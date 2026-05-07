
DROP TABLE IF EXISTS Courses;
DROP TABLE IF EXISTS Announcements;
DROP TABLE IF EXISTS Enrollments;
DROP TABLE IF EXISTS Staff;

IF OBJECT_ID('Grades', 'U') IS NOT NULL DROP TABLE Grades;
CREATE TABLE Grades (
    GradeID INT IDENTITY(1,1) PRIMARY KEY,
    StudentID INT NOT NULL,
    AssignmentID INT NOT NULL,
    Score INT,
    Feedback VARCHAR(500),
    FOREIGN KEY (StudentID) REFERENCES Users(UserID),
    FOREIGN KEY (AssignmentID) REFERENCES Assignments(AssignmentID)
);

INSERT OR IGNORE INTO Grades (GradeID, StudentID, AssignmentID, Score, Feedback) VALUES
    (1, 1, 1, 92, 'Strong implementation and clear report'),
    (2, 1, 2, 45, 'Good understanding of Raft basics');
