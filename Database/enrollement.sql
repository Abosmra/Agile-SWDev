DROP TABLE IF EXISTS Enrollments;

CREATE TABLE Enrollments (
    EnrollmentID INTEGER PRIMARY KEY,
    StudentName TEXT,
    CourseID INTEGER,
    Status TEXT,
    UserID INTEGER,
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

INSERT INTO Enrollments (EnrollmentID, StudentName, CourseID, Status, UserID) VALUES
    (1, 'Mai User', 1, 'Enrolled', 1),
    (2, 'Mai User', 7, 'Enrolled', 1),
    (3, 'Mai User', 12, 'Enrolled', 1);


