import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (


    
    <div className="about-us-container">
     
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">JobLytics</div>

        <ul className="nav-links">
          <li><a href="/Home">Home</a></li>
          <li><a href="/Login">Jobs</a></li>
          <li><a href="/AboutUs">About</a></li>
          <li><a href="/Contact">Contact</a></li>
        </ul>

        <div className="nav-actions">
          <a href="/login" className="login-btn">Login</a>
          <a href="/home" className="signup-btn">Back</a>
        </div>
      </nav>



      <div className="about-us-hero">
        <div className="hero-content">
          <h1 className="hero-title">About Joblytics</h1>
          <p className="hero-subtitle">
            Transforming Job Search with Data-Driven Insights
          </p>
        </div>
      </div>

      <div className="about-us-content">
        <section className="mission-section">
          <div className="container">
            <h2>Our Mission</h2>
            <p>
              At Joblytics, we believe that finding the right job should be 
              informed by data, not just intuition. Our platform leverages 
              advanced analytics and machine learning to provide job seekers 
              with actionable insights, market trends, and personalized 
              recommendations to accelerate their career growth.
            </p>
          </div>
        </section>

        <section className="features-section">
          <div className="container">
            <h2>What Makes Joblytics Unique</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Real-time Market Analytics</h3>
                <p>
                  Get up-to-date insights on salary trends, in-demand skills, 
                  and company hiring patterns in your industry.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Personalized Job Matching</h3>
                <p>
                  Our AI-powered algorithm matches you with opportunities that 
                  align with your skills, experience, and career aspirations.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📈</div>
                <h3>Career Growth Tracking</h3>
                <p>
                  Monitor your job search progress, track application success rates, 
                  and identify areas for improvement.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="team-section">
          <div className="container">
            <h2>Our Story</h2>
            <p>
              Founded in 2023, Joblytics was born from the frustration of 
              traditional job search methods. Our team of data scientists, 
              software engineers, and HR professionals came together to create 
              a solution that empowers job seekers with the same analytical 
              tools that companies use to find talent.
            </p>
            <p>
              Today, we serve thousands of users across various industries, 
              helping them make informed career decisions and find meaningful 
              employment faster and more efficiently.
            </p>
          </div>
        </section>

        <section className="values-section">
          <div className="container">
            <h2>Our Values</h2>
            <div className="values-grid">
              <div className="value-item">
                <h3>Transparency</h3>
                <p>We believe in open data and honest insights</p>
              </div>
              <div className="value-item">
                <h3>Innovation</h3>
                <p>Constantly evolving with cutting-edge technology</p>
              </div>
              <div className="value-item">
                <h3>Empowerment</h3>
                <p>Giving job seekers the tools to take control of their careers</p>
              </div>
              <div className="value-item">
                <h3>Privacy</h3>
                <p>Your data is secure and always under your control</p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container">
            <h2>Ready to Transform Your Job Search?</h2>
            <p>
              Join thousands of professionals who are already using Joblytics 
              to find their dream jobs.
            </p>
            <button className="cta-button">Get Started Today</button>
          </div>
        </section>
      </div>
      
    </div>






  );
};

export default AboutUs;