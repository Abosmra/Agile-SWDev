IF OBJECT_ID('Transcripts', 'U') IS NOT NULL DROP TABLE Transcripts;

CREATE TABLE Transcripts (
    TranscriptID INT IDENTITY(1,1) PRIMARY KEY,
    StudentID INT NOT NULL,
    GeneratedDate DATETIME NOT NULL DEFAULT GETDATE(),
    PDFPath VARCHAR(200) NOT NULL,   -- path to stored PDF file
    Semester VARCHAR(20) NULL,       -- optional: e.g., 'Fall 2025'
    GPA DECIMAL(3,2) NULL,           -- optional: computed GPA at time of generation
    FOREIGN KEY (StudentID) REFERENCES Users(UserID)
);

INSERT INTO Transcripts (StudentID, PDFPath, Semester, GPA)
VALUES (1, '/transcripts/student_1_fall2025.pdf', 'Fall 2025', 3.75);