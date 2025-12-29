// AdminDashboard.jsx
import React from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1 className="app-title">MEDILINE</h1>
      </header>

      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <h2 className="sidebar-title">Hospital</h2>
            <ul className="sidebar-menu">
              <li className="menu-item">Doublecard</li>
              <li className="menu-item active">Appointment</li>
              <li className="menu-item">Doctors</li>
              <li className="menu-item">Patients</li>
              <li className="menu-item">Room Abbreviants</li>
              <li className="menu-item">Payments</li>
              <li className="menu-item">Expenses Report</li>
              <li className="menu-item">Depositories</li>
              <li className="menu-item">Insurance Company</li>
              <li className="menu-item">Events</li>
              <li className="menu-item">Chart</li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Doctor Availability Section */}
          <div className="availability-section">
            <h3>Today Available From: Forts Hospital</h3>
            <div className="doctor-card">
              <div className="doctor-info">
                <h4>Dr. Dary Lees</h4>
                <p className="doctor-specialty">Orthopedist</p>
              </div>
              <div className="availability-time">
                <span>10:00AM - 03:00PM</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            {/* Appointments Card */}
            <div className="stats-card">
              <div className="stats-header">
                <h3>40 Appointments</h3>
                <span className="stats-trend">Weekly 32 Appointments</span>
              </div>
              <div className="stats-subtext">
                <span className="doctors-count">15 Doctors</span>
                <span className="availability-tag">Today Available</span>
              </div>
            </div>

            {/* Admissions Card */}
            <div className="stats-card">
              <div className="stats-header">
                <h3>21 New Admix</h3>
                <span className="stats-trend">Weekly 8 Admix</span>
              </div>
              <div className="stats-subtext">
                <span className="nurses-count">36 Nurses</span>
                <span className="availability-tag">Today Available</span>
              </div>
            </div>

            {/* Operations Card */}
            <div className="stats-card">
              <div className="stats-header">
                <h3>14 Operations</h3>
                <span className="stats-trend">Weekly 9 Operations</span>
              </div>
              <div className="stats-subtext">
                <span className="earnings">$52,140 Earnings</span>
                <span className="earnings-trend">Weekly $43.5%</span>
              </div>
            </div>

            {/* Survey Chart Placeholder */}
            <div className="stats-card chart-card">
              <div className="stats-header">
                <h3>Hospital Survey</h3>
              </div>
              <div className="chart-container">
                {/* Chart visualization would go here */}
                <div className="chart-placeholder">
                  <div className="chart-grid">
                    <div className="grid-line"></div>
                    <div className="grid-line"></div>
                    <div className="grid-line"></div>
                    <div className="grid-line"></div>
                    <div className="grid-line"></div>
                  </div>
                  <div className="chart-bars">
                    <div className="bar" style={{ height: '60%' }}></div>
                    <div className="bar" style={{ height: '40%' }}></div>
                    <div className="bar" style={{ height: '80%' }}></div>
                    <div className="bar" style={{ height: '30%' }}></div>
                    <div className="bar" style={{ height: '70%' }}></div>
                  </div>
                </div>
                <div className="chart-labels">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;