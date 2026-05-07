DROP TABLE IF EXISTS Courses;
DROP TABLE IF EXISTS Announcements;
DROP TABLE IF EXISTS Enrollments;
DROP TABLE IF EXISTS Staff;


cREATE TABLE Staff (
    StaffID INTEGER PRIMARY KEY,
    Name TEXT,
    Department TEXT,
    Role TEXT,
    ContactInfo VARCHAR(100),
    OfficeHours TEXT DEFAULT 'By appointment',
    AssignedCourses TEXT DEFAULT '',
    PerformanceScore INTEGER DEFAULT 90,
    Research TEXT DEFAULT '',
    ProfessionalDevelopment TEXT DEFAULT '',
    PayrollStatus TEXT DEFAULT 'Active',
    BenefitsSummary TEXT DEFAULT 'Standard university benefits',
    LeaveBalance INTEGER DEFAULT 21
);

INSERT INTO Staff (StaffID, Name, Department, Role, ContactInfo, OfficeHours, AssignedCourses, Research, ProfessionalDevelopment, BenefitsSummary)
VALUES (4, 'Dr. Ayman Eldin', 'Computer Science', 'Doctor', 'ayman.eldin@eng.asu.team15.eg', 'Sunday and Tuesday, 10:00-12:00', 'Distributed Computing, Computer Networking', 'Faculty research profile available for publication tracking', 'Annual teaching development plan active', 'Medical coverage, retirement plan, and university staff benefits');
INSERT INTO Staff (StaffID, Name, Department, Role, ContactInfo, AssignedCourses, Research, ProfessionalDevelopment, BenefitsSummary)
VALUES (5, 'Dr. Hossam AbdelRahman', 'Computer Science', 'Doctor', 'hossam.abdelrahman@eng.asu.team15.eg', 'Distributed Computing', 'Faculty research profile available for publication tracking', 'Annual teaching development plan active', 'Medical coverage, retirement plan, and university staff benefits');
INSERT INTO Staff (StaffID, Name, Department, Role, ContactInfo, OfficeHours, AssignedCourses, Research, ProfessionalDevelopment, BenefitsSummary)
VALUES (6, 'Dr. Sherif Hammad', 'Computer Science', 'Doctor', 'sherif.hammad@eng.asu.team15.eg', 'Monday, 13:00-15:00', 'Advanced Embedded Systems Design, Introduction to Embedded Systems', 'Faculty research profile available for publication tracking', 'Annual teaching development plan active', 'Medical coverage, retirement plan, and university staff benefits');
INSERT INTO Staff (StaffID, Name, Department, Role, ContactInfo, Research, ProfessionalDevelopment, BenefitsSummary) VALUES (7, 'Dr. Michael Ibrahim', 'Computer Science', 'Doctor', 'michael.ibrahim@eng.asu.team15.eg', 'Faculty research profile available for publication tracking', 'Annual teaching development plan active', 'Medical coverage, retirement plan, and university staff benefits');
INSERT INTO Staff (StaffID, Name, Department, Role, ContactInfo, AssignedCourses, Research, ProfessionalDevelopment, BenefitsSummary) VALUES (8, 'Dr. Islam Halim', 'Computer Science', 'Doctor', 'islam.halim@eng.asu.team15.eg', 'Internet of Things, Web Development', 'Faculty research profile available for publication tracking', 'Annual teaching development plan active', 'Medical coverage, retirement plan, and university staff benefits');
INSERT INTO Staff (StaffID, Name, Department, Role, ContactInfo, Research, ProfessionalDevelopment, BenefitsSummary) VALUES (9, 'Dr. Hossam Munim', 'Computer Science', 'Doctor', 'hossam.munim@eng.asu.team15.eg', 'Faculty research profile available for publication tracking', 'Annual teaching development plan active', 'Medical coverage, retirement plan, and university staff benefits');
INSERT INTO Staff (StaffID, Name, Department, Role, ContactInfo, Research, ProfessionalDevelopment, BenefitsSummary) VALUES (10, 'Dr. Khaled Eldin', 'Engineering', 'Doctor', 'khaled.eldin@eng.asu.team15.eg', 'Faculty research profile available for publication tracking', 'Annual teaching development plan active', 'Medical coverage, retirement plan, and university staff benefits');
INSERT INTO Staff (StaffID, Name, Department, Role, ContactInfo, Research, ProfessionalDevelopment, BenefitsSummary) VALUES (11, 'Dr. Nabil Mohamed', 'Engineering', 'Doctor', 'nabil.mohamed@eng.asu.team15.eg', 'Faculty research profile available for publication tracking', 'Annual teaching development plan active', 'Medical coverage, retirement plan, and university staff benefits');
INSERT INTO Staff (StaffID, Name, Department, Role, ContactInfo, Research, ProfessionalDevelopment, BenefitsSummary) VALUES (12, 'Dr. Mohamed ElGazzar', 'Computer Science', 'Doctor', 'mohamed.elgazzar@eng.asu.team15.eg', 'Faculty research profile available for publication tracking', 'Annual teaching development plan active', 'Medical coverage, retirement plan, and university staff benefits');
INSERT INTO Staff (StaffID, Name, Department, Role, ContactInfo, Research, ProfessionalDevelopment, BenefitsSummary) VALUES (13, 'Dr. Islam Elmadah', 'Computer Science', 'Doctor', 'islam.elmadah@eng.asu.team15.eg', 'Faculty research profile available for publication tracking', 'Annual teaching development plan active', 'Medical coverage, retirement plan, and university staff benefits');
INSERT INTO Staff (StaffID, Name, Department, Role, ContactInfo, Research, ProfessionalDevelopment, BenefitsSummary) VALUES (14, 'Dr. Mahmoud Khalil', 'Computer Science', 'Doctor', 'mahmoud.khalil@eng.asu.team15.eg', 'Faculty research profile available for publication tracking', 'Annual teaching development plan active', 'Medical coverage, retirement plan, and university staff benefits');
INSERT INTO Staff (StaffID, Name, Department, Role, ContactInfo, Research, ProfessionalDevelopment, BenefitsSummary) VALUES (15, 'Dr. Karim Emara', 'Computer Science', 'Doctor', 'karim.emara@eng.asu.team15.eg', 'Faculty research profile available for publication tracking', 'Annual teaching development plan active', 'Medical coverage, retirement plan, and university staff benefits');
INSERT INTO Staff (StaffID, Name, Department, Role, ContactInfo, OfficeHours, AssignedCourses, PerformanceScore, Research, ProfessionalDevelopment, BenefitsSummary, LeaveBalance)
VALUES (101, 'Nour Hassan', 'Computer Science', 'TA', 'ta1@eng.asu.team15.eg', 'Sunday, 12:00-14:00', 'Web Development Lab, Agile Software Development', 88, 'Supports course labs and grading workflows', 'TA onboarding and lab facilitation workshop', 'Teaching assistant stipend and university access benefits', 14);
INSERT INTO Staff (StaffID, Name, Department, Role, ContactInfo, OfficeHours, AssignedCourses, PerformanceScore, Research, ProfessionalDevelopment, BenefitsSummary, LeaveBalance)
VALUES (102, 'Omar Samir', 'Computer Science', 'TA', 'ta2@eng.asu.team15.eg', 'Wednesday, 11:00-13:00', 'Embedded Systems Lab, Internet of Things', 86, 'Supports embedded systems labs and student mentoring', 'Assessment rubrics and student support workshop', 'Teaching assistant stipend and university access benefits', 14);
