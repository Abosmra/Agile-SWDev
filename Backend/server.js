const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./initDb');

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function runGet(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function runExec(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

app.get('/api/courses', async (req, res) => {
  try {
    const courses = await runQuery(req.app.locals.db, 'SELECT * FROM Courses ORDER BY CourseID');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/announcements', async (req, res) => {
  try {
    const announcements = await runQuery(req.app.locals.db, 'SELECT * FROM Announcements ORDER BY Date DESC');
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/staff', async (req, res) => {
  try {
    const staff = await runQuery(req.app.locals.db, 'SELECT * FROM Staff ORDER BY Name');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/halls', async (req, res) => {
  try {
    const halls = await runQuery(req.app.locals.db, 'SELECT * FROM Halls ORDER BY HallName');
    res.json(halls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const { userId } = req.query;
    if (userId) {
      const query = `SELECT b.*, h.HallName, u.Username AS UserName
        FROM Bookings b
        LEFT JOIN Halls h ON b.HallID = h.HallID
        LEFT JOIN Users u ON b.UserID = u.UserID
        WHERE b.UserID = ?
        ORDER BY b.Date DESC, b.StartTime`;
      const bookings = await runQuery(req.app.locals.db, query, [userId]);
      return res.json(bookings);
    }
    const bookings = await runQuery(req.app.locals.db, 'SELECT * FROM Bookings ORDER BY Date DESC, StartTime');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { HallID, UserID, Date, StartTime, EndTime, Purpose, Attendees, Contact, Status } = req.body;
    const missing = [];
    if (!HallID) missing.push('HallID');
    if (!UserID) missing.push('UserID');
    if (!Date) missing.push('Date');
    if (!StartTime) missing.push('StartTime');
    if (!EndTime) missing.push('EndTime');
    if (!Purpose) missing.push('Purpose');
    if (!Contact) missing.push('Contact');
    if (missing.length) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    const conflict = await runGet(
      req.app.locals.db,
      `SELECT * FROM Bookings WHERE HallID = ? AND Date = ? AND NOT (EndTime <= ? OR StartTime >= ?)`,
      [HallID, Date, StartTime, EndTime]
    );

    if (conflict) {
      return res.status(409).json({ error: 'This hall is already booked for the selected time range' });
    }

    const result = await runExec(
      req.app.locals.db,
      `INSERT INTO Bookings (HallID, UserID, Date, StartTime, EndTime, Purpose, Attendees, Contact, Status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [HallID, UserID, Date, StartTime, EndTime, Purpose, Attendees || 0, Contact, Status || 'Pending']
    );

    const booking = await runGet(req.app.locals.db, 'SELECT * FROM Bookings WHERE BookingID = ?', [result.lastID]);
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existing = await runGet(
      req.app.locals.db,
      'SELECT UserID FROM Users WHERE Username = ?',
      [email]
    );
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    await runExec(
      req.app.locals.db,
      'INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) VALUES (?, ?, ?, ?, ?)',
      [email, password, firstName, lastName, role]
    );
    res.json({ message: 'Account created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = await runGet(
      req.app.locals.db,
      'SELECT UserID AS UserID, Username, Role FROM Users WHERE Username = ? AND Password = ?',
      [username, password]
    );
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await runGet(
      req.app.locals.db,
      'SELECT UserID AS UserID, Username, Role FROM Users WHERE UserID = ?',
      [req.params.id]
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/enrollments', async (req, res) => {
  try {
    const enrollments = await runQuery(req.app.locals.db, `
      SELECT e.EnrollmentID, e.StudentName, e.CourseID, e.Status, c.CourseName, c.CourseCode
      FROM Enrollments e
      LEFT JOIN Courses c ON e.CourseID = c.CourseID
      ORDER BY e.EnrollmentID
    `);
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  try {
    const db = await initDatabase();
    app.locals.db = db;
    app.listen(port, () => {
      console.log(`Backend server listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

startServer();
