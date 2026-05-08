const { runQuery, runExec, authenticate, requireRoles } = require('../utils');

module.exports = function setupAdminPerformanceRoutes(app) {
  app.get('/api/admin/staff-performance', authenticate, requireRoles(['Admin']), async (req, res) => {
    try {
      const staff = await runQuery(
        req.app.locals.db,
        `SELECT StaffID, Name, Role, Department, PerformanceScore, Research, ProfessionalDevelopment
         FROM Staff
         ORDER BY Role, Name`
      );
      res.json(staff);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/update-staff-performance', authenticate, requireRoles(['Admin']), async (req, res) => {
    try {
      const { staffId, PerformanceScore, Research, ProfessionalDevelopment } = req.body;
      await runExec(
        req.app.locals.db,
        `UPDATE Staff
         SET PerformanceScore = ?, Research = ?, ProfessionalDevelopment = ?
         WHERE StaffID = ?`,
        [PerformanceScore, Research, ProfessionalDevelopment, staffId]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
