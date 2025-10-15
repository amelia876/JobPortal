import React from "react";
import "./EmployerDashboard.css";

const EmployerDashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">JobPortal</div>
        <ul className="menu">
          <li className="active">Dashboard</li>
          <li>Postings</li>
          <li>Candidates</li>
          <li>Interviews</li>
          <li>Analytics</li>
          <li>Settings</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <h1>Employer Dashboard</h1>
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
            <div className="user-info">
              <span>Admin</span>
            </div>
          </div>
        </header>

        {/* Top Buttons */}
        <div className="action-buttons">
          <button className="primary-btn">+ Post a Job</button>
          <button>View Postings</button>
          <button>Schedule Interviews</button>
          <button>View Reports</button>
        </div>

        {/* Stats */}
        <div className="stats-cards">
          <div className="card">
            <h3>Active Jobs</h3>
            <p>12</p>
          </div>
          <div className="card">
            <h3>Total Candidates</h3>
            <p>156</p>
          </div>
          <div className="card">
            <h3>Today's Interviews</h3>
            <p>8</p>
          </div>
          <div className="card">
            <h3>Response Rate</h3>
            <p>85%</p>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-section">
          <div className="chart">
            <h3>Application Trends</h3>
            <div className="chart-placeholder">📈 Chart</div>
          </div>
          <div className="chart">
            <h3>Candidate Internet Speed</h3>
            <div className="chart-placeholder">📊 Chart</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <ul>
            <li>✅ New candidate applied for Senior Developer position (2 hrs ago)</li>
            <li>🕒 Interview scheduled with John for Product Manager role (3 hrs ago)</li>
            <li>✉️ New message from HR regarding Designer position (5 hrs ago)</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default EmployerDashboard;
