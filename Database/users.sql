CREATE TABLE Users (
    UserID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(50) NOT NULL,
    GivenName VARCHAR(50),
    FamilyName VARCHAR(50),
    Role VARCHAR(20) -- Student, Staff, Admin
);

INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) VALUES ('mai@example.com', '123456', 'Mai', 'User', 'Student');
INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) VALUES ('admin@example.com', 'admin123', 'Admin', 'User', 'Admin');
INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) VALUES ('staff1@example.com', 'pass123', 'Staff', 'Member', 'Staff');

/*
Note: From Mai this is for implementing Sprint 1
*/
