const setupUserProfileRoutes = require('./profileController');
const setupStudentsListRoutes = require('./studentsController');
const setupPresenceRoutes = require('./presenceController');

module.exports = function setupUserRoutes(app) {
  setupUserProfileRoutes(app);
  setupStudentsListRoutes(app);
  setupPresenceRoutes(app);
};
