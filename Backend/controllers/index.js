module.exports = {
  setupAuthRoutes: require('./authController'),
  setupCourseRoutes: require('./courseController'),
  setupEnrollmentRoutes: require('./enrollmentController'),
  setupAnnouncementRoutes: require('./announcementController'),
  setupStaffRoutes: require('./staffController'),
  setupMessageRoutes: require('./messageController'),
  setupHallRoutes: require('./hallController'),
  setupUserRoutes: require('./user'),
  setupTeachingRoutes: require('./teachingController'),
  setupAdminRoutes: require('./admin'),
  setupAdvisorRoutes: require('./advisorController'),
  setupAdmissionRoutes: require('./admissionController')
};
