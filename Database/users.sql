-- Drop table if 
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(255) UNIQUE NOT NULL,
    Password NVARCHAR(255) NOT NULL,
    GivenName NVARCHAR(100),
    FamilyName NVARCHAR(100),
    Role NVARCHAR(50) CHECK (Role IN ('Student', 'Staff', 'Admin', 'Advisor', 'Doctor', 'Parent'))
);

-- Insert data
INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('mai@example.com', '123456', 'Mai', 'User', 'Student');

INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('mohamed@web.dev', '12345678', 'Mohamed', 'User', 'Admin');

INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('admin@example.com', 'admin123', 'Admin', 'User', 'Admin');

INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('staff1@example.com', 'pass123', 'Staff', 'Member', 'Staff');

-- Advisors
INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('john.doe@eng.asu.team15.eg', 'advisor123', 'John', 'Doe', 'Advisor');

INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('jane.smith@eng.asu.team15.eg', 'advisor123', 'Jane', 'Smith', 'Advisor');

INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('mike.johnson@eng.asu.team15.eg', 'advisor123', 'Mike', 'Johnson', 'Advisor');

-- Doctors
INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('ayman.eldin@eng.asu.team15.eg', 'doctor123', 'Ayman', 'Eldin', 'Doctor');

INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('hossam.abdelrahman@eng.asu.team15.eg', 'doctor123', 'Hossam', 'AbdelRahman', 'Doctor');

INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('sherif.hammad@eng.asu.team15.eg', 'doctor123', 'Sherif', 'Hammad', 'Doctor');

INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('michael.ibrahim@eng.asu.team15.eg', 'doctor123', 'Michael', 'Ibrahim', 'Doctor');

INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('islam.halim@eng.asu.team15.eg', 'doctor123', 'Islam', 'Halim', 'Doctor');

INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('hossam.munim@eng.asu.team15.eg', 'doctor123', 'Hossam', 'Munim', 'Doctor');

INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('khaled.eldin@eng.asu.team15.eg', 'doctor123', 'Khaled', 'Eldin', 'Doctor');

INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('nabil.mohamed@eng.asu.team15.eg', 'doctor123', 'Nabil', 'Mohamed', 'Doctor');

INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('mohamed.elgazzar@eng.asu.team15.eg', 'doctor123', 'Mohamed', 'ElGazzar', 'Doctor');

INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('islam.elmadah@eng.asu.team15.eg', 'doctor123', 'Islam', 'Elmadah', 'Doctor');

INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('mahmoud.khalil@eng.asu.team15.eg', 'doctor123', 'Mahmoud', 'Khalil', 'Doctor');

INSERT INTO Users (Username, Password, GivenName, FamilyName, Role) 
VALUES ('karim.emara@eng.asu.team15.eg', 'doctor123', 'Karim', 'Emara', 'Doctor');

