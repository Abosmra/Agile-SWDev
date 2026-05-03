import React from 'react';

export default function MyCourses() {
  const courses = [
    {
      id: 1,
      title: "React Basics",
      instructor: "John Doe",
      progress: 70,
    },
    {
      id: 2,
      title: "JavaScript Advanced",
      instructor: "Jane Smith",
      progress: 40,
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>My Courses</h2>

      {courses.length === 0 ? (
        <p>No courses yet</p>
      ) : (
        courses.map((course) => (
          <div key={course.id} style={{
            background: '#eee',
            margin: '10px 0',
            padding: '15px',
            borderRadius: '10px'
          }}>
            <h3>{course.title}</h3>
            <p>Instructor: {course.instructor}</p>
            <p>Progress: {course.progress}%</p>
          </div>
        ))
      )}
    </div>
  );
}