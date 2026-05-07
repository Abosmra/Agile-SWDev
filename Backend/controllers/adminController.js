const { runQuery, runGet, runExec, authenticate, requireRoles } = require('./utils');

async function countRows(db, sql, params = []) {
  const row = await runGet(db, sql, params);
  return row ? row.Total : 0;
}

module.exports = function setupAdminRoutes(app) {

  app.get('/api/admin/staff-performance', authenticate, requireRoles(['Admin']), async (req, res) => {
    try {
      const staff = await runQuery(
        req.app.locals.db,
        `SELECT StaffID, Name, Role, Department, PerformanceScore, Research, ProfessionalDevelopment
         FROM Staff
         ORDER BY Role, Name`
      );
      res.json(staff);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/update-staff-performance', authenticate, requireRoles(['Admin']), async (req, res) => {
    try {
      const { staffId, PerformanceScore, Research, ProfessionalDevelopment } = req.body;
      await runExec(
        req.app.locals.db,
        `UPDATE Staff
         SET PerformanceScore = ?, Research = ?, ProfessionalDevelopment = ?
         WHERE StaffID = ?`,
        [PerformanceScore, Research, ProfessionalDevelopment, staffId]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/admin/dashboard', authenticate, requireRoles(['Admin']), async (req, res) => {
    try {
      const db = req.app.locals.db;

      const [
        totalUsers,
        totalStudents,
        totalStaff,
        totalCourses,
        totalEnrollments,
        totalAssignments,
        totalGrades,
        totalMaterials,
        totalMessages,
        totalAnnouncements,
        totalBookings,
        pendingBookings,
        totalHalls,
        labs,
        openMaintenance,
        totalResources,
        activeAllocations,
        transcriptCount,
        admissionApplications,
        parentLinks,
        avgPerformanceRow
      ] = await Promise.all([
        countRows(db, 'SELECT COUNT(*) AS Total FROM Users'),
        countRows(db, "SELECT COUNT(*) AS Total FROM Users WHERE Role = 'Student'"),
        countRows(db, "SELECT COUNT(*) AS Total FROM Users WHERE Role IN ('Staff', 'Admin', 'Doctor', 'TA', 'Advisor')"),
        countRows(db, 'SELECT COUNT(*) AS Total FROM Courses'),
        countRows(db, "SELECT COUNT(*) AS Total FROM Enrollments WHERE Status != 'Dropped'"),
        countRows(db, 'SELECT COUNT(*) AS Total FROM Assignments'),
        countRows(db, 'SELECT COUNT(*) AS Total FROM Grades'),
        countRows(db, 'SELECT COUNT(*) AS Total FROM CourseMaterials'),
        countRows(db, 'SELECT COUNT(*) AS Total FROM Messages'),
        countRows(db, 'SELECT COUNT(*) AS Total FROM Announcements'),
        countRows(db, "SELECT COUNT(*) AS Total FROM Bookings WHERE Status != 'Cancelled'"),
        countRows(db, "SELECT COUNT(*) AS Total FROM Bookings WHERE Status = 'Pending'"),
        countRows(db, 'SELECT COUNT(*) AS Total FROM Halls'),
        countRows(db, 'SELECT COUNT(*) AS Total FROM Halls WHERE IsLab = 1'),
        countRows(db, "SELECT COUNT(*) AS Total FROM MaintenanceRequests WHERE Status != 'closed'"),
        countRows(db, 'SELECT COUNT(*) AS Total FROM Resources'),
        countRows(db, 'SELECT COUNT(*) AS Total FROM ResourceAllocations WHERE ReturnedDate IS NULL'),
        countRows(db, 'SELECT COUNT(*) AS Total FROM Transcripts'),
        countRows(db, "SELECT COUNT(*) AS Total FROM AdmissionApplications WHERE Status IN ('Submitted', 'In Review')"),
        countRows(db, 'SELECT COUNT(*) AS Total FROM Parents'),
        runGet(db, 'SELECT ROUND(AVG(PerformanceScore), 1) AS AverageScore FROM Staff')
      ]);

      const [courseLoad, recentBookings, maintenance, resources, staffPerformance, recentMessages, applications] = await Promise.all([
        runQuery(
          db,
          `SELECT c.CourseID, c.CourseCode, c.CourseName, c.Instructor, COUNT(e.EnrollmentID) AS EnrollmentCount
           FROM Courses c
           LEFT JOIN Enrollments e ON e.CourseID = c.CourseID AND e.Status != 'Dropped'
           GROUP BY c.CourseID
           ORDER BY EnrollmentCount DESC, c.CourseName
           LIMIT 6`
        ),
        runQuery(
          db,
          `SELECT b.BookingID, b.Date, b.StartTime, b.EndTime, b.Purpose, b.Status, h.HallName, u.Username AS RequestedBy
           FROM Bookings b
           JOIN Halls h ON h.HallID = b.HallID
           JOIN Users u ON u.UserID = b.UserID
           WHERE b.Status != 'Cancelled'
           ORDER BY b.Date DESC, b.StartTime DESC
           LIMIT 5`
        ),
        runQuery(
          db,
          `SELECT mr.RequestID, mr.Description, mr.Status, mr.ReportedDate, h.HallName
           FROM MaintenanceRequests mr
           JOIN Halls h ON h.HallID = mr.RoomID
           ORDER BY mr.ReportedDate DESC
           LIMIT 5`
        ),
        runQuery(
          db,
          `SELECT r.ResourceID, r.ResourceName, r.ResourceType, r.TotalQuantity, r.AvailableQuantity,
                  COALESCE(SUM(CASE WHEN ra.ReturnedDate IS NULL THEN ra.Quantity ELSE 0 END), 0) AS AllocatedQuantity
           FROM Resources r
           LEFT JOIN ResourceAllocations ra ON ra.ResourceID = r.ResourceID
           GROUP BY r.ResourceID
           ORDER BY r.ResourceName`
        ),
        runQuery(
          db,
          `SELECT StaffID, Name, Role, Department, PerformanceScore, ProfessionalDevelopment, PayrollStatus, LeaveBalance
           FROM Staff
           ORDER BY PerformanceScore DESC, Name
           LIMIT 6`
        ),
        runQuery(
          db,
          `SELECT m.MessageID, m.Body, m.SentDate,
                  sender.GivenName || ' ' || sender.FamilyName AS SenderName,
                  CASE
                    WHEN sender.Role = 'Student'
                      THEN COALESCE(NULLIF(TRIM(sender.GivenName || ' ' || sender.FamilyName), ''), sender.Username)
                    WHEN receiver.Role = 'Student'
                      THEN COALESCE(NULLIF(TRIM(receiver.GivenName || ' ' || receiver.FamilyName), ''), receiver.Username)
                    ELSE COALESCE(NULLIF(TRIM(sender.GivenName || ' ' || sender.FamilyName), ''), sender.Username)
                  END AS ConversationUserName,
                  staff.Name AS StaffName
           FROM Messages m
           JOIN Users sender ON sender.UserID = m.FromUserID
           LEFT JOIN Users receiver ON receiver.UserID = m.ToUserID
           LEFT JOIN Staff staff ON staff.StaffID = m.ToStaffID
           ORDER BY m.SentDate DESC, m.MessageID DESC
           LIMIT 5`
        ),
        runQuery(
          db,
          `SELECT ApplicationID, ApplicantName, Program, Status, SubmittedAt
           FROM AdmissionApplications
           ORDER BY SubmittedAt DESC, ApplicationID DESC
           LIMIT 5`
        )
      ]);

      res.json({
        facilities: {
          totalHalls,
          classrooms: totalHalls - labs,
          labs,
          totalBookings,
          pendingBookings,
          openMaintenance,
          totalResources,
          activeAllocations,
          recentBookings,
          maintenance,
          resources
        },
        curriculum: {
          totalCourses,
          totalEnrollments,
          totalAssignments,
          totalGrades,
          totalMaterials,
          transcriptCount,
          admissionApplications,
          courseLoad
        },
        staff: {
          totalStaff,
          averagePerformance: avgPerformanceRow?.AverageScore || 0,
          staffPerformance
        },
        community: {
          totalUsers,
          totalStudents,
          totalMessages,
          totalAnnouncements,
          parentLinks,
          recentMessages,
          applications
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/admin/student-records', authenticate, requireRoles(['Admin']), async (req, res) => {
    try {
      const students = await runQuery(
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
         ORDER BY u.FamilyName, u.GivenName
         LIMIT 50`
      );

      res.json(students);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

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
          `SELECT ApplicationID, ApplicantName, Program, Status, SubmittedAt
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

      const student = await runGet(req.app.locals.db, `SELECT UserID FROM Users WHERE UserID = ? AND Role = 'Student'`, [studentId]);
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

  app.put('/api/admin/admissions/:applicationId', authenticate, requireRoles(['Admin']), async (req, res) => {
    try {
      const applicationId = Number(req.params.applicationId);
      const status = req.body.status;
      if (!['Submitted', 'In Review', 'Accepted', 'Rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid application status.' });
      }

      await runExec(
        req.app.locals.db,
        `UPDATE AdmissionApplications SET Status = ? WHERE ApplicationID = ?`,
        [status, applicationId]
      );

      const application = await runGet(
        req.app.locals.db,
        `SELECT ApplicationID, ApplicantName, Program, Status, SubmittedAt
         FROM AdmissionApplications
         WHERE ApplicationID = ?`,
        [applicationId]
      );

      res.json(application);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/admin/maintenance', authenticate, requireRoles(['Admin']), async (req, res) => {
    try {
      const requests = await runQuery(
        req.app.locals.db,
        `SELECT mr.RequestID, mr.RoomID, mr.Description, mr.Status, mr.ReportedDate, mr.ResolvedDate,
                h.HallName,
                u.GivenName || ' ' || u.FamilyName AS ReportedBy
         FROM MaintenanceRequests mr
         JOIN Halls h ON h.HallID = mr.RoomID
         JOIN Users u ON u.UserID = mr.ReportedByUserID
         ORDER BY mr.ReportedDate DESC, mr.RequestID DESC`
      );

      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/maintenance', authenticate, requireRoles(['Admin']), async (req, res) => {
    try {
      const roomId = Number(req.body.roomId);
      const description = String(req.body.description || '').trim();
      const status = req.body.status || 'open';

      if (!roomId || !description) {
        return res.status(400).json({ error: 'Room and description are required.' });
      }

      if (!['open', 'in progress', 'closed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid maintenance status.' });
      }

      const hall = await runGet(req.app.locals.db, 'SELECT HallID FROM Halls WHERE HallID = ?', [roomId]);
      if (!hall) {
        return res.status(404).json({ error: 'Room or lab not found.' });
      }

      const result = await runExec(
        req.app.locals.db,
        `INSERT INTO MaintenanceRequests (RoomID, ReportedByUserID, Description, Status)
         VALUES (?, ?, ?, ?)`,
        [roomId, req.user.UserID, description, status]
      );

      const request = await runGet(
        req.app.locals.db,
        `SELECT mr.RequestID, mr.Description, mr.Status, mr.ReportedDate, h.HallName
         FROM MaintenanceRequests mr
         JOIN Halls h ON h.HallID = mr.RoomID
         WHERE mr.RequestID = ?`,
        [result.lastID]
      );

      res.status(201).json(request);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
