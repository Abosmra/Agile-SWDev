IF OBJECT_ID('Messages', 'U') IS NOT NULL DROP TABLE Messages;

CREATE TABLE Messages (
    MessageID INT IDENTITY(1,1) PRIMARY KEY,
    FromUserID INT NOT NULL,
    ToUserID INT NOT NULL,
    Subject VARCHAR(200),
    Body VARCHAR(MAX),
    SentDate DATETIME NOT NULL DEFAULT GETDATE(),
    IsRead BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (FromUserID) REFERENCES Users(UserID),
    FOREIGN KEY (ToUserID) REFERENCES Users(UserID)
);

-- Optional sample insert
INSERT INTO Messages (FromUserID, ToUserID, Subject, Body, IsRead)
VALUES (1, 3, 'Meeting Request', 'Can we discuss the project tomorrow?', 0);