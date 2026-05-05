const crypto = require('crypto');
const path = require('path');
const { promisify } = require('util');
const XLSX = require('xlsx');

const scrypt = promisify(crypto.scrypt);
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
const ASU_NEWS_URL = 'https://eng.asu.edu.eg/68469';
const NEWS_CACHE_TTL_MS = 1000 * 60 * 10;
const SCHEDULE_BOOK_TTL_MS = 1000 * 60 * 30;
const SCHEDULE_WORKBOOK_PATH = path.join(__dirname, '..', 'data', 'schedule-spring-2026.xlsx');

let announcementsCache = {
  items: null,
  fetchedAt: 0
};

let scheduleBookCache = {
  groups: null,
  fetchedAt: 0
};

function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function runGet(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function runExec(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function execCallback(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function toIsoDate(value) {
  return new Date(value).toISOString();
}

function getAuthToken(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice('Bearer '.length).trim();
}

function serializeUser(row, extras = {}) {
  return {
    UserID: row.UserID,
    Username: row.Username,
    Role: row.Role,
    GivenName: row.GivenName || '',
    FamilyName: row.FamilyName || '',
    Department: row.Department || 'General',
    JoinDate: row.JoinDate || '',
    ...extras
  };
}

function hallMetaFromRow(row) {
  const explicitMeta = {
    1: { type: 'Conference', floor: '3rd', building: 'Main Building', image: '🏢' },
    2: { type: 'Auditorium', floor: '1st', building: 'Academic Block', image: '🎭' },
    3: { type: 'Lab', floor: '2nd', building: 'Science Building', image: '🔬' }
  };

  if (explicitMeta[row.HallID]) {
    return explicitMeta[row.HallID];
  }

  const hallName = row.HallName || '';
  const numericMatch = hallName.match(/(\d+)/);
  const numericPart = numericMatch ? parseInt(numericMatch[1], 10) : row.HallID;
  const floorDigit = numericMatch ? numericMatch[1][0] : '1';

  return {
    type: row.Capacity >= 180 ? 'Auditorium' : row.Capacity >= 90 ? 'Lecture Hall' : 'Classroom',
    floor: `${floorDigit}th`,
    building: numericPart >= 900 ? 'Engineering Complex' : 'Academic Building',
    image: row.Capacity >= 180 ? '🎓' : '🏛️'
  };
}

function serializeHall(row, isAvailableToday = true) {
  const meta = hallMetaFromRow(row);
  return {
    HallID: row.HallID,
    HallName: row.HallName,
    Capacity: row.Capacity,
    Type: meta.type,
    Floor: meta.floor,
    Building: meta.building,
    Image: meta.image,
    Description: `${row.HallName} is a ${meta.type.toLowerCase()} in the ${meta.building}.`,
    Amenities: row.Capacity >= 150
      ? ['Projector', 'Microphone', 'Air Conditioning', 'WiFi', 'Recording Support']
      : ['Projector', 'Whiteboard', 'Air Conditioning', 'WiFi'],
    PricePerHour: row.Capacity >= 180 ? 1500 : row.Capacity >= 90 ? 900 : 500,
    BookingRules: 'Bookings must be made in advance and remain subject to hall availability.',
    Contact: 'facilities@university.edu',
    Ratings: row.Capacity >= 150 ? 4.7 : 4.4,
    Reviews: 10 + row.HallID,
    Available: isAvailableToday
  };
}

function normalizeRole(role) {
  if (!role) return 'Student';
  const lowered = role.toLowerCase();
  if (lowered === 'staff') return 'Staff';
  if (lowered === 'admin') return 'Admin';
  if (lowered === 'advisor') return 'Advisor';
  if (lowered === 'doctor') return 'Doctor';
  return 'Student';
}

function stripHtml(value) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeAnnouncementDate(rawValue) {
  const value = rawValue.trim();
  if (/^\d+\s+(hour|hours|minute|minutes|day|days)$/i.test(value)) {
    return value;
  }
  return value.replace(/-/g, '-');
}

function normalizeSheetGroupName(name) {
  return String(name || '').trim();
}

function isScheduleGroup(name) {
  return /^(Freshman|Sophomore|Junior|Senior)/i.test(normalizeSheetGroupName(name));
}

function getWorkbookMatrix(sheet) {
  const matrix = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
    raw: false
  });

  const merges = sheet['!merges'] || [];
  for (const merge of merges) {
    const sourceValue = matrix[merge.s.r]?.[merge.s.c] ?? '';
    for (let rowIndex = merge.s.r; rowIndex <= merge.e.r; rowIndex += 1) {
      if (!matrix[rowIndex]) {
        matrix[rowIndex] = [];
      }
      for (let colIndex = merge.s.c; colIndex <= merge.e.c; colIndex += 1) {
        if (!matrix[rowIndex][colIndex]) {
          matrix[rowIndex][colIndex] = sourceValue;
        }
      }
    }
  }

  return matrix.map((row) => row.map((cell) => String(cell || '').trim()));
}

function getLastUsefulColumn(matrix) {
  let maxColumn = 1;
  matrix.forEach((row) => {
    row.forEach((cell, index) => {
      if (cell) {
        maxColumn = Math.max(maxColumn, index);
      }
    });
  });
  return maxColumn;
}

function parseWorkbookSchedule(sheetName, sheet) {
  const matrix = getWorkbookMatrix(sheet);
  const title = matrix[0]?.[0] || normalizeSheetGroupName(sheetName);
  const lastUsefulColumn = getLastUsefulColumn(matrix);
  const dayRow = matrix[1] || [];
  const sessionRow = matrix[2] || [];

  const columns = [];
  for (let columnIndex = 2; columnIndex <= lastUsefulColumn; columnIndex += 1) {
    const day = dayRow[columnIndex] || dayRow[columnIndex - 1] || '';
    const session = sessionRow[columnIndex] || '';
    if (!day && !session) {
      continue;
    }
    columns.push({
      key: `col_${columnIndex}`,
      day,
      session,
      label: `${day} ${session}`.trim()
    });
  }

  const sessions = [];
  for (let rowIndex = 3; rowIndex < matrix.length; rowIndex += 1) {
    const row = matrix[rowIndex] || [];
    const slot = row[0] || '';
    const time = row[1] || '';
    const entries = columns.map((column) => {
      const columnIndex = Number(column.key.replace('col_', ''));
      return {
        ...column,
        value: row[columnIndex] || ''
      };
    });
    const hasEntries = entries.some((entry) => entry.value);
    if (!slot && !time && !hasEntries) {
      continue;
    }
    sessions.push({
      slot,
      time,
      isBreak: String(slot).toLowerCase() === 'break',
      entries
    });
  }

  return {
    group: normalizeSheetGroupName(sheetName),
    title,
    columns,
    sessions
  };
}

function loadScheduleWorkbook() {
  const now = Date.now();
  if (scheduleBookCache.groups && now - scheduleBookCache.fetchedAt < SCHEDULE_BOOK_TTL_MS) {
    return scheduleBookCache;
  }

  const workbook = XLSX.readFile(SCHEDULE_WORKBOOK_PATH);
  const groupSheetMap = {};
  workbook.SheetNames.forEach((sheetName) => {
    const normalizedName = normalizeSheetGroupName(sheetName);
    if (isScheduleGroup(normalizedName)) {
      groupSheetMap[normalizedName] = sheetName;
    }
  });

  const groups = Object.keys(groupSheetMap);
  if (!groups.length) {
    throw new Error('No schedule groups found in local workbook');
  }

  scheduleBookCache = {
    groups,
    groupSheetMap,
    workbook,
    fetchedAt: now
  };

  return scheduleBookCache;
}

function getScheduleBook() {
  const scheduleBook = loadScheduleWorkbook();
  return scheduleBook.groups;
}

function fetchScheduleGroup(groupName) {
  const scheduleBook = loadScheduleWorkbook();
  const sourceSheetName = scheduleBook.groupSheetMap[groupName];
  if (!sourceSheetName) {
    throw new Error(`Schedule group not found: ${groupName}`);
  }
  return parseWorkbookSchedule(sourceSheetName, scheduleBook.workbook.Sheets[sourceSheetName]);
}

function parseAnnouncementCards(html) {
  const cards = [];
  const cardRegex = /<div class="ttm-box-col-wrapper[\s\S]*?<div class="featured-content featured-content-post">([\s\S]*?)<\/div>\s*<\/div><!-- featured-imagebox-post end-->/g;
  let match;

  while ((match = cardRegex.exec(html)) !== null) {
    const block = match[1];
    const titleMatch = block.match(/<h5>\s*<a href="([^"]+)">([\s\S]*?)<\/a>\s*<\/h5>/i);
    const dateMatch = block.match(/<time[^>]*datetime="([^"]*)">([\s\S]*?)<\/time>/i);
    const descMatch = block.match(/<div class="post-desc featured-desc">\s*<p>([\s\S]*?)<\/p>/i);

    if (!titleMatch) {
      continue;
    }

    const linkPath = titleMatch[1].trim();
    cards.push({
      id: `asu-${cards.length + 1}`,
      title: stripHtml(titleMatch[2]),
      content: descMatch ? stripHtml(descMatch[1]) : '',
      date: dateMatch ? normalizeAnnouncementDate(stripHtml(dateMatch[2]) || dateMatch[1]) : '',
      sourceUrl: new URL(linkPath, ASU_NEWS_URL).toString()
    });
  }

  return cards;
}

