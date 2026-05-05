const { runQuery, getUserWithStats, authenticate } = require('./utils');

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