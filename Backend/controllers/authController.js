const { runGet, runExec, normalizeRole, hashPassword, verifyPassword, createSession, getUserWithStats, authenticate } = require('./utils');

module.exports = function setupAuthRoutes(app) {
  app.post('/api/signup', async (req, res) => {
    try {
      const { username, password, givenName, familyName, department, role } = req.body;
      const normalizedRole = normalizeRole(role);
      const existing = await runGet(
        req.app.locals.db,
        'SELECT UserID FROM Users WHERE Username = ?',
        [username]
      );

      if (existing) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const hashedPassword = await hashPassword(password);
      const result = await runExec(
        req.app.locals.db,
        `INSERT INTO Users (Username, Password, Role, GivenName, FamilyName, Department, JoinDate)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [username, hashedPassword, normalizedRole, givenName || '', familyName || '', department || '', new Date().toISOString()]
      );

      const token = await createSession(req.app.locals.db, result.lastID);
      const user = await getUserWithStats(req.app.locals.db, result.lastID);
      res.status(201).json({ token, user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await runGet(
        req.app.locals.db,
        'SELECT UserID, Password FROM Users WHERE Username = ?',
        [username]
      );

      if (!user || !(await verifyPassword(password, user.Password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = await createSession(req.app.locals.db, user.UserID);
      const loggedUser = await getUserWithStats(req.app.locals.db, user.UserID);
      res.json({ token, user: loggedUser });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/logout', authenticate, async (req, res) => {
    try {
      await runExec(req.app.locals.db, 'DELETE FROM Sessions WHERE Token = ?', [req.sessionToken]);
      res.json({ message: 'Logged out' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/me', authenticate, async (req, res) => {
    try {
      const user = await getUserWithStats(req.app.locals.db, req.user.UserID);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/me', authenticate, async (req, res) => {
    try {
      const { GivenName, FamilyName, Department } = req.body;
      await runExec(
        req.app.locals.db,
        `UPDATE Users SET GivenName = ?, FamilyName = ?, Department = ? WHERE UserID = ?`,
        [GivenName || '', FamilyName || '', Department || '', req.user.UserID]
      );
      const user = await getUserWithStats(req.app.locals.db, req.user.UserID);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/me/password', authenticate, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const stored = await runGet(
        req.app.locals.db,
        'SELECT Password FROM Users WHERE UserID = ?',
        [req.user.UserID]
      );

      if (!stored || !(await verifyPassword(currentPassword, stored.Password))) {
        return res.status(401).json({ error: 'Current password is invalid' });
      }

      const hashedPassword = await hashPassword(newPassword);
      await runExec(
        req.app.locals.db,
        'UPDATE Users SET Password = ? WHERE UserID = ?',
        [hashedPassword, req.user.UserID]
      );

      res.json({ message: 'Password updated' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
