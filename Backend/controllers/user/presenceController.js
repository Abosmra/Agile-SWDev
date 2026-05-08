const { runQuery, authenticate } = require('../utils');

module.exports = function setupPresenceRoutes(app) {
  app.get('/api/online-users', authenticate, async (req, res) => {
    try {
      const users = await runQuery(
        req.app.locals.db,
        `SELECT UserID, GivenName, FamilyName FROM Users`
      );

      res.json(
        users.map((user) => ({
          id: user.UserID,
          name: `${user.GivenName} ${user.FamilyName}`,
          online: true
        }))
      );
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
