const { runQuery, runExec, runGet, authenticate } = require('./utils');

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
      const enrollment = await runGet(
        req.app.locals.db,
        `SELECT EnrollmentID FROM Enrollments WHERE EnrollmentID = ? AND UserID = ?`,
        [req.params.enrollmentId, req.user.UserID]
      );

      if (!enrollment) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }

      await runExec(
        req.app.locals.db,
        `UPDATE Enrollments SET Status = 'Dropped' WHERE EnrollmentID = ?`,
        [enrollment.EnrollmentID]
      );

      res.json({ message: 'Course dropped successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
