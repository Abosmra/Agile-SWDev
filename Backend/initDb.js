const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'app.db');
const SQL_DIR = path.join(__dirname, '..', 'Database');
const SQL_FILES = [
  'users.sql',
  'courses.sql',
  'announcements.sql',
  'rooms.sql',
  'staff.sql',
  'enrollement.sql',
  'bookings.sql'
];

function openDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) return reject(err);
      resolve(db);
    });
  });
}

function runSql(db, sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) return reject(err);
      resolve();
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

function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function tableExists(db, tableName) {
  const row = await runGet(
    db,
    "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
    [tableName]
  );
  return Boolean(row);
}

async function getTableColumns(db, tableName) {
  if (!(await tableExists(db, tableName))) {
    return [];
  }
  const rows = await runQuery(db, `PRAGMA table_info(${tableName})`);
  return rows.map((row) => row.name);
}

async function ensureColumn(db, tableName, columnName, definition) {
  const columns = await getTableColumns(db, tableName);
  if (!columns.includes(columnName)) {
    await runSql(db, `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

async function ensureSchema(db) {
  await runSql(db, `
    CREATE TABLE IF NOT EXISTS Sessions (
      SessionID INTEGER PRIMARY KEY AUTOINCREMENT,
      Token TEXT UNIQUE NOT NULL,
      UserID INTEGER NOT NULL,
      CreatedAt TEXT NOT NULL,
      ExpiresAt TEXT NOT NULL,
      FOREIGN KEY (UserID) REFERENCES Users(UserID)
    );
  `);

  await ensureColumn(db, 'Users', 'Department', "TEXT DEFAULT 'General'");
  await ensureColumn(db, 'Users', 'JoinDate', "TEXT DEFAULT ''");
  await ensureColumn(db, 'Courses', 'Instructor', "TEXT DEFAULT 'Staff'");
  await ensureColumn(db, 'Courses', 'Credits', 'INTEGER DEFAULT 3');
  await ensureColumn(db, 'Enrollments', 'UserID', 'INTEGER');
  await ensureColumn(db, 'Staff', 'Role', "TEXT DEFAULT 'Staff'");
  await ensureColumn(db, 'Staff', 'OfficeHours', "TEXT DEFAULT 'By appointment'");
  await ensureColumn(db, 'Staff', 'AssignedCourses', "TEXT DEFAULT ''");
  await ensureColumn(db, 'Staff', 'PerformanceScore', 'INTEGER DEFAULT 90');
  await ensureColumn(db, 'Staff', 'Research', "TEXT DEFAULT ''");
  await ensureColumn(db, 'Staff', 'ProfessionalDevelopment', "TEXT DEFAULT ''");
  await ensureColumn(db, 'Staff', 'PayrollStatus', "TEXT DEFAULT 'Active'");
  await ensureColumn(db, 'Staff', 'BenefitsSummary', "TEXT DEFAULT 'Standard university benefits'");
  await ensureColumn(db, 'Staff', 'LeaveBalance', 'INTEGER DEFAULT 21');

  await runSql(
    db,
    `CREATE TABLE IF NOT EXISTS Messages (
      MessageID INTEGER PRIMARY KEY AUTOINCREMENT,
      FromUserID INTEGER NOT NULL,
      ToStaffID INTEGER NOT NULL,
      Body TEXT NOT NULL,
      SentDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      IsRead INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (FromUserID) REFERENCES Users(UserID),
      FOREIGN KEY (ToStaffID) REFERENCES Staff(StaffID)
    );`
  );

  await runSql(
    db,
    "UPDATE Users SET Department = COALESCE(NULLIF(Department, ''), 'General')"
  );

  await runSql(db, `DELETE FROM Staff WHERE StaffID IN (1, 2, 3) AND Role = 'Advisor'`);

  await runSql(db, `
    CREATE TABLE IF NOT EXISTS Bookings (
      BookingID INTEGER PRIMARY KEY AUTOINCREMENT,
      HallID INTEGER NOT NULL,
      UserID INTEGER NOT NULL,
      Date TEXT NOT NULL,
      StartTime TEXT NOT NULL,
      EndTime TEXT NOT NULL,
      Purpose TEXT,
      Attendees INTEGER,
      Contact TEXT,
      Status TEXT DEFAULT 'Pending' CHECK (Status IN ('Confirmed', 'Pending', 'Cancelled')),
      FOREIGN KEY (HallID) REFERENCES Halls(HallID),
      FOREIGN KEY (UserID) REFERENCES Users(UserID)
    )
  `);
  await runSql(db, `UPDATE Users SET Role = 'Admin' WHERE Username = 'mohamed@web.dev'`);
  await runSql(
    db,
    "UPDATE Users SET JoinDate = COALESCE(NULLIF(JoinDate, ''), date('now'))"
  );
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function getSqlText(fileName) {
  const filePath = path.join(SQL_DIR, fileName);
  if (!fileExists(filePath)) {
    throw new Error(`SQL file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

async function initDatabase() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Users'", async (err, row) => {
      if (err) return reject(err);
      if (row) {
        try {
          await ensureSchema(db);
          return resolve(db);
        } catch (error) {
          return reject(error);
        }
      }

      try {
        const combinedSql = SQL_FILES.map(getSqlText).join('\n');
        await runSql(db, combinedSql);
        await ensureSchema(db);
        resolve(db);
      } catch (error) {
        reject(error);
      }
    });
  });
}

module.exports = { initDatabase };
