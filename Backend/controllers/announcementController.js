const { getLiveAnnouncements, getScheduleBook, fetchScheduleGroup, authenticate } = require('./utils');

module.exports = function setupAnnouncementRoutes(app) {
  app.get('/api/announcements', async (req, res) => {
    try {
      const announcements = await getLiveAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/schedules/groups', authenticate, async (req, res) => {
    try {
      const groups = await getScheduleBook();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/schedules', authenticate, async (req, res) => {
    try {
      const groups = await getScheduleBook();
      const requestedGroup = String(req.query.group || '').trim();
      const selectedGroup = requestedGroup || groups[0];

      if (!groups.includes(selectedGroup)) {
        return res.status(404).json({ error: 'Schedule group not found' });
      }

      const schedule = await fetchScheduleGroup(selectedGroup);
      res.json({
        groups,
        selectedGroup,
        schedule
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
