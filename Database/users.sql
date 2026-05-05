-- Drop table if exists
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;

CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(50) NOT NULL,
    GivenName VARCHAR(50),
    FamilyName VARCHAR(50),
    Role VARCHAR(20)
);

ALTER TABLE Users ADD CONSTRAINT CHK_Role CHECK (Role IN ('Student', 'Staff', 'Admin', 'Parent'));

-- Insert data
INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('mai@example.com', '123456', 'Mai', 'User', 'Student');

INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('admin@example.com', 'admin123', 'Admin', 'User', 'Admin');

INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('staff1@example.com', 'pass123', 'Staff', 'Member', 'Staff');

