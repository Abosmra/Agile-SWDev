IF OBJECT_ID('ResourceAllocations', 'U') IS NOT NULL DROP TABLE ResourceAllocations;
IF OBJECT_ID('Resources', 'U') IS NOT NULL DROP TABLE Resources;

CREATE TABLE Resources (
    ResourceID INT IDENTITY(1,1) PRIMARY KEY,
    ResourceName VARCHAR(100) NOT NULL,
    ResourceType VARCHAR(50) CHECK (ResourceType IN ('Equipment', 'Software License', 'Book', 'Other')),
    TotalQuantity INT NOT NULL DEFAULT 0,
    AvailableQuantity INT NOT NULL DEFAULT 0
);

CREATE TABLE ResourceAllocations (
    AllocationID INT IDENTITY(1,1) PRIMARY KEY,
    ResourceID INT NOT NULL,
    AllocatedToUserID INT NOT NULL,   -- can be student or staff
    Department VARCHAR(100) NULL,     -- e.g., 'Computer Science'
    Quantity INT NOT NULL DEFAULT 1,
    AllocatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    DueDate DATE NULL,                -- for returnable items
    ReturnedDate DATE NULL,
    FOREIGN KEY (ResourceID) REFERENCES Resources(ResourceID),
    FOREIGN KEY (AllocatedToUserID) REFERENCES Users(UserID)
);

INSERT INTO Resources (ResourceName, ResourceType, TotalQuantity, AvailableQuantity) VALUES
('Laptop Dell XPS', 'Equipment', 10, 8),
('MATLAB License', 'Software License', 5, 3);

INSERT INTO ResourceAllocations (ResourceID, AllocatedToUserID, Department, Quantity, DueDate)
VALUES (1, 1, 'Computer Science', 1, '2026-06-01');