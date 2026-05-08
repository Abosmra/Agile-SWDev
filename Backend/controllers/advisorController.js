const { runExec, runGet, runQuery, authenticate, normalizeRole } = require('./utils');

async function ensureAdvisorTables(db) {
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

  await runExec(db, `
    INSERT OR IGNORE INTO Staff (StaffID, Name, Department, Role, ContactInfo, OfficeHours, AssignedCourses)
    VALUES
      (201, 'Ahmed Hassan', 'Computer Science', 'Advisor', 'ahmed.hassan@eng.asu.team15.eg', 'Sunday and Tuesday, 11:00-13:00', 'Academic advising'),
      (202, 'Sara Mahmoud', 'Computer Science', 'Advisor', 'sara.mahmoud@eng.asu.team15.eg', 'Monday and Wednesday, 10:00-12:00', 'Academic advising'),
      (203, 'Khaled Ibrahim', 'Engineering', 'Advisor', 'khaled.ibrahim@eng.asu.team15.eg', 'Thursday, 12:00-15:00', 'Academic advising');
  `);

  await runExec(db, `
    INSERT OR IGNORE INTO AdvisorStudentLimits (AdvisorID, MaxStudents)
    VALUES (201, 20), (202, 20), (203, 20);
  `);
}

async function getAdvisorStaffProfile(db, user) {
  return runGet(
    db,
    `SELECT StaffID, Name
     FROM Staff
     WHERE Role = 'Advisor'
       AND (lower(ContactInfo) = lower(?) OR Name = ?)
     ORDER BY StaffID
     LIMIT 1`,
    [user.Username, `${user.GivenName || ''} ${user.FamilyName || ''}`.trim()]
  );
}

async function getAssignedAdvisor(db, studentId) {
  return runGet(
    db,
    `SELECT
       s.StaffID AS id,
       s.Name AS name,
       s.Department AS department,
       s.ContactInfo AS contact,
       s.OfficeHours AS officeHours,
       l.MaxStudents AS maxStudents,
       COUNT(a2.AssignmentID) AS currentStudents
     FROM AdvisorAssignments a
     JOIN Staff s ON s.StaffID = a.AdvisorID
     JOIN AdvisorStudentLimits l ON l.AdvisorID = s.StaffID
     LEFT JOIN AdvisorAssignments a2 ON a2.AdvisorID = s.StaffID
     WHERE a.StudentID = ?
     GROUP BY s.StaffID`,
    [studentId]
  );
}

async function chooseAdvisor(db) {
  return runGet(
    db,
    `SELECT
       s.StaffID AS id,
       s.Name AS name,
       s.Department AS department,
       s.ContactInfo AS contact,
       s.OfficeHours AS officeHours,
       l.MaxStudents AS maxStudents,
       COUNT(a.AssignmentID) AS currentStudents
     FROM Staff s
     JOIN AdvisorStudentLimits l ON l.AdvisorID = s.StaffID
     LEFT JOIN AdvisorAssignments a ON a.AdvisorID = s.StaffID
     WHERE s.Role = 'Advisor'
     GROUP BY s.StaffID
     HAVING currentStudents < l.MaxStudents
     ORDER BY currentStudents ASC, s.StaffID ASC
     LIMIT 1`
  );
}

