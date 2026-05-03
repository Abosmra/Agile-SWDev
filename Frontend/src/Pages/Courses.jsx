import React, { useState, useEffect } from 'react';
import CourseCard from '../Components/CourseCard';
import { courses } from '../Data/courses';

export default function Courses() {
  const [courseList, setCourseList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    setCourseList(courses);
  }, []);

  const filteredCourses = courseList.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnroll = (courseId) => {
    if (!enrolledCourses.includes(courseId)) {
      setEnrolledCourses([...enrolledCourses, courseId]);
      alert('Successfully enrolled in course!');
    } else {
      alert('You are already enrolled in this course!');
    }
  };

  return (
    <div className="courses-page">
      <h1>Browse Courses</h1>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search courses by title, description, or instructor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <p className="search-results">Found {filteredCourses.length} course(s)</p>
      </div>

      <div className="course-container">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course}
              isEnrolled={enrolledCourses.includes(course.id)}
              onEnroll={handleEnroll}
            />
          ))
        ) : (
          <p className="no-results">No courses found matching your search.</p>
        )}
      </div>

      {enrolledCourses.length > 0 && (
        <div className="enrolled-summary">
          <h3>You are enrolled in {enrolledCourses.length} course(s)</h3>
        </div>
      )}
    </div>
  );
}
