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