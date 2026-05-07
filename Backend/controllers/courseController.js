const { runQuery, runExec, runGet, authenticate } = require('./utils');

async function ensureStudentCourseSchema(db) {
  const assignmentColumns = await runQuery(db, 'PRAGMA table_info(Assignments)');
  if (!assignmentColumns.some((column) => column.name === 'Category')) {
    await runExec(db, "ALTER TABLE Assignments ADD COLUMN Category TEXT NOT NULL DEFAULT 'Assignment'");
  }

  await runExec(db, `CREATE TABLE IF NOT EXISTS StudentSubmissions (
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
  )`);
}

async function getStudentEnrollment(db, userId, courseId) {
  return runGet(
    db,
    `SELECT e.EnrollmentID, e.Status, c.CourseID, c.CourseCode, c.CourseName, c.Instructor, c.Credits, c.Description
     FROM Enrollments e
     INNER JOIN Courses c ON c.CourseID = e.CourseID
     WHERE e.UserID = ? AND e.CourseID = ? AND e.Status != 'Dropped'`,
    [userId, Number(courseId)]
  );
}

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

async function getOrAssignAdvisor(db, studentId) {
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

module.exports = function setupCourseRoutes(app) {
  app.get('/api/courses', authenticate, async (req, res) => {
    try {
      const courses = await runQuery(
        req.app.locals.db,
        `SELECT CourseID, CourseCode, CourseName, Instructor, Credits, Description
         FROM Courses
         ORDER BY CourseName`
      );
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/courses/:courseId', authenticate, async (req, res) => {
    try {
      const course = await runGet(
        req.app.locals.db,
        `SELECT CourseID, CourseCode, CourseName, Instructor, Credits, Description
         FROM Courses
         WHERE CourseID = ?`,
        [Number(req.params.courseId)]
      );

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      res.json({
        id: course.CourseID,
        title: course.CourseName,
        courseCode: course.CourseCode,
        description: course.Description,
        fullDescription: course.Description,
        instructor: course.Instructor || 'Instructor pending',
        instructorEmail: 'Available from staff directory',
        officeHours: 'Available from staff directory',
        credits: course.Credits || 3,
        semester: 'Current semester',
        assignments: 'See course page',
        midterm: 'See course page',
        final: 'See course page',
        participation: 'See course page',
        prerequisites: 'None listed'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/my-courses', authenticate, async (req, res) => {
    try {
      const courses = await runQuery(
        req.app.locals.db,
        `SELECT c.CourseID, c.CourseCode, c.CourseName, c.Instructor, c.Credits, c.Description,
                e.EnrollmentID, e.Status
         FROM Enrollments e
         INNER JOIN Courses c ON e.CourseID = c.CourseID
         WHERE e.UserID = ? AND e.Status != 'Dropped'
         ORDER BY c.CourseName`,
        [req.user.UserID]
      );
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.delete('/api/my-courses/:enrollmentId', authenticate, async (req, res) => {
    try {
      await ensureAdvisorWorkflowSchema(req.app.locals.db);

      const enrollment = await runGet(
        req.app.locals.db,
        `SELECT EnrollmentID, CourseID, Status FROM Enrollments WHERE EnrollmentID = ? AND UserID = ? AND Status != 'Dropped'`,
        [req.params.enrollmentId, req.user.UserID]
      );

      if (!enrollment) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }

      if (enrollment.Status === 'Drop Pending') {
        return res.status(409).json({ error: 'Drop request is already pending advisor review.' });
      }

      const existingRequest = await runGet(
        req.app.locals.db,
        `SELECT RequestID
         FROM AcademicRequests
         WHERE EnrollmentID = ? AND RequestType = 'DropCourse' AND Status = 'Pending'`,
        [enrollment.EnrollmentID]
      );
      if (existingRequest) {
        return res.status(409).json({ error: 'Drop request is already pending advisor review.' });
      }

      const advisorId = await getOrAssignAdvisor(req.app.locals.db, req.user.UserID);

      await runExec(
        req.app.locals.db,
        `UPDATE Enrollments SET Status = 'Drop Pending' WHERE EnrollmentID = ?`,
        [enrollment.EnrollmentID]
      );
      const request = await runExec(
        req.app.locals.db,
        `INSERT INTO AcademicRequests (RequestType, EnrollmentID, CourseID, StudentID, AdvisorID)
         VALUES ('DropCourse', ?, ?, ?, ?)`,
        [enrollment.EnrollmentID, enrollment.CourseID, req.user.UserID, advisorId]
      );

      res.json({ message: 'Drop request sent to advisor.', RequestID: request.lastID, status: 'Drop Pending' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/my-courses/:courseId/details', authenticate, async (req, res) => {
    try {
      await ensureStudentCourseSchema(req.app.locals.db);
      const course = await getStudentEnrollment(req.app.locals.db, req.user.UserID, req.params.courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found in your enrollments' });
      }

      const [materials, assignments, submissions, grades] = await Promise.all([
        runQuery(
          req.app.locals.db,
          `SELECT MaterialID, CourseID, Title, Type, Url, Notes, UploadedAt
           FROM CourseMaterials
           WHERE CourseID = ?
           ORDER BY UploadedAt DESC`,
          [course.CourseID]
        ),
        runQuery(
          req.app.locals.db,
          `SELECT AssignmentID, CourseID, Title, Category, DueDate, MaxScore
           FROM Assignments
           WHERE CourseID = ?
           ORDER BY DueDate, AssignmentID`,
          [course.CourseID]
        ),
        runQuery(
          req.app.locals.db,
          `SELECT SubmissionID, AssignmentID, CourseID, StudentID, Content, FileName, FileUrl, SubmittedAt, Status
           FROM StudentSubmissions
           WHERE CourseID = ? AND StudentID = ?`,
          [course.CourseID, req.user.UserID]
        ),
        runQuery(
          req.app.locals.db,
          `SELECT g.GradeID, g.AssignmentID, g.Score, g.Feedback
           FROM Grades g
           INNER JOIN Assignments a ON a.AssignmentID = g.AssignmentID
           WHERE a.CourseID = ? AND g.StudentID = ?`,
          [course.CourseID, req.user.UserID]
        )
      ]);

      res.json({ course, materials, assignments, submissions, grades });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/my-courses/:courseId/submissions', authenticate, async (req, res) => {
    try {
      await ensureStudentCourseSchema(req.app.locals.db);
      const course = await getStudentEnrollment(req.app.locals.db, req.user.UserID, req.params.courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found in your enrollments' });
      }

      const { assignmentId, content, fileName, fileUrl } = req.body;
      if (!assignmentId) {
        return res.status(400).json({ error: 'Assignment or quiz is required' });
      }

      const assignment = await runGet(
        req.app.locals.db,
        `SELECT AssignmentID, Category FROM Assignments WHERE AssignmentID = ? AND CourseID = ?`,
        [Number(assignmentId), course.CourseID]
      );
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found for this course' });
      }

      const trimmedContent = String(content || '').trim();
      const trimmedFileName = String(fileName || '').trim();
      const trimmedFileUrl = String(fileUrl || '').trim();
      if (!trimmedContent && !trimmedFileName && !trimmedFileUrl) {
        return res.status(400).json({ error: 'Add an answer, uploaded file name, or file link.' });
      }

      const existing = await runGet(
        req.app.locals.db,
        `SELECT SubmissionID FROM StudentSubmissions WHERE AssignmentID = ? AND StudentID = ?`,
        [Number(assignmentId), req.user.UserID]
      );

      if (existing) {
        await runExec(
          req.app.locals.db,
          `UPDATE StudentSubmissions
           SET Content = ?, FileName = ?, FileUrl = ?, SubmittedAt = CURRENT_TIMESTAMP, Status = 'Submitted'
           WHERE SubmissionID = ?`,
          [trimmedContent, trimmedFileName, trimmedFileUrl, existing.SubmissionID]
        );
        return res.json({ SubmissionID: existing.SubmissionID, AssignmentID: Number(assignmentId), Status: 'Submitted' });
      }

      const result = await runExec(
        req.app.locals.db,
        `INSERT INTO StudentSubmissions (AssignmentID, CourseID, StudentID, Content, FileName, FileUrl)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [Number(assignmentId), course.CourseID, req.user.UserID, trimmedContent, trimmedFileName, trimmedFileUrl]
      );

      res.status(201).json({ SubmissionID: result.lastID, AssignmentID: Number(assignmentId), Status: 'Submitted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
