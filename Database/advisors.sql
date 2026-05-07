CREATE TABLE IF NOT EXISTS AdvisorStudentLimits (
    AdvisorID INTEGER PRIMARY KEY,
    MaxStudents INTEGER NOT NULL DEFAULT 20,
    FOREIGN KEY (AdvisorID) REFERENCES Staff(StaffID)
);

CREATE TABLE IF NOT EXISTS AdvisorAssignments (
    AssignmentID INTEGER PRIMARY KEY AUTOINCREMENT,
    AdvisorID INTEGER NOT NULL,
    StudentID INTEGER NOT NULL UNIQUE,
    AssignedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AdvisorID) REFERENCES Staff(StaffID),
    FOREIGN KEY (StudentID) REFERENCES Users(UserID)
);

CREATE TABLE IF NOT EXISTS AcademicRequests (
    RequestID INTEGER PRIMARY KEY AUTOINCREMENT,
    RequestType TEXT NOT NULL CHECK (RequestType IN ('Enrollment', 'DropCourse')),
    EnrollmentID INTEGER,
    CourseID INTEGER NOT NULL,
    StudentID INTEGER NOT NULL,
    AdvisorID INTEGER NOT NULL,
    Status TEXT NOT NULL DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Approved', 'Cancelled')),
    RequestedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ReviewedAt TEXT,
    Notes TEXT,
    FOREIGN KEY (EnrollmentID) REFERENCES Enrollments(EnrollmentID),
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
    FOREIGN KEY (StudentID) REFERENCES Users(UserID),
    FOREIGN KEY (AdvisorID) REFERENCES Staff(StaffID)
);

INSERT OR IGNORE INTO Staff (StaffID, Name, Department, Role, ContactInfo, OfficeHours, AssignedCourses)
VALUES
    (201, 'John Doe', 'Computer Science', 'Advisor', 'john.doe@eng.asu.team15.eg', 'Sunday and Tuesday, 11:00-13:00', 'Academic advising'),
    (202, 'Jane Smith', 'Computer Science', 'Advisor', 'jane.smith@eng.asu.team15.eg', 'Monday and Wednesday, 10:00-12:00', 'Academic advising'),
    (203, 'Mike Johnson', 'Engineering', 'Advisor', 'mike.johnson@eng.asu.team15.eg', 'Thursday, 12:00-15:00', 'Academic advising');

INSERT OR IGNORE INTO AdvisorStudentLimits (AdvisorID, MaxStudents)
VALUES
    (201, 20),
    (202, 20),
    (203, 20);
