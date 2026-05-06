DROP TABLE IF EXISTS Courses;
DROP TABLE IF EXISTS Announcements;
DROP TABLE IF EXISTS Enrollments;
DROP TABLE IF EXISTS Staff;


IF OBJECT_ID('MaintenanceRequests', 'U') IS NOT NULL DROP TABLE MaintenanceRequests;

CREATE TABLE MaintenanceRequests (
    RequestID INT IDENTITY(1,1) PRIMARY KEY,
    RoomID INT NOT NULL,
    ReportedByUserID INT NOT NULL,
    Description VARCHAR(500) NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'open',
    ReportedDate DATETIME NOT NULL DEFAULT GETDATE(),
    ResolvedDate DATETIME NULL,
    CONSTRAINT CHK_Status CHECK (Status IN ('open', 'in progress', 'closed')),
    FOREIGN KEY (RoomID) REFERENCES Halls(HallID), 
    FOREIGN KEY (ReportedByUserID) REFERENCES Users(UserID)
);

INSERT INTO MaintenanceRequests (RoomID, ReportedByUserID, Description, Status)
VALUES (1, 2, 'Projector not working in Room 101', 'open');