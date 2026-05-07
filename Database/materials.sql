CREATE TABLE IF NOT EXISTS CourseMaterials (
    MaterialID INTEGER PRIMARY KEY AUTOINCREMENT,
    CourseID INTEGER NOT NULL,
    Title TEXT NOT NULL,
    Type TEXT NOT NULL DEFAULT 'Link',
    Url TEXT,
    Notes TEXT,
    UploadedBy INTEGER NOT NULL,
    UploadedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
    FOREIGN KEY (UploadedBy) REFERENCES Users(UserID)
);

INSERT OR IGNORE INTO CourseMaterials (MaterialID, CourseID, Title, Type, Url, Notes, UploadedBy) VALUES
    (1, 1, 'Distributed Computing Week 1 Slides', 'Slides', '/materials/cse362/week-1.pdf', 'Introductory lecture deck', 8),
    (2, 1, 'Replication Reading List', 'Document', '/materials/cse362/replication-reading.md', 'Read before the next lab', 8),
    (3, 2, 'Embedded Systems Lab Manual', 'Lab', '/materials/cse323/lab-manual.pdf', 'Bring this to the lab session', 10);
