import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp, getCountFromServer } from "firebase/firestore";
import "./Applications.css";
import { useNavigate } from "react-router-dom";
import { FiBell, FiMail, FiUser, FiLogOut, FiSearch, FiFilter } from "react-icons/fi";

const Applications = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    unreadMessages: 0,
    upcomingInterviews: 0
  });
  const [showMessagingPanel, setShowMessagingPanel] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeSidebarTab, setActiveSidebarTab] = useState("applications");
  const [totalApplicationsCount, setTotalApplicationsCount] = useState(0);
  const [applicationStats, setApplicationStats] = useState({
    submitted: 0,
    under_review: 0,
    interview: 0,
    shortlisted: 0,
    rejected: 0,
    offer: 0,
    withdrawn: 0
  });

  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

  const statusCounts = {
    all: applications.length,
    submitted: applications.filter(app => app.status === 'submitted').length,
    under_review: applications.filter(app => app.status === 'under_review').length,
    interview: applications.filter(app => app.status === 'interview').length,
    shortlisted: applications.filter(app => app.status === 'shortlisted').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
    offer: applications.filter(app => app.status === 'offer').length,
    withdrawn: applications.filter(app => app.status === 'withdrawn').length
  };

  const getStatusText = (status) => {
    const statusMap = {
      submitted: 'Submitted',
      under_review: 'Under Review',
      interview: 'Interview',
      shortlisted: 'Shortlisted',
      rejected: 'Rejected',
      offer: 'Offer',
      withdrawn: 'Withdrawn'
    };
    return statusMap[status] || status;
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge ${status}`;
  };

  // Function to fetch total number of applications
  const fetchTotalApplicationsCount = async () => {
    if (!user?.uid) return;

    try {
      const q = query(
        collection(db, "applications"),
        where("applicantId", "==", user.uid)
      );

      const snapshot = await getCountFromServer(q);
      setTotalApplicationsCount(snapshot.data().count);
    } catch (error) {
      console.error("Error fetching total applications count:", error);
    }
  };

  // Function to fetch application statistics by status
  const fetchApplicationStats = async () => {
    if (!user?.uid) return;

    try {
      const statuses = ['submitted', 'under_review', 'interview', 'shortlisted', 'rejected', 'offer', 'withdrawn'];
      const stats = {};

      for (const status of statuses) {
        const q = query(
          collection(db, "applications"),
          where("applicantId", "==", user.uid),
          where("status", "==", status)
        );

        const snapshot = await getCountFromServer(q);
        stats[status] = snapshot.data().count;
      }

      setApplicationStats(stats);
    } catch (error) {
      console.error("Error fetching application stats:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDashboard = () => navigate("/jobseeker");
  const handleJobSearch = () => navigate("/job-search");
  const handleProfile = () => navigate("/jobseeker/profile");
  const handleInterviews = () => navigate("/schedule-interview");
  const handleSavedJobs = () => navigate("/job-seeker/saved-jobs");
  const handleInternetTest = () => navigate("/internet-speed-test");
  const handlePayments = () => navigate("/payment-gateway");
  const handleSettings = () => navigate("/settings");

  // Handle sidebar navigation
  const handleSidebarClick = (menuItem) => {
    setActiveSidebarTab(menuItem);
    switch (menuItem) {
      case "dashboard":
        navigate("/jobseeker");
        break;
      case "jobs":
        navigate("/job-search");
        break;
      case "applications":
        navigate("/job-seeker/applications");
        break;
      case "interviews":
        navigate("/schedule-interview");
        break;
      case "savedJobs":
        navigate("/job-seeker/saved-jobs");
        break;
      case "profile":
        navigate("/jobseeker/profile");
        break;
      case "messaging":
        setShowMessagingPanel(true);
        break;
      case "internet-test":
        navigate("/internet-speed-test");
        break;
      case "payment-gateway":
        navigate("/payment-gateway");
        break;
      case "settings":
        navigate("/settings");
        break;
      default:
        break;
    }
  };

  // Enhanced fetchApplications function with better job data fetching
  const fetchApplications = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, "applications"),
        where("applicantId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const applicationsData = [];

      for (const docSnap of querySnapshot.docs) {
        const appData = docSnap.data();

        // Fetch job details - try multiple possible field names
        const jobId = appData.jobId || appData.jobID;
        const jobDetails = await fetchJobDetails(jobId);

        // Format the date
        let appliedDate;
        if (appData.appliedAt?.toDate) {
          appliedDate = appData.appliedAt.toDate();
        } else if (appData.appliedAt) {
          appliedDate = new Date(appData.appliedAt);
        } else if (appData.createdAt?.toDate) {
          appliedDate = appData.createdAt.toDate();
        } else if (appData.createdAt) {
          appliedDate = new Date(appData.createdAt);
        } else {
          appliedDate = new Date();
        }

        const formattedDate = appliedDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        const formattedTime = appliedDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });

        applicationsData.push({
          id: docSnap.id,
          ...appData,
          jobDetails,
          jobId: jobId, // Ensure jobId is included
          formattedDate,
          formattedTime,
          appliedDate: appliedDate
        });
      }

      setApplications(applicationsData);

      // Fetch total count and stats after loading applications
      await fetchTotalApplicationsCount();
      await fetchApplicationStats();

    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced fetchJobDetails function
  const fetchJobDetails = async (jobId) => {
    if (!jobId) {
      console.log("No jobId provided");
      return null;
    }

    try {
      const jobDoc = await getDoc(doc(db, "jobs", jobId));
      if (jobDoc.exists()) {
        const jobData = jobDoc.data();

        // Try to fetch company details if companyId exists
        if (jobData.companyId) {
          try {
            const companyDoc = await getDoc(doc(db, "companies", jobData.companyId));
            if (companyDoc.exists()) {
              jobData.companyDetails = companyDoc.data();
            }
          } catch (companyError) {
            console.error("Error fetching company details:", companyError);
          }
        }

        // If no company details from companyId, check if company info is in job data
        if (!jobData.companyDetails) {
          jobData.companyDetails = {
            name: jobData.company || "Unknown Company",
            location: jobData.location || "Location not specified"
          };
        }

        return jobData;
      }

      // If job not found in jobs collection, check if it's in another collection
      console.log(`Job ${jobId} not found in jobs collection`);
      return {
        title: appData?.jobTitle || "Position Details Unavailable",
        companyDetails: {
          name: appData?.company || "Company",
          location: appData?.jobLocation || "Location not specified"
        },
        location: appData?.jobLocation || "Location not specified",
        jobType: appData?.jobType || "Not specified",
        salary: appData?.salary || null,
        experienceLevel: "Not specified",
        skills: []
      };
    } catch (error) {
      console.error("Error fetching job details:", error);
      return {
        title: "Position Details Unavailable",
        companyDetails: {
          name: "Company Information Unavailable",
          location: "Location not specified"
        },
        location: "Location not specified",
        jobType: "Not specified",
        salary: null,
        experienceLevel: "Not specified",
        skills: []
      };
    }
  };

  const handleWithdraw = async (applicationId) => {
    if (!confirm("Are you sure you want to withdraw this application?")) return;

    try {
      await updateDoc(doc(db, "applications", applicationId), {
        status: 'withdrawn',
        updatedAt: serverTimestamp()
      });

      fetchApplications();
      alert("Application withdrawn successfully!");
    } catch (error) {
      console.error("Error withdrawing application:", error);
      alert("Failed to withdraw application. Please try again.");
    }
  };

  const handleViewJob = (jobId) => {
    if (jobId) {
      navigate(`/job-search`, {
        state: {
          selectedJobId: jobId,
          viewJobDetails: true
        }
      });
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchApplications();
    }
  }, [user]);

  // Real-time conversations listener
  useEffect(() => {
    if (!user) return;

    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = async () => {
      try {
        const snapshot = await getDocs(conversationsQuery);
        const conversationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setConversations(conversationsData);

        // Update unread messages count
        const unreadCount = conversationsData.reduce((total, conv) => {
          return total + (conv.unreadCount?.[user.uid] || 0);
        }, 0);

        setStats(prev => ({
          ...prev,
          unreadMessages: unreadCount
        }));
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    unsubscribe();
  }, [user]);

  // Notification Dropdown Component
  const NotificationDropdown = () => {
    const unreadCount = notifications.filter(n => !n.read).length;

    const toggleDropdown = () => {
      setNotificationOpen(!notificationOpen);
    };

    const handleClickOutside = (e) => {
      if (!e.target.closest('.notification-container')) {
        setNotificationOpen(false);
      }
    };

    useEffect(() => {
      if (notificationOpen) {
        document.addEventListener('click', handleClickOutside);
      }
      return () => document.removeEventListener('click', handleClickOutside);
    }, [notificationOpen]);

    const handleNotificationClick = (notification) => {
      if (notification.type === 'interview') {
        navigate('/schedule-interview');
      }
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      setNotificationOpen(false);
    };

    const markAllAsRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
      <div className="notification-container">
        <button
          className="notification-bell"
          onClick={toggleDropdown}
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <span className="notification-icon">🔔</span>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>

        <div className={`notification-dropdown ${notificationOpen ? 'open' : ''}`}>
          <div className="notification-header">
            <h3>Notifications</h3>
            <button
              className="mark-all-read"
              onClick={markAllAsRead}
            >
              Mark all read
            </button>
          </div>

          <div className="notification-list">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${notification.read ? '' : 'unread'}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">{notification.time}</div>
                </div>
                {!notification.read && <div className="unread-dot"></div>}
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="notification-item">
                <div className="notification-content">
                  <div className="notification-title">No notifications</div>
                  <div className="notification-message">You're all caught up!</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab !== 'all' && app.status !== activeTab) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const jobTitle = app.jobDetails?.title?.toLowerCase() || '';
      const companyName = app.jobDetails?.companyDetails?.name?.toLowerCase() || '';
      const location = app.jobDetails?.location?.toLowerCase() || '';

      return jobTitle.includes(term) ||
        companyName.includes(term) ||
        location.includes(term);
    }

    return true;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const dateA = a.appliedDate || new Date(0);
    const dateB = b.appliedDate || new Date(0);

    switch (sortBy) {
      case 'newest':
        return dateB - dateA;
      case 'oldest':
        return dateA - dateB;
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return dateB - dateA;
    }
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="jobseeker-dashboard-container">
      {/* Top Navigation Bar - Matching JobSeekerDashboard */}
      <nav className="jobseeker-top-navbar">
        <div className="jobseeker-nav-brand">
          <div className="jobseeker-brand-logo" onClick={() => navigate("/jobseeker")}>JobLytics</div>
          <span className="jobseeker-user-welcome">Applications</span>
        </div>

        <div className="jobseeker-nav-center">
          <ul className="jobseeker-nav-links">
            <li><div onClick={() => navigate("/jobseeker")}>Dashboard</div></li>
            <li><div onClick={() => navigate("/job-search")}>Jobs</div></li>
            <li><div onClick={() => navigate("/job-seeker/applications")} className="active">Applications</div></li>
            <li><div onClick={() => navigate("/schedule-interview")}>Interviews</div></li>
            <li><div onClick={() => setShowMessagingPanel(true)}>Messages</div></li>
            <li><div onClick={() => navigate("/internet-speed-test")}>Internet Test</div></li>
            <li><div onClick={() => navigate("/payment-gateway")}>Payments</div></li>
          </ul>
        </div>

        <div className="jobseeker-nav-actions">
          <NotificationDropdown />

          {/* Messaging Icon */}
          <div className="jobseeker-icon-button-container">
            <button
              className="jobseeker-icon-button jobseeker-messaging-icon-btn"
              onClick={() => setShowMessagingPanel(true)}
              aria-label="Messages"
              title="Messages"
            >
              <span className="jobseeker-icon-button-icon">💬</span>
              {stats.unreadMessages > 0 && (
                <span className="jobseeker-message-badge">{stats.unreadMessages}</span>
              )}
            </button>
          </div>

          {/* Profile Icon */}
          <div className="jobseeker-icon-button-container">
            <button
              className="jobseeker-icon-button jobseeker-profile-icon-btn"
              onClick={() => navigate("/jobseeker/profile")}
              aria-label="Profile"
              title="Profile"
            >
              <span className="jobseeker-icon-button-icon">👤</span>
            </button>
          </div>

          {/* Logout Icon */}
          <div className="jobseeker-icon-button-container">
            <button
              className="jobseeker-icon-button jobseeker-logout-icon-btn"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
            >
              <span className="jobseeker-icon-button-icon">🚪</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Add the layout wrapper for sidebar and main content */}
      <div className="jobseeker-dashboard-layout">
        {/* Sidebar */}
        <aside className="jobseeker-sidebar">
          <div className="jobseeker-logo" onClick={() => navigate("/jobseeker")}>🚀 Job Seeker</div>
          <ul className="jobseeker-menu">
            <li
              className={activeSidebarTab === "dashboard" ? "active" : ""}
              onClick={() => handleSidebarClick("dashboard")}
            >
              <span className="jobseeker-menu-icon">📊</span>
              <span className="jobseeker-menu-text">Dashboard</span>
            </li>
            <li
              className={activeSidebarTab === "jobs" ? "active" : ""}
              onClick={() => handleSidebarClick("jobs")}
            >
              <span className="jobseeker-menu-icon">🔍</span>
              <span className="jobseeker-menu-text">Find Jobs</span>
            </li>
            <li
              className={activeSidebarTab === "applications" ? "active" : ""}
              onClick={() => handleSidebarClick("applications")}
            >
              <span className="jobseeker-menu-icon">📄</span>
              <span className="jobseeker-menu-text">Applications</span>
              <span className="jobseeker-menu-badge">{totalApplicationsCount}</span>
            </li>
            <li
              className={activeSidebarTab === "interviews" ? "active" : ""}
              onClick={() => handleSidebarClick("interviews")}
            >
              <span className="jobseeker-menu-icon">🎯</span>
              <span className="jobseeker-menu-text">Interviews</span>
            </li>
            <li
              className={activeSidebarTab === "savedJobs" ? "active" : ""}
              onClick={() => handleSidebarClick("savedJobs")}
            >
              <span className="jobseeker-menu-icon">⭐</span>
              <span className="jobseeker-menu-text">Saved Jobs</span>
            </li>
            <li
              className={activeSidebarTab === "profile" ? "active" : ""}
              onClick={() => handleSidebarClick("profile")}
            >
              <span className="jobseeker-menu-icon">👤</span>
              <span className="jobseeker-menu-text">Profile</span>
            </li>
            <li
              className={activeSidebarTab === "messaging" ? "active" : ""}
              onClick={() => handleSidebarClick("messaging")}
            >
              <span className="jobseeker-menu-icon">💬</span>
              <span className="jobseeker-menu-text">Messages</span>
              {stats.unreadMessages > 0 && (
                <span className="jobseeker-menu-badge jobseeker-badge-red">{stats.unreadMessages}</span>
              )}
            </li>
            <li
              className={activeSidebarTab === "internet-test" ? "active" : ""}
              onClick={() => handleSidebarClick("internet-test")}
            >
              <span className="jobseeker-menu-icon">🌐</span>
              <span className="jobseeker-menu-text">Internet Test</span>
            </li>
            <li
              className={activeSidebarTab === "payment-gateway" ? "active" : ""}
              onClick={() => handleSidebarClick("payment-gateway")}
            >
              <span className="jobseeker-menu-icon">💳</span>
              <span className="jobseeker-menu-text">Payments</span>
            </li>
            <li
              className={activeSidebarTab === "settings" ? "active" : ""}
              onClick={() => handleSidebarClick("settings")}
            >
              <span className="jobseeker-menu-icon">⚙️</span>
              <span className="jobseeker-menu-text">Settings</span>
            </li>
          </ul>
        </aside>

        {/* Main Content - Applications */}
        <main className="jobseeker-main-content applications-main-wrapper">
          <div className="applications-header-container">
            <h1 className="applications-main-title">My Applications</h1>
            <p className="applications-subtitle">
              Track all your job applications in one place
            </p>
            <div className="total-applications-count">
              Total Applications: <strong>{totalApplicationsCount}</strong>
            </div>
          </div>

          {/* Stats Cards - Centered */}
          <div className="applications-stats-centered">
            <div className="stat-card-centered">
              <div className="stat-number-centered">{totalApplicationsCount}</div>
              <div className="stat-label-centered">All</div>
            </div>
            <div className="stat-card-centered">
              <div className="stat-number-centered">{applicationStats.submitted}</div>
              <div className="stat-label-centered">Submitted</div>
            </div>
            <div className="stat-card-centered">
              <div className="stat-number-centered">{applicationStats.under_review}</div>
              <div className="stat-label-centered">Under Review</div>
            </div>
            <div className="stat-card-centered">
              <div className="stat-number-centered">{applicationStats.interview}</div>
              <div className="stat-label-centered">Interview</div>
            </div>
            <div className="stat-card-centered">
              <div className="stat-number-centered">{applicationStats.shortlisted}</div>
              <div className="stat-label-centered">Shortlisted</div>
            </div>
            <div className="stat-card-centered">
              <div className="stat-number-centered">{applicationStats.rejected}</div>
              <div className="stat-label-centered">Rejected</div>
            </div>
            <div className="stat-card-centered">
              <div className="stat-number-centered">{applicationStats.offer}</div>
              <div className="stat-label-centered">Offer</div>
            </div>
            <div className="stat-card-centered">
              <div className="stat-number-centered">{applicationStats.withdrawn}</div>
              <div className="stat-label-centered">Withdrawn</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="applications-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by job title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
            <div className="filter-controls">
              <div className="sort-dropdown">
                <label>Sort by:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="status-tabs">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                className={`status-tab ${activeTab === status ? 'active' : ''}`}
                onClick={() => setActiveTab(status)}
              >
                <span className="tab-text">
                  {status === 'all' ? 'All' : getStatusText(status)}
                </span>
                <span className="tab-count">{count}</span>
              </button>
            ))}
          </div>

          {/* Applications List */}
          <div className="applications-list-container">
            {sortedApplications.length === 0 ? (
              <div className="applications-empty-state-centered">
                <div className="empty-icon-centered">📄</div>
                <h3 className="empty-title-centered">No applications found</h3>
                <p className="empty-message-centered">
                  {searchTerm || activeTab !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'You haven\'t applied to any jobs yet. Start your job search today!'}
                </p>
                {!searchTerm && activeTab === 'all' && (
                  <button
                    className="browse-jobs-btn-centered"
                    onClick={() => navigate('/job-search')}
                  >
                    Browse Jobs
                  </button>
                )}
              </div>
            ) : (
              sortedApplications.map((application) => (
                <div key={application.id} className="application-card">
                  <div className="application-header">
                    <div className="job-info">
                      <h3 className="job-title">
                        {application.jobDetails?.title || application.jobTitle || 'Untitled Position'}
                      </h3>
                      <p className="company-name">
                        {application.jobDetails?.companyDetails?.name || application.company || 'Unknown Company'}
                      </p>
                      <p className="job-location">
                        📍 {application.jobDetails?.location || application.jobLocation || 'Location not specified'}
                      </p>
                    </div>
                    <div className="application-meta">
                      <span className={getStatusBadgeClass(application.status)}>
                        {getStatusText(application.status)}
                      </span>
                      <div className="application-date">
                        <span className="date-label">Applied:</span>
                        <span className="date-value">{application.formattedDate}</span>
                        <span className="time-value">at {application.formattedTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="application-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="detail-label">Job Type:</span>
                        <span className="detail-value">
                          {application.jobDetails?.jobType || application.jobType || 'Not specified'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Salary:</span>
                        <span className="detail-value">
                          {application.jobDetails?.salary
                            ? `$${Number(application.jobDetails.salary).toLocaleString()}/year`
                            : 'Not specified'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Experience:</span>
                        <span className="detail-value">
                          {application.jobDetails?.experienceLevel || 'Not specified'}
                        </span>
                      </div>
                    </div>
                    <div className="skills-section">
                      <span className="skills-label">Required Skills:</span>
                      <div className="skills-tags">
                        {application.jobDetails?.skills?.slice(0, 5).map((skill, index) => (
                          <span key={index} className="skill-tag">{skill}</span>
                        ))}
                        {application.jobDetails?.skills?.length > 5 && (
                          <span className="skill-tag more">+{application.jobDetails.skills.length - 5} more</span>
                        )}
                        {!application.jobDetails?.skills && (
                          <span className="no-skills">No skills specified</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="application-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleViewJob(application.jobId)}
                      disabled={!application.jobId}
                    >
                      View Job Details
                    </button>
                    <button
                      className="action-btn withdraw-btn"
                      onClick={() => handleWithdraw(application.id)}
                      disabled={application.status === 'rejected' || application.status === 'offer' || application.status === 'withdrawn'}
                    >
                      {application.status === 'withdrawn' ? 'Withdrawn' : 'Withdraw Application'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {sortedApplications.length > 0 && (
            <div className="pagination">
              <button className="page-btn disabled">Previous</button>
              <span className="page-info">Showing 1-{sortedApplications.length} of {totalApplicationsCount}</span>
              <button className="page-btn disabled">Next</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Applications;