import React from "react";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <h1>Find the perfect job for you</h1>
          <p>Search your career opportunity through 12,800 jobs</p>

          <div className="search-bar">
            <input type="text" placeholder="Job Title or Keyword" />
            <select>
              <option>All Locations</option>
              <option>New York</option>
              <option>Los Angeles</option>
              <option>San Francisco</option>
            </select>
            <button className="search-btn">🔍</button>
          </div>

          <div className="popular-searches">
            <span>Popular Searches:</span>
            <div>
              <button>Designer</button>
              <button>Writer</button>
              <button>Team leader</button>
              <button>Web developer</button>
              <button>Tech</button>
            </div>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://via.placeholder.com/400x500"
            alt="Business woman"
          />
          <div className="job-stats">
            <p><strong>319</strong> job offers in Business Development</p>
            <p><strong>265</strong> job offers in Marketing & Communication</p>
            <p><strong>324</strong> job offers in Project Management</p>
          </div>
        </div>
      </section>

      {/* CATEGORY SECTION */}
      <section className="categories">
        <h2>Search by Category</h2>
        <div className="category-grid">
          <div className="category-card">Business Development</div>
          <div className="category-card">Construction</div>
          <div className="category-card">Customer Service</div>
          <div className="category-card">Finance</div>
          <div className="category-card">Healthcare</div>
          <div className="category-card">Human Resources</div>
        </div>
      </section>

      {/* FEATURED JOBS SECTION */}
      <section className="featured-jobs">
        <h2>Featured Job Offers</h2>
        <div className="job-grid">
          <div className="job-card">
            <h3>Financial Analyst</h3>
            <p>Finance • San Diego, CA • Full Time</p>
          </div>
          <div className="job-card">
            <h3>Fullstack Web Developer</h3>
            <p>Software Engineering • San Francisco, CA • Internship</p>
          </div>
          <div className="job-card">
            <h3>Human Resources Coordinator</h3>
            <p>Human Resources • San Diego, CA • Full Time</p>
          </div>
          <div className="job-card">
            <h3>Technical Writer</h3>
            <p>Business Development • Los Angeles, CA • Remote</p>
          </div>
          <div className="job-card">
            <h3>Senior Editor</h3>
            <p>Marketing • San Francisco, CA • Full Time</p>
          </div>
        </div>

        <button className="view-all-btn">All Job Offers →</button>
      </section>

      {/* DEFAULT SECTION */}
      <div className="default-section">
        <h1>Welcome to JobPortal 👋</h1>
        <p>
          <a href="/signup">Signup</a> | <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Home;
