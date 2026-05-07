const { runQuery, runExec, runGet, authenticate } = require('./utils');

async function ensureAdvisorWorkflowSchema(db) {
  await runExec(db, `
    CREATE TABLE IF NOT EXISTS AdvisorStudentLimits (
      AdvisorID INTEGER PRIMARY KEY,
      MaxStudents INTEGER NOT NULL DEFAULT 20,
      FOREIGN KEY (AdvisorID) REFERENCES Staff(StaffID)
    );
  `);

  await runExec(db, `
    CREATE TABLE IF NOT EXISTS AdvisorAssignments (
      AssignmentID INTEGER PRIMARY KEY AUTOINCREMENT,
      AdvisorID INTEGER NOT NULL,
      StudentID INTEGER NOT NULL UNIQUE,
      AssignedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (AdvisorID) REFERENCES Staff(StaffID),
      FOREIGN KEY (StudentID) REFERENCES Users(UserID)
    );
  `);

  await runExec(db, `
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
}

async function ensureStudentAdvisor(db, studentId) {
  const existing = await runGet(
    db,
    `SELECT AdvisorID FROM AdvisorAssignments WHERE StudentID = ?`,
    [studentId]
  );
  if (existing) return existing.AdvisorID;

  const advisor = await runGet(
    db,
    `SELECT s.StaffID AS AdvisorID, COUNT(a.AssignmentID) AS CurrentStudents, l.MaxStudents
     FROM Staff s
     JOIN AdvisorStudentLimits l ON l.AdvisorID = s.StaffID
     LEFT JOIN AdvisorAssignments a ON a.AdvisorID = s.StaffID
     WHERE s.Role = 'Advisor'
     GROUP BY s.StaffID
     HAVING CurrentStudents < l.MaxStudents
     ORDER BY CurrentStudents ASC, s.StaffID ASC
     LIMIT 1`
  );

  if (!advisor) {
    throw new Error('No advisor has available student capacity.');
  }

  await runExec(
    db,
    `INSERT INTO AdvisorAssignments (AdvisorID, StudentID) VALUES (?, ?)`,
    [advisor.AdvisorID, studentId]
  );
  return advisor.AdvisorID;
}

module.exports = function setupEnrollmentRoutes(app) {
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

  app.post('/api/enrollments', authenticate, async (req, res) => {
    try {
      const { courseId } = req.body;
      if (!courseId) {
        return res.status(400).json({ error: 'Course ID is required' });
      }

      await ensureAdvisorWorkflowSchema(req.app.locals.db);

      const activeEnrollment = await runGet(
        req.app.locals.db,
        `SELECT EnrollmentID, Status
         FROM Enrollments
         WHERE UserID = ? AND CourseID = ? AND Status != 'Dropped'`,
        [req.user.UserID, Number(courseId)]
      );

      if (activeEnrollment) {
        return res.status(409).json({ error: `Enrollment already exists with status ${activeEnrollment.Status}.` });
      }

      const advisorId = await ensureStudentAdvisor(req.app.locals.db, req.user.UserID);
      const result = await runExec(
        req.app.locals.db,
        `INSERT INTO Enrollments (UserID, CourseID, Status, StudentName)
         VALUES (?, ?, 'Pending', ?)`,
        [req.user.UserID, Number(courseId), req.user.Username]
      );

      const request = await runExec(
        req.app.locals.db,
        `INSERT INTO AcademicRequests (RequestType, EnrollmentID, CourseID, StudentID, AdvisorID)
         VALUES ('Enrollment', ?, ?, ?, ?)`,
        [result.lastID, Number(courseId), req.user.UserID, advisorId]
      );

      res.status(201).json({
        EnrollmentID: result.lastID,
        RequestID: request.lastID,
        courseId: Number(courseId),
        status: 'Pending'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
