const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./initDb');
const {
  setupAuthRoutes,
  setupCourseRoutes,
  setupEnrollmentRoutes,
  setupAnnouncementRoutes,
  setupStaffRoutes,
  setupMessageRoutes,
  setupHallRoutes,
  setupUserRoutes,
  setupTeachingRoutes,
  setupAdminRoutes,
  setupAdvisorRoutes,
  setupAdmissionRoutes
} = require('./controllers');
const { migrateLegacyUsers, migrateEnrollmentOwnership } = require('./controllers/utils');

const app = express();
const port = 5168;

app.use(cors());
app.use(express.json());

async function startServer() {
  try {
    const db = await initDatabase();
    await migrateLegacyUsers(db);
    await migrateEnrollmentOwnership(db);
    app.locals.db = db;

    setupAuthRoutes(app);
    setupCourseRoutes(app);
    setupEnrollmentRoutes(app);
    setupAnnouncementRoutes(app);
    setupStaffRoutes(app);
    setupMessageRoutes(app);
    setupHallRoutes(app);
    setupUserRoutes(app);
    setupTeachingRoutes(app);
    setupAdminRoutes(app);
    setupAdvisorRoutes(app);
    setupAdmissionRoutes(app);

    app.listen(port, () => {
      console.log(`Backend server listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

startServer();
