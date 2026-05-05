DROP TABLE IF EXISTS Halls;

CREATE TABLE Halls (
    HallID INTEGER PRIMARY KEY AUTOINCREMENT,
    HallName TEXT NOT NULL,
    Capacity INTEGER NOT NULL CHECK (Capacity > 0),
    IsLab INTEGER NOT NULL DEFAULT 0   -- 0 = classroom, 1 = lab
);

INSERT INTO Halls (HallName, Capacity, IsLab) VALUES
('Hall A', 50, 0),
('Hall B', 60, 0),
('Hall C', 70, 0),
('Hall D', 80, 0),
('Hall 1', 40, 0),
('Hall 2', 55, 0),
('Hall 3', 65, 0),
('Hall 4', 75, 0),
('Hall 911A', 160, 1),   
('Hall 914A', 160, 1),
('Hall 921A', 160, 1),
('Hall 924A', 160, 1),
('Hall 931A', 160, 1),
('Hall 934A', 160, 1),
('Hall 941A', 160, 1),
('Hall 944A', 160, 1),
('Hall 911', 100, 0),
('Hall 912', 120, 0),
('Hall 913', 140, 0),
('Hall 914', 160, 0),
('Hall 921', 30, 0),
('Hall 922', 35, 0),
('Hall 923', 45, 0),
('Hall 924', 55, 0),
('Hall 931', 200, 0),
('Hall 932', 220, 0),
('Hall 933', 240, 0),
('Hall 934', 260, 0),
('Hall 941', 90, 0),
('Hall 942', 110, 0),
('Hall 943', 130, 0),
('Hall 944', 150, 0);
