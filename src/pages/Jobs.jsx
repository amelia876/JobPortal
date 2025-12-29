import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FiSearch, FiMapPin, FiFilter, FiX, FiStar, 
  FiBookmark, FiBriefcase, FiDollarSign, FiClock,
  FiCheckCircle, FiTrendingUp, FiBell, FiHelpCircle,
  FiChevronRight, FiExternalLink, FiCalendar, FiArrowLeft,
  FiLogOut, FiUsers, FiMail, FiBarChart2, FiHome,
  FiFileText, FiMessageSquare, FiGlobe, FiCreditCard,
  FiUser, FiSettings
} from "react-icons/fi";
import "./Jobs.css";

// ✅ Firebase Imports
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ✅ Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYjjzQZunjUJ4IOJ-s_GLKQYxOw5V8psI",
  authDomain: "jobportal-84fc0.firebaseapp.com",
  projectId: "jobportal-84fc0",
  storageBucket: "jobportal-84fc0.appspot.com",
  messagingSenderId: "391211718873",
  appId: "1:391211718873:web:ed69f3abdfaa91b2ca86c8",
  measurementId: "G-QTCL4FK0BT",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

const Jobs = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [jobListings, setJobListings] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    experience: "all",
    salary: "all",
    remote: "all",
    jobType: "all"
  });
  const [sortBy, setSortBy] = useState("mostRecent");
  const [loading, setLoading] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
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
  const [activeTab, setActiveTab] = useState("jobs");
  
  // ✅ Track Firebase auth state separately
  const [firebaseUser, setFirebaseUser] = useState(null);

  // ✅ Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      console.log("Auth state changed, user:", currentUser?.uid);
      setFirebaseUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Handle page refresh - load from localStorage on mount
  useEffect(() => {
    const loadFromLocalStorageOnRefresh = () => {
      console.log("Checking for saved jobs on page load/refresh");
      
      // Try multiple sources for user ID
      const possibleUserIds = [
        user?.uid,
        firebaseUser?.uid,
        auth.currentUser?.uid
      ].filter(Boolean);
      
      for (const userId of possibleUserIds) {
        if (userId) {
          const savedJobsFromStorage = localStorage.getItem(`savedJobs_${userId}`);
          if (savedJobsFromStorage) {
            try {
              const parsed = JSON.parse(savedJobsFromStorage);
              console.log("Loading saved jobs from localStorage:", parsed.length);
              setSavedJobs(parsed);
              break;
            } catch (error) {
              console.error("Error loading from localStorage:", error);
            }
          }
        }
      }
    };

    // Run after a short delay to ensure user is loaded
    setTimeout(loadFromLocalStorageOnRefresh, 500);
  }, [user, firebaseUser]);

  // ✅ Default Static Jobs (fallback)
  const staticJobs = [
    {
      id: "1",
      title: "Senior Frontend Developer",
      company: "Tech Solutions Inc",
      location: "San Francisco, CA",
      type: "Full-time",
      remote: true,
      salary: "$120k - $160k",
      experience: "Senior Level",
      logo: "https://via.placeholder.com/56",
      description: "We are looking for a skilled Frontend Developer to join our team. You'll be working on cutting-edge web applications using React, TypeScript, and modern frontend technologies.",
      qualifications: "Bachelor's degree in Computer Science or related field, 5+ years of experience with React, TypeScript, and modern JavaScript frameworks.",
      hiringProcess: "Initial screening -> Technical interview -> Final round -> Offer",
      compensation: "$120,000 - $160,000",
      experienceRequired: "5+ years",
      jobStatus: "Full-time",
      postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
      id: "2",
      title: "Product Marketing Manager",
      company: "Growth Dynamics",
      location: "New York, NY",
      type: "Full-time",
      remote: false,
      salary: "$90k - $130k",
      experience: "Mid Level",
      logo: "https://via.placeholder.com/56",
      description: "Join our marketing team to drive product awareness and user acquisition. Develop go-to-market strategies and collaborate with product teams.",
      qualifications: "3+ years in product marketing, strong analytical skills, excellent communication abilities.",
      hiringProcess: "Phone screen -> Case study -> Team interview -> Offer",
      compensation: "$90,000 - $130,000",
      experienceRequired: "3+ years",
      jobStatus: "Full-time",
      postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    },
    {
      id: "3",
      title: "DevOps Engineer",
      company: "Cloud Innovations",
      location: "Remote",
      type: "Full-time",
      remote: true,
      salary: "$110k - $150k",
      experience: "Mid-Senior Level",
      logo: "https://via.placeholder.com/56",
      description: "Design and implement CI/CD pipelines, manage cloud infrastructure, and ensure system reliability.",
      qualifications: "Experience with AWS, Kubernetes, Docker, and Terraform. 3+ years in DevOps role.",
      hiringProcess: "Technical assessment -> System design interview -> Team fit -> Offer",
      compensation: "$110,000 - $150,000",
      experienceRequired: "3+ years",
      jobStatus: "Full-time",
      postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
  ];

  // ✅ Fetch Jobs from Firebase Firestore
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const jobsCollection = collection(db, "jobs");
        const jobSnapshot = await getDocs(jobsCollection);
        const jobData = jobSnapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data(),
          company: doc.data().employerName || "Company",
          salary: doc.data().compensation || "Salary not specified",
          experience: doc.data().experienceRequired || doc.data().minExperience || "Experience not specified",
          type: doc.data().jobStatus || "Full-time",
          remote: doc.data().location?.toLowerCase().includes("remote") || false,
          logo: "https://via.placeholder.com/56",
          postedAt: doc.data().updatedAt?.toDate?.() || new Date()
        }));

        if (jobData.length > 0) {
          setJobListings(jobData);
          setFilteredJobs(jobData);
        } else {
          setJobListings(staticJobs);
          setFilteredJobs(staticJobs);
        }
      } catch (error) {
        console.error("Error fetching jobs from Firestore:", error);
        setJobListings(staticJobs);
        setFilteredJobs(staticJobs);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // ✅ Handle incoming navigation state from Applications page
  useEffect(() => {
    const checkForIncomingJob = () => {
      const navigationState = window.history.state?.usr || {};
      console.log("Navigation state:", navigationState);
      
      if (navigationState.selectedJobId && navigationState.viewJobDetails) {
        console.log("Received jobId from applications:", navigationState.selectedJobId);
        
        // Find the job in the listings
        const findAndShowJob = () => {
          const job = jobListings.find(j => j.id === navigationState.selectedJobId);
          
          if (job) {
            console.log("Found job:", job.title);
            setSelectedJob(job);
            setShowJobDetails(true);
            
            // Clear the state to avoid re-triggering
            window.history.replaceState({ ...window.history.state, usr: null }, '');
          } else {
            console.log("Job not found in current listings");
            // Try static jobs as fallback
            const staticJob = staticJobs.find(j => j.id === navigationState.selectedJobId);
            if (staticJob) {
              setSelectedJob(staticJob);
              setShowJobDetails(true);
              window.history.replaceState({ ...window.history.state, usr: null }, '');
            }
          }
        };
        
        // If jobs are loaded, find immediately
        if (jobListings.length > 0) {
          findAndShowJob();
        } else {
          // Wait for jobs to load
          const timeoutId = setTimeout(() => {
            findAndShowJob();
          }, 2000);
          
          return () => clearTimeout(timeoutId);
        }
      }
    };

    // Check for incoming job when component mounts or jobListings change
    checkForIncomingJob();
  }, [jobListings]);

  // ✅ FIXED: Fetch user's saved jobs from Firestore with better handling
  useEffect(() => {
    const fetchSavedJobs = async () => {
      // Wait for Firebase auth to initialize
      if (!user && !firebaseUser) {
        console.log("No user yet, waiting for auth...");
        
        // Try to check if auth is still loading
        auth.onAuthStateChanged(async (currentAuthUser) => {
          if (currentAuthUser) {
            console.log("Firebase auth user found:", currentAuthUser.uid);
            await fetchSavedJobsForUser(currentAuthUser.uid);
          } else {
            console.log("No Firebase user authenticated");
          }
        });
        return;
      }
      
      // Use whichever user is available
      const currentUserId = user?.uid || firebaseUser?.uid;
      if (currentUserId) {
        await fetchSavedJobsForUser(currentUserId);
      }
    };

    const fetchSavedJobsForUser = async (userId) => {
      try {
        console.log("Fetching saved jobs for user:", userId);
        const savedJobsRef = collection(db, "savedJobs");
        const q = query(savedJobsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        
        const savedJobsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log("Fetched saved jobs from Firestore:", savedJobsData.length);
        setSavedJobs(savedJobsData);
        
        // Also sync to localStorage
        localStorage.setItem(`savedJobs_${userId}`, JSON.stringify(savedJobsData));
        
      } catch (error) {
        console.error("Error fetching saved jobs from Firestore:", error);
        // Try to load from localStorage as fallback
        const savedJobsFromStorage = localStorage.getItem(`savedJobs_${userId}`);
        if (savedJobsFromStorage) {
          try {
            const parsed = JSON.parse(savedJobsFromStorage);
            console.log("Loaded saved jobs from localStorage:", parsed.length);
            setSavedJobs(parsed);
          } catch (parseError) {
            console.error("Error parsing saved jobs from localStorage:", parseError);
          }
        }
      }
    };

    fetchSavedJobs();
  }, [user, firebaseUser]);

  // ✅ Sync saved jobs to localStorage as backup
  useEffect(() => {
    const syncToLocalStorage = () => {
      // Try multiple ways to get user ID
      const currentUserId = user?.uid || firebaseUser?.uid || auth.currentUser?.uid;
      
      if (currentUserId && savedJobs.length > 0) {
        localStorage.setItem(`savedJobs_${currentUserId}`, JSON.stringify(savedJobs));
        console.log("Saved jobs synced to localStorage:", savedJobs.length);
      }
    };

    // Use a timeout to ensure user is loaded
    const timeoutId = setTimeout(syncToLocalStorage, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [savedJobs, user, firebaseUser]);

  // ✅ Real-time conversations listener (for messaging panel)
  useEffect(() => {
    const currentUser = user || firebaseUser;
    if (!currentUser) return;

    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
      const conversationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConversations(conversationsData);

      // Update unread messages count
      const unreadCount = conversationsData.reduce((total, conv) => {
        return total + (conv.unreadCount?.[currentUser.uid] || 0);
      }, 0);

      setStats(prev => ({
        ...prev,
        unreadMessages: unreadCount
      }));
    });

    return () => unsubscribe();
  }, [user, firebaseUser]);

  // ✅ Real-time messages listener for selected conversation
  useEffect(() => {
    const currentUser = user || firebaseUser;
    if (!selectedConversation || !currentUser) return;

    const messagesQuery = query(
      collection(db, 'conversations', selectedConversation.id, 'messages')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds);
      
      setMessages(messagesData);

      // Mark messages as read
      if (currentUser) {
        const unreadMessages = messagesData.filter(msg => 
          msg.senderId !== currentUser.uid && !msg.read
        );
        if (unreadMessages.length > 0) {
          updateDoc(doc(db, 'conversations', selectedConversation.id), {
            [`unreadCount.${currentUser.uid}`]: 0
          });
        }
      }
    });

    return () => unsubscribe();
  }, [selectedConversation, user, firebaseUser]);

  // ✅ Apply filters and search
  useEffect(() => {
    let results = [...jobListings];

    // Search filter
    if (searchTerm) {
      results = results.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.qualifications?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Location filter
    if (locationFilter) {
      results = results.filter(job =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Experience filter
    if (activeFilters.experience !== "all") {
      results = results.filter(job => {
        const experience = job.experienceRequired || job.experience || "";
        switch (activeFilters.experience) {
          case "entry":
            return experience.toLowerCase().includes("entry") || experience.toLowerCase().includes("junior");
          case "mid":
            return experience.toLowerCase().includes("mid") || experience.toLowerCase().includes("intermediate");
          case "senior":
            return experience.toLowerCase().includes("senior") || experience.toLowerCase().includes("lead");
          default:
            return true;
        }
      });
    }

    // Remote filter
    if (activeFilters.remote !== "all") {
      results = results.filter(job => 
        activeFilters.remote === "remote" ? job.remote : !job.remote
      );
    }

    // Job type filter
    if (activeFilters.jobType !== "all") {
      results = results.filter(job => 
        job.type.toLowerCase().includes(activeFilters.jobType.toLowerCase()) ||
        job.jobStatus?.toLowerCase().includes(activeFilters.jobType.toLowerCase())
      );
    }

    // Salary filter
    if (activeFilters.salary !== "all") {
      results = results.filter(job => {
        const salary = job.compensation || job.salary || "";
        const salaryNum = extractSalary(salary);
        switch (activeFilters.salary) {
          case "0-50":
            return salaryNum < 50000;
          case "50-100":
            return salaryNum >= 50000 && salaryNum < 100000;
          case "100-150":
            return salaryNum >= 100000 && salaryNum < 150000;
          case "150+":
            return salaryNum >= 150000;
          default:
            return true;
        }
      });
    }

    // Sort results
    results = sortJobs(results, sortBy);

    setFilteredJobs(results);
  }, [searchTerm, locationFilter, activeFilters, sortBy, jobListings]);

  // ✅ Sort jobs
  const sortJobs = (jobs, sortType) => {
    const sortedJobs = [...jobs];
    switch (sortType) {
      case "mostRecent":
        return sortedJobs.sort((a, b) => {
          const dateA = a.postedAt || new Date(0);
          const dateB = b.postedAt || new Date(0);
          return dateB - dateA;
        });
      case "salaryHighLow":
        return sortedJobs.sort((a, b) => {
          const salaryA = extractSalary(a.compensation || a.salary);
          const salaryB = extractSalary(b.compensation || b.salary);
          return salaryB - salaryA;
        });
      case "salaryLowHigh":
        return sortedJobs.sort((a, b) => {
          const salaryA = extractSalary(a.compensation || a.salary);
          const salaryB = extractSalary(b.compensation || b.salary);
          return salaryA - salaryB;
        });
      case "mostRelevant":
      default:
        return sortedJobs;
    }
  };

  // ✅ Extract salary number from string
  const extractSalary = (salaryString) => {
    if (!salaryString) return 0;
    const numbers = salaryString.match(/\d+/g);
    if (!numbers) return 0;
    return Math.max(...numbers.map(num => parseInt(num)));
  };

  // ✅ Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // ✅ Handle search
  const handleSearch = (e) => {
    e.preventDefault();
  };

  // ✅ Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setActiveFilters({
      experience: "all",
      salary: "all",
      remote: "all",
      jobType: "all"
    });
    setSortBy("mostRecent");
  };

  // ✅ IMPROVED: Toggle save job with better error handling and localStorage fallback
  const handleSaveJob = async (job) => {
    // Get user ID from multiple sources
    const currentUserId = user?.uid || firebaseUser?.uid || auth.currentUser?.uid;
    
    if (!currentUserId) {
      alert("Please log in to save jobs");
      navigate("/login");
      return;
    }

    console.log("Save job clicked for:", job.id, job.title, "User:", currentUserId);
    
    try {
      // Check if job is already saved in local state
      const isAlreadySaved = savedJobs.some(savedJob => savedJob.jobId === job.id);
      const savedJobId = `${currentUserId}_${job.id}`;
      
      if (isAlreadySaved) {
        // UNSAVE JOB
        console.log("Unsaving job:", job.id);
        
        // 1. Update local state immediately
        setSavedJobs(prev => prev.filter(savedJob => savedJob.jobId !== job.id));
        
        // 2. Remove from localStorage
        const savedJobsFromStorage = localStorage.getItem(`savedJobs_${currentUserId}`);
        if (savedJobsFromStorage) {
          try {
            const parsed = JSON.parse(savedJobsFromStorage);
            const updated = parsed.filter(savedJob => savedJob.jobId !== job.id);
            localStorage.setItem(`savedJobs_${currentUserId}`, JSON.stringify(updated));
            console.log("Removed from localStorage");
          } catch (error) {
            console.error("Error updating localStorage:", error);
          }
        }
        
        // 3. Try to remove from Firestore (if it exists)
        try {
          const savedJobRef = doc(db, "savedJobs", savedJobId);
          await deleteDoc(savedJobRef);
          console.log("Removed from Firestore");
        } catch (firestoreError) {
          console.log("Job wasn't in Firestore or couldn't delete:", firestoreError);
          // This is okay - maybe it was only saved locally
        }
        
      } else {
        // SAVE JOB
        console.log("Saving job:", job.id);
        
        // Prepare job data
        const jobData = {
          id: savedJobId,
          userId: currentUserId,
          jobId: job.id,
          savedAt: new Date().toISOString(),
          jobTitle: job.title || "",
          company: job.company || "",
          location: job.location || "",
          salary: job.salary || job.compensation || "",
          type: job.type || job.jobStatus || "",
          logo: job.logo || "",
          description: job.description || "",
          experience: job.experience || job.experienceRequired || "",
          // Keep original job data for reference
          originalJobData: {
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary || job.compensation,
            type: job.type || job.jobStatus,
            description: job.description,
            qualifications: job.qualifications,
            experienceRequired: job.experienceRequired
          }
        };
        
        // 1. Update local state immediately for UI feedback
        setSavedJobs(prev => [...prev, jobData]);
        console.log("Updated local state");
        
        // 2. Save to localStorage as backup
        try {
          const savedJobsFromStorage = localStorage.getItem(`savedJobs_${currentUserId}`);
          let currentSavedJobs = [];
          
          if (savedJobsFromStorage) {
            try {
              currentSavedJobs = JSON.parse(savedJobsFromStorage);
            } catch (e) {
              console.error("Error parsing localStorage, starting fresh");
              currentSavedJobs = [];
            }
          }
          
          // Check if already exists in localStorage
          const existsInStorage = currentSavedJobs.some(savedJob => savedJob.jobId === job.id);
          if (!existsInStorage) {
            currentSavedJobs.push(jobData);
            localStorage.setItem(`savedJobs_${currentUserId}`, JSON.stringify(currentSavedJobs));
            console.log("Saved to localStorage");
          }
        } catch (storageError) {
          console.error("Error saving to localStorage:", storageError);
        }
        
        // 3. Try to save to Firestore
        try {
          const savedJobRef = doc(db, "savedJobs", savedJobId);
          await setDoc(savedJobRef, jobData, { merge: true }); // Use merge to avoid overwriting
          console.log("Saved to Firestore successfully");
        } catch (firestoreError) {
          console.error("Failed to save to Firestore:", firestoreError);
          
          // Check for specific error types
          if (firestoreError.code === 'permission-denied') {
            console.warn("Firestore permission denied. Check your Firestore rules.");
            // Job is already saved locally, so user experience is preserved
          } else if (firestoreError.code === 'not-found') {
            console.warn("savedJobs collection might not exist yet");
            // This is okay - we'll create it when we write
          } else {
            console.warn("Firestore error, but job saved locally:", firestoreError);
          }
        }
      }
    } catch (error) {
      console.error("Unexpected error in handleSaveJob:", error);
      // Don't show alert to avoid disrupting user experience
      // The job is already saved/unsaved locally
    }
  };

  // ✅ FIXED: Check if a job is saved - with localStorage fallback
  const isJobSaved = (jobId) => {
    // Also check localStorage as backup
    const currentUserId = user?.uid || firebaseUser?.uid || auth.currentUser?.uid;
    if (currentUserId) {
      const savedJobsFromStorage = localStorage.getItem(`savedJobs_${currentUserId}`);
      if (savedJobsFromStorage) {
        try {
          const parsed = JSON.parse(savedJobsFromStorage);
          const isSavedInStorage = parsed.some(savedJob => savedJob.jobId === jobId);
          if (isSavedInStorage && !savedJobs.some(savedJob => savedJob.jobId === jobId)) {
            // If it's in localStorage but not in state, update state
            setSavedJobs(parsed);
          }
          return isSavedInStorage || savedJobs.some(savedJob => savedJob.jobId === jobId);
        } catch (error) {
          console.error("Error checking localStorage:", error);
        }
      }
    }
    
    return savedJobs.some(savedJob => savedJob.jobId === jobId);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setIsLoggedIn(false);
      localStorage.removeItem("user");
      // Also clear saved jobs from localStorage for this user
      const currentUserId = user?.uid || firebaseUser?.uid || auth.currentUser?.uid;
      if (currentUserId) {
        localStorage.removeItem(`savedJobs_${currentUserId}`);
      }
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // ✅ View Job Details
  const handleViewJob = (job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  // ✅ Close Job Details Modal
  const handleCloseJobDetails = () => {
    setShowJobDetails(false);
    setSelectedJob(null);
  };

  // ✅ Apply for Job
  const handleApplyJob = (job) => {
    navigate("/apply", { state: { job } });
  };

  // ✅ Send Message (for messaging panel)
  const sendMessage = async () => {
    const currentUser = user || firebaseUser;
    if (!messageInput.trim() || !selectedConversation || !currentUser) return;

    try {
      const messageData = {
        conversationId: selectedConversation.id,
        senderId: currentUser.uid,
        content: messageInput.trim(),
        timestamp: serverTimestamp(),
        read: false,
        attachments: []
      };

      await addDoc(
        collection(db, 'conversations', selectedConversation.id, 'messages'),
        messageData
      );

      await updateDoc(doc(db, 'conversations', selectedConversation.id), {
        lastMessage: messageInput.trim(),
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${selectedConversation.participants.find(p => p !== currentUser.uid)}`]: 
          (selectedConversation.unreadCount?.[selectedConversation.participants.find(p => p !== currentUser.uid)] || 0) + 1
      });

      setMessageInput("");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // ✅ Format timestamp for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "Recently";
    
    if (timestamp.toDate) {
      const date = timestamp.toDate();
      const diff = Date.now() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days === 0) return "Today";
      if (days === 1) return "Yesterday";
      if (days < 7) return `${days} days ago`;
      if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    return "Recently";
  };

  // ✅ Check if field has valid data
  const hasData = (field) => {
    return field && field !== "" && field !== "f" && field !== "h" && field !== "n/a";
  };

  // ✅ Check if any filters are active
  const isAnyFilterActive = () => {
    return searchTerm || locationFilter || Object.values(activeFilters).some(filter => filter !== "all");
  };

  // ✅ Get experience level label
  const getExperienceLabel = (exp) => {
    const lowerExp = exp.toLowerCase();
    if (lowerExp.includes("entry") || lowerExp.includes("junior")) return "Entry";
    if (lowerExp.includes("mid") || lowerExp.includes("intermediate")) return "Mid";
    if (lowerExp.includes("senior") || lowerExp.includes("lead")) return "Senior";
    return "Mid";
  };

  // ✅ Handle sidebar navigation
  const handleSidebarClick = (menuItem) => {
    setActiveTab(menuItem);
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

  // ✅ Messaging Panel Component (from JobSeekerDashboard)
  const MessagingPanel = () => {
    const handleAttachFile = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.txt';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          console.log('File selected:', file.name);
        }
      };
      input.click();
    };

    return (
      <div className="messaging-overlay">
        <div className="messaging-panel">
          <div className="messaging-header">
            <h3>Messages</h3>
            <button 
              className="close-panel"
              onClick={() => setShowMessagingPanel(false)}
            >
              ×
            </button>
          </div>

          <div className="messaging-container">
            {/* Conversations List */}
            <div className="conversations-list">
              <div className="conversations-header">
                <h4>Conversations</h4>
                <button className="new-conversation-btn">+ New</button>
              </div>
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="conversation-avatar">
                    {conv.otherUserName?.charAt(0) || 'U'}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-name">{conv.otherUserName || 'User'}</div>
                    <div className="conversation-preview">
                      {conv.lastMessage || 'Start a conversation'}
                    </div>
                  </div>
                  {conv.unreadCount?.[(user || firebaseUser)?.uid] > 0 && (
                    <span className="unread-count">{conv.unreadCount[(user || firebaseUser)?.uid]}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Chat Area */}
            <div className="chat-area">
              {selectedConversation ? (
                <>
                  <div className="chat-header">
                    <div className="chat-partner-info">
                      <div className="partner-avatar">
                        {selectedConversation.otherUserName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h4>{selectedConversation.otherUserName || 'User'}</h4>
                        <span className="partner-status">Online</span>
                      </div>
                    </div>
                  </div>

                  <div className="messages-container">
                    {messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`message ${msg.senderId === (user || firebaseUser)?.uid ? 'sent' : 'received'}`}
                      >
                        <div className="message-content">
                          {msg.content}
                          {msg.attachments?.length > 0 && (
                            <div className="message-attachments">
                              {msg.attachments.map((att, idx) => (
                                <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer">
                                  📎 {att.name}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="message-time">
                          {msg.timestamp?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="message-input-container">
                    <button 
                      className="attach-btn"
                      onClick={handleAttachFile}
                      title="Attach file"
                    >
                      📎
                    </button>
                    <input
                      type="text"
                      className="message-input"
                      placeholder="Type your message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button 
                      className="send-btn"
                      onClick={sendMessage}
                      disabled={!messageInput.trim()}
                    >
                      Send
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-conversation-selected">
                  <h4>Select a conversation to start messaging</h4>
                  <p>Or start a new conversation from the list</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ✅ Notification Dropdown Component
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
        prev.map(n => n.id === notification.id ? {...n, read: true} : n)
      );
      setNotificationOpen(false);
    };

    const markAllAsRead = () => {
      setNotifications(prev => prev.map(n => ({...n, read: true})));
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

  return (
    <div className="jobseeker-dashboard-container">
      {/* Top Navigation Bar - Matching JobSeekerDashboard */}
      <nav className="jobseeker-top-navbar">
        <div className="jobseeker-nav-brand">
          <div className="jobseeker-brand-logo" onClick={() => navigate("/jobseeker")}>JobLytics</div>
          <span className="jobseeker-user-welcome">Job Search</span>
        </div>

        <div className="jobseeker-nav-center">
          <ul className="jobseeker-nav-links">
            <li><div onClick={() => navigate("/jobseeker")}>Dashboard</div></li>
            <li><div onClick={() => navigate("/job-search")} className="active">Jobs</div></li>
            <li><div onClick={() => navigate("/job-seeker/applications")}>Applications</div></li>
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
              className={activeTab === "dashboard" ? "active" : ""}
              onClick={() => handleSidebarClick("dashboard")}
            >
              <span className="jobseeker-menu-icon">📊</span>
              <span className="jobseeker-menu-text">Dashboard</span>
            </li>
            <li
              className={activeTab === "jobs" ? "active" : ""}
              onClick={() => handleSidebarClick("jobs")}
            >
              <span className="jobseeker-menu-icon">🔍</span>
              <span className="jobseeker-menu-text">Find Jobs</span>
            </li>
            <li
              className={activeTab === "applications" ? "active" : ""}
              onClick={() => handleSidebarClick("applications")}
            >
              <span className="jobseeker-menu-icon">📄</span>
              <span className="jobseeker-menu-text">Applications</span>
            </li>
            <li
              className={activeTab === "interviews" ? "active" : ""}
              onClick={() => handleSidebarClick("interviews")}
            >
              <span className="jobseeker-menu-icon">🎯</span>
              <span className="jobseeker-menu-text">Interviews</span>
            </li>
            <li
              className={activeTab === "savedJobs" ? "active" : ""}
              onClick={() => handleSidebarClick("savedJobs")}
            >
              <span className="jobseeker-menu-icon">⭐</span>
              <span className="jobseeker-menu-text">Saved Jobs</span>
              {savedJobs.length > 0 && (
                <span className="jobseeker-menu-badge">{savedJobs.length}</span>
              )}
            </li>
            <li
              className={activeTab === "profile" ? "active" : ""}
              onClick={() => handleSidebarClick("profile")}
            >
              <span className="jobseeker-menu-icon">👤</span>
              <span className="jobseeker-menu-text">Profile</span>
            </li>
            <li
              className={activeTab === "messaging" ? "active" : ""}
              onClick={() => handleSidebarClick("messaging")}
            >
              <span className="jobseeker-menu-icon">💬</span>
              <span className="jobseeker-menu-text">Messages</span>
              {stats.unreadMessages > 0 && (
                <span className="jobseeker-menu-badge jobseeker-badge-red">{stats.unreadMessages}</span>
              )}
            </li>
            <li
              className={activeTab === "internet-test" ? "active" : ""}
              onClick={() => handleSidebarClick("internet-test")}
            >
              <span className="jobseeker-menu-icon">🌐</span>
              <span className="jobseeker-menu-text">Internet Test</span>
            </li>
            <li
              className={activeTab === "payment-gateway" ? "active" : ""}
              onClick={() => handleSidebarClick("payment-gateway")}
            >
              <span className="jobseeker-menu-icon">💳</span>
              <span className="jobseeker-menu-text">Payments</span>
            </li>
            <li
              className={activeTab === "settings" ? "active" : ""}
              onClick={() => handleSidebarClick("settings")}
            >
              <span className="jobseeker-menu-icon">⚙️</span>
              <span className="jobseeker-menu-text">Settings</span>
            </li>
          </ul>
        </aside>

        {/* Main Content - Keeping your original design */}
        <main className="jobseeker-main-content">
          {/* Hero Section */}
          <section className="jobs-hero">
            <div className="hero-content">
              <h1>Find Your Dream Career</h1>
              <p>Discover opportunities that match your skills and ambitions</p>
            </div>
          </section>

          {/* Search Section */}
          <section className="search-section-modern">
            <div className="search-container-modern">
              <form onSubmit={handleSearch} className="search-form-modern">
                <div className="search-input-group-modern">
                  <FiSearch className="search-icon-modern" />
                  <input
                    type="text"
                    placeholder="Job title, keyword, or company"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input-modern"
                  />
                </div>
                <div className="search-input-group-modern">
                  <FiMapPin className="search-icon-modern" />
                  <input
                    type="text"
                    placeholder="City, state, or remote"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="search-input-modern"
                  />
                </div>
                <button type="submit" className="search-btn-modern">
                  <FiSearch /> Search Jobs
                </button>
              </form>
            </div>
          </section>

          {/* Quick Filters */}
          <section className="quick-filters-section">
            <div className="quick-filters-container">
              <h3 className="quick-filters-title">
                <FiFilter /> Quick Filters
              </h3>
              <div className="quick-filters-grid">
                <button 
                  className={`quick-filter-btn ${activeFilters.experience === "all" ? "active" : ""}`}
                  onClick={() => handleFilterChange("experience", "all")}
                >
                  All Levels
                </button>
                <button 
                  className={`quick-filter-btn ${activeFilters.experience === "entry" ? "active" : ""}`}
                  onClick={() => handleFilterChange("experience", "entry")}
                >
                  Entry Level
                </button>
                <button 
                  className={`quick-filter-btn ${activeFilters.experience === "mid" ? "active" : ""}`}
                  onClick={() => handleFilterChange("experience", "mid")}
                >
                  Mid Level
                </button>
                <button 
                  className={`quick-filter-btn ${activeFilters.experience === "senior" ? "active" : ""}`}
                  onClick={() => handleFilterChange("experience", "senior")}
                >
                  Senior Level
                </button>
                <button 
                  className={`quick-filter-btn ${activeFilters.remote === "remote" ? "active" : ""}`}
                  onClick={() => handleFilterChange("remote", "remote")}
                >
                  <FiCheckCircle /> Remote
                </button>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <main className="main-content-modern">
            <div className="content-layout">
              {/* Left Column - Filters */}
              <aside className="filters-sidebar">
                <div className="filters-card">
                  <h3 className="filters-title">Advanced Filters</h3>
                  
                  <div className="filter-section">
                    <h4 className="filter-section-title">
                      <FiBriefcase /> Job Type
                    </h4>
                    {["all", "full-time", "part-time", "contract", "internship"].map(type => (
                      <label key={type} className="filter-checkbox">
                        <input
                          type="radio"
                          name="jobType"
                          checked={activeFilters.jobType === type}
                          onChange={() => handleFilterChange("jobType", type)}
                        />
                        <span>{type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}</span>
                      </label>
                    ))}
                  </div>

                  <div className="filter-section">
                    <h4 className="filter-section-title">
                      <FiDollarSign /> Salary Range
                    </h4>
                    {["all", "0-50", "50-100", "100-150", "150+"].map(range => (
                      <label key={range} className="filter-checkbox">
                        <input
                          type="radio"
                          name="salary"
                          checked={activeFilters.salary === range}
                          onChange={() => handleFilterChange("salary", range)}
                        />
                        <span>
                          {range === "all" ? "All Salaries" : 
                           range === "0-50" ? "$0 - $50k" :
                           range === "50-100" ? "$50k - $100k" :
                           range === "100-150" ? "$100k - $150k" : "$150k+"}
                        </span>
                      </label>
                    ))}
                  </div>

                  {isAnyFilterActive() && (
                    <button className="clear-all-filters-btn" onClick={clearAllFilters}>
                      <FiX /> Clear All Filters
                    </button>
                  )}
                </div>

                {/* Saved Jobs Sidebar */}
                <div className="saved-jobs-card">
                  <h3 className="saved-jobs-title">
                    <FiBookmark /> Saved Jobs
                  </h3>
                  <p className="saved-jobs-count">{savedJobs.length} saved</p>
                  <button 
                    className="view-saved-jobs-btn"
                    onClick={() => navigate("/job-seeker/saved-jobs")}
                  >
                    View All Saved
                  </button>
                </div>
              </aside>

              {/* Right Column - Job Listings */}
              <div className="jobs-listing-section">
                {/* Results Header */}
                <div className="results-header">
                  <div className="results-info">
                    <h2 className="results-count">
                      {loading ? (
                        <span className="loading-text">Loading jobs...</span>
                      ) : (
                        `${filteredJobs.length} Jobs Found`
                      )}
                    </h2>
                    {!loading && filteredJobs.length > 0 && (
                      <p className="results-subtitle">
                        Sorted by {sortBy === "mostRecent" ? "Most Recent" : 
                                 sortBy === "salaryHighLow" ? "Salary (High to Low)" :
                                 sortBy === "salaryLowHigh" ? "Salary (Low to High)" : "Most Relevant"}
                      </p>
                    )}
                  </div>
                  
                  <div className="sort-controls">
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="sort-select-modern"
                    >
                      <option value="mostRelevant">Most Relevant</option>
                      <option value="mostRecent">Most Recent</option>
                      <option value="salaryHighLow">Salary: High to Low</option>
                      <option value="salaryLowHigh">Salary: Low to High</option>
                    </select>
                  </div>
                </div>

                {/* Job Cards */}
                <div className="job-cards-modern">
                  {loading ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Loading job opportunities...</p>
                    </div>
                  ) : filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                      <div key={job.id} className="job-card-modern">
                        <div className="job-card-header">
                          <div className="job-card-company">
                            <img 
                              src={job.logo} 
                              alt={job.company} 
                              className="job-card-logo"
                            />
                            <div className="job-card-company-info">
                              <h3 className="job-card-title">{job.title}</h3>
                              <p className="job-card-company-name">{job.company}</p>
                            </div>
                          </div>
                          <button 
                            className={`save-job-btn ${isJobSaved(job.id) ? "saved" : ""}`}
                            onClick={() => handleSaveJob(job)}
                            title={isJobSaved(job.id) ? "Unsave Job" : "Save Job"}
                          >
                            <FiBookmark />
                          </button>
                        </div>

                        <div className="job-card-meta">
                          <span className="job-card-location">
                            <FiMapPin /> {job.location}
                          </span>
                          <span className={`job-card-type ${job.remote ? "remote" : ""}`}>
                            {job.remote ? "Remote" : job.type}
                          </span>
                          <span className="job-card-experience">
                            <FiTrendingUp /> {getExperienceLabel(job.experience)}
                          </span>
                        </div>

                        <p className="job-card-description">
                          {job.description?.substring(0, 120)}...
                        </p>

                        <div className="job-card-footer">
                          <div className="job-card-salary">
                            <FiDollarSign />
                            <span>{job.salary}</span>
                          </div>
                          <div className="job-card-posted">
                            <FiClock />
                            <span>{formatDate(job.postedAt)}</span>
                          </div>
                          <button 
                            className="view-job-btn"
                            onClick={() => handleViewJob(job)}
                          >
                            View Details <FiChevronRight />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <FiSearch size={48} />
                      </div>
                      <h3>No jobs found</h3>
                      <p>Try adjusting your search terms or filters</p>
                      {isAnyFilterActive() && (
                        <button className="clear-filters-btn" onClick={clearAllFilters}>
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* Job Details Modal */}
          {showJobDetails && selectedJob && (
            <div className="modal-overlay" onClick={handleCloseJobDetails}>
              <div className="job-details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-modern">
                  <div className="modal-title-section">
                    <h2>{selectedJob.title}</h2>
                    <p className="modal-company">{selectedJob.company}</p>
                  </div>
                  <button className="modal-close-btn" onClick={handleCloseJobDetails}>
                    <FiX />
                  </button>
                </div>
                
                <div className="modal-content-modern">
                  {/* Basic Info */}
                  <div className="job-basic-info-modern">
                    <div className="job-meta-grid">
                      <div className="meta-item">
                        <FiMapPin />
                        <div>
                          <span className="meta-label">Location</span>
                          <span className="meta-value">{selectedJob.location}</span>
                        </div>
                      </div>
                      <div className="meta-item">
                        <FiBriefcase />
                        <div>
                          <span className="meta-label">Job Type</span>
                          <span className="meta-value">{selectedJob.type}</span>
                        </div>
                      </div>
                      <div className="meta-item">
                        <FiDollarSign />
                        <div>
                          <span className="meta-label">Salary</span>
                          <span className="meta-value">{selectedJob.salary}</span>
                        </div>
                      </div>
                      <div className="meta-item">
                        <FiTrendingUp />
                        <div>
                          <span className="meta-label">Experience</span>
                          <span className="meta-value">{selectedJob.experience}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {hasData(selectedJob.description) && (
                    <div className="detail-section-modern">
                      <h3>Job Description</h3>
                      <p>{selectedJob.description}</p>
                    </div>
                  )}

                  {/* Qualifications */}
                  {hasData(selectedJob.qualifications) && (
                    <div className="detail-section-modern">
                      <h3>Qualifications</h3>
                      <p>{selectedJob.qualifications}</p>
                    </div>
                  )}

                  {/* Requirements */}
                  {hasData(selectedJob.experienceRequired) && (
                    <div className="detail-section-modern">
                      <h3>Requirements</h3>
                      <p>{selectedJob.experienceRequired}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="modal-actions-modern">
                    <button 
                      className="modal-apply-btn"
                      onClick={() => handleApplyJob(selectedJob)}
                    >
                      <FiCheckCircle /> Apply Now
                    </button>
                    <button 
                      className={`modal-save-btn ${isJobSaved(selectedJob.id) ? "saved" : ""}`}
                      onClick={() => handleSaveJob(selectedJob)}
                    >
                      <FiBookmark /> {isJobSaved(selectedJob.id) ? "Saved" : "Save Job"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messaging Panel Overlay */}
          {showMessagingPanel && <MessagingPanel />}

          {/* Footer */}
          <footer className="jobs-footer-modern">
            <div className="footer-content-modern">
              <div className="footer-brand">
                <h3 className="footer-logo">Joblytics</h3>
                <p className="footer-tagline">Connecting talent with opportunity</p>
              </div>
              <div className="footer-links-modern">
                <div className="footer-column">
                  <h4>For Job Seekers</h4>
                  <div onClick={() => navigate("/job-search")}>Browse Jobs</div>
                  <div onClick={() => navigate("/job-seeker/applications")}>Applications</div>
                  <div onClick={() => navigate("/job-seeker/saved-jobs")}>Saved Jobs</div>
                  <div onClick={() => navigate("/jobseeker/profile")}>Profile</div>
                </div>
                <div className="footer-column">
                  <h4>Support</h4>
                  <div onClick={() => navigate("/help")}>Help Center</div>
                  <div onClick={() => navigate("/contact")}>Contact Us</div>
                  <div onClick={() => navigate("/privacy")}>Privacy Policy</div>
                  <div onClick={() => navigate("/terms")}>Terms of Service</div>
                </div>
              </div>
            </div>
            <div className="footer-bottom-modern">
              <p>&copy; {new Date().getFullYear()} Joblytics. All rights reserved.</p>
              <p className="footer-contact">
                <FiMail /> support@joblytics.com | <FiHelpCircle /> Need help?
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Jobs;