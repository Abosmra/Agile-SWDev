const setupAdminDashboardRoutes = require('./dashboardController');
const setupAdminOfficeRoutes = require('./officeController');
const setupAdminAdmissionsRoutes = require('./admissionsController');
const setupAdminMaintenanceRoutes = require('./maintenanceController');
const setupAdminPerformanceRoutes = require('./performanceController');

module.exports = function setupAdminRoutes(app) {
  setupAdminPerformanceRoutes(app);
  setupAdminDashboardRoutes(app);
  setupAdminOfficeRoutes(app);
  setupAdminAdmissionsRoutes(app);
  setupAdminMaintenanceRoutes(app);
};
