import React from "react";
import JobSeekerNavbar from "../components/JobSeekerNavbar";
import "./JobSeekerDashboard.css";

const JobSeekerDashboard = () => {
  return (
    <div className="dashboard-container">
      {/*<JobSeekerNavbar />*/}

      <div className="dashboard-main">
        <h2 className="dashboard-welcome">Welcome back, Alex</h2>
        <p className="dashboard-date">Tuesday, February 20, 2024</p>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Active Applications</h3>
            <p className="stat-number">12</p>
            <span className="stat-change">+3 this week</span>
          </div>
          <div className="stat-card">
            <h3>Job Matches</h3>
            <p className="stat-number">28</p>
            <span className="stat-change green">+5 new today</span>
          </div>
          <div className="stat-card">
            <h3>Upcoming Sessions</h3>
            <p className="stat-number">2</p>
            <span className="stat-change">Next: Tomorrow 2PM</span>
          </div>
          <div className="stat-card">
            <h3>Profile Strength</h3>
            <p className="stat-number">85%</p>
            <span className="stat-change">Almost complete</span>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="left-section">
            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <ul>
                <li>
                  <div>
                    <strong>Senior Product Designer</strong>
                    <p>TechCorp</p>
                  </div>
                  <span className="status interview">Interview</span>
                </li>
                <li>
                  <div>
                    <strong>UX Research Lead</strong>
                    <p>InnovateLabs</p>
                  </div>
                  <span className="status review">In Review</span>
                </li>
                <li>
                  <div>
                    <strong>Visual Designer</strong>
                    <p>DesignStudio</p>
                  </div>
                  <span className="status applied">Applied</span>
                </li>
              </ul>
            </div>

            <div className="career-progress">
              <h3>Career Progress</h3>
              <div className="progress-bar">
                <label>UI/UX Design</label>
                <div className="bar">
                  <div className="fill" style={{ width: "90%" }}></div>
                </div>
              </div>
              <div className="progress-bar">
                <label>Product Strategy</label>
                <div className="bar">
                  <div className="fill" style={{ width: "70%" }}></div>
                </div>
              </div>
              <div className="progress-bar">
                <label>Design Systems</label>
                <div className="bar">
                  <div className="fill" style={{ width: "50%" }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="right-section">
            <div className="upcoming-events">
              <h3>Upcoming Events</h3>
              <ul>
                <li>
                  <strong>Career Coaching Session</strong>
                  <p>Feb 21, 2024 at 2:00 PM</p>
                </li>
                <li>
                  <strong>Portfolio Review</strong>
                  <p>Feb 23, 2024 at 11:00 AM</p>
                </li>
                <li>
                  <strong>Interview Preparation</strong>
                  <p>Feb 25, 2024 at 3:30 PM</p>
                </li>
              </ul>
            </div>

            <div className="notifications">
              <h3>Notifications</h3>
              <ul>
                <li>
                  <strong>New job match found</strong>
                  <p>Senior UX Designer position at TechCorp</p>
                </li>
                <li>
                  <strong>Application viewed</strong>
                  <p>Your Product Designer application was viewed</p>
                </li>
                <li>
                  <strong>Profile milestone</strong>
                  <p>Your profile strength increased to 85%</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
