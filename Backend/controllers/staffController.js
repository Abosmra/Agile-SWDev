const { runQuery, runGet, runExec, authenticate, isStaffRole, normalizeRole } = require('./utils');

async function getStaffProfileForUser(db, user) {
  return runGet(
    db,
    `SELECT StaffID, Name, Role, ContactInfo, PayrollStatus, BenefitsSummary, LeaveBalance, SalaryAmount
     FROM Staff
     WHERE lower(ContactInfo) = lower(?)
        OR lower(Name) = lower(trim(? || ' ' || ?))
     ORDER BY StaffID
     LIMIT 1`,
    [user.Username, user.GivenName || '', user.FamilyName || '']
  );
}

async function ensureLeaveRequestsTable(db) {
  await runExec(
    db,
    `CREATE TABLE IF NOT EXISTS LeaveRequests (
      RequestID INTEGER PRIMARY KEY AUTOINCREMENT,
      UserID INTEGER NOT NULL,
      StaffID INTEGER,
      StartDate TEXT NOT NULL,
      EndDate TEXT NOT NULL,
      Reason TEXT,
      Status TEXT NOT NULL DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Approved', 'Rejected')),
      RequestedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (UserID) REFERENCES Users(UserID),
      FOREIGN KEY (StaffID) REFERENCES Staff(StaffID)
    )`
  );
}

async function ensureStaffHrColumns(db) {
  const columns = await runQuery(db, 'PRAGMA table_info(Staff)');
  const names = columns.map((column) => column.name);
  if (!names.includes('SalaryAmount')) {
    await runExec(db, 'ALTER TABLE Staff ADD COLUMN SalaryAmount INTEGER DEFAULT 18000');
  }
}

module.exports = function setupStaffRoutes(app) {
  app.get('/api/staff', authenticate, async (req, res) => {
    try {
      const normalizedRole = normalizeRole(req.user.Role);
      let staff;

      if (normalizedRole === 'Student') {
        const enrollments = await runQuery(
          req.app.locals.db,
          `SELECT c.Instructor
           FROM Enrollments e
           JOIN Courses c ON e.CourseID = c.CourseID
           WHERE e.UserID = ? AND e.Status != 'Dropped'`,
          [req.user.UserID]
        );

        const doctorNames = new Set();
        enrollments.forEach((enrollment) => {
          if (enrollment.Instructor) {
            enrollment.Instructor.split(',').forEach((instr) => {
              const name = instr.trim();
              if (name.startsWith('Dr. ')) {
                doctorNames.add(name);
              }
            });
          }
        });

        const doctorList = Array.from(doctorNames);
        if (doctorList.length === 0) {
          staff = await runQuery(
            req.app.locals.db,
          `SELECT StaffID AS id, Name AS name, Department AS department, Role AS role, ContactInfo AS contact,
                  OfficeHours AS officeHours, AssignedCourses AS assignedCourses, PerformanceScore AS performanceScore,
                  Research AS research, ProfessionalDevelopment AS professionalDevelopment, PayrollStatus AS payrollStatus,
                  BenefitsSummary AS benefitsSummary, LeaveBalance AS leaveBalance
             FROM Staff
             WHERE Role = 'Advisor'
             ORDER BY Name`
          );
        } else {
          const placeholders = doctorList.map(() => '?').join(',');
          staff = await runQuery(
            req.app.locals.db,
            `SELECT StaffID AS id, Name AS name, Department AS department, Role AS role, ContactInfo AS contact,
                    OfficeHours AS officeHours, AssignedCourses AS assignedCourses, PerformanceScore AS performanceScore,
                    Research AS research, ProfessionalDevelopment AS professionalDevelopment, PayrollStatus AS payrollStatus,
                    BenefitsSummary AS benefitsSummary, LeaveBalance AS leaveBalance
             FROM Staff
             WHERE Role IN ('Advisor', 'TA') OR (Role = 'Doctor' AND Name IN (${placeholders}))
             ORDER BY Name`,
            doctorList
          );
        }
      } else {
        staff = await runQuery(
          req.app.locals.db,
          `SELECT StaffID AS id, Name AS name, Department AS department, Role AS role, ContactInfo AS contact,
                  OfficeHours AS officeHours, AssignedCourses AS assignedCourses, PerformanceScore AS performanceScore,
                  Research AS research, ProfessionalDevelopment AS professionalDevelopment, PayrollStatus AS payrollStatus,
                  BenefitsSummary AS benefitsSummary, LeaveBalance AS leaveBalance
           FROM Staff
           WHERE Role IN ('Advisor', 'Doctor', 'TA', 'Staff')
           ORDER BY Name`
        );
      }

      res.json(staff);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/staff/hr', authenticate, async (req, res) => {
    try {
      if (!isStaffRole(req.user.Role)) {
        return res.status(403).json({ error: 'Only staff can view HR information.' });
      }
      await ensureStaffHrColumns(req.app.locals.db);
      await ensureLeaveRequestsTable(req.app.locals.db);

      const staffProfile = await getStaffProfileForUser(req.app.locals.db, req.user);
      if (!staffProfile) {
        return res.status(404).json({ error: 'Staff profile not found.' });
      }

      const leaveRequests = await runQuery(
        req.app.locals.db,
        `SELECT RequestID, StartDate, EndDate, Reason, Status, RequestedAt
         FROM LeaveRequests
         WHERE UserID = ?
         ORDER BY RequestedAt DESC, RequestID DESC`,
        [req.user.UserID]
      );

      res.json({
        staffId: staffProfile.StaffID,
        payrollStatus: staffProfile.PayrollStatus || 'Active',
        benefitsSummary: staffProfile.BenefitsSummary || 'Standard university benefits',
        leaveBalance: staffProfile.LeaveBalance ?? 21,
        salaryAmount: staffProfile.SalaryAmount ?? 18000,
        leaveRequests
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/staff/leave-requests', authenticate, async (req, res) => {
    try {
      if (!isStaffRole(req.user.Role)) {
        return res.status(403).json({ error: 'Only staff can request leave.' });
      }
      await ensureStaffHrColumns(req.app.locals.db);
      await ensureLeaveRequestsTable(req.app.locals.db);

      const { startDate, endDate, reason } = req.body;
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required.' });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
        return res.status(400).json({ error: 'Please enter a valid leave date range.' });
      }

      const staffProfile = await getStaffProfileForUser(req.app.locals.db, req.user);
      if (!staffProfile) {
        return res.status(404).json({ error: 'Staff profile not found.' });
      }

      const result = await runExec(
        req.app.locals.db,
        `INSERT INTO LeaveRequests (UserID, StaffID, StartDate, EndDate, Reason, Status)
         VALUES (?, ?, ?, ?, ?, 'Pending')`,
        [req.user.UserID, staffProfile.StaffID, startDate, endDate, String(reason || '').trim()]
      );

      const request = await runGet(
        req.app.locals.db,
        `SELECT RequestID, StartDate, EndDate, Reason, Status, RequestedAt
         FROM LeaveRequests
         WHERE RequestID = ?`,
        [result.lastID]
      );

      res.status(201).json(request);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
