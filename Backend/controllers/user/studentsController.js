const { runQuery, authenticate, isStaffRole } = require('../utils');

module.exports = function setupStudentsListRoutes(app) {
  app.get('/api/students', authenticate, async (req, res) => {
    try {
      if (!isStaffRole(req.user.Role)) {
        return res.status(403).json({ error: 'Only staff can view all students.' });
      }

      const students = await runQuery(
        req.app.locals.db,
        `SELECT
           u.UserID AS id,
           COALESCE(NULLIF(TRIM(u.GivenName || ' ' || u.FamilyName), ''), u.Username) AS name,
           u.Username AS email,
           u.Department AS department,
           u.JoinDate AS joinDate,
           COUNT(DISTINCT e.EnrollmentID) AS enrolledCourses,
           MAX(t.GPA) AS gpa
         FROM Users u
         LEFT JOIN Enrollments e ON e.UserID = u.UserID AND e.Status != 'Dropped'
         LEFT JOIN Transcripts t ON t.StudentID = u.UserID
         WHERE u.Role = 'Student'
         GROUP BY u.UserID
         ORDER BY u.UserID`
      );

      res.json(
        students.map((student) => ({
          ...student,
          role: 'Student',
          lastSnippet: `${student.enrolledCourses || 0} active courses`
        }))
      );
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
