import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiBookmark, FiMapPin, FiBriefcase, FiDollarSign, 
  FiClock, FiTrendingUp, FiX, FiSearch, FiFilter,
  FiTrash2, FiEye, FiExternalLink, FiChevronRight,
  FiAlertCircle, FiStar, FiLayers
} from "react-icons/fi";
import { db } from "../firebase/firebase";
import { 
  collection, query, where, getDocs, 
  deleteDoc, doc, orderBy, limit 
} from "firebase/firestore";
import "./SavedJobs.css";

const SavedJobs = ({ user }) => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    jobType: "all",
    location: "all",
    experience: "all"
  });
  const navigate = useNavigate();

  // Fetch saved jobs from Firestore
  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const savedJobsRef = collection(db, "savedJobs");
        const q = query(
          savedJobsRef, 
          where("userId", "==", user.uid),
          orderBy("savedAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const jobsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log("Fetched saved jobs:", jobsData.length);
        setSavedJobs(jobsData);
        setFilteredJobs(jobsData);
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
        // Try localStorage as fallback
        const savedJobsFromStorage = localStorage.getItem(`savedJobs_${user.uid}`);
        if (savedJobsFromStorage) {
          try {
            const parsed = JSON.parse(savedJobsFromStorage);
            console.log("Loaded from localStorage:", parsed.length);
            setSavedJobs(parsed);
            setFilteredJobs(parsed);
          } catch (parseError) {
            console.error("Error parsing localStorage:", parseError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, [user, navigate]);

  // Apply filters and search
  useEffect(() => {
    let results = [...savedJobs];

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(job =>
        job.jobTitle?.toLowerCase().includes(searchLower) ||
        job.company?.toLowerCase().includes(searchLower) ||
        job.location?.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply filters
    if (activeFilters.jobType !== "all") {
      results = results.filter(job => 
        job.type?.toLowerCase().includes(activeFilters.jobType.toLowerCase())
      );
    }

    if (activeFilters.location !== "all") {
      results = results.filter(job => {
        const jobLocation = job.location?.toLowerCase() || "";
        if (activeFilters.location === "remote") {
          return jobLocation.includes("remote");
        } else if (activeFilters.location === "onsite") {
          return !jobLocation.includes("remote");
        }
        return true;
      });
    }

    if (activeFilters.experience !== "all") {
      results = results.filter(job => {
        const experience = job.experience?.toLowerCase() || "";
        switch (activeFilters.experience) {
          case "entry":
            return experience.includes("entry") || experience.includes("junior");
          case "mid":
            return experience.includes("mid") || experience.includes("intermediate");
          case "senior":
            return experience.includes("senior") || experience.includes("lead");
          default:
            return true;
        }
      });
    }

    // Apply sorting
    results = sortJobs(results, sortBy);

    setFilteredJobs(results);
  }, [searchTerm, activeFilters, sortBy, savedJobs]);

  const sortJobs = (jobs, sortType) => {
    const sorted = [...jobs];
    switch (sortType) {
      case "recent":
        return sorted.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
      case "salaryHighLow":
        return sorted.sort((a, b) => {
          const salaryA = extractSalary(a.salary) || 0;
          const salaryB = extractSalary(b.salary) || 0;
          return salaryB - salaryA;
        });
      case "title":
        return sorted.sort((a, b) => (a.jobTitle || "").localeCompare(b.jobTitle || ""));
      default:
        return sorted;
    }
  };

  const extractSalary = (salaryString) => {
    if (!salaryString) return 0;
    const numbers = salaryString.match(/\d+/g);
    if (!numbers) return 0;
    return Math.max(...numbers.map(num => parseInt(num)));
  };

  const handleRemoveSavedJob = async (jobId) => {
    if (!user) return;

    try {
      // Remove from Firestore
      const savedJobRef = doc(db, "savedJobs", jobId);
      await deleteDoc(savedJobRef);
      
      // Update local state
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      
      // Update localStorage
      const savedJobsFromStorage = localStorage.getItem(`savedJobs_${user.uid}`);
      if (savedJobsFromStorage) {
        const parsed = JSON.parse(savedJobsFromStorage);
        const updated = parsed.filter(job => job.id !== jobId);
        localStorage.setItem(`savedJobs_${user.uid}`, JSON.stringify(updated));
      }
      
      console.log("Job removed from saved jobs");
    } catch (error) {
      console.error("Error removing saved job:", error);
      // Still update local state even if Firestore fails
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
    }
  };

  const handleViewJob = (job) => {
    // If we have the original job data, navigate to the job details
    if (job.jobId) {
      // Navigate to jobs page with the specific job ID
      navigate("/job-search", { 
        state: { 
          scrollToJob: job.jobId,
          highlightJob: job.jobId 
        } 
      });
    } else {
      // Show modal with saved job details
      setSelectedJob(job);
      setShowJobDetails(true);
    }
  };

  const handleApplyJob = (job) => {
    navigate("/apply", { state: { job } });
  };

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setActiveFilters({
      jobType: "all",
      location: "all",
      experience: "all"
    });
    setSortBy("recent");
  };

  const getExperienceLabel = (experience) => {
    if (!experience) return "Not specified";
    const lowerExp = experience.toLowerCase();
    if (lowerExp.includes("entry") || lowerExp.includes("junior")) return "Entry Level";
    if (lowerExp.includes("mid") || lowerExp.includes("intermediate")) return "Mid Level";
    if (lowerExp.includes("senior") || lowerExp.includes("lead")) return "Senior Level";
    return experience;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Navigation handler for sidebar
  const handleSidebarClick = (menuItem) => {
    switch (menuItem) {
      case "dashboard":
        navigate("/jobseeker");
        break;
      case "jobSearch":
        navigate("/job-search");
        break;
      case "applications":
        navigate("/job-seeker/applications");
        break;
      case "interviews":
        navigate("/schedule-interview");
        break;
      case "savedJobs":
        // Already here
        break;
      case "profile":
        navigate("/jobseeker/profile");
        break;
      case "messaging":
        // Implement messaging panel
        break;
      default:
        break;
    }
  };

  // Job Details Modal
  const JobDetailsModal = () => {
    if (!showJobDetails || !selectedJob) return null;

    return (
      <div className="saved-job-modal-overlay" onClick={() => setShowJobDetails(false)}>
        <div className="saved-job-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title-section">
              <h2>{selectedJob.jobTitle || "Job Title"}</h2>
              <p className="modal-company">{selectedJob.company || "Company"}</p>
            </div>
            <button className="modal-close-btn" onClick={() => setShowJobDetails(false)}>
              <FiX />
            </button>
          </div>
          
          <div className="modal-content">
            <div className="job-meta-grid">
              <div className="meta-item">
                <FiMapPin />
                <div>
                  <span className="meta-label">Location</span>
                  <span className="meta-value">{selectedJob.location || "Not specified"}</span>
                </div>
              </div>
              <div className="meta-item">
                <FiBriefcase />
                <div>
                  <span className="meta-label">Job Type</span>
                  <span className="meta-value">{selectedJob.type || "Not specified"}</span>
                </div>
              </div>
              <div className="meta-item">
                <FiDollarSign />
                <div>
                  <span className="meta-label">Salary</span>
                  <span className="meta-value">{selectedJob.salary || "Not specified"}</span>
                </div>
              </div>
              <div className="meta-item">
                <FiTrendingUp />
                <div>
                  <span className="meta-label">Experience</span>
                  <span className="meta-value">{getExperienceLabel(selectedJob.experience)}</span>
                </div>
              </div>
            </div>

            {selectedJob.description && (
              <div className="detail-section">
                <h3>Job Description</h3>
                <p>{selectedJob.description}</p>
              </div>
            )}

            {selectedJob.originalJobData?.qualifications && (
              <div className="detail-section">
                <h3>Qualifications</h3>
                <p>{selectedJob.originalJobData.qualifications}</p>
              </div>
            )}

            <div className="modal-actions">
              <button 
                className="modal-apply-btn"
                onClick={() => handleApplyJob(selectedJob)}
              >
                Apply Now
              </button>
              <button 
                className="modal-view-btn"
                onClick={() => {
                  setShowJobDetails(false);
                  handleViewJob(selectedJob);
                }}
              >
                View Full Details
              </button>
              <button 
                className="modal-remove-btn"
                onClick={() => {
                  handleRemoveSavedJob(selectedJob.id);
                  setShowJobDetails(false);
                }}
              >
                <FiTrash2 /> Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="jobseeker-dashboard-container">
      {/* Top Navigation Bar - Matching JobSeekerDashboard */}
      <nav className="jobseeker-top-navbar">
        <div className="jobseeker-nav-brand">
          <div className="jobseeker-brand-logo" onClick={() => navigate("/jobseeker")}>JobLytics</div>
          <span className="jobseeker-user-welcome">Saved Jobs</span>
        </div>

        <div className="jobseeker-nav-center">
          <ul className="jobseeker-nav-links">
            <li><div onClick={() => navigate("/jobseeker")}>Dashboard</div></li>
            <li><div onClick={() => navigate("/job-search")}>Jobs</div></li>
            <li><div onClick={() => navigate("/job-seeker/applications")}>Applications</div></li>
            <li><div onClick={() => navigate("/schedule-interview")}>Interviews</div></li>
            <li><div onClick={() => navigate("/messaging")}>Messages</div></li>
            <li><div onClick={() => navigate("/internet-speed-test")}>Internet Test</div></li>
            <li><div onClick={() => navigate("/payment-gateway")}>Payments</div></li>
          </ul>
        </div>

        <div className="jobseeker-nav-actions">
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

          {/* Dashboard Icon */}
          <div className="jobseeker-icon-button-container">
            <button
              className="jobseeker-icon-button jobseeker-dashboard-icon-btn"
              onClick={() => navigate("/jobseeker")}
              aria-label="Dashboard"
              title="Dashboard"
            >
              <span className="jobseeker-icon-button-icon">📊</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="jobseeker-dashboard-layout">
        {/* Sidebar */}
        <aside className="jobseeker-sidebar">
          <div className="jobseeker-logo" onClick={() => navigate("/jobseeker")}>🚀 Job Seeker</div>
          <ul className="jobseeker-menu">
            <li onClick={() => handleSidebarClick("dashboard")}>
              <span className="jobseeker-menu-icon">📊</span>
              <span className="jobseeker-menu-text">Dashboard</span>
            </li>
            <li onClick={() => handleSidebarClick("jobSearch")}>
              <span className="jobseeker-menu-icon">🔍</span>
              <span className="jobseeker-menu-text">Find Jobs</span>
            </li>
            <li onClick={() => handleSidebarClick("applications")}>
              <span className="jobseeker-menu-icon">📄</span>
              <span className="jobseeker-menu-text">Applications</span>
            </li>
            <li onClick={() => handleSidebarClick("interviews")}>
              <span className="jobseeker-menu-icon">🎯</span>
              <span className="jobseeker-menu-text">Interviews</span>
            </li>
            <li className="active" onClick={() => handleSidebarClick("savedJobs")}>
              <span className="jobseeker-menu-icon">⭐</span>
              <span className="jobseeker-menu-text">Saved Jobs</span>
              {savedJobs.length > 0 && (
                <span className="jobseeker-menu-badge">{savedJobs.length}</span>
              )}
            </li>
            <li onClick={() => handleSidebarClick("profile")}>
              <span className="jobseeker-menu-icon">👤</span>
              <span className="jobseeker-menu-text">Profile</span>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="jobseeker-main-content">
          {/* Header */}
          <header className="jobseeker-header">
            <div className="saved-jobs-header-content">
              <h1>
                <FiBookmark className="header-icon" /> 
                My Saved Jobs
              </h1>
              <p className="header-subtitle">
                {savedJobs.length} jobs saved • Click any job to view details
              </p>
            </div>
            
            <div className="saved-jobs-search-bar">
              <div className="search-input-group">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search in saved jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button className="clear-search" onClick={() => setSearchTerm("")}>
                    <FiX />
                  </button>
                )}
              </div>
              
              <div className="sort-controls">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="recent">Recently Saved</option>
                  <option value="salaryHighLow">Salary: High to Low</option>
                  <option value="title">Job Title A-Z</option>
                </select>
              </div>
            </div>
          </header>

          {/* Quick Filters */}
          <div className="saved-jobs-quick-filters">
            <h3 className="filters-title">
              <FiFilter /> Quick Filters
            </h3>
            <div className="filters-grid">
              <button 
                className={`filter-btn ${activeFilters.jobType === "all" ? "active" : ""}`}
                onClick={() => handleFilterChange("jobType", "all")}
              >
                All Types
              </button>
              <button 
                className={`filter-btn ${activeFilters.jobType === "full-time" ? "active" : ""}`}
                onClick={() => handleFilterChange("jobType", "full-time")}
              >
                Full-time
              </button>
              <button 
                className={`filter-btn ${activeFilters.jobType === "part-time" ? "active" : ""}`}
                onClick={() => handleFilterChange("jobType", "part-time")}
              >
                Part-time
              </button>
              <button 
                className={`filter-btn ${activeFilters.jobType === "contract" ? "active" : ""}`}
                onClick={() => handleFilterChange("jobType", "contract")}
              >
                Contract
              </button>
              <button 
                className={`filter-btn ${activeFilters.location === "remote" ? "active" : ""}`}
                onClick={() => handleFilterChange("location", "remote")}
              >
                Remote
              </button>
              <button 
                className={`filter-btn ${activeFilters.location === "onsite" ? "active" : ""}`}
                onClick={() => handleFilterChange("location", "onsite")}
              >
                On-site
              </button>
              <button 
                className={`filter-btn ${activeFilters.experience === "entry" ? "active" : ""}`}
                onClick={() => handleFilterChange("experience", "entry")}
              >
                Entry Level
              </button>
              <button 
                className={`filter-btn ${activeFilters.experience === "senior" ? "active" : ""}`}
                onClick={() => handleFilterChange("experience", "senior")}
              >
                Senior Level
              </button>
            </div>
            
            {(searchTerm || Object.values(activeFilters).some(f => f !== "all")) && (
              <button className="clear-filters-btn" onClick={clearAllFilters}>
                <FiX /> Clear All Filters
              </button>
            )}
          </div>

          {/* Results Stats */}
          <div className="saved-jobs-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <FiLayers />
              </div>
              <div className="stat-content">
                <h3>Total Saved</h3>
                <p>{savedJobs.length}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiBriefcase />
              </div>
              <div className="stat-content">
                <h3>Filtered</h3>
                <p>{filteredJobs.length}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiDollarSign />
              </div>
              <div className="stat-content">
                <h3>Avg. Salary</h3>
                <p>
                  {savedJobs.length > 0 
                    ? `$${Math.round(savedJobs.reduce((sum, job) => sum + (extractSalary(job.salary) || 0), 0) / savedJobs.length).toLocaleString()}k`
                    : "N/A"
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="saved-jobs-content">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading your saved jobs...</p>
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="saved-jobs-grid">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="saved-job-card">
                    <div className="job-card-header">
                      <div className="job-card-company">
                        <div className="company-logo">
                          {job.company?.charAt(0) || "J"}
                        </div>
                        <div className="company-info">
                          <h3 className="job-title">{job.jobTitle || "Job Title"}</h3>
                          <p className="company-name">{job.company || "Company"}</p>
                        </div>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => handleRemoveSavedJob(job.id)}
                        title="Remove from saved"
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                    <div className="job-card-meta">
                      <span className="meta-item">
                        <FiMapPin /> {job.location || "Location not specified"}
                      </span>
                      <span className="meta-item">
                        <FiBriefcase /> {job.type || "Job type not specified"}
                      </span>
                      <span className="meta-item">
                        <FiTrendingUp /> {getExperienceLabel(job.experience)}
                      </span>
                    </div>

                    {job.salary && (
                      <div className="job-card-salary">
                        <FiDollarSign /> {job.salary}
                      </div>
                    )}

                    {job.description && (
                      <p className="job-card-description">
                        {job.description.substring(0, 100)}...
                      </p>
                    )}

                    <div className="job-card-footer">
                      <div className="saved-date">
                        <FiClock /> Saved {formatDate(job.savedAt)}
                      </div>
                      <div className="job-card-actions">
                        <button 
                          className="view-btn"
                          onClick={() => handleViewJob(job)}
                        >
                          <FiEye /> View Details
                        </button>
                        <button 
                          className="apply-btn"
                          onClick={() => handleApplyJob(job)}
                        >
                          Apply Now <FiChevronRight />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm || Object.values(activeFilters).some(f => f !== "all") ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FiSearch size={48} />
                </div>
                <h3>No matching jobs found</h3>
                <p>Try adjusting your search terms or filters</p>
                <button className="clear-filters-btn" onClick={clearAllFilters}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FiBookmark size={48} />
                </div>
                <h3>No saved jobs yet</h3>
                <p>Start browsing jobs and save interesting ones for later</p>
                <button 
                  className="browse-jobs-btn"
                  onClick={() => navigate("/job-search")}
                >
                  Browse Jobs <FiChevronRight />
                </button>
              </div>
            )}
          </div>

          {/* Tips Section */}
          {savedJobs.length > 0 && (
            <div className="saved-jobs-tips">
              <div className="tips-header">
                <FiStar className="tips-icon" />
                <h3>Tips for Your Saved Jobs</h3>
              </div>
              <div className="tips-grid">
                <div className="tip-card">
                  <div className="tip-number">1</div>
                  <p><strong>Prioritize applications</strong> based on application deadlines</p>
                </div>
                <div className="tip-card">
                  <div className="tip-number">2</div>
                  <p><strong>Customize your resume</strong> for each job application</p>
                </div>
                <div className="tip-card">
                  <div className="tip-number">3</div>
                  <p><strong>Set reminders</strong> to follow up on applications</p>
                </div>
                <div className="tip-card">
                  <div className="tip-number">4</div>
                  <p><strong>Research companies</strong> before interviews</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Job Details Modal */}
      <JobDetailsModal />

      {/* Footer */}
      <footer className="saved-jobs-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3 className="footer-logo">JobLytics</h3>
            <p className="footer-tagline">Your career journey starts here</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Quick Links</h4>
              <div onClick={() => navigate("/job-search")}>Browse Jobs</div>
              <div onClick={() => navigate("/job-seeker/applications")}>Applications</div>
              <div onClick={() => navigate("/schedule-interview")}>Interviews</div>
              <div onClick={() => navigate("/jobseeker/profile")}>Profile</div>
            </div>
            <div className="footer-column">
              <h4>Support</h4>
              <div onClick={() => navigate("/help")}>Help Center</div>
              <div onClick={() => navigate("/contact")}>Contact Us</div>
              <div onClick={() => navigate("/privacy")}>Privacy Policy</div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} JobLytics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default SavedJobs;