async function getLiveAnnouncements() {
  const now = Date.now();
  if (announcementsCache.items && now - announcementsCache.fetchedAt < NEWS_CACHE_TTL_MS) {
    return announcementsCache.items;
  }

  const response = await fetch(ASU_NEWS_URL, {
    headers: {
      'User-Agent': 'Agile-SWDev Announcements Fetcher'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch announcements: ${response.status}`);
  }

  const html = await response.text();
  const items = parseAnnouncementCards(html).slice(0, 9);

  if (!items.length) {
    throw new Error('No announcements could be parsed from the source page');
  }

  announcementsCache = {
    items,
    fetchedAt: now
  };

  return items;
}

function isPrivilegedRole(role) {
  return role === 'Staff' || role === 'Admin';
}

function hashLooksLegacy(password) {
  return typeof password === 'string' && !password.startsWith('scrypt$');
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, storedPassword) {
  if (!storedPassword) {
    return false;
  }

  if (hashLooksLegacy(storedPassword)) {
    return password === storedPassword;
  }

  const [, salt, key] = storedPassword.split('$');
  if (!salt || !key) {
    return false;
  }

  const derivedKey = await scrypt(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
}

async function createSession(db, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + SESSION_DURATION_MS);

  await runExec(
    db,
    'INSERT INTO Sessions (Token, UserID, CreatedAt, ExpiresAt) VALUES (?, ?, ?, ?)',
    [token, userId, toIsoDate(createdAt), toIsoDate(expiresAt)]
  );

  return token;
}

async function getUserWithStats(db, userId) {
  const user = await runGet(
    db,
    `SELECT UserID, Username, Role, GivenName, FamilyName, Department, JoinDate
     FROM Users
     WHERE UserID = ?`,
    [userId]
  );

  if (!user) {
    return null;
  }

  const enrollmentCountRow = await runGet(
    db,
    `SELECT COUNT(*) AS Total
     FROM Enrollments
     WHERE UserID = ? AND Status != 'Dropped'`,
    [userId]
  );

  return serializeUser(user, {
    EnrolledCourses: enrollmentCountRow ? enrollmentCountRow.Total : 0
  });
}

async function migrateLegacyUsers(db) {
  const users = await runQuery(db, 'SELECT UserID, Password FROM Users');
  for (const user of users) {
    if (hashLooksLegacy(user.Password)) {
      const hashed = await hashPassword(user.Password);
      await runExec(db, 'UPDATE Users SET Password = ? WHERE UserID = ?', [hashed, user.UserID]);
    }
  }
}

async function migrateEnrollmentOwnership(db) {
  const rows = await runQuery(
    db,
    `SELECT EnrollmentID, StudentName
     FROM Enrollments
     WHERE UserID IS NULL`
  );

  for (const row of rows) {
    const normalizedName = (row.StudentName || '').trim().toLowerCase();
    let userId = null;

    if (normalizedName.startsWith('mai')) {
      userId = 1;
    }

    if (userId) {
      await runExec(db, 'UPDATE Enrollments SET UserID = ? WHERE EnrollmentID = ?', [userId, row.EnrollmentID]);
    }
  }
}

async function authenticate(req, res, next) {
  try {
    const token = getAuthToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const session = await runGet(
      req.app.locals.db,
      `SELECT s.SessionID, s.UserID, s.ExpiresAt, u.Username, u.Role, u.GivenName, u.FamilyName, u.Department, u.JoinDate
       FROM Sessions s
       INNER JOIN Users u ON s.UserID = u.UserID
       WHERE s.Token = ?`,
      [token]
    );

    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    if (new Date(session.ExpiresAt) <= new Date()) {
      await runExec(req.app.locals.db, 'DELETE FROM Sessions WHERE SessionID = ?', [session.SessionID]);
      return res.status(401).json({ error: 'Session expired' });
    }

    req.sessionToken = token;
    req.user = serializeUser(session);
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

function requireRoles(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.Role)) {
      return res.status(403).json({ error: 'You do not have permission to access this resource' });
    }
    next();
  };
}

async function getHallAvailabilityMap(db) {
  const rows = await runQuery(
    db,
    `SELECT HallID, COUNT(*) AS TodayBookings
     FROM Bookings
     WHERE Date = date('now') AND Status != 'Cancelled'
     GROUP BY HallID`,
    []
  );

  return new Map(rows.map((row) => [row.HallID, row.TodayBookings === 0]));
}

async function getBookingById(db, bookingId) {
  return runGet(
    db,
    `SELECT b.BookingID, b.HallID, b.UserID, b.Date, b.StartTime, b.EndTime, b.Purpose, b.Attendees, b.Contact, b.Status,
            h.HallName, h.Capacity, u.Username AS UserName
     FROM Bookings b
     INNER JOIN Halls h ON b.HallID = h.HallID
     INNER JOIN Users u ON b.UserID = u.UserID
     WHERE b.BookingID = ?`,
    [bookingId]
  );
}

async function validateBookingPayload(db, booking, excludedBookingId = null) {
  const requiredFields = ['HallID', 'Date', 'StartTime', 'EndTime', 'Purpose', 'Contact'];
  const missing = requiredFields.filter((field) => !booking[field]);

  if (missing.length) {
    return { status: 400, error: `Missing required fields: ${missing.join(', ')}` };
  }

  if (booking.StartTime >= booking.EndTime) {
    return { status: 400, error: 'End time must be after start time' };
  }

  const hall = await runGet(db, 'SELECT HallID, HallName, Capacity FROM Halls WHERE HallID = ?', [booking.HallID]);

  if (!hall) {
    return { status: 404, error: 'Hall not found' };
  }

  const attendees = Number(booking.Attendees || 0);
  if (attendees <= 0) {
    return { status: 400, error: 'Attendees must be greater than zero' };
  }

  if (attendees > hall.Capacity) {
    return { status: 400, error: `Attendees exceed hall capacity of ${hall.Capacity}` };
  }

  const conflict = await runGet(
    db,
    `SELECT BookingID
     FROM Bookings
     WHERE HallID = ?
       AND Date = ?
       AND Status != 'Cancelled'
       AND (? IS NULL OR BookingID != ?)
       AND NOT (EndTime <= ? OR StartTime >= ?)`,
    [
      booking.HallID,
      booking.Date,
      excludedBookingId,
      excludedBookingId,
      booking.StartTime,
      booking.EndTime
    ]
  );

  if (conflict) {
    return { status: 409, error: 'This hall is already booked for the selected time range' };
  }

  return { hall };
}

module.exports = {
  runQuery,
  runGet,
  runExec,
  toIsoDate,
  getAuthToken,
  serializeUser,
  serializeHall,
  normalizeRole,
  stripHtml,
  normalizeAnnouncementDate,
  normalizeSheetGroupName,
  isScheduleGroup,
  getScheduleBook,
  fetchScheduleGroup,
  getLiveAnnouncements,
  isPrivilegedRole,
  hashPassword,
  verifyPassword,
  createSession,
  getUserWithStats,
  migrateLegacyUsers,
  migrateEnrollmentOwnership,
  authenticate,
  requireRoles,
  getHallAvailabilityMap,
  getBookingById,
  validateBookingPayload
};
