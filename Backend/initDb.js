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
      if (row) return resolve(db);

      try {
        const combinedSql = SQL_FILES.map(getSqlText).join('\n');
        await runSql(db, combinedSql);
        resolve(db);
      } catch (error) {
        reject(error);
      }
    });
  });
}

module.exports = { initDatabase };
