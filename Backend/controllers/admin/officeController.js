const { runQuery, runGet, runExec, authenticate, requireRoles } = require('../utils');

module.exports = function setupAdminOfficeRoutes(app) {
  app.get('/api/admin/office', authenticate, requireRoles(['Admin']), async (req, res) => {
    try {
      const [students, transcripts, applications] = await Promise.all([
        runQuery(
          req.app.locals.db,
          `SELECT u.UserID, u.Username, u.GivenName, u.FamilyName, u.Department,
                  COUNT(e.EnrollmentID) AS EnrolledCourses,
                  MAX(t.GPA) AS LatestGPA,
                  MAX(t.GeneratedDate) AS LastTranscriptDate
           FROM Users u
           LEFT JOIN Enrollments e ON e.UserID = u.UserID AND e.Status != 'Dropped'
           LEFT JOIN Transcripts t ON t.StudentID = u.UserID
           WHERE u.Role = 'Student'
           GROUP BY u.UserID
           ORDER BY u.FamilyName, u.GivenName`
        ),
        runQuery(
          req.app.locals.db,
          `SELECT t.TranscriptID, t.StudentID, t.GeneratedDate, t.PDFPath, t.Semester, t.GPA,
                  COALESCE(NULLIF(TRIM(u.GivenName || ' ' || u.FamilyName), ''), u.Username) AS StudentName
           FROM Transcripts t
           JOIN Users u ON u.UserID = t.StudentID
           ORDER BY t.GeneratedDate DESC, t.TranscriptID DESC`
        ),
        runQuery(
          req.app.locals.db,
          `SELECT ApplicationID, ApplicantName, Program, Status, SubmittedAt,
                  Email, Phone, NationalID, DateOfBirth, HighSchool, HighSchoolGPA,
                  PersonalStatement, Documents, TrackingCode, StatusMessage
           FROM AdmissionApplications
           ORDER BY SubmittedAt DESC, ApplicationID DESC`
        )
      ]);

      res.json({ students, transcripts, applications });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/students/:studentId', authenticate, requireRoles(['Admin']), async (req, res) => {
    try {
      const studentId = Number(req.params.studentId);
      const { givenName, familyName, department } = req.body;
      if (!studentId || !String(givenName || '').trim() || !String(familyName || '').trim()) {
        return res.status(400).json({ error: 'Student name is required.' });
      }

      await runExec(
        req.app.locals.db,
        `UPDATE Users SET GivenName = ?, FamilyName = ?, Department = ? WHERE UserID = ? AND Role = 'Student'`,
        [String(givenName).trim(), String(familyName).trim(), String(department || 'General').trim(), studentId]
      );

      const updated = await runGet(
        req.app.locals.db,
        `SELECT UserID, Username, GivenName, FamilyName, Department FROM Users WHERE UserID = ?`,
        [studentId]
      );
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/transcripts', authenticate, requireRoles(['Admin']), async (req, res) => {
    try {
      const studentId = Number(req.body.studentId);
      const semester = String(req.body.semester || '').trim() || 'Current Semester';
      const gpa = req.body.gpa === '' || req.body.gpa === undefined ? null : Number(req.body.gpa);

      if (!studentId) {
        return res.status(400).json({ error: 'Student is required.' });
      }
      if (gpa !== null && (Number.isNaN(gpa) || gpa < 0 || gpa > 4)) {
        return res.status(400).json({ error: 'GPA must be between 0 and 4.' });
      }

      const student = await runGet(
        req.app.locals.db,
        `SELECT UserID FROM Users WHERE UserID = ? AND Role = 'Student'`,
        [studentId]
      );
      if (!student) {
        return res.status(404).json({ error: 'Student not found.' });
      }

      const result = await runExec(
        req.app.locals.db,
        `INSERT INTO Transcripts (StudentID, PDFPath, Semester, GPA)
         VALUES (?, ?, ?, ?)`,
        [studentId, `/transcripts/student_${studentId}_${semester.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.pdf`, semester, gpa]
      );

      const transcript = await runGet(
        req.app.locals.db,
        `SELECT t.TranscriptID, t.StudentID, t.GeneratedDate, t.PDFPath, t.Semester, t.GPA,
                COALESCE(NULLIF(TRIM(u.GivenName || ' ' || u.FamilyName), ''), u.Username) AS StudentName
         FROM Transcripts t
         JOIN Users u ON u.UserID = t.StudentID
         WHERE t.TranscriptID = ?`,
        [result.lastID]
      );

      res.status(201).json(transcript);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
