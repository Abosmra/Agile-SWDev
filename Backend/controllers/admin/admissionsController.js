const { runGet, runExec, authenticate, requireRoles } = require('../utils');

module.exports = function setupAdminAdmissionsRoutes(app) {
  app.put('/api/admin/admissions/:applicationId', authenticate, requireRoles(['Admin']), async (req, res) => {
    try {
      const applicationId = Number(req.params.applicationId);
      const status = req.body.status;
      if (!['Submitted', 'In Review', 'Accepted', 'Rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid application status.' });
      }

      await runExec(
        req.app.locals.db,
        `UPDATE AdmissionApplications SET Status = ? WHERE ApplicationID = ?`,
        [status, applicationId]
      );

      const application = await runGet(
        req.app.locals.db,
        `SELECT ApplicationID, ApplicantName, Program, Status, SubmittedAt
         FROM AdmissionApplications
         WHERE ApplicationID = ?`,
        [applicationId]
      );

      res.json(application);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
