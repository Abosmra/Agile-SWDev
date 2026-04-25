CREATE TABLE Users (
    UserID INT PRIMARY KEY,
    Username VARCHAR(50),
    Password VARCHAR(50),
    Role VARCHAR(20) -- Student, Staff, Admin
);

INSERT INTO Users VALUES (1, 'mai', '1234', 'Student');
INSERT INTO Users VALUES (2, 'admin', 'admin123', 'Admin');
INSERT INTO Users VALUES (3, 'staff1', 'pass', 'Staff');

/*
Note: From Mai this is for implementing Sprint 1
*/