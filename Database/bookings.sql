-- Drop table if exists
IF OBJECT_ID('HallBookings', 'U') IS NOT NULL DROP TABLE HallBookings;

-- Create HallBookings table (SQL Server compatible)
CREATE TABLE HallBookings (
    BookingID INT IDENTITY(1,1) PRIMARY KEY,
    HallID INT NOT NULL,
    UserID INT NOT NULL,         
    BookingDate DATE NOT NULL,
    StartTime TIME NOT NULL,   
    EndTime TIME NOT NULL,
    Purpose VARCHAR(200),
    Attendees INT,
    Contact VARCHAR(100),
    Status VARCHAR(20) DEFAULT 'Pending',
    CONSTRAINT CHK_Status CHECK (Status IN ('Confirmed', 'Pending', 'Cancelled')),
    CONSTRAINT CHK_Time CHECK (StartTime < EndTime),
    FOREIGN KEY (HallID) REFERENCES Halls(HallID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Insert your sample data (converted to SQL Server types)
INSERT INTO HallBookings (HallID, UserID, BookingDate, StartTime, EndTime, Purpose, Attendees, Contact, Status)
VALUES
    (1, 1, '2026-05-15', '10:00', '12:00', 'Project Meeting', 20, 'mai@example.com', 'Confirmed'),
    (2, 1, '2026-05-20', '14:00', '17:00', 'AI Seminar', 150, 'mai@example.com', 'Confirmed'),
    (4, 3, '2026-05-25', '09:00', '10:30', 'Team Standup', 8, 'staff1@example.com', 'Pending');