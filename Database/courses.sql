CREATE TABLE Courses (
    CourseID INTEGER PRIMARY KEY,
    CourseName TEXT,
    CourseCode TEXT,
    Description TEXT,
    Instructor TEXT,
    Credits INT
);

INSERT INTO Courses (CourseID, CourseName, CourseCode, Description, Instructor, Credits) VALUES
    (1, 'Distributed Computing', 'CSE362', 'Covers core concepts and practical applications of distributed computing systems.', 'Dr. Ayman Eldin, Dr. Hossam AbdelRahman', 3),
    (2, 'Advanced Embedded Systems Design', 'CSE323', 'Focuses on advanced design techniques and implementation patterns for embedded systems.', 'Dr. Sherif Hammad', 3),
    (3, 'Control Systems', 'CSE481', 'Introduces analysis and design principles used in modern control systems.', 'Dr. Michael Ibrahim', 3),
    (4, 'Internet of Things', 'CSE365', 'Explores connected devices, communication models, and common Internet of Things applications.', 'Dr. Islam Halim', 3),
    (5, 'Introduction to Machine learning', 'CSE382', 'Introduces core machine learning ideas, workflows, and common predictive modeling techniques.', 'Dr. Hossam Munim', 3),
    (6, 'Engineering Economy and Investments', 'EPM111', 'Examines economic decision-making, cost analysis, and investment evaluation for engineering projects.', 'Dr. Khaled Eldin, Dr. Nabil Mohamed', 2),
    (7, 'Agile Software Development', 'CSE342', 'Covers agile planning, iterative delivery, teamwork practices, and software project workflows.', 'Dr. Mohamed ElGazzar', 2),
    (8, 'Introduction to Embedded Systems', 'CSE322', 'Provides an introduction to embedded systems architecture, programming, and hardware integration.', 'Dr. Sherif Hammad', 3),
    (9, 'Software Testing, Validation, and Verification', 'CSE341', 'Focuses on testing strategies, validation techniques, and verification practices for software quality.', 'Dr. Islam Elmadah', 2),
    (10, 'Image Processing', 'CSE381', 'Introduces digital image processing concepts, enhancement methods, and analysis techniques.', 'Dr. Mahmoud Khalil', 2),
    (11, 'Computer Networking', 'CSE361', 'Covers networking fundamentals, communication protocols, and data exchange across computer networks.', 'Dr. Ayman Eldin, Dr. Karim Emara', 3),
    (12, 'Web Development', 'CSE343', 'Introduces frontend and backend web development concepts used to build modern web applications.', 'Dr. Islam Halim', 3);

/*
Safe course catalog imported from local one-time course export:
- kept only course names, course codes, instructor names, and neutral descriptions
- excluded grades, internal IDs, committee IDs, attendance data, and other sensitive LMS details
*/
