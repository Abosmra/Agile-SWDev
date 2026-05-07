const { runQuery, authenticate, normalizeRole } = require('./utils');

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
};
