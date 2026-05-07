const { runQuery, runGet, runExec, authenticate, requireRoles, isStaffRole } = require('./utils');

function staffNameVariants(user) {
  const fullName = `${user.GivenName || ''} ${user.FamilyName || ''}`.trim();
  return Array.from(new Set([fullName, fullName ? `Dr. ${fullName}` : '', user.Username].filter(Boolean)));
}

async function getStaffRecord(db, user) {
  return runGet(
    db,
    `SELECT * FROM Staff
     WHERE lower(ContactInfo) = lower(?)
        OR lower(Name) = lower(?)
        OR lower(Name) = lower(?)`,
    [user.Username, `${user.GivenName || ''} ${user.FamilyName || ''}`.trim(), `Dr. ${user.GivenName || ''} ${user.FamilyName || ''}`.trim()]
  );
}

function courseMatchesStaff(course, user, staffRecord) {
  if (user.Role === 'Admin' || user.Role === 'Staff' || user.Role === 'Advisor') return true;

  const instructor = String(course.Instructor || '').toLowerCase();
  const courseName = String(course.CourseName || '').toLowerCase();
  const courseCode = String(course.CourseCode || '').toLowerCase();
  const variants = staffNameVariants(user).map((value) => value.toLowerCase());

  if (variants.some((name) => instructor.includes(name))) return true;

  const assignedCourses = String(staffRecord?.AssignedCourses || '').toLowerCase();
  return assignedCourses.includes(courseName) || assignedCourses.includes(courseCode);
}

