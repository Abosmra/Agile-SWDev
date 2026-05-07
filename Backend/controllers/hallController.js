const { runQuery, runGet, runExec, serializeHall, authenticate, isPrivilegedRole, requireRoles, validateBookingPayload, getBookingById, getHallAvailabilityMap } = require('./utils');

module.exports = function setupHallRoutes(app) {
  app.get('/api/halls', authenticate, async (req, res) => {
    try {
      const halls = await runQuery(req.app.locals.db, 'SELECT * FROM Halls ORDER BY HallName');
      const availabilityMap = await getHallAvailabilityMap(req.app.locals.db);
      res.json(halls.map((hall) => serializeHall(hall, availabilityMap.get(hall.HallID) ?? true)));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/halls/:id', authenticate, async (req, res) => {
    try {
      const hall = await runGet(
        req.app.locals.db,
        'SELECT * FROM Halls WHERE HallID = ?',
        [req.params.id]
      );

      if (!hall) {
        return res.status(404).json({ error: 'Hall not found' });
      }

      const bookedToday = await runGet(
        req.app.locals.db,
        `SELECT COUNT(*) AS Total
         FROM Bookings
         WHERE HallID = ? AND Date = date('now') AND Status != 'Cancelled'`,
        [req.params.id]
      );

      res.json(serializeHall(hall, (bookedToday ? bookedToday.Total : 0) === 0));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/bookings', authenticate, async (req, res) => {
    try {
      const { scope } = req.query;
      const wantsAll = scope === 'all';

      if (wantsAll && !isPrivilegedRole(req.user.Role)) {
        return res.status(403).json({ error: 'Only staff can view all bookings' });
      }

      const params = [];
      let whereClause = '';
      if (!wantsAll) {
        whereClause = 'WHERE b.UserID = ?';
        params.push(req.user.UserID);
      }

      const bookings = await runQuery(
        req.app.locals.db,
        `SELECT b.BookingID, b.HallID, b.UserID, b.Date, b.StartTime, b.EndTime, b.Purpose, b.Attendees, b.Contact, b.Status,
                h.HallName, h.Capacity, u.Username AS UserName
         FROM Bookings b
         INNER JOIN Halls h ON b.HallID = h.HallID
         INNER JOIN Users u ON b.UserID = u.UserID
         ${whereClause}
         ORDER BY b.Date DESC, b.StartTime`,
        params
      );

      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/bookings/usage', authenticate, async (req, res) => {
    try {
      const bookings = await runQuery(
        req.app.locals.db,
        `SELECT b.BookingID, b.HallID, b.Date, b.StartTime, b.EndTime, b.Purpose, b.Status,
                h.HallName
         FROM Bookings b
         INNER JOIN Halls h ON b.HallID = h.HallID
         WHERE b.Status != 'Cancelled'
         ORDER BY b.Date DESC, b.StartTime`
      );

      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/bookings', authenticate, async (req, res) => {
    try {
      const bookingPayload = {
        HallID: Number(req.body.HallID),
        Date: req.body.Date,
        StartTime: req.body.StartTime,
        EndTime: req.body.EndTime,
        Purpose: req.body.Purpose,
        Attendees: Number(req.body.Attendees || 0),
        Contact: req.body.Contact,
        Status: req.body.Status || 'Pending'
      };

      const validation = await validateBookingPayload(req.app.locals.db, bookingPayload);
      if (validation.error) {
        return res.status(validation.status).json({ error: validation.error });
      }

      const result = await runExec(
        req.app.locals.db,
        `INSERT INTO Bookings (HallID, UserID, Date, StartTime, EndTime, Purpose, Attendees, Contact, Status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bookingPayload.HallID,
          req.user.UserID,
          bookingPayload.Date,
          bookingPayload.StartTime,
          bookingPayload.EndTime,
          bookingPayload.Purpose,
          bookingPayload.Attendees,
          bookingPayload.Contact,
          bookingPayload.Status
        ]
      );

      const booking = await getBookingById(req.app.locals.db, result.lastID);
      res.status(201).json(booking);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/bookings/:id', authenticate, async (req, res) => {
    try {
      const existing = await getBookingById(req.app.locals.db, req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (existing.UserID !== req.user.UserID && req.user.Role !== 'Admin') {
        return res.status(403).json({ error: 'You can only modify your own bookings' });
      }

      const updatedBooking = {
        HallID: Number(existing.HallID),
        Date: req.body.Date,
        StartTime: req.body.StartTime,
        EndTime: req.body.EndTime,
        Purpose: req.body.Purpose,
        Attendees: Number(req.body.Attendees || 0),
        Contact: req.body.Contact,
        Status: req.body.Status || existing.Status
      };

      const validation = await validateBookingPayload(req.app.locals.db, updatedBooking, Number(req.params.id));
      if (validation.error) {
        return res.status(validation.status).json({ error: validation.error });
      }

      await runExec(
        req.app.locals.db,
        `UPDATE Bookings
         SET Date = ?, StartTime = ?, EndTime = ?, Purpose = ?, Attendees = ?, Contact = ?, Status = ?
         WHERE BookingID = ?`,
        [
          updatedBooking.Date,
          updatedBooking.StartTime,
          updatedBooking.EndTime,
          updatedBooking.Purpose,
          updatedBooking.Attendees,
          updatedBooking.Contact,
          updatedBooking.Status,
          req.params.id
        ]
      );

      const booking = await getBookingById(req.app.locals.db, req.params.id);
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/bookings/:id', authenticate, async (req, res) => {
    try {
      const existing = await getBookingById(req.app.locals.db, req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (existing.UserID !== req.user.UserID && req.user.Role !== 'Admin') {
        return res.status(403).json({ error: 'You can only cancel your own bookings' });
      }

      await runExec(
        req.app.locals.db,
        "UPDATE Bookings SET Status = 'Cancelled' WHERE BookingID = ?",
        [req.params.id]
      );

      const booking = await getBookingById(req.app.locals.db, req.params.id);
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/maintenance', authenticate, async (req, res) => {
    try {
      const roomId = Number(req.body.roomId);
      const description = String(req.body.description || '').trim();

      if (!roomId || !description) {
        return res.status(400).json({ error: 'Room and issue description are required.' });
      }

      await runExec(
        req.app.locals.db,
        `CREATE TABLE IF NOT EXISTS MaintenanceRequests (
          RequestID INTEGER PRIMARY KEY AUTOINCREMENT,
          RoomID INTEGER NOT NULL,
          ReportedByUserID INTEGER NOT NULL,
          Description TEXT NOT NULL,
          Status TEXT NOT NULL DEFAULT 'open',
          ReportedDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          ResolvedDate TEXT,
          FOREIGN KEY (RoomID) REFERENCES Halls(HallID),
          FOREIGN KEY (ReportedByUserID) REFERENCES Users(UserID)
        )`
      );

      const hall = await runGet(req.app.locals.db, 'SELECT HallID FROM Halls WHERE HallID = ?', [roomId]);
      if (!hall) {
        return res.status(404).json({ error: 'Room or lab not found.' });
      }

      const result = await runExec(
        req.app.locals.db,
        `INSERT INTO MaintenanceRequests (RoomID, ReportedByUserID, Description, Status)
         VALUES (?, ?, ?, 'open')`,
        [roomId, req.user.UserID, description]
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
