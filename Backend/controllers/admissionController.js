const { runQuery, runGet, runExec } = require('./utils');

function generateTrackingCode() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `APP-${Date.now().toString(36).toUpperCase()}-${random}`;
}

function safeString(value, max = 1000) {
  return String(value ?? '').trim().slice(0, max);
}

function serializeApplication(row) {
  if (!row) return null;
  let documents = [];
  try {
    documents = row.Documents ? JSON.parse(row.Documents) : [];
  } catch {
    documents = [];
  }
  return {
    applicationId: row.ApplicationID,
    trackingCode: row.TrackingCode,
    applicantName: row.ApplicantName,
    email: row.Email || '',
    phone: row.Phone || '',
    nationalId: row.NationalID || '',
    dateOfBirth: row.DateOfBirth || '',
    highSchool: row.HighSchool || '',
    highSchoolGPA: row.HighSchoolGPA || '',
    program: row.Program,
    personalStatement: row.PersonalStatement || '',
    documents,
    status: row.Status,
    statusMessage: row.StatusMessage || '',
    submittedAt: row.SubmittedAt
  };
}

module.exports = function setupAdmissionRoutes(app) {
  app.post('/api/applications', async (req, res) => {
    try {
      const db = req.app.locals.db;
      const {
        applicantName,
        email,
        phone,
        nationalId,
        dateOfBirth,
        highSchool,
        highSchoolGPA,
        program,
        personalStatement,
        documents
      } = req.body || {};

      const cleanName = safeString(applicantName, 200);
      const cleanProgram = safeString(program, 200);
      const cleanEmail = safeString(email, 200);

      if (!cleanName || !cleanProgram || !cleanEmail) {
        return res.status(400).json({ error: 'Name, email, and program are required.' });
      }

      const docList = Array.isArray(documents)
        ? documents
            .filter((doc) => doc && (doc.name || doc.fileName))
            .slice(0, 10)
            .map((doc) => ({
              name: safeString(doc.name || doc.fileName, 200),
              type: safeString(doc.type || doc.docType || 'Document', 80),
              size: Number(doc.size) || 0
            }))
        : [];

      const trackingCode = generateTrackingCode();

      const result = await runExec(
        db,
        `INSERT INTO AdmissionApplications
           (ApplicantName, Program, Status, Email, Phone, NationalID, DateOfBirth,
            HighSchool, HighSchoolGPA, PersonalStatement, Documents, TrackingCode, StatusMessage)
         VALUES (?, ?, 'Submitted', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cleanName,
          cleanProgram,
          cleanEmail,
          safeString(phone, 60),
          safeString(nationalId, 60),
          safeString(dateOfBirth, 40),
          safeString(highSchool, 200),
          safeString(highSchoolGPA, 20),
          safeString(personalStatement, 4000),
          JSON.stringify(docList),
          trackingCode,
          'We have received your application. You will be notified by email when the review status changes.'
        ]
      );

      const row = await runGet(
        db,
        `SELECT * FROM AdmissionApplications WHERE ApplicationID = ?`,
        [result.lastID]
      );

      res.status(201).json({
        message: 'Application submitted successfully. Save your tracking code to check status later.',
        application: serializeApplication(row)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/applications/track/:code', async (req, res) => {
    try {
      const code = safeString(req.params.code, 80);
      if (!code) {
        return res.status(400).json({ error: 'Tracking code is required.' });
      }
      const row = await runGet(
        req.app.locals.db,
        `SELECT * FROM AdmissionApplications WHERE TrackingCode = ?`,
        [code]
      );
      if (!row) {
        return res.status(404).json({ error: 'No application found for that tracking code.' });
      }
      res.json(serializeApplication(row));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/admissions/programs', async (req, res) => {
    res.json([
      'Computer Engineering',
      'Software Engineering',
      'Computer Science',
      'Mechatronics',
      'Electrical Engineering',
      'Civil Engineering',
      'Architecture',
      'Business Administration'
    ]);
  });
};
