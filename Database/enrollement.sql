DROP TABLE IF EXISTS Courses;
DROP TABLE IF EXISTS Announcements;
DROP TABLE IF EXISTS Enrollments;
DROP TABLE IF EXISTS Staff;

CREATE TABLE Enrollments (
    EnrollmentID INTEGER PRIMARY KEY,
    StudentName TEXT,
    CourseID INTEGER,
    Status TEXT,
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
);

INSERT INTO Enrollments VALUES (1, 'Mai Ahmed', 1, 'Enrolled');
INSERT INTO Enrollments VALUES (2, 'Tarek Hassan', 2, 'Completed');
INSERT INTO Enrollments VALUES (3, 'Sara Ali', 3, 'Pending');

/*
Note: From Mai this is for sprint  1
*/
