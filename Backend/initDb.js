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
  await ensureColumn(db, 'Messages', 'ToUserID', 'INTEGER');
  await ensureColumn(db, 'Messages', 'Subject', 'TEXT');

  await runSql(db, `
    CREATE TABLE IF NOT EXISTS CourseMaterials (
      MaterialID INTEGER PRIMARY KEY AUTOINCREMENT,
      CourseID INTEGER NOT NULL,
      Title TEXT NOT NULL,
      Type TEXT NOT NULL DEFAULT 'Link',
      Url TEXT,
      Notes TEXT,
      UploadedBy INTEGER NOT NULL,
      UploadedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
      FOREIGN KEY (UploadedBy) REFERENCES Users(UserID)
    );
  `);

  await runSql(db, `
    CREATE TABLE IF NOT EXISTS CourseTeachingRequests (
      RequestID INTEGER PRIMARY KEY AUTOINCREMENT,
      CourseID INTEGER NOT NULL,
      UserID INTEGER NOT NULL,
      Role TEXT NOT NULL,
      Status TEXT NOT NULL DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Approved', 'Rejected')),
      Message TEXT,
      RequestedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
      FOREIGN KEY (UserID) REFERENCES Users(UserID),
      UNIQUE (CourseID, UserID)
    );
  `);

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

async function ensureDemoStudentEnrollments(db) {
  const demoStudents = [
    ['student01@example.com', 'Youssef', 'Adel'],
    ['student02@example.com', 'Farida', 'Nasser'],
    ['student03@example.com', 'Omar', 'Hany'],
    ['student04@example.com', 'Laila', 'Mostafa'],
    ['student05@example.com', 'Karim', 'Said'],
    ['student06@example.com', 'Nour', 'Magdy'],
    ['student07@example.com', 'Mariam', 'Tarek'],
    ['student08@example.com', 'Hassan', 'Fouad'],
    ['student09@example.com', 'Salma', 'Ibrahim'],
    ['student10@example.com', 'Ali', 'Sherif'],
    ['student11@example.com', 'Jana', 'Wael'],
    ['student12@example.com', 'Ziad', 'Samir'],
    ['student13@example.com', 'Nada', 'Khaled'],
    ['student14@example.com', 'Seif', 'Maher'],
    ['student15@example.com', 'Hana', 'Ashraf'],
    ['student16@example.com', 'Adam', 'Yasser'],
    ['student17@example.com', 'Rana', 'Gamal'],
    ['student18@example.com', 'Mazen', 'Nabil'],
    ['student19@example.com', 'Malak', 'Ayman'],
    ['student20@example.com', 'Yara', 'Hesham'],
    ['student21@example.com', 'Talia', 'Osama'],
    ['student22@example.com', 'Fares', 'Amr'],
    ['student23@example.com', 'Dina', 'Kareem'],
    ['student24@example.com', 'Eyad', 'Hatem'],
    ['student25@example.com', 'Leen', 'Sameh'],
    ['student26@example.com', 'Amira', 'Walid'],
    ['student27@example.com', 'Marwan', 'Fathy'],
    ['student28@example.com', 'Sofia', 'Reda'],
    ['student29@example.com', 'Khaled', 'Ehab'],
    ['student30@example.com', 'Reem', 'Bassem'],
    ['student31@example.com', 'Yassin', 'Nader'],
    ['student32@example.com', 'Mona', 'Tamer'],
    ['student33@example.com', 'Ola', 'Ramy'],
    ['student34@example.com', 'Hussein', 'Adham'],
    ['student35@example.com', 'Judy', 'Mounir'],
    ['student36@example.com', 'Bilal', 'Atef'],
    ['student37@example.com', 'Sara', 'Lotfy'],
    ['student38@example.com', 'Tarek', 'Hassan'],
    ['student39@example.com', 'Mai', 'Ahmed'],
    ['student40@example.com', 'Ahmed', 'Saber']
  ];

  for (const [username, givenName, familyName] of demoStudents) {
    await runSql(db, `
      INSERT OR IGNORE INTO Users (Username, Password, GivenName, FamilyName, Role, Department, JoinDate)
      VALUES ('${username}', 'student123', '${givenName}', '${familyName}', 'Student', 'Computer Science', date('now'));
    `);
  }

  const students = await runQuery(
    db,
    `SELECT UserID, GivenName, FamilyName
     FROM Users
     WHERE Role = 'Student'
     ORDER BY UserID`
  );
  const courses = await runQuery(db, 'SELECT CourseID FROM Courses ORDER BY CourseID');
  const statuses = ['Enrolled', 'Enrolled', 'Enrolled', 'Completed', 'Pending'];

  for (const course of courses) {
    for (let index = 0; index < Math.min(20, students.length); index += 1) {
      const student = students[(index * 7 + course.CourseID * 3) % students.length];
      const existing = await runGet(
        db,
        'SELECT EnrollmentID FROM Enrollments WHERE UserID = ? AND CourseID = ?',
        [student.UserID, course.CourseID]
      );

      if (!existing) {
        await runSql(db, `
          INSERT INTO Enrollments (StudentName, CourseID, Status, UserID)
          VALUES ('${student.GivenName} ${student.FamilyName}', ${course.CourseID}, '${statuses[(index + course.CourseID) % statuses.length]}', ${student.UserID});
        `);
      }
    }
  }
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
          await ensureDemoStudentEnrollments(db);
          return resolve(db);
        } catch (error) {
          return reject(error);
        }
      }

      try {
        const combinedSql = SQL_FILES.map(getSqlText).join('\n');
        await runSql(db, combinedSql);
        await ensureSchema(db);
        await ensureDemoStudentEnrollments(db);
        resolve(db);
      } catch (error) {
        reject(error);
      }
    });
  });
}

module.exports = { initDatabase };
