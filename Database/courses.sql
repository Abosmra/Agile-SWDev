CREATE TABLE Courses (
    CourseID INT PRIMARY KEY,
    CourseName VARCHAR(100),
    CourseCode VARCHAR(20),
    Description TEXT,
    Instructor TEXT,
    Credits INT
);

INSERT INTO Courses (CourseID, CourseName, CourseCode, Description, Instructor, Credits) VALUES
    (1, 'Distributed Computing', 'CSE362', 'Covers core concepts and practical applications of distributed computing systems.', 'Ayman Mohamed Bahaa Eldin, Hossam Mohamed AbdelRahman', 3),
    (2, 'Advanced Embedded Systems Design', 'CSE323', 'Focuses on advanced design techniques and implementation patterns for embedded systems.', 'Sherif Ali Mohamed Hammad', 3),
    (3, 'Control Systems', 'CSE481', 'Introduces analysis and design principles used in modern control systems.', 'Michael Naiem Abdelmassih Ibrahim', 3),
    (4, 'Internet of Things', 'CSE365', 'Explores connected devices, communication models, and common Internet of Things applications.', 'Islam Tharwat Abdel Halim', 3),
    (5, 'Introduction to Machine learning', 'CSE382', 'Introduces core machine learning ideas, workflows, and common predictive modeling techniques.', 'Hossam El-Din Hassan Abd El Munim', 3),
    (6, 'Engineering Economy and Investments', 'EPM111', 'Examines economic decision-making, cost analysis, and investment evaluation for engineering projects.', 'Khaled Abdel Aty M. Salah Eldin, Nabil Mohamed Hamed Mohamed', 2),
    (7, 'Agile Software Development', 'CSE342', 'Covers agile planning, iterative delivery, teamwork practices, and software project workflows.', 'Mohamed Hassan Mahmoud El Gazzar', 2),
    (8, 'Introduction to Embedded Systems', 'CSE322', 'Provides an introduction to embedded systems architecture, programming, and hardware integration.', 'Sherif Ali Mohamed Hammad', 3),
    (9, 'Software Testing, Validation, and Verification', 'CSE341', 'Focuses on testing strategies, validation techniques, and verification practices for software quality.', 'Islam Ahmed Mahmoud Elmadah', 2),
    (10, 'Image Processing', 'CSE381', 'Introduces digital image processing concepts, enhancement methods, and analysis techniques.', 'Mahmoud Ibrahim Khalil', 2),
    (11, 'Computer Networking', 'CSE361', 'Covers networking fundamentals, communication protocols, and data exchange across computer networks.', 'Ayman Mohamed Bahaa Eldin, Karim Ahmed Awad El Sayed Emara', 3),
    (12, 'Web Development', 'CSE343', 'Introduces frontend and backend web development concepts used to build modern web applications.', 'Islam Tharwat Abdel Halim', 3);

/*
Safe course catalog imported from local one-time course export:
- kept only course names, course codes, instructor names, and neutral descriptions
- excluded grades, internal IDs, committee IDs, attendance data, and other sensitive LMS details
*/
