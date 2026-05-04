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
  await ensureColumn(db, 'Enrollments', 'UserID', 'INTEGER');

  await runSql(
    db,
    "UPDATE Users SET Department = COALESCE(NULLIF(Department, ''), 'General')"
  );
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
