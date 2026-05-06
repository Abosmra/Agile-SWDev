DROP TABLE IF EXISTS Courses;
DROP TABLE IF EXISTS Announcements;
DROP TABLE IF EXISTS Enrollments;
DROP TABLE IF EXISTS Staff;

CREATE TABLE Bookings (
    BookingID INTEGER PRIMARY KEY AUTOINCREMENT,
    HallID INTEGER NOT NULL,
    UserID INTEGER NOT NULL,
    Date TEXT NOT NULL,
    StartTime TEXT NOT NULL,
    EndTime TEXT NOT NULL,
    Purpose TEXT,
    Attendees INTEGER,
    Contact TEXT,
    Status TEXT DEFAULT 'Pending' CHECK (Status IN ('Confirmed', 'Pending', 'Cancelled')),
    FOREIGN KEY (HallID) REFERENCES Halls(HallID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

INSERT INTO Bookings (HallID, UserID, Date, StartTime, EndTime, Purpose, Attendees, Contact, Status) VALUES
    (1, 1, '2026-05-15', '10:00', '12:00', 'Project Meeting', 20, 'mai@example.com', 'Confirmed'),
    (2, 1, '2026-05-20', '14:00', '17:00', 'AI Seminar', 150, 'mai@example.com', 'Confirmed');
