const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const SQL_DIR = path.join(__dirname, '..', 'Database');
const DB_PATH = path.join(SQL_DIR, 'app.db');
const SQL_FILES = [
  'users.sql',
  'courses.sql',
  'rooms.sql',
  'staff.sql',
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

async function ensureTableColumn(db, tableName, columnName, definition) {
  if (!(await tableExists(db, tableName))) {
    return;
  }
  await ensureColumn(db, tableName, columnName, definition);
}

async function ensureSchema(db) {
  await runSql(db, `
    CREATE TABLE IF NOT EXISTS Enrollments (
      EnrollmentID INTEGER PRIMARY KEY AUTOINCREMENT,
      StudentName TEXT,
      CourseID INTEGER,
      Status TEXT,
      UserID INTEGER,
      FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
      FOREIGN KEY (UserID) REFERENCES Users(UserID)
    );
  `);

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
  await ensureColumn(db, 'Staff', 'SalaryAmount', 'INTEGER DEFAULT 18000');
  await ensureColumn(db, 'Staff', 'UserID', 'INTEGER REFERENCES Users(UserID)');

  await runSql(db, `
    UPDATE Staff
    SET SalaryAmount = CASE
      WHEN Role = 'Advisor' THEN 22000
      WHEN Role = 'Doctor' THEN 28000
      WHEN Role = 'TA' THEN 12000
      WHEN Role = 'Admin' THEN 26000
      ELSE 18000
    END
    WHERE SalaryAmount IS NULL OR SalaryAmount = 18000;
  `);

  await runSql(db, `
    CREATE TABLE IF NOT EXISTS AdvisorStudentLimits (
      AdvisorID INTEGER PRIMARY KEY,
      MaxStudents INTEGER NOT NULL DEFAULT 20,
      FOREIGN KEY (AdvisorID) REFERENCES Staff(StaffID)
    );
  `);

  await runSql(db, `
    CREATE TABLE IF NOT EXISTS AdvisorAssignments (
      AssignmentID INTEGER PRIMARY KEY AUTOINCREMENT,
      AdvisorID INTEGER NOT NULL,
      StudentID INTEGER NOT NULL UNIQUE,
      AssignedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (AdvisorID) REFERENCES Staff(StaffID),
      FOREIGN KEY (StudentID) REFERENCES Users(UserID)
    );
  `);

  await runSql(db, `
    CREATE TABLE IF NOT EXISTS AcademicRequests (
      RequestID INTEGER PRIMARY KEY AUTOINCREMENT,
      RequestType TEXT NOT NULL CHECK (RequestType IN ('Enrollment', 'DropCourse')),
      EnrollmentID INTEGER,
      CourseID INTEGER NOT NULL,
      StudentID INTEGER NOT NULL,
      AdvisorID INTEGER NOT NULL,
      Status TEXT NOT NULL DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Approved', 'Cancelled')),
      RequestedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ReviewedAt TEXT,
      Notes TEXT,
      FOREIGN KEY (EnrollmentID) REFERENCES Enrollments(EnrollmentID),
      FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
      FOREIGN KEY (StudentID) REFERENCES Users(UserID),
      FOREIGN KEY (AdvisorID) REFERENCES Staff(StaffID)
    );
  `);

  await runSql(db, `
    INSERT OR IGNORE INTO Staff (StaffID, Name, Department, Role, ContactInfo, OfficeHours, AssignedCourses)
    VALUES
      (201, 'Ahmed Hassan', 'Computer Science', 'Advisor', 'ahmed.hassan@eng.asu.team15.eg', 'Sunday and Tuesday, 11:00-13:00', 'Academic advising'),
      (202, 'Sara Mahmoud', 'Computer Science', 'Advisor', 'sara.mahmoud@eng.asu.team15.eg', 'Monday and Wednesday, 10:00-12:00', 'Academic advising'),
      (203, 'Khaled Ibrahim', 'Engineering', 'Advisor', 'khaled.ibrahim@eng.asu.team15.eg', 'Thursday, 12:00-15:00', 'Academic advising');
  `);

  await runSql(db, `
    INSERT OR IGNORE INTO AdvisorStudentLimits (AdvisorID, MaxStudents)
    VALUES (201, 20), (202, 20), (203, 20);
  `);

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
    CREATE TABLE IF NOT EXISTS LeaveRequests (
      RequestID INTEGER PRIMARY KEY AUTOINCREMENT,
      UserID INTEGER NOT NULL,
      StaffID INTEGER,
      StartDate TEXT NOT NULL,
      EndDate TEXT NOT NULL,
      Reason TEXT,
      Status TEXT NOT NULL DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Approved', 'Rejected')),
      RequestedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (UserID) REFERENCES Users(UserID),
      FOREIGN KEY (StaffID) REFERENCES Staff(StaffID)
    );
  `);
  await ensureTableColumn(db, 'LeaveRequests', 'StaffID', 'INTEGER');
  await ensureTableColumn(db, 'LeaveRequests', 'Reason', 'TEXT');
  await ensureTableColumn(db, 'LeaveRequests', 'RequestedAt', "TEXT DEFAULT CURRENT_TIMESTAMP");

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

  await runSql(db, `
    CREATE TABLE IF NOT EXISTS Assignments (
      AssignmentID INTEGER PRIMARY KEY AUTOINCREMENT,
      CourseID INTEGER NOT NULL,
      Title TEXT NOT NULL,
      Category TEXT NOT NULL DEFAULT 'Assignment',
      DueDate TEXT,
      MaxScore INTEGER DEFAULT 100,
      FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
    );
  `);
  await ensureColumn(db, 'Assignments', 'Category', "TEXT NOT NULL DEFAULT 'Assignment'");

  await runSql(db, `
    CREATE TABLE IF NOT EXISTS Grades (
      GradeID INTEGER PRIMARY KEY AUTOINCREMENT,
      StudentID INTEGER NOT NULL,
      AssignmentID INTEGER NOT NULL,
      Score INTEGER,
      Feedback TEXT,
      FOREIGN KEY (StudentID) REFERENCES Users(UserID),
      FOREIGN KEY (AssignmentID) REFERENCES Assignments(AssignmentID)
    );
  `);

  await runSql(db, `
    CREATE TABLE IF NOT EXISTS StudentSubmissions (
      SubmissionID INTEGER PRIMARY KEY AUTOINCREMENT,
      AssignmentID INTEGER NOT NULL,
      CourseID INTEGER NOT NULL,
      StudentID INTEGER NOT NULL,
      Content TEXT,
      FileName TEXT,
      FileUrl TEXT,
      SubmittedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      Status TEXT NOT NULL DEFAULT 'Submitted',
      FOREIGN KEY (AssignmentID) REFERENCES Assignments(AssignmentID),
      FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
      FOREIGN KEY (StudentID) REFERENCES Users(UserID),
      UNIQUE (AssignmentID, StudentID)
    );
  `);

  await runSql(db, `
    INSERT OR IGNORE INTO Assignments (AssignmentID, CourseID, Title, Category, DueDate, MaxScore)
    VALUES
      (1, 1, 'Distributed Systems Lab 1', 'Lab', '2026-05-20', 100),
      (2, 1, 'Consensus Algorithms Quiz', 'Quiz', '2026-05-27', 50),
      (3, 2, 'Embedded Controller Design', 'Assignment', '2026-05-24', 100),
      (4, 4, 'IoT Sensor Integration Lab', 'Lab', '2026-05-26', 100);
  `);

  await runSql(db, `
    INSERT OR IGNORE INTO Grades (GradeID, StudentID, AssignmentID, Score, Feedback)
    VALUES
      (1, 1, 1, 92, 'Strong implementation and clear report'),
      (2, 1, 2, 45, 'Good understanding of Raft basics');
  `);

  await runSql(db, `
    INSERT OR IGNORE INTO CourseMaterials (MaterialID, CourseID, Title, Type, Url, Notes, UploadedBy)
    VALUES
      (1, 1, 'Lecture 1: Distributed Systems Overview', 'Lecture', 'https://example.com/cse362/lecture-1', 'Core concepts and system models', 4),
      (2, 1, 'Tutorial 1: RPC Practice', 'Tutorial', 'https://example.com/cse362/tutorial-1', 'Practice sheet for remote calls', 4),
      (3, 1, 'Lab Guide: Socket Cluster', 'Lab', 'https://example.com/cse362/lab-sockets', 'Submit your lab report under work items', 4),
      (4, 1, 'Project Brief', 'Project', 'https://example.com/cse362/project', 'Team project requirements', 4),
      (5, 1, 'Reference Links', 'Link', 'https://example.com/cse362/resources', 'Useful documentation and readings', 4);
  `);

  await runSql(
    db,
    "UPDATE Users SET Department = COALESCE(NULLIF(Department, ''), 'General')"
  );

  await runSql(db, `DELETE FROM Staff WHERE StaffID IN (1, 2, 3) AND Role = 'Advisor'`);
  await runSql(db, `DROP TABLE IF EXISTS Announcements`);

  await runSql(db, `
    UPDATE Staff
    SET UserID = (
      SELECT u.UserID FROM Users u
      WHERE lower(u.Username) = lower(Staff.ContactInfo)
         OR lower(trim(u.GivenName || ' ' || u.FamilyName)) = lower(Staff.Name)
         OR lower(trim('Dr. ' || u.GivenName || ' ' || u.FamilyName)) = lower(Staff.Name)
      LIMIT 1
    )
    WHERE UserID IS NULL;
  `);

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

  await runSql(db, `
    CREATE TABLE IF NOT EXISTS MaintenanceRequests (
      RequestID INTEGER PRIMARY KEY AUTOINCREMENT,
      RoomID INTEGER NOT NULL,
      ReportedByUserID INTEGER NOT NULL,
      Description TEXT NOT NULL,
      Status TEXT NOT NULL DEFAULT 'open' CHECK (Status IN ('open', 'in progress', 'closed')),
      ReportedDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ResolvedDate TEXT,
      FOREIGN KEY (RoomID) REFERENCES Halls(HallID),
      FOREIGN KEY (ReportedByUserID) REFERENCES Users(UserID)
    );
  `);

  await runSql(db, `
    CREATE TABLE IF NOT EXISTS Resources (
      ResourceID INTEGER PRIMARY KEY AUTOINCREMENT,
      ResourceName TEXT NOT NULL,
      ResourceType TEXT CHECK (ResourceType IN ('Equipment', 'Software License', 'Book', 'Other')),
      TotalQuantity INTEGER NOT NULL DEFAULT 0,
      AvailableQuantity INTEGER NOT NULL DEFAULT 0
    );
  `);

  await runSql(db, `
    CREATE TABLE IF NOT EXISTS ResourceAllocations (
      AllocationID INTEGER PRIMARY KEY AUTOINCREMENT,
      ResourceID INTEGER NOT NULL,
      AllocatedToUserID INTEGER NOT NULL,
      Department TEXT,
      Quantity INTEGER NOT NULL DEFAULT 1,
      AllocatedDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      DueDate TEXT,
      ReturnedDate TEXT,
      FOREIGN KEY (ResourceID) REFERENCES Resources(ResourceID),
      FOREIGN KEY (AllocatedToUserID) REFERENCES Users(UserID)
    );
  `);

  await runSql(db, `
    CREATE TABLE IF NOT EXISTS Transcripts (
      TranscriptID INTEGER PRIMARY KEY AUTOINCREMENT,
      StudentID INTEGER NOT NULL,
      GeneratedDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PDFPath TEXT NOT NULL,
      Semester TEXT,
      GPA REAL,
      FOREIGN KEY (StudentID) REFERENCES Users(UserID)
    );
  `);

  await runSql(db, `
    CREATE TABLE IF NOT EXISTS AdmissionApplications (
      ApplicationID INTEGER PRIMARY KEY AUTOINCREMENT,
      ApplicantName TEXT NOT NULL,
      Program TEXT NOT NULL,
      Status TEXT NOT NULL DEFAULT 'Submitted' CHECK (Status IN ('Submitted', 'In Review', 'Accepted', 'Rejected')),
      SubmittedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await ensureColumn(db, 'AdmissionApplications', 'Email', "TEXT DEFAULT ''");
  await ensureColumn(db, 'AdmissionApplications', 'Phone', "TEXT DEFAULT ''");
  await ensureColumn(db, 'AdmissionApplications', 'NationalID', "TEXT DEFAULT ''");
  await ensureColumn(db, 'AdmissionApplications', 'DateOfBirth', "TEXT DEFAULT ''");
  await ensureColumn(db, 'AdmissionApplications', 'HighSchool', "TEXT DEFAULT ''");
  await ensureColumn(db, 'AdmissionApplications', 'HighSchoolGPA', "TEXT DEFAULT ''");
  await ensureColumn(db, 'AdmissionApplications', 'PersonalStatement', "TEXT DEFAULT ''");
  await ensureColumn(db, 'AdmissionApplications', 'Documents', "TEXT DEFAULT '[]'");
  await ensureColumn(db, 'AdmissionApplications', 'TrackingCode', "TEXT");
  await ensureColumn(db, 'AdmissionApplications', 'StatusMessage', "TEXT DEFAULT ''");

  await runSql(db, `
    CREATE TABLE IF NOT EXISTS Parents (
      ParentID INTEGER PRIMARY KEY AUTOINCREMENT,
      UserID INTEGER NOT NULL,
      StudentID INTEGER NOT NULL,
      Phone TEXT,
      FOREIGN KEY (UserID) REFERENCES Users(UserID),
      FOREIGN KEY (StudentID) REFERENCES Users(UserID)
    );
  `);

  await runSql(db, `
    INSERT OR IGNORE INTO MaintenanceRequests (RequestID, RoomID, ReportedByUserID, Description, Status)
    VALUES
      (1, 1, 2, 'Projector not working in Hall A', 'open'),
      (2, 9, 3, 'Lab network switch needs inspection', 'in progress');
  `);

  await runSql(db, `
    INSERT OR IGNORE INTO Resources (ResourceID, ResourceName, ResourceType, TotalQuantity, AvailableQuantity)
    VALUES
      (1, 'Laptop Dell XPS', 'Equipment', 10, 8),
      (2, 'MATLAB License', 'Software License', 25, 12),
      (3, 'Robotics Kit', 'Equipment', 8, 5),
      (4, 'Cloud Lab Seat', 'Software License', 60, 20);
  `);

  await runSql(db, `
    INSERT OR IGNORE INTO ResourceAllocations (AllocationID, ResourceID, AllocatedToUserID, Department, Quantity, DueDate)
    VALUES
      (1, 1, 1, 'Computer Science', 1, '2026-06-01'),
      (2, 2, 4, 'Computer Science', 3, '2026-08-31'),
      (3, 3, 101, 'Computer Science', 1, '2026-06-20');
  `);

  await runSql(db, `
    INSERT OR IGNORE INTO Transcripts (TranscriptID, StudentID, PDFPath, Semester, GPA)
    VALUES
      (1, 1, '/transcripts/student_1_fall2025.pdf', 'Fall 2025', 3.75),
      (2, 22, '/transcripts/student_22_spring2026.pdf', 'Spring 2026', 3.42);
  `);

  await runSql(db, `
    INSERT OR IGNORE INTO AdmissionApplications (ApplicationID, ApplicantName, Program, Status)
    VALUES
      (1, 'Lina Mostafa', 'Computer Engineering', 'Submitted'),
      (2, 'Yehia Samir', 'Software Engineering', 'In Review'),
      (3, 'Nadine Fouad', 'Mechatronics', 'Accepted');
  `);

  await runSql(
    db,
    "UPDATE Users SET JoinDate = COALESCE(NULLIF(JoinDate, ''), date('now'))"
  );
}

async function ensureDemoStudentEnrollments(db) {
  const demoStudents = [
    ['youssef.adel@eng.asu.team15.eg', 'Youssef', 'Adel'],
    ['farida.nasser@eng.asu.team15.eg', 'Farida', 'Nasser'],
    ['omar.hany@eng.asu.team15.eg', 'Omar', 'Hany'],
    ['laila.mostafa@eng.asu.team15.eg', 'Laila', 'Mostafa'],
    ['karim.said@eng.asu.team15.eg', 'Karim', 'Said'],
    ['nour.magdy@eng.asu.team15.eg', 'Nour', 'Magdy'],
    ['mariam.tarek@eng.asu.team15.eg', 'Mariam', 'Tarek'],
    ['mariam.riyad@eng.asu.team15.eg', 'Mariam', 'Riyad'],
    ['mariam.shaker@eng.asu.team15.eg', 'Mariam', 'Shaker'],
    ['maryam.hamdy@eng.asu.team15.eg', 'Maryam', 'Hamdy'],
    ['basmala.hany@eng.asu.team15.eg', 'Basmala', 'Hany'],
    ['hassan.fouad@eng.asu.team15.eg', 'Hassan', 'Fouad'],
    ['salma.ibrahim@eng.asu.team15.eg', 'Salma', 'Ibrahim'],
    ['ali.sherif@eng.asu.team15.eg', 'Ali', 'Sherif'],
    ['jana.wael@eng.asu.team15.eg', 'Jana', 'Wael'],
    ['ziad.samir@eng.asu.team15.eg', 'Ziad', 'Samir'],
    ['nada.khaled@eng.asu.team15.eg', 'Nada', 'Khaled'],
    ['seif.maher@eng.asu.team15.eg', 'Seif', 'Maher'],
    ['hana.ashraf@eng.asu.team15.eg', 'Hana', 'Ashraf'],
    ['adam.yasser@eng.asu.team15.eg', 'Adam', 'Yasser'],
    ['rana.gamal@eng.asu.team15.eg', 'Rana', 'Gamal'],
    ['mazen.nabil@eng.asu.team15.eg', 'Mazen', 'Nabil'],
    ['malak.ayman@eng.asu.team15.eg', 'Malak', 'Ayman'],
    ['yara.hesham@eng.asu.team15.eg', 'Yara', 'Hesham'],
    ['talia.osama@eng.asu.team15.eg', 'Talia', 'Osama'],
    ['fares.amr@eng.asu.team15.eg', 'Fares', 'Amr'],
    ['dina.kareem@eng.asu.team15.eg', 'Dina', 'Kareem'],
    ['eyad.hatem@eng.asu.team15.eg', 'Eyad', 'Hatem'],
    ['leen.sameh@eng.asu.team15.eg', 'Leen', 'Sameh'],
    ['amira.walid@eng.asu.team15.eg', 'Amira', 'Walid'],
    ['marwan.fathy@eng.asu.team15.eg', 'Marwan', 'Fathy'],
    ['sofia.reda@eng.asu.team15.eg', 'Sofia', 'Reda'],
    ['khaled.ehab@eng.asu.team15.eg', 'Khaled', 'Ehab'],
    ['reem.bassem@eng.asu.team15.eg', 'Reem', 'Bassem'],
    ['yassin.nader@eng.asu.team15.eg', 'Yassin', 'Nader'],
    ['mona.tamer@eng.asu.team15.eg', 'Mona', 'Tamer'],
    ['ola.ramy@eng.asu.team15.eg', 'Ola', 'Ramy'],
    ['hussein.adham@eng.asu.team15.eg', 'Hussein', 'Adham'],
    ['judy.mounir@eng.asu.team15.eg', 'Judy', 'Mounir'],
    ['bilal.atef@eng.asu.team15.eg', 'Bilal', 'Atef'],
    ['sara.lotfy@eng.asu.team15.eg', 'Sara', 'Lotfy'],
    ['tarek.hassan@eng.asu.team15.eg', 'Tarek', 'Hassan'],
    ['mai.ahmed@eng.asu.team15.eg', 'Mai', 'Ahmed'],
    ['ahmed.saber@eng.asu.team15.eg', 'Ahmed', 'Saber']
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
  const dbExisted = fileExists(DB_PATH);
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Users'", async (err, row) => {
      if (err) return reject(err);
      if (row) {
        try {
          console.log(`[initDb] Existing database found at ${DB_PATH} — applying migrations.`);
          await ensureSchema(db);
          await ensureDemoStudentEnrollments(db);
          console.log('[initDb] Migrations complete.');
          return resolve(db);
        } catch (error) {
          return reject(error);
        }
      }

      try {
        console.log(
          dbExisted
            ? `[initDb] Empty database at ${DB_PATH} — seeding from SQL files.`
            : `[initDb] No database at ${DB_PATH} — creating and seeding.`
        );
        const combinedSql = SQL_FILES.map(getSqlText).join('\n');
        await runSql(db, combinedSql);
        await ensureSchema(db);
        await ensureDemoStudentEnrollments(db);
        console.log(`[initDb] Seeded ${SQL_FILES.length} SQL files and applied schema.`);
        resolve(db);
      } catch (error) {
        reject(error);
      }
    });
  });
}

module.exports = { initDatabase };

if (require.main === module) {
  initDatabase()
    .then((db) => {
      db.close();
      process.exit(0);
    })
    .catch((error) => {
      console.error('[initDb] Failed:', error.message);
      process.exit(1);
    });
}
