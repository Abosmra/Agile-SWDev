const { runQuery, runExec, authenticate } = require('./utils');

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

      const result = await runExec(
        req.app.locals.db,
        `INSERT INTO Enrollments (UserID, CourseID, Status, StudentName)
         VALUES (?, ?, 'Enrolled', ?)`,
        [req.user.UserID, Number(courseId), req.user.Username]
      );

      res.status(201).json({ EnrollmentID: result.lastID, courseId: Number(courseId), status: 'Enrolled' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
