CREATE TABLE Enrollments (
    EnrollmentID INT PRIMARY KEY,
    StudentName VARCHAR(100),
    CourseID INT,
    Status VARCHAR(20),
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
);

/*
Note: From Mai this is for sprint  1
*/