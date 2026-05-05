IF OBJECT_ID('Assignments', 'U') IS NOT NULL DROP TABLE Assignments;
CREATE TABLE Assignments (
    AssignmentID INT IDENTITY(1,1) PRIMARY KEY,
    CourseID INT NOT NULL,
    Title VARCHAR(100) NOT NULL,
    DueDate DATETIME,
    MaxScore INT DEFAULT 100,
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
);