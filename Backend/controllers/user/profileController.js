const { getUserWithStats, authenticate } = require('../utils');

module.exports = function setupUserProfileRoutes(app) {
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
};
