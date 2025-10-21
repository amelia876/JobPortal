import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import "./EmployerDashboard.css";
import { useNavigate } from "react-router-dom";

const EmployerDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalCandidates: 0,
    todaysInterviews: 8,
    responseRate: 85
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser(userDoc.data());
        } else {
          console.log("No such user document!");
        }
      }
    };

    const fetchJobData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate('/login');
          return;
        }

        // Fetch jobs for this employer
        const jobsQuery = query(
          collection(db, 'jobs'),
          where('employerId', '==', currentUser.uid)
        );

        const querySnapshot = await getDocs(jobsQuery);
        const jobsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calculate stats
        const activeJobs = jobsData.filter(job => job.status === 'active').length;
        const totalCandidates = jobsData.reduce((total, job) => total + (job.applicants || 0), 0);

        setStats({
          activeJobs,
          totalCandidates,
          todaysInterviews: 8, // Placeholder
          responseRate: 85 // Placeholder
        });

      } catch (error) {
        console.error('Error fetching job data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchJobData();
  }, [navigate]);

  const handleStatClick = (statType) => {
    if (statType === 'activeJobs' || statType === 'totalCandidates') {
      navigate("/employer/jobs");
    }
  };

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
          <h1>Welcome, {user?.firstName || "Employer"}</h1>
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
            <div className="user-info">
              <span>{user?.role || "Employer"}</span>
            </div>
          </div>
        </header>

        {/* Top Buttons */}
        <div className="action-buttons">
          <button onClick={() => navigate("/postjob")}>Create Job</button>
          <button onClick={() => navigate("/employer/jobs")}>View Postings</button>
          <button onClick={() => navigate("/schedule-interview")}>Schedule Interview</button>
          <button>View Reports</button>
        </div>

        {/* Stats */}
        <div className="stats-cards">
          <div 
            className={`card ${loading ? 'loading' : 'clickable'}`}
            onClick={() => !loading && handleStatClick('activeJobs')}
          >
            <h3>Active Jobs</h3>
            <p>{loading ? '...' : stats.activeJobs}</p>
            {!loading && <span className="stat-hint">Click to manage</span>}
          </div>
          <div 
            className={`card ${loading ? 'loading' : 'clickable'}`}
            onClick={() => !loading && handleStatClick('totalCandidates')}
          >
            <h3>Total Candidates</h3>
            <p>{loading ? '...' : stats.totalCandidates}</p>
            {!loading && <span className="stat-hint">Click to view</span>}
          </div>
          <div className="card">
            <h3>Today's Interviews</h3>
            <p>{stats.todaysInterviews}</p>
          </div>
          <div className="card">
            <h3>Response Rate</h3>
            <p>{stats.responseRate}%</p>
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