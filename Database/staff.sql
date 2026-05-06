DROP TABLE IF EXISTS Courses;
DROP TABLE IF EXISTS Announcements;
DROP TABLE IF EXISTS Enrollments;
DROP TABLE IF EXISTS Staff;


cREATE TABLE Staff (
    StaffID INTEGER PRIMARY KEY,
    Name TEXT,
    Department TEXT,
    Role TEXT,
    ContactInfo VARCHAR(100)
);

INSERT INTO Staff VALUES (4, 'Dr. Ayman Eldin', 'Computer Science', 'Doctor', 'ayman.eldin@eng.asu.team15.eg');
INSERT INTO Staff VALUES (5, 'Dr. Hossam AbdelRahman', 'Computer Science', 'Doctor', 'hossam.abdelrahman@eng.asu.team15.eg');
INSERT INTO Staff VALUES (6, 'Dr. Sherif Hammad', 'Computer Science', 'Doctor', 'sherif.hammad@eng.asu.team15.eg');
INSERT INTO Staff VALUES (7, 'Dr. Michael Ibrahim', 'Computer Science', 'Doctor', 'michael.ibrahim@eng.asu.team15.eg');
INSERT INTO Staff VALUES (8, 'Dr. Islam Halim', 'Computer Science', 'Doctor', 'islam.halim@eng.asu.team15.eg');
INSERT INTO Staff VALUES (9, 'Dr. Hossam Munim', 'Computer Science', 'Doctor', 'hossam.munim@eng.asu.team15.eg');
INSERT INTO Staff VALUES (10, 'Dr. Khaled Eldin', 'Engineering', 'Doctor', 'khaled.eldin@eng.asu.team15.eg');
INSERT INTO Staff VALUES (11, 'Dr. Nabil Mohamed', 'Engineering', 'Doctor', 'nabil.mohamed@eng.asu.team15.eg');
INSERT INTO Staff VALUES (12, 'Dr. Mohamed ElGazzar', 'Computer Science', 'Doctor', 'mohamed.elgazzar@eng.asu.team15.eg');
INSERT INTO Staff VALUES (13, 'Dr. Islam Elmadah', 'Computer Science', 'Doctor', 'islam.elmadah@eng.asu.team15.eg');
INSERT INTO Staff VALUES (14, 'Dr. Mahmoud Khalil', 'Computer Science', 'Doctor', 'mahmoud.khalil@eng.asu.team15.eg');
INSERT INTO Staff VALUES (15, 'Dr. Karim Emara', 'Computer Science', 'Doctor', 'karim.emara@eng.asu.team15.eg');

