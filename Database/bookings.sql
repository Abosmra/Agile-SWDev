CREATE TABLE Bookings (
    BookingID INTEGER PRIMARY KEY AUTOINCREMENT,
    HallID INT,
    UserID INT,
    Date DATE,
    StartTime TEXT,
    EndTime TEXT,
    Purpose TEXT,
    Attendees INT,
    Contact VARCHAR(100),
    Status VARCHAR(20)
);

INSERT INTO Bookings (HallID, UserID, Date, StartTime, EndTime, Purpose, Attendees, Contact, Status) VALUES
    (1, 1, '2026-05-15', '10:00', '12:00', 'Project Meeting', 20, 'mai@example.com', 'Confirmed'),
    (2, 1, '2026-05-20', '14:00', '17:00', 'AI Seminar', 150, 'mai@example.com', 'Confirmed'),
    (4, 3, '2026-05-25', '09:00', '10:30', 'Team Standup', 8, 'staff1@example.com', 'Pending');
