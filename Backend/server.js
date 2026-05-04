const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { promisify } = require('util');
const XLSX = require('xlsx');
const { initDatabase } = require('./initDb');

const app = express();
const scrypt = promisify(crypto.scrypt);
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
const port = process.env.PORT || 5001;
const ASU_NEWS_URL = 'https://eng.asu.edu.eg/68469';
const NEWS_CACHE_TTL_MS = 1000 * 60 * 10;
const SCHEDULE_BOOK_TTL_MS = 1000 * 60 * 30;
const SCHEDULE_WORKBOOK_PATH = path.join(__dirname, 'data', 'schedule-spring-2026.xlsx');
let announcementsCache = {
  items: null,
  fetchedAt: 0
};
let scheduleBookCache = {
  groups: null,
  fetchedAt: 0
};

app.use(cors());
app.use(express.json());

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
     GROUP BY HallID`
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

  const hall = await runGet(
    db,
    'SELECT HallID, HallName, Capacity FROM Halls WHERE HallID = ?',
    [booking.HallID]
  );

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

app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, department } = req.body;
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await runGet(
      req.app.locals.db,
      'SELECT UserID FROM Users WHERE Username = ?',
      [email]
    );

    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const normalizedRole = normalizeRole(role);
    const hashedPassword = await hashPassword(password);
    const result = await runExec(
      req.app.locals.db,
      `INSERT INTO Users (Username, Password, GivenName, FamilyName, Role, Department, JoinDate)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, firstName, lastName, normalizedRole, department || 'General', new Date().toISOString().slice(0, 10)]
    );

    const token = await createSession(req.app.locals.db, result.lastID);
    const user = await getUserWithStats(req.app.locals.db, result.lastID);
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await runGet(
      req.app.locals.db,
      `SELECT UserID, Username, Password, Role, GivenName, FamilyName, Department, JoinDate
       FROM Users
       WHERE Username = ?`,
      [username]
    );

    if (!user || !(await verifyPassword(password, user.Password))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = await createSession(req.app.locals.db, user.UserID);
    const userWithStats = await getUserWithStats(req.app.locals.db, user.UserID);
    res.json({ token, user: userWithStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/logout', authenticate, async (req, res) => {
  try {
    await runExec(req.app.locals.db, 'DELETE FROM Sessions WHERE Token = ?', [req.sessionToken]);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/me', authenticate, async (req, res) => {
  try {
    const user = await getUserWithStats(req.app.locals.db, req.user.UserID);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/me', authenticate, async (req, res) => {
  try {
    const { firstName, lastName, email, department } = req.body;
    if (!firstName || !lastName || !email || !department) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await runGet(
      req.app.locals.db,
      'SELECT UserID FROM Users WHERE Username = ? AND UserID != ?',
      [email, req.user.UserID]
    );

    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    await runExec(
      req.app.locals.db,
      `UPDATE Users
       SET Username = ?, GivenName = ?, FamilyName = ?, Department = ?
       WHERE UserID = ?`,
      [email, firstName, lastName, department, req.user.UserID]
    );

    const user = await getUserWithStats(req.app.locals.db, req.user.UserID);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/me/password', authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await runGet(
      req.app.locals.db,
      'SELECT Password FROM Users WHERE UserID = ?',
      [req.user.UserID]
    );

    if (!user || !(await verifyPassword(oldPassword, user.Password))) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await hashPassword(newPassword);
    await runExec(
      req.app.locals.db,
      'UPDATE Users SET Password = ? WHERE UserID = ?',
      [hashedPassword, req.user.UserID]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/courses', authenticate, async (req, res) => {
  try {
    const courses = await runQuery(req.app.locals.db, 'SELECT * FROM Courses ORDER BY CourseID');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/my-courses', authenticate, async (req, res) => {
  try {
    const courses = await runQuery(
      req.app.locals.db,
      `SELECT e.EnrollmentID, e.Status, c.CourseID, c.CourseName, c.CourseCode, c.Description
       FROM Enrollments e
       INNER JOIN Courses c ON e.CourseID = c.CourseID
       WHERE e.UserID = ?
       ORDER BY c.CourseID`,
      [req.user.UserID]
    );
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/enrollments', authenticate, async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }

    const course = await runGet(
      req.app.locals.db,
      'SELECT CourseID, CourseName FROM Courses WHERE CourseID = ?',
      [courseId]
    );

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const existing = await runGet(
      req.app.locals.db,
      'SELECT EnrollmentID FROM Enrollments WHERE UserID = ? AND CourseID = ?',
      [req.user.UserID, courseId]
    );

    if (existing) {
      return res.status(409).json({ error: 'You are already enrolled in this course' });
    }

    const nextIdRow = await runGet(
      req.app.locals.db,
      'SELECT COALESCE(MAX(EnrollmentID), 0) + 1 AS NextID FROM Enrollments'
    );

    const displayName = `${req.user.GivenName} ${req.user.FamilyName}`.trim() || req.user.Username;
    await runExec(
      req.app.locals.db,
      `INSERT INTO Enrollments (EnrollmentID, StudentName, CourseID, Status, UserID)
       VALUES (?, ?, ?, ?, ?)`,
      [nextIdRow.NextID, displayName, courseId, 'Enrolled', req.user.UserID]
    );

    res.status(201).json({ message: 'Enrollment created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/announcements', authenticate, async (req, res) => {
  try {
    const announcements = await getLiveAnnouncements();
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/schedules/groups', authenticate, async (req, res) => {
  try {
    const groups = await getScheduleBook();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/schedules', authenticate, async (req, res) => {
  try {
    const groups = await getScheduleBook();
    const requestedGroup = String(req.query.group || '').trim();
    const selectedGroup = requestedGroup || groups[0];

    if (!groups.includes(selectedGroup)) {
      return res.status(404).json({ error: 'Schedule group not found' });
    }

    const schedule = await fetchScheduleGroup(selectedGroup);
    res.json({
      groups,
      selectedGroup,
      schedule
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/staff', authenticate, async (req, res) => {
  try {
    const staff = await runQuery(req.app.locals.db, 'SELECT * FROM Staff ORDER BY Name');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/halls', authenticate, async (req, res) => {
  try {
    const halls = await runQuery(req.app.locals.db, 'SELECT * FROM Halls ORDER BY HallName');
    const availabilityMap = await getHallAvailabilityMap(req.app.locals.db);
    res.json(
      halls.map((hall) => serializeHall(hall, availabilityMap.get(hall.HallID) ?? true))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/halls/:id', authenticate, async (req, res) => {
  try {
    const hall = await runGet(
      req.app.locals.db,
      'SELECT * FROM Halls WHERE HallID = ?',
      [req.params.id]
    );

    if (!hall) {
      return res.status(404).json({ error: 'Hall not found' });
    }

    const bookedToday = await runGet(
      req.app.locals.db,
      `SELECT COUNT(*) AS Total
       FROM Bookings
       WHERE HallID = ? AND Date = date('now') AND Status != 'Cancelled'`,
      [req.params.id]
    );

    res.json(serializeHall(hall, (bookedToday ? bookedToday.Total : 0) === 0));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bookings', authenticate, async (req, res) => {
  try {
    const { scope } = req.query;
    const wantsAll = scope === 'all';

    if (wantsAll && !isPrivilegedRole(req.user.Role)) {
      return res.status(403).json({ error: 'Only staff can view all bookings' });
    }

    const params = [];
    let whereClause = '';
    if (!wantsAll) {
      whereClause = 'WHERE b.UserID = ?';
      params.push(req.user.UserID);
    }

    const bookings = await runQuery(
      req.app.locals.db,
      `SELECT b.BookingID, b.HallID, b.UserID, b.Date, b.StartTime, b.EndTime, b.Purpose, b.Attendees, b.Contact, b.Status,
              h.HallName, h.Capacity, u.Username AS UserName
       FROM Bookings b
       INNER JOIN Halls h ON b.HallID = h.HallID
       INNER JOIN Users u ON b.UserID = u.UserID
       ${whereClause}
       ORDER BY b.Date DESC, b.StartTime`,
      params
    );

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bookings', authenticate, requireRoles(['Staff', 'Admin']), async (req, res) => {
  try {
    const bookingPayload = {
      HallID: Number(req.body.HallID),
      Date: req.body.Date,
      StartTime: req.body.StartTime,
      EndTime: req.body.EndTime,
      Purpose: req.body.Purpose,
      Attendees: Number(req.body.Attendees || 0),
      Contact: req.body.Contact,
      Status: req.body.Status || 'Pending'
    };

    const validation = await validateBookingPayload(req.app.locals.db, bookingPayload);
    if (validation.error) {
      return res.status(validation.status).json({ error: validation.error });
    }

    const result = await runExec(
      req.app.locals.db,
      `INSERT INTO Bookings (HallID, UserID, Date, StartTime, EndTime, Purpose, Attendees, Contact, Status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingPayload.HallID,
        req.user.UserID,
        bookingPayload.Date,
        bookingPayload.StartTime,
        bookingPayload.EndTime,
        bookingPayload.Purpose,
        bookingPayload.Attendees,
        bookingPayload.Contact,
        bookingPayload.Status
      ]
    );

    const booking = await getBookingById(req.app.locals.db, result.lastID);
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/bookings/:id', authenticate, requireRoles(['Staff', 'Admin']), async (req, res) => {
  try {
    const existing = await getBookingById(req.app.locals.db, req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (existing.UserID !== req.user.UserID && req.user.Role !== 'Admin') {
      return res.status(403).json({ error: 'You can only modify your own bookings' });
    }

    const updatedBooking = {
      HallID: Number(existing.HallID),
      Date: req.body.Date,
      StartTime: req.body.StartTime,
      EndTime: req.body.EndTime,
      Purpose: req.body.Purpose,
      Attendees: Number(req.body.Attendees || 0),
      Contact: req.body.Contact,
      Status: req.body.Status || existing.Status
    };

    const validation = await validateBookingPayload(req.app.locals.db, updatedBooking, Number(req.params.id));
    if (validation.error) {
      return res.status(validation.status).json({ error: validation.error });
    }

    await runExec(
      req.app.locals.db,
      `UPDATE Bookings
       SET Date = ?, StartTime = ?, EndTime = ?, Purpose = ?, Attendees = ?, Contact = ?, Status = ?
       WHERE BookingID = ?`,
      [
        updatedBooking.Date,
        updatedBooking.StartTime,
        updatedBooking.EndTime,
        updatedBooking.Purpose,
        updatedBooking.Attendees,
        updatedBooking.Contact,
        updatedBooking.Status,
        req.params.id
      ]
    );

    const booking = await getBookingById(req.app.locals.db, req.params.id);
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/bookings/:id', authenticate, requireRoles(['Staff', 'Admin']), async (req, res) => {
  try {
    const existing = await getBookingById(req.app.locals.db, req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (existing.UserID !== req.user.UserID && req.user.Role !== 'Admin') {
      return res.status(403).json({ error: 'You can only cancel your own bookings' });
    }

    await runExec(
      req.app.locals.db,
      "UPDATE Bookings SET Status = 'Cancelled' WHERE BookingID = ?",
      [req.params.id]
    );

    const booking = await getBookingById(req.app.locals.db, req.params.id);
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', authenticate, async (req, res) => {
  try {
    const user = await getUserWithStats(req.app.locals.db, req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/enrollments', authenticate, async (req, res) => {
  try {
    const enrollments = await runQuery(
      req.app.locals.db,
      `SELECT e.EnrollmentID, e.StudentName, e.CourseID, e.Status, e.UserID, c.CourseName, c.CourseCode
       FROM Enrollments e
       LEFT JOIN Courses c ON e.CourseID = c.CourseID
       ORDER BY e.EnrollmentID`
    );
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  try {
    const db = await initDatabase();
    await migrateLegacyUsers(db);
    await migrateEnrollmentOwnership(db);
    app.locals.db = db;
    app.listen(port, () => {
      console.log(`Backend server listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

startServer();
