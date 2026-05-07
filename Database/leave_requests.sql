CREATE TABLE IF NOT EXISTS LeaveRequests (
    RequestID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    StaffID INTEGER,
    StartDate TEXT NOT NULL,
    EndDate TEXT NOT NULL,
    Reason TEXT,
    Status TEXT NOT NULL DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Approved', 'Rejected')),
    RequestedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (StaffID) REFERENCES Staff(StaffID)
);