async function ensureTeachingSchema(db) {
  await runExec(db, `CREATE TABLE IF NOT EXISTS CourseMaterials (
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
  )`);

  await runExec(db, `CREATE TABLE IF NOT EXISTS CourseTeachingRequests (
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
  )`);

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

async function getTeachingCourses(db, user) {
  const [courses, staffRecord] = await Promise.all([
    runQuery(db, `SELECT CourseID, CourseCode, CourseName, Instructor, Credits, Description FROM Courses ORDER BY CourseName`),
    getStaffRecord(db, user)
  ]);

  return courses.filter((course) => courseMatchesStaff(course, user, staffRecord));
}

async function requireTeachingCourse(req, res, courseId) {
  const courses = await getTeachingCourses(req.app.locals.db, req.user);
  const course = courses.find((item) => Number(item.CourseID) === Number(courseId));
  if (!course) {
    res.status(403).json({ error: 'You can only manage courses assigned to you.' });
    return null;
  }
  return course;
}

module.exports = function setupTeachingRoutes(app) {
  app.get('/api/teaching/courses', authenticate, requireRoles(['Staff']), async (req, res) => {
    try {
      if (!isStaffRole(req.user.Role)) {
        return res.status(403).json({ error: 'Staff access required' });
      }

      await ensureTeachingSchema(req.app.locals.db);
      const courses = await getTeachingCourses(req.app.locals.db, req.user);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/teaching/catalog', authenticate, requireRoles(['Staff']), async (req, res) => {
    try {
      await ensureTeachingSchema(req.app.locals.db);

      const courses = await runQuery(
        req.app.locals.db,
        `SELECT c.CourseID, c.CourseCode, c.CourseName, c.Instructor, c.Credits, c.Description,
                r.RequestID, r.Status AS RequestStatus, r.RequestedAt
         FROM Courses c
         LEFT JOIN CourseTeachingRequests r
           ON r.CourseID = c.CourseID AND r.UserID = ?
         ORDER BY c.CourseName`,
        [req.user.UserID]
      );

      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/teaching/requests', authenticate, requireRoles(['Staff']), async (req, res) => {
    try {
      await ensureTeachingSchema(req.app.locals.db);

      const { courseId, message } = req.body;
      if (!courseId) {
        return res.status(400).json({ error: 'Course is required' });
      }

      const course = await runGet(req.app.locals.db, `SELECT CourseID FROM Courses WHERE CourseID = ?`, [Number(courseId)]);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      const existing = await runGet(
        req.app.locals.db,
        `SELECT RequestID, Status FROM CourseTeachingRequests WHERE CourseID = ? AND UserID = ?`,
        [Number(courseId), req.user.UserID]
      );
      if (existing) {
        return res.status(409).json({ error: `You already have a ${existing.Status.toLowerCase()} request for this course.` });
      }

      const result = await runExec(
        req.app.locals.db,
        `INSERT INTO CourseTeachingRequests (CourseID, UserID, Role, Message) VALUES (?, ?, ?, ?)`,
        [Number(courseId), req.user.UserID, req.user.Role, message || '']
      );

      res.status(201).json({
        RequestID: result.lastID,
        CourseID: Number(courseId),
        UserID: req.user.UserID,
        Status: 'Pending'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/teaching/courses/:courseId', authenticate, requireRoles(['Staff']), async (req, res) => {
    try {
      await ensureTeachingSchema(req.app.locals.db);
      const course = await requireTeachingCourse(req, res, req.params.courseId);
      if (!course) return;

      const [students, assignments, grades, materials, submissions] = await Promise.all([
        runQuery(
          req.app.locals.db,
          `SELECT e.EnrollmentID, e.StudentName, e.Status, e.UserID,
                  u.Username, u.GivenName, u.FamilyName
           FROM Enrollments e
           LEFT JOIN Users u ON u.UserID = e.UserID
           WHERE e.CourseID = ? AND e.Status != 'Dropped'
           ORDER BY COALESCE(u.GivenName || ' ' || u.FamilyName, e.StudentName)`,
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
          `SELECT g.GradeID, g.StudentID, g.AssignmentID, g.Score, g.Feedback
           FROM Grades g
           INNER JOIN Assignments a ON a.AssignmentID = g.AssignmentID
           WHERE a.CourseID = ?`,
          [course.CourseID]
        ),
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
          `SELECT s.SubmissionID, s.AssignmentID, s.CourseID, s.StudentID, s.Content, s.FileName,
                  s.FileUrl, s.SubmittedAt, s.Status,
                  a.Title AS AssignmentTitle, a.Category,
                  u.Username, u.GivenName, u.FamilyName
           FROM StudentSubmissions s
           INNER JOIN Assignments a ON a.AssignmentID = s.AssignmentID
           LEFT JOIN Users u ON u.UserID = s.StudentID
           WHERE s.CourseID = ?
           ORDER BY s.SubmittedAt DESC`,
          [course.CourseID]
        )
      ]);

      res.json({ course, students, assignments, grades, materials, submissions });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/teaching/courses/:courseId/assignments', authenticate, requireRoles(['Staff']), async (req, res) => {
    try {
      const course = await requireTeachingCourse(req, res, req.params.courseId);
      if (!course) return;

      await ensureTeachingSchema(req.app.locals.db);
      const { title, category, dueDate, maxScore } = req.body;
      if (!title || !String(title).trim()) {
        return res.status(400).json({ error: 'Assignment title is required' });
      }

      const result = await runExec(
        req.app.locals.db,
        `INSERT INTO Assignments (CourseID, Title, Category, DueDate, MaxScore) VALUES (?, ?, ?, ?, ?)`,
        [course.CourseID, String(title).trim(), category || 'Assignment', dueDate || '', Number(maxScore) || 100]
      );

      res.status(201).json({ AssignmentID: result.lastID, CourseID: course.CourseID, Title: title, Category: category || 'Assignment', DueDate: dueDate || '', MaxScore: Number(maxScore) || 100 });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/teaching/courses/:courseId/grades', authenticate, requireRoles(['Staff']), async (req, res) => {
    try {
      const course = await requireTeachingCourse(req, res, req.params.courseId);
      if (!course) return;

      const { studentId, assignmentId, score, feedback } = req.body;
      if (!studentId || !assignmentId || score === undefined || score === '') {
        return res.status(400).json({ error: 'Student, assignment, and score are required' });
      }

      const assignment = await runGet(
        req.app.locals.db,
        `SELECT AssignmentID, MaxScore FROM Assignments WHERE AssignmentID = ? AND CourseID = ?`,
        [Number(assignmentId), course.CourseID]
      );
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found for this course' });
      }

      const existing = await runGet(
        req.app.locals.db,
        `SELECT GradeID FROM Grades WHERE StudentID = ? AND AssignmentID = ?`,
        [Number(studentId), Number(assignmentId)]
      );

      if (existing) {
        await runExec(
          req.app.locals.db,
          `UPDATE Grades SET Score = ?, Feedback = ? WHERE GradeID = ?`,
          [Number(score), feedback || '', existing.GradeID]
        );
        return res.json({ GradeID: existing.GradeID, StudentID: Number(studentId), AssignmentID: Number(assignmentId), Score: Number(score), Feedback: feedback || '' });
      }

      const result = await runExec(
        req.app.locals.db,
        `INSERT INTO Grades (StudentID, AssignmentID, Score, Feedback) VALUES (?, ?, ?, ?)`,
        [Number(studentId), Number(assignmentId), Number(score), feedback || '']
      );
      res.status(201).json({ GradeID: result.lastID, StudentID: Number(studentId), AssignmentID: Number(assignmentId), Score: Number(score), Feedback: feedback || '' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/teaching/courses/:courseId/materials', authenticate, requireRoles(['Staff']), async (req, res) => {
    try {
      await ensureTeachingSchema(req.app.locals.db);
      const course = await requireTeachingCourse(req, res, req.params.courseId);
      if (!course) return;

      const { title, type, url, notes } = req.body;
      if (!title || !String(title).trim()) {
        return res.status(400).json({ error: 'Material title is required' });
      }

      const result = await runExec(
        req.app.locals.db,
        `INSERT INTO CourseMaterials (CourseID, Title, Type, Url, Notes, UploadedBy) VALUES (?, ?, ?, ?, ?, ?)`,
        [course.CourseID, String(title).trim(), type || 'Link', url || '', notes || '', req.user.UserID]
      );

      res.status(201).json({ MaterialID: result.lastID, CourseID: course.CourseID, Title: title, Type: type || 'Link', Url: url || '', Notes: notes || '' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
