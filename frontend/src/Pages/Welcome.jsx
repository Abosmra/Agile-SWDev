import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/welcome.css';
import notes from '../assets/notes.png';
import globe from '../assets/globe.png';
import education from '../assets/education.png';

export default function Welcome() {
  const navigate = useNavigate();
  const [active, setActive] = useState('home');
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetch('/api/announcements')
      .then(r => r.ok ? r.json() : [])
      .then(data => setAnnouncements(data.slice(0, 4)))
      .catch(() => {});
  }, []);

  const scrollTo = (id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <div className="welcome-page">

      {/* Navbar */}
      <div className="welcome-nav">
        <div className="logo">LMS</div>

        <div className="nav-links">
          <span
            className={active === 'home' ? 'active' : ''}
            onClick={() => scrollTo('home')}
          >
            Home
          </span>

          <span
            className={active === 'features' ? 'active' : ''}
            onClick={() => scrollTo('features')}
          >
            Features
          </span>

          <span
            className={active === 'about' ? 'active' : ''}
            onClick={() => scrollTo('about')}
          >
            About
          </span>

          <span
            className={active === 'announcements' ? 'active' : ''}
            onClick={() => scrollTo('announcements')}
          >
            News
          </span>
        </div>

        <button
          className="login-btn"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      </div>

      {/* HERO */}
      <section className="hero" id="home">

        <div className="hero-text">
          <h1>
            Enhance Your Skills <br />
            With <span>Our LMS</span>
          </h1>

          <p className="hero-description">
            Access courses, track progress, manage schedules,
            and communicate with instructors.
          </p>

          <p className="auth-note">
            Accounts are provided by your institution. Please log in using your assigned credentials.
          </p>

          <button
            className="btn-primary"
            onClick={() => navigate('/login')}
          >
            Log In
          </button>
        </div>

        <div className="hero-image">
          <img src={notes} alt="LMS preview" />
        </div>

      </section>

      {/* FEATURES */}
      <section className="info-section" id="features">
        <h2>Platform Features</h2>
        <img src={globe} className="decor-globe" alt="globe" />
        <img src={education} className="decor-edu" alt="education" />
        <p className="section-subtitle">
          Everything you need to manage your academic experience in one place.
        </p>

        <div className="info-grid">

          <div className="info-card">
            <h3>Course Management</h3>
            <p>
              Access lecture materials, assignments, and resources for all your enrolled courses.
              Stay organized with structured content and clear navigation.
            </p>
          </div>

          <div className="info-card">
            <h3>Schedule & Timetable</h3>
            <p>
              View your weekly schedule, upcoming classes, and important deadlines.
              Never miss a lecture or exam again.
            </p>
          </div>

          <div className="info-card">
            <h3>Real-Time Messaging</h3>
            <p>
              Communicate directly with instructors and classmates through a built-in
              messaging system designed for academic collaboration.
            </p>
          </div>

          <div className="info-card">
            <h3>Progress & Grades</h3>
            <p>
              Track your academic performance, view grades, and monitor your progress
              across all courses in real time.
            </p>
          </div>

          <div className="info-card">
            <h3>Announcements</h3>
            <p>
              Stay updated with course announcements, university notices, and important
              academic updates in one centralized feed.
            </p>
          </div>

          <div className="info-card">
            <h3>Role-Based Access</h3>
            <p>
              Separate experiences for students and staff, ensuring the right tools
              and information are available to each user.
            </p>
          </div>

        </div>
      </section>

      {/* ABOUT */}
      <section className="about-section" id="about">
        <h2>About the LMS</h2>

        <p className="about-text">
          The Learning Management System (LMS) is a centralized digital platform designed
          to support academic activities for both students and staff. It simplifies the
          management of courses, communication, and academic progress in a unified environment.
        </p>

        <div className="about-grid">

          <div className="about-item">
            <h4>For Students</h4>
            <p>
              Access course materials, track grades, view schedules, and stay connected
              with instructors and classmates.
            </p>
          </div>

          <div className="about-item">
            <h4>For Staff</h4>
            <p>
              Manage courses, post announcements, monitor student progress, and
              communicate efficiently with learners.
            </p>
          </div>

          <div className="about-item">
            <h4>Secure & Reliable</h4>
            <p>
              The system ensures secure authentication and reliable access to all
              academic resources provided by your institution.
            </p>
          </div>

        </div>
      </section>

      {/* ANNOUNCEMENTS */}
      {announcements.length > 0 && (
        <section className="welcome-ann-section" id="announcements">
          <h2>Latest News</h2>
          <p className="section-subtitle">Recent updates from Ain Shams University Faculty of Engineering</p>
          <div className="welcome-ann-grid">
            {announcements.map((ann, i) => (
              <div key={ann.id || i} className="welcome-ann-card">
                <div className="welcome-ann-meta">
                  {ann.date && <span className="welcome-ann-date">{ann.date}</span>}
                </div>
                <h3>{ann.title}</h3>
                {ann.content && <p>{ann.content}</p>}
                {ann.sourceUrl && (
                  <a href={ann.sourceUrl} target="_blank" rel="noreferrer" className="welcome-ann-link">
                    Read more →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2026 LMS System — All rights reserved</p>
      </footer>

    </div>
  );
}