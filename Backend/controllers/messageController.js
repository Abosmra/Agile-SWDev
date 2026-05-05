const { runQuery, runExec, authenticate } = require('./utils');

module.exports = function setupMessageRoutes(app) {
  app.get('/api/messages/:staffId', authenticate, async (req, res) => {
    try {
      const staffId = Number(req.params.staffId);
      if (!staffId) {
        return res.status(400).json({ error: 'Invalid staff member selected' });
      }

      const messages = await runQuery(
        req.app.locals.db,
        `SELECT m.MessageID AS id,
                m.FromUserID AS fromUserId,
                m.ToStaffID AS toStaffId,
                m.Body AS body,
                m.SentDate AS sentDate,
                m.IsRead AS isRead,
                u.GivenName || ' ' || u.FamilyName AS senderName
         FROM Messages m
         JOIN Users u ON u.UserID = m.FromUserID
         WHERE m.FromUserID = ? AND m.ToStaffID = ?
         ORDER BY m.SentDate ASC`,
        [req.user.UserID, staffId]
      );

      res.json(
        messages.map((message) => ({
          ...message,
          text: message.body,
          time: new Date(message.sentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isUser: message.fromUserId === req.user.UserID,
          sender: message.senderName
        }))
      );
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/messages', authenticate, async (req, res) => {
    try {
      const { toStaffId, body } = req.body;
      const staffId = Number(toStaffId);
      const trimmedBody = String(body || '').trim();

      if (!staffId || !trimmedBody) {
        return res.status(400).json({ error: 'Please select a staff member and enter a message.' });
      }

      const result = await runExec(
        req.app.locals.db,
        `INSERT INTO Messages (FromUserID, ToStaffID, Body, IsRead)
         VALUES (?, ?, ?, 0)`,
        [req.user.UserID, staffId, trimmedBody]
      );

      res.status(201).json({
        id: result.lastID,
        fromUserId: req.user.UserID,
        toStaffId: staffId,
        body: trimmedBody,
        sentDate: new Date().toISOString(),
        isRead: 0,
        isUser: true,
        sender: `${req.user.GivenName || req.user.Username} ${req.user.FamilyName || ''}`.trim()
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
