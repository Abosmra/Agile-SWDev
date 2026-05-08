const { runQuery, runGet, authenticate, requireRoles, getLiveAnnouncements } = require('../utils');

async function countRows(db, sql, params = []) {
  const row = await runGet(db, sql, params);
  return row ? row.Total : 0;
}

module.exports = function setupAdminDashboardRoutes(app) {
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
        liveAnnouncements,
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
        getLiveAnnouncements().then((rows) => rows.length).catch(() => 0),
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
          `SELECT ApplicationID, ApplicantName, Program, Status, SubmittedAt,
                  Email, Phone, NationalID, DateOfBirth, HighSchool, HighSchoolGPA,
                  PersonalStatement, Documents, TrackingCode, StatusMessage
           FROM AdmissionApplications
           ORDER BY SubmittedAt DESC, ApplicationID DESC`
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
          totalAnnouncements: liveAnnouncements,
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
};
