CREATE TABLE IF NOT EXISTS CourseTeachingRequests (
    RequestID INTEGER PRIMARY KEY AUTOINCREMENT,
    CourseID INTEGER NOT NULL,
    UserID INTEGER NOT NULL,
    Role TEXT NOT NULL,
    Status TEXT NOT NULL DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Approved', 'Rejected')),
    Message TEXT,
    RequestedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    UNIQUE (CourseID, UserID)
);