module.exports = function setupAdvisorRoutes(app) {
  app.get('/api/my-advisor', authenticate, async (req, res) => {
    try {
      await ensureAdvisorTables(req.app.locals.db);

      let advisor = await getAssignedAdvisor(req.app.locals.db, req.user.UserID);
      if (!advisor) {
        advisor = await chooseAdvisor(req.app.locals.db);
        if (!advisor) {
          return res.status(404).json({ error: 'No advisor has available student capacity.' });
        }

        await runExec(
          req.app.locals.db,
          `INSERT INTO AdvisorAssignments (AdvisorID, StudentID) VALUES (?, ?)`,
          [advisor.id, req.user.UserID]
        );

        advisor = await getAssignedAdvisor(req.app.locals.db, req.user.UserID);
      }

      res.json(advisor);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/advisor/requests', authenticate, async (req, res) => {
    try {
      await ensureAdvisorTables(req.app.locals.db);
      const role = normalizeRole(req.user.Role);
      if (role !== 'Advisor' && role !== 'Admin') {
        return res.status(403).json({ error: 'Only advisors can review academic requests.' });
      }

      const advisor = role === 'Admin'
        ? null
        : await getAdvisorStaffProfile(req.app.locals.db, req.user);

      if (role === 'Advisor' && !advisor) {
        return res.status(404).json({ error: 'Advisor staff profile not found.' });
      }

      const params = advisor ? [advisor.StaffID] : [];
      const advisorFilter = advisor ? 'WHERE r.AdvisorID = ?' : '';
      const requests = await runQuery(
        req.app.locals.db,
        `SELECT
           r.RequestID,
           r.RequestType,
           r.EnrollmentID,
           r.CourseID,
           r.StudentID,
           r.AdvisorID,
           r.Status,
           r.RequestedAt,
           r.ReviewedAt,
           c.CourseCode,
           c.CourseName,
           u.GivenName || ' ' || u.FamilyName AS StudentName,
           u.Username AS StudentEmail,
           s.Name AS AdvisorName
         FROM AcademicRequests r
         JOIN Courses c ON c.CourseID = r.CourseID
         JOIN Users u ON u.UserID = r.StudentID
         JOIN Staff s ON s.StaffID = r.AdvisorID
         ${advisorFilter}
         ORDER BY
           CASE r.Status WHEN 'Pending' THEN 0 WHEN 'Approved' THEN 1 ELSE 2 END,
           r.RequestedAt DESC`,
        params
      );

      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/advisor/requests/:requestId/:decision', authenticate, async (req, res) => {
    try {
      await ensureAdvisorTables(req.app.locals.db);
      const role = normalizeRole(req.user.Role);
      if (role !== 'Advisor' && role !== 'Admin') {
        return res.status(403).json({ error: 'Only advisors can review academic requests.' });
      }

      const decision = String(req.params.decision || '').toLowerCase();
      if (!['approve', 'cancel'].includes(decision)) {
        return res.status(400).json({ error: 'Decision must be approve or cancel.' });
      }

      const advisor = role === 'Admin'
        ? null
        : await getAdvisorStaffProfile(req.app.locals.db, req.user);
      if (role === 'Advisor' && !advisor) {
        return res.status(404).json({ error: 'Advisor staff profile not found.' });
      }

      const request = await runGet(
        req.app.locals.db,
        `SELECT * FROM AcademicRequests WHERE RequestID = ?`,
        [Number(req.params.requestId)]
      );
      if (!request || request.Status !== 'Pending') {
        return res.status(404).json({ error: 'Pending request not found.' });
      }
      if (advisor && request.AdvisorID !== advisor.StaffID) {
        return res.status(403).json({ error: 'This request is assigned to another advisor.' });
      }

      const approved = decision === 'approve';
      const requestStatus = approved ? 'Approved' : 'Cancelled';
      let enrollmentStatus;
      if (request.RequestType === 'Enrollment') {
        enrollmentStatus = approved ? 'Enrolled' : 'Dropped';
      } else {
        enrollmentStatus = approved ? 'Dropped' : 'Enrolled';
      }

      await runExec(
        req.app.locals.db,
        `UPDATE Enrollments SET Status = ? WHERE EnrollmentID = ?`,
        [enrollmentStatus, request.EnrollmentID]
      );
      await runExec(
        req.app.locals.db,
        `UPDATE AcademicRequests
         SET Status = ?, ReviewedAt = CURRENT_TIMESTAMP
         WHERE RequestID = ?`,
        [requestStatus, request.RequestID]
      );

      res.json({ message: `Request ${requestStatus.toLowerCase()}.`, enrollmentStatus });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
