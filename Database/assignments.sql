DROP TABLE IF EXISTS Courses;
DROP TABLE IF EXISTS Announcements;
DROP TABLE IF EXISTS Enrollments;
DROP TABLE IF EXISTS Staff;

IF OBJECT_ID('Assignments', 'U') IS NOT NULL DROP TABLE Assignments;
CREATE TABLE Assignments (
    AssignmentID INT IDENTITY(1,1) PRIMARY KEY,
    CourseID INT NOT NULL,
    Title VARCHAR(100) NOT NULL,
    DueDate DATETIME,
    MaxScore INT DEFAULT 100,
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
);

INSERT OR IGNORE INTO Assignments (AssignmentID, CourseID, Title, DueDate, MaxScore) VALUES
    (1, 1, 'Distributed Systems Lab 1', '2026-05-20', 100),
    (2, 1, 'Consensus Algorithms Quiz', '2026-05-27', 50),
    (3, 2, 'Embedded Controller Design', '2026-05-24', 100),
    (4, 4, 'IoT Sensor Integration Lab', '2026-05-26', 100);
