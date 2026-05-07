const { runQuery, getUserWithStats, authenticate, isStaffRole } = require('./utils');

module.exports = function setupUserRoutes(app) {

  app.get('/api/users/:id', authenticate, async (req, res) => {
    try {
      const user = await getUserWithStats(req.app.locals.db, req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

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
           COUNT(e.EnrollmentID) AS enrolledCourses,
           MAX(t.GPA) AS gpa
         FROM Users u
         LEFT JOIN Enrollments e ON e.UserID = u.UserID AND e.Status != 'Dropped'
         LEFT JOIN Transcripts t ON t.StudentID = u.UserID
         WHERE u.Role = 'Student'
         GROUP BY u.UserID
         ORDER BY u.UserID`
      );

      res.json(students.map((student) => ({
        ...student,
        role: 'Student',
        lastSnippet: `${student.enrolledCourses || 0} active courses`
      })));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ✅ FIXED VERSION
  app.get('/api/online-users', authenticate, async (req, res) => {
    try {
      const db = req.app.locals.db;

      const users = await runQuery(
        db,
        `SELECT UserID, GivenName, FamilyName FROM Users`
      );

      const result = users.map(user => ({
        id: user.UserID,
        name: `${user.GivenName} ${user.FamilyName}`,
        online: true // temporary
      }));

      res.json(result);
    } catch (error) {
      console.error('Online users error:', error);
      res.status(500).json({ error: error.message });
    }
  });
};
