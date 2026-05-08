CREATE TABLE Users (
    UserID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username TEXT UNIQUE NOT NULL,
    Password TEXT NOT NULL,
    GivenName TEXT,
    FamilyName TEXT,
    Role TEXT CHECK (Role IN ('Student', 'Staff', 'Admin', 'Advisor', 'Doctor', 'TA', 'Parent'))
);

-- Students
INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) VALUES
    ('mai.hamed@eng.asu.team15.eg', '123456', 'Mai', 'Hamed', 'Student'),
    ('student.abosamra@eng.asu.team15.eg', '12345678', 'Mohamed', 'Abosamra', 'Student'),
    ('mariam.riyad@eng.asu.team15.eg', 'student123', 'Mariam', 'Riyad', 'Student'),
    ('mariam.shaker@eng.asu.team15.eg', 'student123', 'Mariam', 'Shaker', 'Student'),
    ('maryam.hamdy@eng.asu.team15.eg', 'student123', 'Maryam', 'Hamdy', 'Student'),
    ('basmala.hany@eng.asu.team15.eg', 'student123', 'Basmala', 'Hany', 'Student');

-- Admins
INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) VALUES
    ('admin.abosamra@eng.asu.team15.eg', '12345678', 'Mohamed', 'Abosamra', 'Admin'),
    ('admin.user@eng.asu.team15.eg', 'admin123', 'Admin', 'User', 'Admin');

-- Staff
INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) VALUES
    ('staff.member@eng.asu.team15.eg', 'pass123', 'Staff', 'Member', 'Staff');

-- Advisors
INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) VALUES
    ('ahmed.hassan@eng.asu.team15.eg', 'advisor123', 'Ahmed', 'Hassan', 'Advisor'),
    ('sara.mahmoud@eng.asu.team15.eg', 'advisor123', 'Sara', 'Mahmoud', 'Advisor'),
    ('khaled.ibrahim@eng.asu.team15.eg', 'advisor123', 'Khaled', 'Ibrahim', 'Advisor');

-- Doctors
INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) VALUES
    ('ayman.eldin@eng.asu.team15.eg', 'doctor123', 'Ayman', 'Eldin', 'Doctor'),
    ('hossam.abdelrahman@eng.asu.team15.eg', 'doctor123', 'Hossam', 'AbdelRahman', 'Doctor'),
    ('sherif.hammad@eng.asu.team15.eg', 'doctor123', 'Sherif', 'Hammad', 'Doctor'),
    ('michael.ibrahim@eng.asu.team15.eg', 'doctor123', 'Michael', 'Ibrahim', 'Doctor'),
    ('islam.halim@eng.asu.team15.eg', 'doctor123', 'Islam', 'Halim', 'Doctor'),
    ('hossam.munim@eng.asu.team15.eg', 'doctor123', 'Hossam', 'Munim', 'Doctor'),
    ('khaled.eldin@eng.asu.team15.eg', 'doctor123', 'Khaled', 'Eldin', 'Doctor'),
    ('nabil.mohamed@eng.asu.team15.eg', 'doctor123', 'Nabil', 'Mohamed', 'Doctor'),
    ('mohamed.elgazzar@eng.asu.team15.eg', 'doctor123', 'Mohamed', 'ElGazzar', 'Doctor'),
    ('islam.elmadah@eng.asu.team15.eg', 'doctor123', 'Islam', 'Elmadah', 'Doctor'),
    ('mahmoud.khalil@eng.asu.team15.eg', 'doctor123', 'Mahmoud', 'Khalil', 'Doctor'),
    ('karim.emara@eng.asu.team15.eg', 'doctor123', 'Karim', 'Emara', 'Doctor');

-- Teaching Assistants
INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) VALUES
    ('nour.hassan@eng.asu.team15.eg', 'ta123456', 'Nour', 'Hassan', 'TA'),
    ('omar.samir@eng.asu.team15.eg', 'ta123456', 'Omar', 'Samir', 'TA');
