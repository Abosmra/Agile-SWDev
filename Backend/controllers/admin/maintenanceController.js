const { runQuery, runGet, runExec, authenticate, requireRoles } = require('../utils');

module.exports = function setupAdminMaintenanceRoutes(app) {
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
