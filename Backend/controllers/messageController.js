const { runQuery, runGet, runExec, authenticate, isStaffRole, normalizeRole } = require('./utils');

async function getStaffProfileForUser(db, user) {
  const existing = await runGet(
    db,
    `SELECT StaffID, Name
     FROM Staff
     WHERE lower(ContactInfo) = lower(?)
        OR Name = ?
     ORDER BY StaffID
     LIMIT 1`,
    [user.Username, `${user.GivenName || ''} ${user.FamilyName || ''}`.trim()]
  );
  if (existing) return existing;

  const result = await runExec(
    db,
    `INSERT INTO Staff (Name, Department, Role, ContactInfo)
     VALUES (?, ?, ?, ?)`,
    [
      `${user.GivenName || ''} ${user.FamilyName || ''}`.trim() || user.Username,
      user.Department || 'General',
      normalizeRole(user.Role),
      user.Username
    ]
  );

  return {
    StaffID: result.lastID,
    Name: `${user.GivenName || ''} ${user.FamilyName || ''}`.trim() || user.Username
  };
}

function serializeMessage(message, currentUserId) {
  return {
    ...message,
    text: message.body,
    time: new Date(message.sentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isUser: message.fromUserId === currentUserId,
    sender: message.senderName
  };
}

module.exports = function setupMessageRoutes(app) {
  app.get('/api/messages/conversations', authenticate, async (req, res) => {
    try {
      if (normalizeRole(req.user.Role) !== 'Admin') {
        return res.status(403).json({ error: 'Only admins can view all student conversations.' });
      }

      const conversations = await runQuery(
         req.app.locals.db,
         `SELECT
            CASE WHEN normalizeFrom.Role = 'Student' THEN normalizeFrom.UserID ELSE normalizeTo.UserID END AS studentUserId,
            CASE
              WHEN normalizeFrom.Role = 'Student'
                THEN COALESCE(NULLIF(TRIM(normalizeFrom.GivenName || ' ' || normalizeFrom.FamilyName), ''), normalizeFrom.Username)
              ELSE COALESCE(NULLIF(TRIM(normalizeTo.GivenName || ' ' || normalizeTo.FamilyName), ''), normalizeTo.Username)
            END AS name,
            normalizeTo.UserID AS toUserId,
            m.ToStaffID AS staffId,
            s.Name AS staffName,
            MAX(m.SentDate) AS lastSentDate,
            (SELECT Body
               FROM Messages latest
               WHERE latest.ToStaffID = m.ToStaffID
                 AND (
                   latest.FromUserID = CASE WHEN normalizeFrom.Role = 'Student' THEN normalizeFrom.UserID ELSE normalizeTo.UserID END
                   OR latest.ToUserID = CASE WHEN normalizeFrom.Role = 'Student' THEN normalizeFrom.UserID ELSE normalizeTo.UserID END
                 )
               ORDER BY latest.SentDate DESC, latest.MessageID DESC
               LIMIT 1) AS lastSnippet
         FROM Messages m
         JOIN Users normalizeFrom ON normalizeFrom.UserID = m.FromUserID
         LEFT JOIN Users normalizeTo ON normalizeTo.UserID = m.ToUserID
         LEFT JOIN Staff s ON s.StaffID = m.ToStaffID
         GROUP BY studentUserId, m.ToStaffID
         HAVING studentUserId IS NOT NULL
         ORDER BY lastSentDate DESC`
      );

      res.json(conversations.map((conversation) => ({
        id: `${conversation.studentUserId}-${conversation.staffId}`,
        studentUserId: conversation.studentUserId,
        staffId: conversation.staffId,
        name: conversation.name || `Student ${conversation.studentUserId}`,
        role: 'Student',
        department: 'Student',
        staffName: conversation.staffName,
        lastSnippet: conversation.lastSnippet || 'No message preview'
      })));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/messages/student/:studentId', authenticate, async (req, res) => {
    try {
      const role = normalizeRole(req.user.Role);
      const studentId = Number(req.params.studentId);
      const staffProfile = role === 'Admin' ? null : await getStaffProfileForUser(req.app.locals.db, req.user);
      const staffId = role === 'Admin' ? Number(req.query.staffId) : staffProfile?.StaffID;

      if (!studentId || !staffId) {
        return res.status(400).json({ error: 'Invalid student conversation selected.' });
      }

      if (role !== 'Admin' && !isStaffRole(role)) {
        return res.status(403).json({ error: 'Only staff can view student conversations.' });
      }

      const messages = await runQuery(
        req.app.locals.db,
        `SELECT m.MessageID AS id,
                m.FromUserID AS fromUserId,
                m.ToStaffID AS toStaffId,
                m.ToUserID AS toUserId,
                m.Body AS body,
                m.SentDate AS sentDate,
                m.IsRead AS isRead,
                u.GivenName || ' ' || u.FamilyName AS senderName
         FROM Messages m
         JOIN Users u ON u.UserID = m.FromUserID
         WHERE m.ToStaffID = ?
           AND (m.FromUserID = ? OR m.ToUserID = ?)
         ORDER BY m.SentDate ASC, m.MessageID ASC`,
        [staffId, studentId, studentId]
      );

      res.json(messages.map((message) => serializeMessage(message, req.user.UserID)));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

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
         WHERE m.ToStaffID = ?
           AND (m.FromUserID = ? OR m.ToUserID = ?)
         ORDER BY m.SentDate ASC, m.MessageID ASC`,
        [staffId, req.user.UserID, req.user.UserID]
      );

      res.json(messages.map((message) => serializeMessage(message, req.user.UserID)));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/messages', authenticate, async (req, res) => {
    try {
      const { toStaffId, toUserId, staffId, body } = req.body;
      const trimmedBody = String(body || '').trim();

      if (!trimmedBody) {
        return res.status(400).json({ error: 'Please enter a message.' });
      }

      if (toUserId && isStaffRole(req.user.Role)) {
        const role = normalizeRole(req.user.Role);
        const staffProfile = role === 'Admin' ? null : await getStaffProfileForUser(req.app.locals.db, req.user);
        const resolvedStaffId = role === 'Admin' ? Number(staffId) : staffProfile?.StaffID;
        const studentId = Number(toUserId);

        if (!resolvedStaffId || !studentId) {
          return res.status(400).json({ error: 'Please select a student conversation.' });
        }

        const result = await runExec(
          req.app.locals.db,
          `INSERT INTO Messages (FromUserID, ToStaffID, ToUserID, Body, IsRead)
           VALUES (?, ?, ?, ?, 0)`,
          [req.user.UserID, resolvedStaffId, studentId, trimmedBody]
        );

        return res.status(201).json({
          id: result.lastID,
          fromUserId: req.user.UserID,
          toStaffId: resolvedStaffId,
          toUserId: studentId,
          body: trimmedBody,
          sentDate: new Date().toISOString(),
          isRead: 0,
          isUser: true,
          sender: `${req.user.GivenName || req.user.Username} ${req.user.FamilyName || ''}`.trim()
        });
      }

      const selectedStaffId = Number(toStaffId);
      if (!selectedStaffId) {
        return res.status(400).json({ error: 'Please select a staff member.' });
      }

      const staffUser = await runGet(
        req.app.locals.db,
        `SELECT u.UserID
         FROM Staff s
         LEFT JOIN Users u ON lower(u.Username) = lower(s.ContactInfo)
         WHERE s.StaffID = ?`,
        [selectedStaffId]
      );

      const result = await runExec(
        req.app.locals.db,
        `INSERT INTO Messages (FromUserID, ToStaffID, ToUserID, Body, IsRead)
         VALUES (?, ?, ?, ?, 0)`,
        [req.user.UserID, selectedStaffId, staffUser?.UserID || null, trimmedBody]
      );

      res.status(201).json({
        id: result.lastID,
        fromUserId: req.user.UserID,
        toStaffId: selectedStaffId,
        toUserId: staffUser?.UserID || null,
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
