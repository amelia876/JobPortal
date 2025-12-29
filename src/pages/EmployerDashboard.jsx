import React, { useState, useEffect, useCallback } from "react";
import { auth, db } from "../firebase/firebase";
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp,
  onSnapshot,
  orderBy,
  limit
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import {
  FiHome,
  FiBriefcase,
  FiUser,
  FiUsers,
  FiBell,
  FiMessageSquare,
  FiLogOut,
  FiSearch,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiArchive,
  FiFileText,
  FiDollarSign,
  FiMapPin,
  FiCalendar,
  FiChevronRight,
  FiPlus,
  FiFilter,
  FiTrendingUp,
  FiTarget,
  FiTool,
  FiStar,
  FiArrowRight,
  FiActivity,
  FiPercent,
  FiCalendar as FiCalendarIcon,
  FiZap,
  FiClipboard,
  FiBarChart2,
  FiSettings,
  FiCreditCard,
  FiMail,
  FiDownload,
  FiShare2
} from 'react-icons/fi';
import "./EmployerDashboard.css";

const EmployerDashboard = ({ user, setUser }) => {
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalCandidates: 0,
    todaysInterviews: 0,
    responseRate: 0,
    newApplications: 0,
    pendingReviews: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [conversations, setConversations] = useState([]);
  const [showMessagingPanel, setShowMessagingPanel] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [recentJobs, setRecentJobs] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [analytics, setAnalytics] = useState({
    weeklyApplications: 0,
    conversionRate: 0,
    avgResponseTime: 0
  });
  const navigate = useNavigate();

  // Fetch user data if not loaded
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate('/login');
          return;
        }

        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid: currentUser.uid,
            ...userData
          });
          localStorage.setItem("user", JSON.stringify({
            uid: currentUser.uid,
            ...userData
          }));
        } else {
          console.log("No such user document!");
          navigate('/login');
        }
      }
    };

    fetchUserData();
  }, [user, setUser, navigate]);

  // Helper function to get start and end of today
  const getTodayRange = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    return {
      start: Timestamp.fromDate(startOfDay),
      end: Timestamp.fromDate(endOfDay)
    };
  };

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch jobs
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('employerId', '==', user.uid),
        orderBy('updatedAt', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(jobsQuery);
      const jobsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Set recent jobs
      setRecentJobs(jobsData.slice(0, 3).map(job => ({
        id: job.id,
        title: job.title,
        status: job.status || 'draft',
        applications: job.applicantCount || 0,
        posted: job.createdAt ? new Date(job.createdAt.toDate()).toLocaleDateString() : 'Recently',
        views: job.viewCount || 0
      })));

      // Calculate active jobs
      const activeJobs = jobsData.filter(job => job.status === 'active').length;

      // Calculate total candidates from applications
      const applicationsPromises = jobsData.map(async (job) => {
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('jobId', '==', job.id)
        );
        const applicationsSnap = await getDocs(applicationsQuery);
        return applicationsSnap.size;
      });

      const applicationsCounts = await Promise.all(applicationsPromises);
      const totalCandidates = applicationsCounts.reduce((a, b) => a + b, 0);
      const totalViews = jobsData.reduce((sum, job) => sum + (job.viewCount || 0), 0);

      // Fetch today's interviews
      const todayRange = getTodayRange();
      let todaysInterviewsCount = 0;
      
      try {
        const interviewsQuery = query(
          collection(db, 'interviews'),
          where('employerId', '==', user.uid),
          where('scheduledTime', '>=', todayRange.start),
          where('scheduledTime', '<', todayRange.end),
          orderBy('scheduledTime', 'asc')
        );

        const interviewsSnapshot = await getDocs(interviewsQuery);
        todaysInterviewsCount = interviewsSnapshot.size;
        
        // Set upcoming interviews
        const interviewData = interviewsSnapshot.docs.slice(0, 2).map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUpcomingInterviews(interviewData.map(interview => ({
          id: interview.id,
          title: interview.jobTitle || 'Interview',
          candidateName: interview.candidateName || 'Candidate',
          time: interview.scheduledTime?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '10:00 AM',
          date: 'Today',
          type: interview.type || 'Zoom Meeting'
        })));
      } catch (interviewError) {
        console.log("No interviews collection or error fetching interviews:", interviewError);
      }

      // Calculate response rate
      let responseRate = 0;
      if (jobsData.length > 0) {
        const jobsWithApplications = jobsData.filter((job, index) => 
          applicationsCounts[index] > 0
        ).length;
        responseRate = Math.round((jobsWithApplications / jobsData.length) * 100);
      }

      // New applications (last 7 days)
      const oneWeekAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      const newApplicationsQuery = query(
        collection(db, 'applications'),
        where('jobId', 'in', jobsData.map(job => job.id)),
        where('appliedAt', '>=', oneWeekAgo)
      );
      const newApplicationsSnap = await getDocs(newApplicationsQuery);

      // Pending reviews (applications with 'pending' status)
      const pendingApplicationsQuery = query(
        collection(db, 'applications'),
        where('jobId', 'in', jobsData.map(job => job.id)),
        where('status', '==', 'pending')
      );
      const pendingReviewsSnap = await getDocs(pendingApplicationsQuery);

      // Fetch top candidates (applications with highest scores)
      const topCandidatesQuery = query(
        collection(db, 'applications'),
        where('jobId', 'in', jobsData.map(job => job.id)),
        orderBy('matchScore', 'desc'),
        limit(3)
      );

      try {
        const topCandidatesSnap = await getDocs(topCandidatesQuery);
        const candidatesData = topCandidatesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setTopCandidates(candidatesData.map(candidate => ({
          id: candidate.id,
          name: candidate.candidateName || 'Candidate',
          position: candidate.jobTitle || 'Position',
          match: `${candidate.matchScore || Math.floor(Math.random() * 20) + 80}%`,
          status: candidate.status || 'reviewed'
        })));
      } catch (error) {
        console.log("Error fetching top candidates:", error);
      }

      // Analytics calculations
      const weeklyApplications = newApplicationsSnap.size;
      const conversionRate = jobsData.length > 0 ? Math.round((weeklyApplications / jobsData.length) * 100) : 0;
      const avgResponseTime = 24; // hours (mock data)

      setStats({
        activeJobs,
        totalCandidates,
        todaysInterviews: todaysInterviewsCount,
        responseRate,
        newApplications: newApplicationsSnap.size,
        pendingReviews: pendingReviewsSnap.size,
        totalViews
      });

      setAnalytics({
        weeklyApplications,
        conversionRate,
        avgResponseTime
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }, [user]);

  // Initial fetch of dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    };

    loadDashboardData();
  }, [fetchDashboardData, user]);

  // Real-time listeners for notifications
  useEffect(() => {
    if (!user) return;

    // Listen for new applications
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('employerId', '==', user.uid)
    );

    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      const jobIds = snapshot.docs.map(doc => doc.id);
      if (jobIds.length === 0) return;

      const applicationsQuery = query(
        collection(db, 'applications'),
        where('jobId', 'in', jobIds),
        orderBy('appliedAt', 'desc'),
        limit(5)
      );

      const unsubscribeApps = onSnapshot(applicationsQuery, (appsSnapshot) => {
        const newNotifications = [];
        appsSnapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const appData = change.doc.data();
            newNotifications.push({
              id: change.doc.id,
              type: 'application',
              title: 'New Application',
              message: `New application received for ${appData.jobTitle}`,
              time: 'Just now',
              read: false,
              jobId: appData.jobId,
              applicationId: change.doc.id
            });
          }
        });

        if (newNotifications.length > 0) {
          setNotifications(prev => [...newNotifications, ...prev.slice(0, 9)]);
        }
      });

      return () => unsubscribeApps();
    });

    // Listen for conversations
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribeConvos = onSnapshot(conversationsQuery, (snapshot) => {
      const conversationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConversations(conversationsData);
    });

    return () => {
      unsubscribeJobs();
      unsubscribeConvos();
    };
  }, [user]);

  const handleStatClick = (statType) => {
    switch(statType) {
      case 'activeJobs':
        navigate("/employer/jobs");
        break;
      case 'totalCandidates':
      case 'newApplications':
      case 'pendingReviews':
        navigate("/employer/applications");
        break;
      case 'todaysInterviews':
        navigate("/employer/interviews");
        break;
      case 'totalViews':
        navigate("/employer/analytics");
        break;
      default:
        break;
    }
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'createJob':
        navigate("/PostJobPage");
        break;
      case 'viewPostings':
        navigate("/EmployerJobList");
        break;
      case 'scheduleInterview':
        navigate("/schedule-interview");
        break;
      case 'viewAnalytics':
        navigate("/employer/analytics");
        break;
      case 'reviewApplications':
        navigate("/employer/applications");
        break;
      case 'companyProfile':
        navigate("/employer/company-profile");
        break;
      case 'exportData':
        handleExportData();
        break;
      case 'shareDashboard':
        handleShareDashboard();
        break;
      default:
        break;
    }
  };

  const handleExportData = () => {
    // Implement export functionality
    const exportData = {
      stats,
      recentJobs,
      topCandidates,
      upcomingInterviews,
      analytics,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `joblytics-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert('Dashboard data exported successfully!');
  };

  const handleShareDashboard = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My JobLytics Dashboard',
        text: `Check out my hiring dashboard: ${stats.activeJobs} active jobs, ${stats.newApplications} new applications, and ${stats.todaysInterviews} interviews today!`,
        url: window.location.href,
      })
      .then(() => console.log('Successfully shared'))
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Dashboard link copied to clipboard!');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      localStorage.removeItem("user");
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSidebarClick = (menuItem) => {
    setActiveTab(menuItem);
    switch(menuItem) {
      case 'dashboard':
        navigate("/employer");
        break;
      case 'jobs':
        navigate("/EmployerJobList");
        break;
      case 'applications':
        navigate("/applications");
        break;
      case 'candidates':
        navigate("/employer/candidates");
        break;
      case 'interviews':
        navigate("/employer/interviews");
        break;
      case 'messaging':
        setShowMessagingPanel(true);
        break;
      case 'analytics':
        navigate("/employer/analytics");
        break;
      case 'company':
        navigate("/employer/company-profile");
        break;
      case 'billing':
        navigate("/employer/billing");
        break;
      case 'settings':
        navigate("/employer/settings");
        break;
      default:
        break;
    }
  };

  // Notification Dropdown Component
  const NotificationDropdown = () => {
    const unreadCount = notifications.filter(n => !n.read).length;

    const toggleDropdown = () => setNotificationOpen(!notificationOpen);

    const handleClickOutside = (e) => {
      if (!e.target.closest('.employer-notification-container')) {
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
      if (notification.type === 'application') {
        navigate(`/application/${notification.applicationId}`);
      }
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? {...n, read: true} : n)
      );
      setNotificationOpen(false);
    };

    const markAllAsRead = () => {
      setNotifications(prev => prev.map(n => ({...n, read: true})));
    };

    return (
      <div className="employer-notification-container">
        <button
          className="employer-notification-bell"
          onClick={toggleDropdown}
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <FiBell className="employer-notification-icon" />
          {unreadCount > 0 && (
            <span className="employer-notification-badge">{unreadCount}</span>
          )}
        </button>

        <div className={`employer-notification-dropdown ${notificationOpen ? 'open' : ''}`}>
          <div className="employer-notification-header">
            <h3>Notifications</h3>
            <button 
              className="employer-mark-all-read"
              onClick={markAllAsRead}
            >
              Mark all read
            </button>
          </div>

          <div className="employer-notification-list">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`employer-notification-item ${notification.read ? '' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="employer-notification-content">
                    <div className="employer-notification-title">{notification.title}</div>
                    <div className="employer-notification-message">{notification.message}</div>
                    <div className="employer-notification-time">{notification.time}</div>
                  </div>
                  {!notification.read && <div className="employer-unread-dot"></div>}
                </div>
              ))
            ) : (
              <div className="employer-notification-empty">
                <FiBell size={24} />
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <FiCheckCircle />;
      case 'draft': return <FiFileText />;
      case 'closed': return <FiXCircle />;
      case 'archived': return <FiArchive />;
      default: return <FiClock />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return { bg: '#d1fae5', text: '#065f46' };
      case 'draft': return { bg: '#fef3c7', text: '#92400e' };
      case 'closed': return { bg: '#f3f4f6', text: '#374151' };
      case 'archived': return { bg: '#fef3c7', text: '#92400e' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const getCandidateStatusColor = (status) => {
    switch (status) {
      case 'interview': return { bg: '#dbeafe', text: '#1e40af' };
      case 'reviewed': return { bg: '#fef3c7', text: '#92400e' };
      case 'new': return { bg: '#fce7f3', text: '#9d174d' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  return (
    <div className="employer-dashboard-container">
      {/* TOP NAVBAR */}
      <nav className="employer-top-navbar">
        <div className="employer-nav-brand">
          <Link to="/EmployerDashboard" className="employer-brand-logo">JobLytics</Link>
          <span className="employer-user-welcome">
            Employer Dashboard
          </span>
        </div>
        
        <div className="employer-nav-center">
          <ul className="employer-nav-links">
            <li><Link to="/EmployerDashboard" className="active">Dashboard</Link></li>
            <li><Link to="/EmployerJobList">Jobs</Link></li>
            <li><Link to="/Applicants">Candidates</Link></li>
            <li><Link to="/interviews">Interviews</Link></li>
            <li><Link to="/analytics">Analytics</Link></li>
            <li><Link to="/company-profile">Company</Link></li>
          </ul>
        </div>
        
        <div className="employer-nav-actions">
          <NotificationDropdown />
          
          <div className="employer-icon-button-container">
            <button 
              className="employer-icon-button"
              onClick={() => navigate('/messages')}
            >
              <FiMessageSquare className="employer-icon-button-icon" />
            </button>
          </div>
          
          <div className="employer-user-info">
            {user?.firstName || auth.currentUser?.displayName || 'Employer'}
          </div>
          
          <button 
            onClick={handleLogout}
            className="employer-icon-button"
            style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
          >
            <FiLogOut />
          </button>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <div className="employer-dashboard-layout">
        {/* SIDEBAR */}
        <aside className="employer-sidebar">
          <div className="employer-logo">JobLytics</div>
          <ul className="employer-menu">
            <li className="active">
              <Link to="/EmployerDashboard" className="employer-menu-link">
                <span className="employer-menu-icon"><FiHome /></span>
                <span className="employer-menu-text">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/EmployerJobList" className="employer-menu-link">
                <span className="employer-menu-icon"><FiBriefcase /></span>
                <span className="employer-menu-text">Job Postings</span>
                {stats.activeJobs > 0 && (
                  <span className="employer-menu-badge">{stats.activeJobs}</span>
                )}
              </Link>
            </li>
            <li>
              <Link to="/Applicants" className="employer-menu-link">
                <span className="employer-menu-icon"><FiUsers /></span>
                <span className="employer-menu-text">Applications</span>
                {stats.newApplications > 0 && (
                  <span className="employer-menu-badge employer-badge-red">{stats.newApplications}</span>
                )}
              </Link>
            </li>
            <li>
              <Link to="/candidates" className="employer-menu-link">
                <span className="employer-menu-icon"><FiUser /></span>
                <span className="employer-menu-text">Candidates</span>
              </Link>
            </li>
            <li>
              <Link to="/interviews" className="employer-menu-link">
                <span className="employer-menu-icon"><FiCalendar /></span>
                <span className="employer-menu-text">Interviews</span>
                {stats.todaysInterviews > 0 && (
                  <span className="employer-menu-badge">{stats.todaysInterviews}</span>
                )}
              </Link>
            </li>
            <li>
              <Link to="/analytics" className="employer-menu-link">
                <span className="employer-menu-icon"><FiBarChart2 /></span>
                <span className="employer-menu-text">Analytics</span>
              </Link>
            </li>
            <li>
              <Link to="/company-profile" className="employer-menu-link">
                <span className="employer-menu-icon"><FiBriefcase /></span>
                <span className="employer-menu-text">Company</span>
              </Link>
            </li>
            <li>
              <Link to="/billing" className="employer-menu-link">
                <span className="employer-menu-icon"><FiCreditCard /></span>
                <span className="employer-menu-text">Billing</span>
              </Link>
            </li>
            <li>
              <Link to="/settings" className="employer-menu-link">
                <span className="employer-menu-icon"><FiSettings /></span>
                <span className="employer-menu-text">Settings</span>
              </Link>
            </li>
          </ul>
        </aside>

        {/* MAIN CONTENT */}
        <main className="employer-main-content">
          <header className="employer-header">
            <h1>Welcome back, {user?.firstName || user?.companyName || "Employer"}!</h1>
            <div className="employer-search-bar">
              <div className="employer-search-box">
                <FiSearch className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search candidates, jobs, or messages..." 
                  className="employer-search-input"
                />
              </div>
              <div className="employer-user-info">
                <span>Employer • {user?.companyName || "Company"}</span>
              </div>
            </div>
          </header>

          {/* Quick Stats */}
          <div className="employer-quick-stats">
            <div 
              className="employer-stat-card clickable"
              onClick={() => handleStatClick('activeJobs')}
            >
              <h3>Active Jobs</h3>
              <p>{loading ? '...' : stats.activeJobs}</p>
              <span className="employer-stat-trend">
                <FiTrendingUp /> +2 this week
              </span>
            </div>
            <div 
              className="employer-stat-card employer-stat-highlight clickable"
              onClick={() => handleStatClick('newApplications')}
            >
              <h3>New Applications</h3>
              <p>{loading ? '...' : stats.newApplications}</p>
              <span className="employer-stat-trend">
                <FiZap /> Pending review
              </span>
            </div>
            <div 
              className="employer-stat-card clickable"
              onClick={() => handleStatClick('todaysInterviews')}
            >
              <h3>Today's Interviews</h3>
              <p>{loading ? '...' : stats.todaysInterviews}</p>
              <span className="employer-stat-trend">
                <FiCalendarIcon /> Scheduled
              </span>
            </div>
            <div 
              className="employer-stat-card clickable"
              onClick={() => handleStatClick('totalViews')}
            >
              <h3>Total Views</h3>
              <p>{loading ? '...' : stats.totalViews}</p>
              <span className="employer-stat-trend">
                <FiEye /> This month
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="employer-stats-cards">
            <div 
              className={`employer-card ${loading ? 'loading' : 'clickable'}`}
              onClick={() => !loading && handleStatClick('activeJobs')}
            >
              <div className="employer-card-icon">
                <FiBriefcase />
              </div>
              <div className="employer-card-content">
                <h3>Active Jobs</h3>
                <p>{loading ? '...' : stats.activeJobs}</p>
                <span className="employer-card-hint">Click to manage</span>
              </div>
              <FiChevronRight className="card-arrow" />
            </div>
            <div 
              className={`employer-card ${loading ? 'loading' : 'clickable'}`}
              onClick={() => !loading && handleStatClick('totalCandidates')}
            >
              <div className="employer-card-icon">
                <FiUsers />
              </div>
              <div className="employer-card-content">
                <h3>Total Candidates</h3>
                <p>{loading ? '...' : stats.totalCandidates}</p>
                <span className="employer-card-hint">Click to view</span>
              </div>
              <FiChevronRight className="card-arrow" />
            </div>
            <div 
              className={`employer-card ${loading ? 'loading' : 'clickable'}`}
              onClick={() => !loading && handleStatClick('todaysInterviews')}
            >
              <div className="employer-card-icon">
                <FiCalendar />
              </div>
              <div className="employer-card-content">
                <h3>Today's Interviews</h3>
                <p>{loading ? '...' : stats.todaysInterviews}</p>
                <span className="employer-card-hint">Click to manage</span>
              </div>
              <FiChevronRight className="card-arrow" />
            </div>
            <div 
              className={`employer-card ${loading ? 'loading' : 'clickable'}`}
              onClick={() => !loading && handleStatClick('newApplications')}
            >
              <div className="employer-card-icon">
                <FiFileText />
              </div>
              <div className="employer-card-content">
                <h3>New Applications</h3>
                <p>{loading ? '...' : stats.newApplications}</p>
                {stats.newApplications > 0 && <div className="employer-pulse-dot"></div>}
                <span className="employer-card-hint">Require attention</span>
              </div>
              <FiChevronRight className="card-arrow" />
            </div>
            <div 
              className={`employer-card ${loading ? 'loading' : 'clickable'}`}
              onClick={() => !loading && handleStatClick('pendingReviews')}
            >
              <div className="employer-card-icon">
                <FiClock />
              </div>
              <div className="employer-card-content">
                <h3>Pending Reviews</h3>
                <p>{loading ? '...' : stats.pendingReviews}</p>
                <span className="employer-card-hint">Click to review</span>
              </div>
              <FiChevronRight className="card-arrow" />
            </div>
            <div 
              className="employer-card clickable"
              onClick={() => navigate("/employer/analytics")}
            >
              <div className="employer-card-icon">
                <FiPercent />
              </div>
              <div className="employer-card-content">
                <h3>Response Rate</h3>
                <p>{loading ? '...' : `${stats.responseRate}%`}</p>
                <span className="employer-card-hint">Overall performance</span>
              </div>
              <FiChevronRight className="card-arrow" />
            </div>
          </div>

          {/* Analytics Insights */}
          <div className="employer-analytics-insights">
            <div className="analytics-card">
              <div className="analytics-header">
                <FiTrendingUp />
                <h4>Weekly Applications</h4>
              </div>
              <div className="analytics-value">{analytics.weeklyApplications}</div>
              <div className="analytics-trend positive">
                <FiArrowRight /> +12% from last week
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-header">
                <FiTarget />
                <h4>Conversion Rate</h4>
              </div>
              <div className="analytics-value">{analytics.conversionRate}%</div>
              <div className="analytics-trend positive">
                <FiArrowRight /> +8% improvement
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-header">
                <FiActivity />
                <h4>Avg Response Time</h4>
              </div>
              <div className="analytics-value">{analytics.avgResponseTime}h</div>
              <div className="analytics-trend negative">
                <FiArrowRight /> -3h faster
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="employer-quick-actions">
            <h3>Quick Actions</h3>
            <div className="employer-actions-grid">
              <button className="employer-action-btn" onClick={() => handleQuickAction('createJob')}>
                <span className="employer-action-icon"><FiPlus /></span>
                <span className="employer-action-text">Post New Job</span>
              </button>
              <button className="employer-action-btn" onClick={() => handleQuickAction('reviewApplications')}>
                <span className="employer-action-icon"><FiClipboard /></span>
                <span className="employer-action-text">Review Applications</span>
                {stats.newApplications > 0 && <span className="employer-action-badge">{stats.newApplications}</span>}
              </button>
              <button className="employer-action-btn" onClick={() => handleQuickAction('scheduleInterview')}>
                <span className="employer-action-icon"><FiCalendar /></span>
                <span className="employer-action-text">Schedule Interview</span>
              </button>
              <button className="employer-action-btn" onClick={() => handleQuickAction('viewAnalytics')}>
                <span className="employer-action-icon"><FiBarChart2 /></span>
                <span className="employer-action-text">View Analytics</span>
              </button>
              <button className="employer-action-btn" onClick={() => handleQuickAction('companyProfile')}>
                <span className="employer-action-icon"><FiBriefcase /></span>
                <span className="employer-action-text">Company Profile</span>
              </button>
              <button className="employer-action-btn" onClick={() => navigate('/messages')}>
                <span className="employer-action-icon"><FiMessageSquare /></span>
                <span className="employer-action-text">Messages</span>
                {conversations.length > 0 && <span className="employer-action-badge">{conversations.length}</span>}
              </button>
              <button className="employer-action-btn" onClick={handleExportData}>
                <span className="employer-action-icon"><FiDownload /></span>
                <span className="employer-action-text">Export Data</span>
              </button>
              <button className="employer-action-btn" onClick={handleShareDashboard}>
                <span className="employer-action-icon"><FiShare2 /></span>
                <span className="employer-action-text">Share Dashboard</span>
              </button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="employer-content-grid">
            {/* Recent Job Postings */}
            <div className="employer-content-section">
              <div className="employer-section-header">
                <h3>Recent Job Postings</h3>
                <button className="employer-view-all" onClick={() => navigate("/EmployerJobList")}>
                  View All <FiChevronRight />
                </button>
              </div>
              <div className="employer-job-list">
                {recentJobs.map(job => (
                  <div 
                    key={job.id} 
                    className="employer-job-item clickable"
                    onClick={() => navigate(`/job/${job.id}`)}
                  >
                    <div className="employer-job-info">
                      <h4>{job.title}</h4>
                      <div className="employer-job-meta">
                        <span 
                          className="employer-job-status"
                          style={{
                            backgroundColor: getStatusColor(job.status).bg,
                            color: getStatusColor(job.status).text
                          }}
                        >
                          {getStatusIcon(job.status)}
                          {job.status}
                        </span>
                        <span className="employer-job-applications">
                          {job.applications} applications
                        </span>
                        <span className="employer-job-posted">
                          {job.posted}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="employer-job-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/job/${job.id}/applications`);
                      }}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Candidates */}
            <div className="employer-content-section">
              <div className="employer-section-header">
                <h3>Top Candidates</h3>
                <button className="employer-view-all" onClick={() => navigate("/Applicants")}>
                  View All <FiChevronRight />
                </button>
              </div>
              <div className="employer-candidate-list">
                {topCandidates.map(candidate => (
                  <div 
                    key={candidate.id} 
                    className="employer-candidate-item clickable"
                    onClick={() => navigate(`/application/${candidate.id}`)}
                  >
                    <div className="employer-candidate-avatar">
                      {candidate.name.charAt(0)}
                    </div>
                    <div className="employer-candidate-info">
                      <h4>{candidate.name}</h4>
                      <p className="employer-candidate-position">{candidate.position}</p>
                      <div className="employer-candidate-meta">
                        <span className="employer-candidate-match">
                          <FiTarget /> {candidate.match} match
                        </span>
                        <span 
                          className="employer-candidate-status"
                          style={{
                            backgroundColor: getCandidateStatusColor(candidate.status).bg,
                            color: getCandidateStatusColor(candidate.status).text
                          }}
                        >
                          {candidate.status}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="employer-candidate-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/application/${candidate.id}`);
                      }}
                    >
                      <FiEye /> View
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Interviews */}
            <div className="employer-content-section employer-full-width">
              <div className="employer-section-header">
                <h3>Upcoming Interviews</h3>
                <button className="employer-view-all" onClick={() => navigate("/interviews")}>
                  View All <FiChevronRight />
                </button>
              </div>
              <div className="employer-interview-list">
                {upcomingInterviews.length > 0 ? (
                  upcomingInterviews.map(interview => (
                    <div 
                      key={interview.id} 
                      className="employer-interview-item clickable"
                      onClick={() => navigate(`/interview/${interview.id}`)}
                    >
                      <div className="employer-interview-time">
                        <span className="employer-interview-hour">
                          <FiClock /> {interview.time}
                        </span>
                        <span className="employer-interview-date">{interview.date}</span>
                      </div>
                      <div className="employer-interview-details">
                        <h4>{interview.title}</h4>
                        <p className="employer-interview-candidate">
                          {interview.candidateName} • {interview.type}
                        </p>
                        <div className="employer-interview-actions">
                          <button 
                            className="employer-interview-btn employer-btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Join meeting functionality
                              window.open('https://meet.google.com', '_blank');
                            }}
                          >
                            <FiVideo /> Join Now
                          </button>
                          <button 
                            className="employer-interview-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/interview/${interview.id}/reschedule`);
                            }}
                          >
                            <FiCalendar /> Reschedule
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-interviews">
                    <FiCalendar size={32} />
                    <p>No interviews scheduled for today</p>
                    <button 
                      className="employer-primary-btn"
                      onClick={() => navigate("/schedule-interview")}
                    >
                      <FiPlus /> Schedule Interview
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Insights */}
            <div className="employer-content-section employer-full-width">
              <div className="employer-section-header">
                <h3>Performance Insights</h3>
                <button className="employer-view-all" onClick={() => navigate("/employer/analytics")}>
                  View Details <FiChevronRight />
                </button>
              </div>
              <div className="performance-insights">
                <div className="insight-card">
                  <div className="insight-header">
                    <FiTrendingUp />
                    <h4>Application Growth</h4>
                  </div>
                  <p>Applications increased by 25% compared to last month</p>
                  <div className="insight-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '75%' }}></div>
                    </div>
                    <span>75% of target achieved</span>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-header">
                    <FiTool />
                    <h4>Skill Gap Analysis</h4>
                  </div>
                  <p>Most needed skills in current applications:</p>
                  <ul className="skill-list">
                    <li>React.js (85% demand)</li>
                    <li>Node.js (72% demand)</li>
                    <li>TypeScript (68% demand)</li>
                  </ul>
                </div>
                <div className="insight-card">
                  <div className="insight-header">
                    <FiStar />
                    <h4>Recommendations</h4>
                  </div>
                  <div className="recommendations-list">
                    <div className="recommendation-item">
                      <FiCheckCircle /> Update 2 job descriptions to attract more candidates
                    </div>
                    <div className="recommendation-item">
                      <FiCheckCircle /> Respond to pending applications within 24 hours
                    </div>
                    <div className="recommendation-item">
                      <FiCheckCircle /> Schedule follow-up interviews for top candidates
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployerDashboard;