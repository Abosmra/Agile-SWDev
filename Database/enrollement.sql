CREATE TABLE Enrollments (
    EnrollmentID INT PRIMARY KEY,
    StudentName VARCHAR(100),
    CourseID INT,
    Status VARCHAR(20),
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
);

INSERT INTO Enrollments VALUES (1, 'Mai Ahmed', 1, 'Enrolled');
INSERT INTO Enrollments VALUES (2, 'Tarek Hassan', 2, 'Completed');
INSERT INTO Enrollments VALUES (3, 'Sara Ali', 3, 'Pending');

/*
Note: From Mai this is for sprint  1
*/
