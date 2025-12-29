import React, { useState, useEffect, useRef, useCallback } from "react";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc, collection, query, where, getDocs, onSnapshot, addDoc, updateDoc, serverTimestamp, orderBy, limit } from "firebase/firestore";
import "./JobSeekerDashboard.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import ablyService from "../services/ablyService";

// API Configuration
const API_BASE_URL = 'http://localhost:5001';

// AI Service Functions
const aiService = {
  // Chat with AI
  chat: async (message, context) => {
    try {
      console.log('📡 Sending chat request:', { message: message.substring(0, 50) + '...', context: context ? 'Has context' : 'No context' });
      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, context }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ AI Chat Error:', error);
      return { 
        success: false, 
        error: error.message || 'Network error',
        details: 'Failed to connect to AI service'
      };
    }
  },

  // Get job recommendations
  getRecommendations: async (userProfile) => {
    try {
      console.log('📡 Sending recommendations request:', { 
        skills: userProfile.skills?.length || 0,
        location: userProfile.location || 'Not specified'
      });
      
      const response = await fetch(`${API_BASE_URL}/api/ai/recommend-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: userProfile.skills || [],
          experience: userProfile.experience || 'Not specified',
          location: userProfile.location || 'Nigeria',
          education: userProfile.education || 'Not specified',
          preferences: userProfile.preferences || 'Remote work preferred'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ AI Recommendations Error:', error);
      return { 
        success: false, 
        error: error.message || 'Network error' 
      };
    }
  },

  // Get notification insights
  getNotificationInsights: async (notifications) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/notification-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notifications }),
      });
      return await response.json();
    } catch (error) {
      console.error('AI Insights Error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  // Match skills to jobs
  matchSkills: async (skills) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/match-skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skills }),
      });
      return await response.json();
    } catch (error) {
      console.error('Skills Matching Error:', error);
      return { success: false, error: 'Network error' };
    }
  },
  
  // Enhanced: Match real Firebase jobs with user profile
  matchJobsWithProfile: async (userProfile, allJobs) => {
    try {
      console.log('🎯 Matching profile with', allJobs.length, 'real jobs');
      const response = await fetch(`${API_BASE_URL}/api/ai/match-jobs-intelligent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: {
            skills: userProfile.skills || [],
            experience: userProfile.experience || 'Not specified',
            location: userProfile.location || 'Nigeria',
            education: userProfile.education || 'Not specified',
            preferences: userProfile.preferences || {}
          },
          jobs: allJobs.map(job => ({
            id: job.id,
            title: job.title,
            employerName: job.employerName,
            location: job.location,
            experienceRequired: job.experienceRequired,
            minExperience: job.minExperience,
            jobStatus: job.jobStatus,
            qualifications: job.qualifications,
            status: job.status
          }))
        }),
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Job Matching Error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get career analytics
  analyzeProfile: async (userProfile, applications, savedJobs) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/analyze-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: userProfile,
          applicationCount: applications.length,
          savedJobsCount: savedJobs.length,
          recentApplications: applications.slice(0, 5)
        }),
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Profile Analysis Error:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate resume content
  generateResumeContent: async (userProfile) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: userProfile }),
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Resume Generation Error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get personalized career tips
  getCareerTips: async (userProfile, analytics) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/career-tips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProfile, analytics }),
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Career Tips Error:', error);
      return { success: false, error: error.message };
    }
  }
};

const JobSeekerDashboard = ({ user, setUser }) => {
  const [stats, setStats] = useState({
    applications: 0,
    interviews: 0,
    offers: 0,
    savedJobs: 0,
    unreadMessages: 0,
    upcomingInterviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [showMessagingPanel, setShowMessagingPanel] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [notificationInsights, setNotificationInsights] = useState(null);
  const [smartNotifications, setSmartNotifications] = useState([]);
  const [notificationIntelligence, setNotificationIntelligence] = useState(null);
  const [messageSummary, setMessageSummary] = useState(null);
  const [lastNotificationUpdate, setLastNotificationUpdate] = useState(null);
  const [notificationLoading, setNotificationLoading] = useState(false);


  const [skillAnalysis, setSkillAnalysis] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [aiMatchedJobs, setAiMatchedJobs] = useState([]);
  const [profileAnalysis, setProfileAnalysis] = useState(null);
  const [careerTips, setCareerTips] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showResumeBuilder, setShowResumeBuilder] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  
  // ============ ABLY-ONLY MESSAGING STATE ============
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [ablyConnected, setAblyConnected] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Initialize Ably when user loads
  useEffect(() => {
    const initializeAbly = async () => {
      if (!user) return;
      
      try {
        // Get Ably API key from environment
        const apiKey = import.meta.env.VITE_ABLY_API_KEY;
        if (!apiKey) {
          console.error('❌ Ably API key not found in environment variables');
          return;
        }
        
        await ablyService.initialize(user.uid, apiKey);
        setAblyConnected(true);
        console.log('✅ Ably initialized successfully');
        
        // Load conversations (in-memory for now)
        const userConversations = ablyService.getConversations(user.uid);
        setConversations(userConversations);
        
      } catch (error) {
        console.error('❌ Failed to initialize Ably:', error);
      }
    };

    initializeAbly();

    // Cleanup on unmount
    return () => {
      ablyService.disconnect();
    };
  }, [user]);

  // Fetch user data from Firestore
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

  // Fetch application and saved jobs stats
  useEffect(() => {
    const fetchApplicationData = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('userId', '==', user.uid)
        );
        const applicationsSnap = await getDocs(applicationsQuery);
        const applicationsData = applicationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setApplications(applicationsData);

        const savedJobsSnap = await getDocs(query(
          collection(db, 'savedJobs'),
          where('userId', '==', user.uid)
        ));
        const savedJobsData = savedJobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSavedJobs(savedJobsData);

        // Fetch upcoming interviews
        const interviewsQuery = query(
          collection(db, 'interviews'),
          where('userId', '==', user.uid),
          where('status', '==', 'scheduled')
        );
        const interviewsSnap = await getDocs(interviewsQuery);
        const upcomingInterviews = interviewsSnap.docs.filter(doc => {
          const interviewDate = doc.data().scheduledTime?.toDate();
          return interviewDate > new Date();
        });

        // Update unread messages count from conversations
            const unreadMessagesCount = conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);

               // ADD THIS SECTION:
      // Calculate notification statistics
      const allNotifications = [...smartNotifications, ...notifications];
      const unreadNotificationsCount = allNotifications.filter(n => !n.read).length;
      const highPriorityNotifications = allNotifications.filter(n => !n.read && n.priority === 'high').length;

        setStats({
          applications: applicationsData.length,
          interviews: applicationsData.filter(app => app.status === 'interview').length,
          offers: applicationsData.filter(app => app.status === 'offer').length,
          savedJobs: savedJobsData.length,
          unreadMessages: unreadMessagesCount,
          upcomingInterviews: upcomingInterviews.length
        });
      } catch (error) {
        console.error('Error fetching application data:', error);
      } finally {
        setLoading(false);
      }
    };

  fetchApplicationData();
}, [user, conversations, smartNotifications, notifications]); // ADD smartNotifications, notifications to dependencies

  // ========================================
  // ADD THIS useEffect to fetch ALL jobs from Firebase:
  // ========================================
  useEffect(() => {
    const fetchAllJobs = async () => {
      try {
        console.log('📥 Fetching all jobs from Firebase...');
        const jobsQuery = query(
          collection(db, 'jobs'),
          where('status', '==', 'open'),
          limit(100)
        );
        
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsData = jobsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('✅ Fetched', jobsData.length, 'jobs from Firebase');
        setAllJobs(jobsData);
      } catch (error) {
        console.error('❌ Error fetching jobs:', error);
        // Try without orderBy if index is missing
        try {
          const fallbackQuery = query(
            collection(db, 'jobs'),
            where('status', '==', 'open'),
            limit(100)
          );
          const jobsSnapshot = await getDocs(fallbackQuery);
          const jobsData = jobsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log('✅ Fetched', jobsData.length, 'jobs (fallback)');
          setAllJobs(jobsData);
        } catch (fallbackError) {
          console.error('❌ Fallback fetch also failed:', fallbackError);
        }
      }
    };

    fetchAllJobs();
  }, []);

  // ========================================
  // REPLACE your existing "Fetch AI-powered recommendations" useEffect with this:
  // ========================================
  useEffect(() => {
    const matchJobsWithAI = async () => {
      if (!user || allJobs.length === 0) return;
      
      setRecommendationsLoading(true);
      try {
        const userProfile = {
          skills: user.skills || ['JavaScript', 'React', 'Node.js'],
          experience: user.experience || 'Not specified',
          location: user.location || 'Nigeria',
          preferences: user.jobPreferences || {},
          education: user.education || 'Not specified'
        };

        console.log('🤖 Sending', allJobs.length, 'real jobs to AI for matching...');
        
        // Use the new intelligent matching
        const result = await aiService.matchJobsWithProfile(userProfile, allJobs);
        
        if (result.success && result.matchedJobs) {
          console.log('✅ AI matched', result.matchedJobs.length, 'jobs');
          setAiRecommendations(result.matchedJobs.slice(0, 10));
          
          if (result.insights) {
            setProfileAnalysis(result.insights);
          }
        } else {
          console.warn('AI matching failed, showing all jobs');
          // Fallback to showing all jobs
          const fallbackJobs = allJobs.slice(0, 10).map(job => ({
            ...job,
            matchScore: 75,
            whyItFits: "Based on your profile and location"
          }));
          setAiRecommendations(fallbackJobs);
        }
      } catch (error) {
        console.error('Error in AI job matching:', error);
        setAiRecommendations(allJobs.slice(0, 10));
      } finally {
        setRecommendationsLoading(false);
      }
    };

    matchJobsWithAI();
  }, [user, allJobs]);





  // ========================================
// ADD THIS useEffect for smart notifications
// ========================================
useEffect(() => {
  const generateSmartNotifications = async () => {
    if (!user || notificationLoading) return;
    
    // Only update every 30 minutes
    if (lastNotificationUpdate && 
        Date.now() - lastNotificationUpdate < 30 * 60 * 1000) {
      return;
    }

    setNotificationLoading(true);
    try {
      // Prepare data for AI analysis
      const notificationData = {
        userProfile: {
          skills: user.skills || [],
          experience: user.experience || 'Not specified',
          location: user.location || 'Nigeria',
          preferences: user.preferences || {}
        },
        notifications: notifications.slice(0, 10),
        applications: applications,
        savedJobs: savedJobs,
        jobMatches: aiMatchedJobs.slice(0, 5),
        messages: messages.filter(msg => !msg.read)
      };

      // Get intelligent notifications
      const response = await fetch(`${API_BASE_URL}/api/ai/notification-intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setNotificationIntelligence(result.insights);
          
          // Merge AI-generated notifications with existing ones
          const aiNotifications = result.notifications.map(notif => ({
            id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            priority: notif.priority,
            actionUrl: notif.actionUrl,
            icon: notif.icon,
            data: notif.data,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false,
            source: 'ai'
          }));

          setSmartNotifications(prev => {
            // Remove old AI notifications and add new ones
            const filtered = prev.filter(n => n.source !== 'ai');
            return [...aiNotifications, ...filtered].slice(0, 20);
          });
        }
      }

      // Get message summary
      const unreadMessages = conversations.reduce((acc, conv) => {
        return acc + (conv.unreadCount || 0);
      }, 0);

      if (unreadMessages > 0) {
        const summaryResponse = await fetch(`${API_BASE_URL}/api/ai/summarize-messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: messages.filter(msg => !msg.read) }),
        });

        if (summaryResponse.ok) {
          const summaryResult = await summaryResponse.json();
          if (summaryResult.success) {
            setMessageSummary(summaryResult);
          }
        }
      }

      setLastNotificationUpdate(Date.now());
    } catch (error) {
      console.error('❌ Smart notifications error:', error);
    } finally {
      setNotificationLoading(false);
    }
  };

  generateSmartNotifications();
}, [user, notifications, applications, savedJobs, aiMatchedJobs, conversations, messages]);

// ========================================
// ADD real-time listeners for new events
// ========================================
useEffect(() => {
  if (!user) return;

  // Listen for new jobs that might match user profile
  const jobsQuery = query(
    collection(db, 'jobs'),
    where('status', '==', 'open'),
    orderBy('createdAt', 'desc'),
    limit(10)
  );

  const unsubscribeJobs = onSnapshot(jobsQuery, async (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const job = { id: change.doc.id, ...change.doc.data() };
        
        // Simple check if job matches user skills
        const userSkills = user.skills || [];
        const jobSkills = job.requiredSkills || job.skills || [];
        const matchCount = userSkills.filter(skill => 
          jobSkills.some(jobSkill => 
            jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(jobSkill.toLowerCase())
          )
        ).length;

        if (matchCount >= 2) {
          const notification = {
            id: `job_${job.id}`,
            type: 'job_match',
            title: 'New Job Match Found!',
            message: `${job.title} at ${job.employerName} matches ${matchCount} of your skills`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false,
            priority: 'high',
            icon: '🎯',
            actionUrl: `/job-details/${job.id}`,
            data: { jobId: job.id, matchCount }
          };

          setSmartNotifications(prev => [notification, ...prev.slice(0, 19)]);
        }
      }
    });
  });

  // Listen for new messages
  const handleNewMessage = (message) => {
    if (message.senderId !== user.uid) {
      const notification = {
        id: `msg_${message.id}`,
        type: 'message',
        title: 'New Message',
        message: `From ${message.senderName}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        priority: 'medium',
        icon: '💬',
        actionUrl: '/messaging',
        data: { conversationId: selectedConversation?.id, messageId: message.id }
      };

      setSmartNotifications(prev => [notification, ...prev.slice(0, 19)]);
    }
  };

  // Listen for interview updates
  const interviewsQuery = query(
    collection(db, 'interviews'),
    where('userId', '==', user.uid),
    orderBy('scheduledTime', 'desc')
  );

  const unsubscribeInterviews = onSnapshot(interviewsQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added' || change.type === 'modified') {
        const interview = { id: change.doc.id, ...change.doc.data() };
        
        let notification = null;
        
        switch (interview.status) {
          case 'scheduled':
            notification = {
              id: `interview_${interview.id}`,
              type: 'interview',
              title: 'Interview Scheduled',
              message: `Interview for ${interview.jobTitle} at ${interview.scheduledTime?.toDate().toLocaleDateString()}`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: false,
              priority: 'high',
              icon: '📅',
              actionUrl: '/schedule-interview',
              data: { interviewId: interview.id, jobTitle: interview.jobTitle }
            };
            break;
          
          case 'completed':
            notification = {
              id: `interview_done_${interview.id}`,
              type: 'interview',
              title: 'Interview Completed',
              message: `Your interview for ${interview.jobTitle} has been completed`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: false,
              priority: 'medium',
              icon: '✅',
              actionUrl: '/applications',
              data: { interviewId: interview.id }
            };
            break;
          
          case 'cancelled':
            notification = {
              id: `interview_cancel_${interview.id}`,
              type: 'interview',
              title: 'Interview Cancelled',
              message: `Interview for ${interview.jobTitle} has been cancelled`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: false,
              priority: 'medium',
              icon: '❌',
              actionUrl: '/applications',
              data: { interviewId: interview.id }
            };
            break;
        }

        if (notification) {
          setSmartNotifications(prev => [notification, ...prev.slice(0, 19)]);
        }
      }
    });
  });

  // Listen for application status changes
  const applicationsQuery = query(
    collection(db, 'applications'),
    where('userId', '==', user.uid),
    orderBy('appliedDate', 'desc')
  );

  const unsubscribeApplications = onSnapshot(applicationsQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'modified') {
        const application = { id: change.doc.id, ...change.doc.data() };
        
        let notification = null;
        
        switch (application.status) {
          case 'hired':
            notification = {
              id: `hired_${application.id}`,
              type: 'hiring',
              title: '🎉 Congratulations! You\'re Hired!',
              message: `You've been hired for ${application.jobTitle} at ${application.companyName}`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: false,
              priority: 'high',
              icon: '🎉',
              actionUrl: `/applications/${application.id}`,
              data: { applicationId: application.id }
            };
            break;
          
          case 'offer':
            notification = {
              id: `offer_${application.id}`,
              type: 'hiring',
              title: 'Job Offer Received!',
              message: `You received an offer for ${application.jobTitle}`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: false,
              priority: 'high',
              icon: '💰',
              actionUrl: `/applications/${application.id}`,
              data: { applicationId: application.id }
            };
            break;
          
          case 'rejected':
            notification = {
              id: `rejected_${application.id}`,
              type: 'application_update',
              title: 'Application Update',
              message: `Update on ${application.jobTitle}: Not selected for this position`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: false,
              priority: 'medium',
              icon: 'ℹ️',
              actionUrl: `/applications/${application.id}`,
              data: { applicationId: application.id }
            };
            break;
        }

        if (notification) {
          setSmartNotifications(prev => [notification, ...prev.slice(0, 19)]);
        }
      }
    });
  });

  return () => {
    unsubscribeJobs();
    unsubscribeInterviews();
    unsubscribeApplications();
  };
}, [user, selectedConversation]);

  // ========================================
  // ADD THIS useEffect for analytics generation:
  // ========================================
  useEffect(() => {
    const generateAnalytics = async () => {
      if (!user || applications.length === 0) return;
      
      try {
        const userProfile = {
          skills: user.skills || [],
          experience: user.experience || 'Not specified',
          location: user.location || 'Nigeria',
          education: user.education || 'Not specified'
        };

        const result = await aiService.analyzeProfile(userProfile, applications, savedJobs);
        
        if (result.success) {
          setAnalytics(result.analytics);
          
          // Get career tips based on analytics
          const tipsResult = await aiService.getCareerTips(userProfile, result.analytics);
          if (tipsResult.success && tipsResult.tips) {
            setCareerTips(tipsResult.tips);
          }
        }
      } catch (error) {
        console.error('Error generating analytics:', error);
      }
    };

    generateAnalytics();
  }, [user, applications, savedJobs]);

  // Real-time notifications listener with AI insights
  useEffect(() => {
    if (!user) return;

    const interviewsQuery = query(
      collection(db, 'interviews'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(interviewsQuery, async (snapshot) => {
      const newNotifications = [];
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const interviewData = change.doc.data();
          newNotifications.push({
            id: change.doc.id,
            type: 'interview',
            title: 'Interview Update',
            message: `Interview for ${interviewData.jobTitle} - ${interviewData.status}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false,
            interviewId: change.doc.id
          });
        }
      });

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev.slice(0, 9)]);
        
        // Get AI insights for new notifications
        const insights = await aiService.getNotificationInsights([...newNotifications, ...notifications.slice(0, 3)]);
        if (insights.success) {
          setNotificationInsights(insights);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation || !user || !ablyConnected) return;

    const loadMessages = async () => {
      try {
        const history = await ablyService.joinConversation(
          selectedConversation.id,
          (message) => {
            // New message received
            setMessages(prev => [...prev, message]);
            
            // Update conversation last message
            setConversations(prev => prev.map(conv => 
              conv.id === selectedConversation.id 
                ? { 
                    ...conv, 
                    lastMessage: message.content, 
                    lastMessageTime: Date.now(),
                    unreadCount: conv.participants.filter(p => p !== user.uid).length
                  }
                : conv
            ));
          },
          (typingData) => {
            // Handle typing indicators
            if (typingData.userId !== user.uid) {
              setTypingUsers(prev => ({
                ...prev,
                [typingData.userId]: typingData.isTyping
              }));
              
              // Clear typing indicator after 3 seconds
              setTimeout(() => {
                setTypingUsers(prev => {
                  const updated = {...prev};
                  delete updated[typingData.userId];
                  return updated;
                });
              }, 3000);
            }
          },
          (action, member) => {
            // Handle presence (who's online)
            if (action === 'enter') {
              setOnlineUsers(prev => [...prev, member.clientId]);
            } else if (action === 'leave') {
              setOnlineUsers(prev => prev.filter(id => id !== member.clientId));
            }
          }
        );
        
        setMessages(history);
      } catch (error) {
        console.error('Error joining conversation:', error);
      }
    };

    loadMessages();

    // Cleanup when conversation changes
    return () => {
      setMessages([]);
      setTypingUsers({});
    };
  }, [selectedConversation, user, ablyConnected]);

  const handleStatClick = (statType) => {
    if (statType === 'applications' || statType === 'interviews') {
      navigate("/job-seeker/applications");
    } else if (statType === 'savedJobs') {
      navigate("/job-seeker/saved-jobs");
    } else if (statType === 'unreadMessages') {
      setShowMessagingPanel(true);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'searchJobs':
        navigate("/job-search");
        break;
      case 'updateProfile':
        navigate("/jobseeker/profile");
        break;
      case 'viewApplications':
        navigate("/job-seeker/applications");
        break;
      case 'scheduleInterview':
        navigate("/schedule-interview");
        break;
      case 'buildResume':
        setShowResumeBuilder(true);
        break;
      case 'viewAnalytics':
        setShowAnalytics(true);
        break;
      case 'messaging':
        setShowMessagingPanel(true);
        break;
      case 'aiAnalysis':
        if (skillAnalysis) {
          navigate("/skill-analysis", { state: { analysis: skillAnalysis } });
        }
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    localStorage.removeItem("user");
    navigate('/login');
  };

  // ABLY-ONLY MESSAGING FUNCTIONS
  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !user) return;

    try {
      const messageId = `msg_${Date.now()}_${user.uid}`;
      const messageData = {
        id: messageId,
        senderId: user.uid,
        content: messageInput.trim(),
        timestamp: Date.now(),
        read: false,
        senderName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
      };

      // Send via Ably
      await ablyService.sendMessage(selectedConversation.id, messageData);
      
      // Update conversation last message
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { 
              ...conv, 
              lastMessage: messageInput.trim(),
              lastMessageTime: Date.now(),
              unreadCount: conv.participants.filter(p => p !== user.uid).length
            }
          : conv
      ));

      setMessageInput("");
      
      // Clear typing status
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      ablyService.sendTypingIndicator(selectedConversation.id, user.uid, false);
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleTyping = useCallback(() => {
    if (!selectedConversation || !user) return;
    
    ablyService.sendTypingIndicator(selectedConversation.id, user.uid, true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      ablyService.sendTypingIndicator(selectedConversation.id, user.uid, false);
    }, 2000);
  }, [selectedConversation, user]);

  const handleScheduleInterview = async (conversationId, employerId) => {
    navigate('/schedule-interview', { 
      state: { 
        conversationId, 
        employerId,
        fromMessaging: true 
      } 
    });
  };

  const handleSidebarClick = (menuItem) => {
    setActiveTab(menuItem);
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
        navigate("/job-seeker/saved-jobs");
        break;
      case "profile":
        navigate("/jobseeker/profile");
        break;
      case "settings":
        navigate("/settings");
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
      case "itin-support":
        navigate("/itin-support");
        break;
      case "tax-guidance":
        navigate("/tax-guidance");
        break;
      case "community":
        navigate("/community");
        break;
      default:
        break;
    }
  };

  const handleFileUpload = async (file) => {
    if (!selectedConversation || !user || !file) return;
    
    // Check file size (Ably free tier: 64KB per message)
    const MAX_SIZE = 64 * 1024; // 64KB
    if (file.size > MAX_SIZE) {
      alert(`File is too large. Maximum size is 64KB for Ably free tier.`);
      return;
    }
    
    try {
      // Convert file to Base64
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const base64Data = e.target.result;
        
        const fileData = {
          id: `file_${Date.now()}_${user.uid}`,
          senderId: user.uid,
          content: '',
          timestamp: Date.now(),
          read: false,
          senderName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          attachments: [{
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64Data
          }]
        };
        
        // Send via Ably
        await ablyService.sendFile(selectedConversation.id, fileData);
        
        // Update conversation
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { 
                ...conv, 
                lastMessage: `Sent a file: ${file.name}`,
                lastMessageTime: Date.now(),
                unreadCount: conv.participants.filter(p => p !== user.uid).length
              }
            : conv
        ));
      };
      
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Failed to read file.');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file.');
    }
  };

  const createNewConversation = async (otherUserId, otherUserName) => {
    if (!user) return;
    
    try {
      const conversation = await ablyService.createConversation(
        user.uid, 
        otherUserId, 
        otherUserName
      );
      
      setConversations(prev => [...prev, conversation]);
      setSelectedConversation(conversation);
      setShowNewChatModal(false);
      setSearchQuery('');
      setSearchResults([]);
      
      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to create conversation. Please try again.');
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      // Search in Firestore users collection
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('uid', '!=', user.uid),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      const results = snapshot.docs
        .map(doc => ({
          id: doc.id,
          uid: doc.data().uid,
          displayName: doc.data().displayName || 
                     `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim() || 
                     doc.data().email,
          email: doc.data().email,
          photoURL: doc.data().photoURL,
          ...doc.data()
        }))
        .filter(user => 
          user.displayName.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
        );
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    }
  };

  // ========================================
  // ADD Resume Builder Component:
  // ========================================
  const ResumeBuilderModal = () => {
    const [resumeData, setResumeData] = useState(null);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
      if (showResumeBuilder && user) {
        setResumeData({
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email || '',
          phone: user.phone || '',
          location: user.location || '',
          summary: user.bio || '',
          skills: user.skills || [],
          experience: user.workExperience || [],
          education: user.education || []
        });
      }
    }, [showResumeBuilder, user]);

    const generateWithAI = async () => {
      setGenerating(true);
      try {
        const result = await aiService.generateResumeContent(user);
        if (result.success) {
          setResumeData(prev => ({
            ...prev,
            summary: result.summary || prev.summary,
            skills: result.skills || prev.skills
          }));
          alert('✅ Resume enhanced with AI!');
        }
      } catch (error) {
        console.error('Error generating resume:', error);
        alert('❌ Failed to enhance resume');
      } finally {
        setGenerating(false);
      }
    };

    if (!showResumeBuilder) return null;

    return (
      <div className="resume-builder-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="resume-builder-panel" style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <div className="resume-builder-header" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2>📄 AI Resume Builder</h2>
            <button 
              onClick={() => setShowResumeBuilder(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '28px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={generateWithAI}
              disabled={generating}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: generating ? 'not-allowed' : 'pointer',
                marginRight: '10px'
              }}
            >
              {generating ? '⏳ Generating...' : '🤖 AI Enhance'}
            </button>
            <button
              onClick={() => alert('PDF download - integrate jsPDF library here')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              📥 Download PDF
            </button>
          </div>

          <div className="resume-preview" style={{
            border: '1px solid #ddd',
            padding: '30px',
            borderRadius: '8px',
            backgroundColor: '#fff'
          }}>
            <h1 style={{ marginBottom: '10px' }}>{resumeData?.fullName || 'Your Name'}</h1>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              {resumeData?.email} | {resumeData?.phone} | {resumeData?.location}
            </p>

            {resumeData?.summary && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '10px' }}>Professional Summary</h3>
                <p>{resumeData.summary}</p>
              </div>
            )}

            {resumeData?.skills && resumeData.skills.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '10px' }}>Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {resumeData.skills.map((skill, idx) => (
                    <span key={idx} style={{
                      padding: '5px 12px',
                      backgroundColor: '#e3f2fd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {resumeData?.education && (
              <div>
                <h3 style={{ marginBottom: '10px' }}>Education</h3>
                <p>{resumeData.education}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ========================================
  // ADD Analytics Modal Component:
  // ========================================
  const AnalyticsModal = () => {
    if (!showAnalytics) return null;

    return (
      <div className="analytics-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="analytics-panel" style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '900px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2>📊 Career Analytics</h2>
            <button 
              onClick={() => setShowAnalytics(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '28px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>Application Stats</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>{stats.applications}</div>
              <p>Total Applications</p>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Interview Rate: {stats.applications > 0 ? Math.round((stats.interviews / stats.applications) * 100) : 0}%
              </p>
            </div>

            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>Profile Strength</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>
                {analytics?.profileStrength ? parseInt(analytics.profileStrength) : 75}%
              </div>
              <p>Your profile score</p>
            </div>

            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>Market Demand</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>
                {analytics?.marketDemand || 'Medium'}
              </div>
              <p>For your skills</p>
            </div>
          </div>

          {careerTips.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '15px' }}>🤖 AI Career Tips</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {careerTips.map((tip, idx) => (
                  <div key={idx} style={{
                    padding: '15px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    borderLeft: '4px solid #4CAF50'
                  }}>
                    <strong>{idx + 1}.</strong> {tip}
                  </div>
                ))}
              </div>
            </div>
          )}

          {analytics?.skillGaps && analytics.skillGaps.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h3>Skills to Develop</h3>
              <ul style={{ marginTop: '10px' }}>
                {analytics.skillGaps.map((skill, idx) => (
                  <li key={idx} style={{ padding: '8px 0' }}>{skill}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Notification Dropdown Component with AI Insights
 // Enhanced Notification Dropdown Component
const NotificationDropdown = () => {
  // Combine regular notifications with smart notifications
  const allNotifications = [...smartNotifications, ...notifications].slice(0, 20);
  const unreadCount = allNotifications.filter(n => !n.read).length;
  const highPriorityCount = allNotifications.filter(n => !n.read && n.priority === 'high').length;

  const toggleDropdown = () => {
    setNotificationOpen(!notificationOpen);
    if (!notificationOpen) {
      // Refresh smart notifications when opening
      setLastNotificationUpdate(0);
    }
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
    // Mark as read
    if (notification.source === 'ai') {
      setSmartNotifications(prev => 
        prev.map(n => n.id === notification.id ? {...n, read: true} : n)
      );
    } else {
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? {...n, read: true} : n)
      );
    }

    // Navigate based on actionUrl
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    } else if (notification.type === 'interview') {
      navigate('/schedule-interview');
    } else if (notification.type === 'message') {
      setShowMessagingPanel(true);
    } else if (notification.type === 'job_match' && notification.data?.jobId) {
      navigate(`/job-details/${notification.data.jobId}`);
    }

    setNotificationOpen(false);
  };

  const markAllAsRead = () => {
    setSmartNotifications(prev => prev.map(n => ({...n, read: true})));
    setNotifications(prev => prev.map(n => ({...n, read: true})));
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'job_match': return '🎯';
      case 'interview': return '📅';
      case 'message': return '💬';
      case 'hiring': return '💰';
      case 'application_update': return '📄';
      case 'profile': return '👤';
      case 'reminder': return '⏰';
      default: return '🔔';
    }
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
          <span className="notification-badge">
            {highPriorityCount > 0 ? '❗' : unreadCount}
          </span>
        )}
      </button>

      <div className={`notification-dropdown ${notificationOpen ? 'open' : ''}`}>
        <div className="notification-header">
          <div className="notification-header-left">
            <h3>Notifications</h3>
            {notificationIntelligence && (
              <span className="notification-ai-badge" title="AI-Powered">
                🤖 Smart
              </span>
            )}
          </div>
          <div className="notification-header-right">
            {messageSummary && messageSummary.urgent && (
              <span className="notification-urgent-badge" title="Urgent messages">
                🔥 Urgent
              </span>
            )}
            <button 
              className="mark-all-read"
              onClick={markAllAsRead}
            >
              Mark all read
            </button>
          </div>
        </div>

        {/* AI Insights Panel */}
        {notificationIntelligence && (
          <div className="ai-insights-panel">
            <div className="ai-insights-header">
              <span className="ai-icon">🤖</span>
              <h4>Notification Insights</h4>
            </div>
            <p className="ai-summary">{notificationIntelligence.unreadSummary}</p>
            {notificationIntelligence.suggestedActions && notificationIntelligence.suggestedActions.length > 0 && (
              <div className="ai-actions">
                {notificationIntelligence.suggestedActions.slice(0, 2).map((action, idx) => (
                  <button key={idx} className="ai-action-btn" onClick={() => {
                    if (action.includes('profile')) navigate('/jobseeker/profile');
                    else if (action.includes('apply')) navigate('/job-search');
                    else if (action.includes('message')) setShowMessagingPanel(true);
                  }}>
                    {action}
                  </button>
                ))}
              </div>
            )}
            <div className="ai-priority-stats">
              <span className="priority-stat high">
                🔴 {notificationIntelligence.priorityCount?.high || 0} High
              </span>
              <span className="priority-stat medium">
                🟡 {notificationIntelligence.priorityCount?.medium || 0} Medium
              </span>
              <span className="priority-stat low">
                🟢 {notificationIntelligence.priorityCount?.low || 0} Low
              </span>
            </div>
          </div>
        )}

        {/* Message Summary */}
        {messageSummary && messageSummary.count > 0 && (
          <div className={`message-summary-panel ${messageSummary.urgent ? 'urgent' : ''}`}>
            <div className="message-summary-header">
              <span className="message-icon">💬</span>
              <span className="message-count">{messageSummary.count} unread message{messageSummary.count !== 1 ? 's' : ''}</span>
              {messageSummary.urgent && <span className="urgent-indicator">URGENT</span>}
            </div>
            <p className="message-summary-text">{messageSummary.summary}</p>
            {messageSummary.senders && messageSummary.senders.length > 0 && (
              <p className="message-senders">From: {messageSummary.senders.join(', ')}</p>
            )}
            <button 
              className="view-messages-btn"
              onClick={() => {
                setShowMessagingPanel(true);
                setNotificationOpen(false);
              }}
            >
              View Messages
            </button>
          </div>
        )}

        {/* Notification Categories */}
        <div className="notification-categories">
          <button className="category-btn active">All</button>
          <button className="category-btn">High Priority</button>
          <button className="category-btn">Jobs</button>
          <button className="category-btn">Messages</button>
        </div>

        <div className="notification-list">
          {allNotifications.length === 0 ? (
            <div className="notification-item empty">
              <div className="notification-content">
                <div className="notification-title">No notifications</div>
                <div className="notification-message">You're all caught up!</div>
              </div>
            </div>
          ) : (
            allNotifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${notification.read ? '' : 'unread'} priority-${notification.priority || 'medium'}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon-col">
                  <span className="notification-type-icon">
                    {notification.icon || getTypeIcon(notification.type)}
                  </span>
                  <span className="notification-priority-icon">
                    {getPriorityIcon(notification.priority)}
                  </span>
                </div>
                <div className="notification-content">
                  <div className="notification-title-row">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-time">{notification.time}</div>
                  </div>
                  <div className="notification-message">{notification.message}</div>
                  {notification.data?.matchScore && (
                    <div className="notification-match-score">
                      <span className="match-label">Match:</span>
                      <span className="match-value">{notification.data.matchScore}%</span>
                    </div>
                  )}
                  {notification.source === 'ai' && (
                    <span className="ai-generated-badge">AI Suggested</span>
                  )}
                </div>
                {!notification.read && <div className="unread-dot"></div>}
              </div>
            ))
          )}
        </div>

        {/* Notification Footer */}
        <div className="notification-footer">
          <button 
            className="notification-settings-btn"
            onClick={() => navigate('/settings?tab=notifications')}
          >
            ⚙️ Notification Settings
          </button>
          <button 
            className="refresh-notifications-btn"
            onClick={() => setLastNotificationUpdate(0)}
            disabled={notificationLoading}
          >
            {notificationLoading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>
    </div>
  );
};

  // ============ UPDATED MESSAGING PANEL (Ably-only) ============
  const MessagingPanel = () => {
    const messagesEndRef = useRef(null);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleAttachFile = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png';
      input.multiple = false;
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          await handleFileUpload(file);
        }
      };
      input.click();
    };

    const getOtherParticipantName = (conv) => {
      if (!conv || !user) return 'User';
      const otherId = conv.participants?.find(p => p !== user.uid);
      return conv.participantNames?.[otherId] || 'User';
    };

    const getOtherParticipantId = (conv) => {
      if (!conv || !user) return null;
      return conv.participants?.find(p => p !== user.uid);
    };

    const renderTypingIndicator = () => {
      if (Object.keys(typingUsers).length === 0) return null;
      
      const otherParticipantName = getOtherParticipantName(selectedConversation);
      return (
        <div className="typing-indicator-container">
          <div className="typing-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <span>{otherParticipantName} is typing...</span>
        </div>
      );
    };

    const renderOnlineStatus = () => {
      if (!selectedConversation || !user) return null;
      const otherId = getOtherParticipantId(selectedConversation);
      const isOnline = onlineUsers.includes(otherId);
      
      return (
        <span className={`partner-status ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? '● Online' : '○ Offline'}
        </span>
      );
    };

    if (!showMessagingPanel) return null;

    return (
      <div className="messaging-overlay">
        <div className="messaging-panel">
          <div className="messaging-header">
            <h3>Messages {!ablyConnected && <span className="connection-badge">(Connecting...)</span>}</h3>
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
                <button 
                  className="new-conversation-btn"
                  onClick={() => setShowNewChatModal(true)}
                >
                  + New
                </button>
              </div>
              
              <div className="conversations-scroll">
                {conversations.map(conv => {
                  const otherUserName = getOtherParticipantName(conv);
                  const lastMessageTime = new Date(conv.lastMessageTime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                  
                  return (
                    <div
                      key={conv.id}
                      className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div className="conversation-avatar">
                        {otherUserName.charAt(0).toUpperCase()}
                      </div>
                      <div className="conversation-info">
                        <div className="conversation-name-row">
                          <div className="conversation-name">{otherUserName}</div>
                          <div className="conversation-time">{lastMessageTime}</div>
                        </div>
                        <div className="conversation-preview">
                          {conv.lastMessage || 'Start a conversation'}
                        </div>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="unread-count">{conv.unreadCount}</span>
                      )}
                    </div>
                  );
                })}
                
                {conversations.length === 0 && (
                  <div className="no-conversations">
                    No conversations yet. Start a new one!
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="chat-area">
              {selectedConversation ? (
                <>
                  <div className="chat-header">
                    <div className="chat-partner-info">
                      <div className="partner-avatar">
                        {getOtherParticipantName(selectedConversation).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4>{getOtherParticipantName(selectedConversation)}</h4>
                        {renderOnlineStatus()}
                      </div>
                    </div>
                    <div className="chat-actions">
                      <button 
                        className="schedule-interview-btn"
                        onClick={() => handleScheduleInterview(
                          selectedConversation.id, 
                          getOtherParticipantId(selectedConversation)
                        )}
                      >
                        📅 Schedule Interview
                      </button>
                      <button className="video-call-btn" title="Video Call">
                        📹
                      </button>
                    </div>
                  </div>

                  <div className="messages-container">
                    {messages.map(msg => {
                      const isCurrentUser = msg.senderId === user?.uid;
                      
                      return (
                        <div
                          key={msg.id}
                          className={`message ${isCurrentUser ? 'sent' : 'received'}`}
                        >
                          {!isCurrentUser && (
                            <div className="message-sender">{msg.senderName}</div>
                          )}
                          <div className="message-content">
                            {msg.content}
                            {msg.attachments?.map((att, idx) => (
                              <div key={idx} className="message-attachment">
                                <a 
                                  href={att.data} 
                                  download={att.name}
                                  className="attachment-link"
                                >
                                  📎 {att.name} ({Math.round(att.size / 1024)}KB)
                                </a>
                              </div>
                            ))}
                          </div>
                          <div className="message-time">
                            {new Date(msg.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      );
                    })}
                    
                    {renderTypingIndicator()}
                    <div ref={messagesEndRef} />
                  </div>

                  {renderTypingIndicator()}
                  
                  <div className="message-input-container">
                    <button 
                      className="attach-btn"
                      onClick={handleAttachFile}
                      title="Attach file (max 64KB)"
                    >
                      📎
                    </button>
                    <input
                      type="text"
                      className="message-input"
                      placeholder="Type your message..."
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button 
                      className="send-btn"
                      onClick={sendMessage}
                      disabled={!messageInput.trim() || !ablyConnected}
                    >
                      {ablyConnected ? 'Send' : 'Connecting...'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-conversation-selected">
                  <div className="empty-chat-icon">💬</div>
                  <h4>Select a conversation to start messaging</h4>
                  <p>Or start a new conversation from the list</p>
                  <button 
                    onClick={() => setShowNewChatModal(true)}
                    className="start-chat-btn"
                  >
                    Start New Conversation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // New Chat Modal Component
  const NewChatModal = () => {
    useEffect(() => {
      if (showNewChatModal && searchQuery) {
        const timeoutId = setTimeout(() => {
          searchUsers(searchQuery);
        }, 300);
        return () => clearTimeout(timeoutId);
      }
    }, [searchQuery, showNewChatModal]);

    if (!showNewChatModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>New Conversation</h3>
            <button 
              onClick={() => {
                setShowNewChatModal(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              ×
            </button>
          </div>
          
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!e.target.value.trim()) {
                setSearchResults([]);
              }
            }}
            autoFocus
          />
          
          <div className="search-results">
            {searchResults.length > 0 ? (
              searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => createNewConversation(result.uid, result.displayName)}
                  className="user-result"
                >
                  <div className="user-avatar">
                    {result.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{result.displayName}</div>
                    <div className="user-email">{result.email}</div>
                  </div>
                </div>
              ))
            ) : searchQuery ? (
              <div className="no-results">
                No users found
              </div>
            ) : (
              <div className="no-results">
                Start typing to search users
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Mock data for fallback
  const mockJobRecommendations = [
    {
      jobTitle: "Senior Frontend Developer",
      industry: "Technology",
      matchScore: 95,
      whyItFits: "Your JavaScript and React skills align perfectly with modern frontend development requirements.",
      requiredSkills: ["React", "TypeScript", "Next.js"],
      salaryRange: "Entry-level: ₦180,000 - Senior: ₦800,000",
      companiesHiring: ["TechCorp", "Digital Solutions"],
      learningPath: ["Advanced React Patterns", "GraphQL"],
      applicationTips: "Highlight your React projects and emphasize your problem-solving skills."
    },
    {
      jobTitle: "Full Stack Engineer",
      industry: "Software Development",
      matchScore: 88,
      whyItFits: "Your Node.js experience combined with frontend skills makes you a strong candidate.",
      requiredSkills: ["Node.js", "React", "MongoDB"],
      salaryRange: "Entry-level: ₦200,000 - Senior: ₦850,000",
      companiesHiring: ["Innovate Inc", "Web Masters"],
      learningPath: ["DevOps Basics", "AWS Services"],
      applicationTips: "Showcase full-stack projects and mention your database experience."
    }
  ];

  const recentApplications = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "Web Solutions",
      status: "Under Review",
      applied: "2 days ago"
    },
    {
      id: 2,
      title: "UX Designer",
      company: "Creative Agency",
      status: "Interview Scheduled",
      applied: "1 week ago"
    },
    {
      id: 3,
      title: "Backend Engineer",
      company: "Data Systems",
      status: "Application Submitted",
      applied: "3 days ago"
    }
  ];

  const upcomingInterviews = [
    {
      id: 1,
      title: "Senior React Developer Interview",
      company: "Tech Innovations Inc.",
      time: "10:00 AM",
      date: "Today",
      type: "Zoom Meeting",
      status: "Confirmed"
    },
    {
      id: 2,
      title: "Product Manager Interview",
      company: "Digital Solutions",
      time: "2:30 PM",
      date: "Tomorrow",
      type: "In-person",
      status: "Scheduled"
    }
  ];

  return (
    <div className="jobseeker-dashboard-container">
      {/* Top Navigation Bar */}
      <nav className="jobseeker-top-navbar">
        <div className="jobseeker-nav-brand">
          <Link to="/jobseeker" className="jobseeker-brand-logo">JobLytics</Link>
          <span className="jobseeker-user-welcome">Job Seeker Dashboard</span>
        </div>

        <div className="jobseeker-nav-center">
          <ul className="jobseeker-nav-links">
            <li><Link to="/jobseeker">Dashboard</Link></li>
            <li><Link to="/job-search">Jobs</Link></li>
            <li><Link to="/job-seeker/applications">Applications</Link></li>
            <li><Link to="/schedule-interview">Interviews</Link></li>
            <li><Link to="/messaging">Messages</Link></li>
            <li><Link to="/internet-speed-test">Internet Test</Link></li>
            <li><Link to="/payment-gateway">Payments</Link></li>
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
              className={activeTab === "jobSearch" ? "active" : ""}
              onClick={() => handleSidebarClick("jobSearch")}
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
              {stats.applications > 0 && (
                <span className="jobseeker-menu-badge">{stats.applications}</span>
              )}
            </li>
            <li
              className={activeTab === "interviews" ? "active" : ""}
              onClick={() => handleSidebarClick("interviews")}
            >
              <span className="jobseeker-menu-icon">🎯</span>
              <span className="jobseeker-menu-text">Interviews</span>
              {stats.upcomingInterviews > 0 && (
                <span className="jobseeker-menu-badge">{stats.upcomingInterviews}</span>
              )}
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
              className={activeTab === "savedJobs" ? "active" : ""}
              onClick={() => handleSidebarClick("savedJobs")}
            >
              <span className="jobseeker-menu-icon">⭐</span>
              <span className="jobseeker-menu-text">Saved Jobs</span>
              {stats.savedJobs > 0 && (
                <span className="jobseeker-menu-badge">{stats.savedJobs}</span>
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
              className={activeTab === "itin-support" ? "active" : ""}
              onClick={() => handleSidebarClick("itin-support")}
            >
              <span className="jobseeker-menu-icon">🆔</span>
              <span className="jobseeker-menu-text">ITIN Support</span>
            </li>
            <li
              className={activeTab === "tax-guidance" ? "active" : ""}
              onClick={() => handleSidebarClick("tax-guidance")}
            >
              <span className="jobseeker-menu-icon">📊</span>
              <span className="jobseeker-menu-text">Tax Guidance</span>
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

        {/* Main Content */}
        <main className="jobseeker-main-content">
          {/* Header */}
          <header className="jobseeker-header">
            <h1>Welcome back, {user?.firstName || "Job Seeker"}!</h1>
            <div className="jobseeker-search-bar">
              <input type="text" placeholder="Search jobs, companies, or skills..." />
              <div className="jobseeker-user-info">
                <span>Job Seeker • {user?.location || "Location not set"}</span>
              </div>
            </div>
          </header>

          {/* Quick Stats */}
          <div className="jobseeker-quick-stats">
            <div className="jobseeker-stat-card">
              <h3>Applications</h3>
              <p>{loading ? '...' : stats.applications}</p>
              <span className="jobseeker-stat-trend">{stats.interviews > 0 ? `+${stats.interviews} interviews` : 'No interviews yet'}</span>
            </div>
            <div className="jobseeker-stat-card jobseeker-stat-highlight">
              <h3>Unread Messages</h3>
              <p>{loading ? '...' : stats.unreadMessages}</p>
              <span className="jobseeker-stat-trend">Click to view</span>
            </div>
            <div className="jobseeker-stat-card">
              <h3>Upcoming Interviews</h3>
              <p>{loading ? '...' : stats.upcomingInterviews}</p>
              <span className="jobseeker-stat-trend">Scheduled</span>
            </div>
            <div className="jobseeker-stat-card">
              <h3>Offers Received</h3>
              <p>{loading ? '...' : stats.offers}</p>
              <span className="jobseeker-stat-trend">{stats.offers > 0 ? 'Congratulations!' : 'Keep applying!'}</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="jobseeker-stats-cards">
            <div 
              className={`jobseeker-card ${loading ? 'loading' : 'clickable'}`}
              onClick={() => !loading && handleStatClick('applications')}
            >
              <div className="jobseeker-card-icon">📄</div>
              <div className="jobseeker-card-content">
                <h3>Total Applications</h3>
                <p>{loading ? '...' : stats.applications}</p>
                <span className="jobseeker-card-hint">Click to view all</span>
              </div>
            </div>
            <div 
              className={`jobseeker-card ${loading ? 'loading' : 'clickable'}`}
              onClick={() => !loading && handleStatClick('interviews')}
            >
              <div className="jobseeker-card-icon">🎯</div>
              <div className="jobseeker-card-content">
                <h3>Interviews</h3>
                <p>{loading ? '...' : stats.interviews}</p>
                <span className="jobseeker-card-hint">Click to manage</span>
              </div>
            </div>
            <div className="jobseeker-card">
              <div className="jobseeker-card-icon">🏆</div>
              <div className="jobseeker-card-content">
                <h3>Job Offers</h3>
                <p>{loading ? '...' : stats.offers}</p>
                <span className="jobseeker-card-hint">Congratulations!</span>
              </div>
            </div>
            <div 
              className={`jobseeker-card ${loading ? 'loading' : 'clickable'}`}
              onClick={() => !loading && handleStatClick('savedJobs')}
            >
              <div className="jobseeker-card-icon">⭐</div>
              <div className="jobseeker-card-content">
                <h3>Saved Jobs</h3>
                <p>{loading ? '...' : stats.savedJobs}</p>
                <span className="jobseeker-card-hint">Click to view</span>
              </div>
            </div>
            <div 
              className={`jobseeker-card ${loading ? 'loading' : 'clickable'}`}
              onClick={() => !loading && handleStatClick('unreadMessages')}
            >
              <div className="jobseeker-card-icon">💬</div>
              <div className="jobseeker-card-content">
                <h3>Unread Messages</h3>
                <p>{loading ? '...' : stats.unreadMessages}</p>
                {stats.unreadMessages > 0 && <div className="jobseeker-pulse-dot"></div>}
              </div>
            </div>
            <div className="jobseeker-card">
              <div className="jobseeker-card-icon">📅</div>
              <div className="jobseeker-card-content">
                <h3>Upcoming Interviews</h3>
                <p>{loading ? '...' : stats.upcomingInterviews}</p>
                <span className="jobseeker-card-hint">Scheduled</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="jobseeker-quick-actions">
            <h3>Quick Actions</h3>
            <div className="jobseeker-actions-grid">
              <button className="jobseeker-action-btn" onClick={() => handleQuickAction('searchJobs')}>
                <span className="jobseeker-action-icon">🔍</span>
                <span className="jobseeker-action-text">Search Jobs</span>
              </button>
              <button className="jobseeker-action-btn" onClick={() => handleQuickAction('updateProfile')}>
                <span className="jobseeker-action-icon">👤</span>
                <span className="jobseeker-action-text">Update Profile</span>
              </button>
              <button className="jobseeker-action-btn" onClick={() => handleQuickAction('viewApplications')}>
                <span className="jobseeker-action-icon">📄</span>
                <span className="jobseeker-action-text">View Applications</span>
              </button>
              <button className="jobseeker-action-btn" onClick={() => handleQuickAction('scheduleInterview')}>
                <span className="jobseeker-action-icon">📅</span>
                <span className="jobseeker-action-text">Schedule Interview</span>
              </button>
              <button className="jobseeker-action-btn" onClick={() => handleQuickAction('messaging')}>
                <span className="jobseeker-action-icon">💬</span>
                <span className="jobseeker-action-text">Messages</span>
                {stats.unreadMessages > 0 && <span className="jobseeker-action-badge">{stats.unreadMessages}</span>}
              </button>
              <button className="jobseeker-action-btn" onClick={() => handleQuickAction('buildResume')}>
                <span className="jobseeker-action-icon">📄</span>
                <span className="jobseeker-action-text">Build Resume</span>
              </button>
              <button className="jobseeker-action-btn" onClick={() => handleQuickAction('viewAnalytics')}>
                <span className="jobseeker-action-icon">📊</span>
                <span className="jobseeker-action-text">View Analytics</span>
              </button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="jobseeker-content-grid">
            {/* AI-Powered Recommendations */}
            <div className="jobseeker-content-section">
              <div className="jobseeker-section-header">
                <h3>🤖 AI-Powered Recommendations</h3>
                <span className="jobseeker-ai-badge">Powered by Gemini AI</span>
                <button 
                  className="jobseeker-view-all" 
                  onClick={() => navigate("/job-search")}
                  disabled={recommendationsLoading}
                >
                  {recommendationsLoading ? 'Loading...' : 'View All →'}
                </button>
              </div>
              
              {recommendationsLoading ? (
                <div className="jobseeker-loading-recommendations">
                  <div className="jobseeker-loading-spinner"></div>
                  <p>AI is analyzing your profile to find perfect matches...</p>
                </div>
              ) : aiRecommendations.length > 0 ? (
                <div className="jobseeker-recommendations-list">
                  {aiRecommendations.slice(0, 3).map((job, index) => (
                    <div key={index} className="jobseeker-recommendation-item">
                      <div className="jobseeker-recommendation-header">
                        <h4>{job.jobTitle || job.title || 'Job Title'}</h4>
                        <div className="jobseeker-match-score">
                          <span className="jobseeker-match-percent">{job.matchScore || 85}%</span>
                          <span className="jobseeker-match-label">AI Match</span>
                        </div>
                      </div>
                      <p className="jobseeker-company">
                        {job.industry || 'Technology'} • {job.companiesHiring ? job.companiesHiring[0] : (job.companyType || 'Multiple companies')}
                      </p>
                      <p className="jobseeker-salary">{job.salaryRange || job.estimatedSalary || 'Competitive salary'}</p>
                      
                      {job.whyItFits && (
                        <p className="jobseeker-ai-insight">
                          <strong>💡 Why it fits:</strong> {job.whyItFits}
                        </p>
                      )}
                      
                      <div className="jobseeker-skills-tags">
                        {(job.requiredSkills || job.keyResponsibilities || []).slice(0, 4).map((skill, idx) => (
                          <span key={idx} className="jobseeker-skill-tag">{skill}</span>
                        ))}
                      </div>
                      
                      {job.learningPath && job.learningPath.length > 0 && (
                        <div className="jobseeker-learning-path">
                          <small>📚 Learn: {job.learningPath.slice(0, 2).join(', ')}</small>
                        </div>
                      )}
                      
                      <div className="jobseeker-recommendation-footer">
                        <span className="jobseeker-posted">AI Recommended</span>
                        <button 
                          className="jobseeker-apply-btn"
                          onClick={() => navigate("/job-search", { 
                            state: { searchQuery: job.jobTitle || job.title } 
                          })}
                        >
                          Find Similar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="jobseeker-no-recommendations">
                  <p>No AI recommendations yet. Update your profile for personalized matches!</p>
                  <button 
                    className="jobseeker-btn-primary"
                    onClick={() => navigate("/jobseeker/profile")}
                  >
                    Update Profile
                  </button>
                </div>
              )}
            </div>

            {/* Recent Applications */}
            <div className="jobseeker-content-section">
              <div className="jobseeker-section-header">
                <h3>Recent Applications</h3>
                <button className="jobseeker-view-all" onClick={() => navigate("/job-seeker/applications")}>
                  View All →
                </button>
              </div>
              <div className="jobseeker-applications-list">
                {recentApplications.map(app => (
                  <div key={app.id} className="jobseeker-application-item">
                    <div className="jobseeker-application-info">
                      <h4>{app.title}</h4>
                      <p className="jobseeker-application-company">{app.company}</p>
                      <div className="jobseeker-application-meta">
                        <span className={`jobseeker-application-status jobseeker-status-${app.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {app.status}
                        </span>
                        <span className="jobseeker-application-posted">
                          {app.applied}
                        </span>
                      </div>
                    </div>
                    <button className="jobseeker-application-action" onClick={() => navigate(`/job-seeker/application/${app.id}`)}>
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Interviews */}
            <div className="jobseeker-content-section jobseeker-full-width">
              <div className="jobseeker-section-header">
                <h3>Upcoming Interviews</h3>
                <button className="jobseeker-view-all" onClick={() => navigate("/schedule-interview")}>
                  View All →
                </button>
              </div>
              <div className="jobseeker-interview-list">
                {upcomingInterviews.map(interview => (
                  <div key={interview.id} className="jobseeker-interview-item">
                    <div className="jobseeker-interview-time">
                      <span className="jobseeker-interview-hour">{interview.time}</span>
                      <span className="jobseeker-interview-date">{interview.date}</span>
                    </div>
                    <div className="jobseeker-interview-details">
                      <h4>{interview.title}</h4>
                      <p className="jobseeker-interview-company">{interview.company} • {interview.type}</p>
                      <div className="jobseeker-interview-meta">
                        <span className={`jobseeker-interview-status jobseeker-status-${interview.status.toLowerCase()}`}>
                          {interview.status}
                        </span>
                      </div>
                      <div className="jobseeker-interview-actions">
                        <button className="jobseeker-interview-btn jobseeker-btn-primary">
                          {interview.date === "Today" ? "Join Now" : "Details"}
                        </button>
                        <button className="jobseeker-interview-btn">Reschedule</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Updated Messaging Panel */}
      <MessagingPanel />
      
      {/* New Chat Modal */}
      <NewChatModal />

      {/* Resume Builder Modal */}
      <ResumeBuilderModal />
      
      {/* Analytics Modal */}
      <AnalyticsModal />

      {/* AI Chatbox Component */}
      <AIChatbox user={user} />
    </div>
  );
};

// Enhanced AI Chatbox Component
const AIChatbox = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your JobLytics AI Assistant. I can help you with:\n\n• Job search strategies\n• Resume optimization\n• Interview preparation\n• Skill recommendations\n• Nigerian/US job market insights\n\nHow can I help you today?",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatContext, setChatContext] = useState('');

  // Build user context from profile
  useEffect(() => {
    if (user) {
      const context = `
        User Profile:
        Name: ${user.firstName || 'Not specified'}
        Skills: ${user.skills ? user.skills.join(', ') : 'Not specified'}
        Experience: ${user.experience || 'Not specified'}
        Location: ${user.location || 'Not specified'}
        Education: ${user.education || 'Not specified'}
      `;
      setChatContext(context);
    }
  }, [user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await aiService.chat(inputText, chatContext);

      if (result.success) {
        const aiMessage = {
          id: messages.length + 2,
          text: result.response,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          id: messages.length + 2,
          text: result.error || "I'm having trouble connecting right now. Please try again in a moment!",
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I'm experiencing technical difficulties. Please try again!",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "Best jobs for my skills?",
    "How to improve my resume?",
    "Common interview questions?",
    "Remote jobs in Nigeria?",
    "Salary negotiation tips?"
  ];

  if (!isOpen) {
    return (
      <button className="jobseeker-chatbox-toggle" onClick={() => setIsOpen(true)}>
        <span className="chatbox-icon">🤖</span>
        <span className="chatbox-badge">AI</span>
      </button>
    );
  }

  return (
    <div className="jobseeker-ai-chatbox">
      <div className="jobseeker-chatbox-header">
        <div className="chatbox-title">
          <span className="ai-icon">🤖</span>
          <h3>JobLytics AI Assistant</h3>
          <span className="chatbox-status">● Online</span>
        </div>
        <button 
          className="chatbox-close" 
          onClick={() => setIsOpen(false)}
          aria-label="Close chat"
        >
          ×
        </button>
      </div>

      <div className="jobseeker-chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`jobseeker-message ${message.sender}`}>
            <div className="message-avatar">
              {message.sender === 'ai' ? '🤖' : '👤'}
            </div>
            <div className="message-content-wrapper">
              <div className="jobseeker-message-content">
                {message.text}
              </div>
              <div className="message-time">{message.time}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="jobseeker-message ai">
            <div className="message-avatar">🤖</div>
            <div className="message-content-wrapper">
              <div className="jobseeker-message-content typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Questions */}
      <div className="quick-questions">
        <p className="quick-questions-label">Quick questions:</p>
        <div className="quick-questions-buttons">
          {quickQuestions.map((question, idx) => (
            <button
              key={idx}
              className="quick-question-btn"
              onClick={() => {
                setInputText(question);
                setTimeout(() => {
                  handleSendMessage({ preventDefault: () => {} });
                }, 100);
              }}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      <div className="jobseeker-chat-input-container">
        <form className="jobseeker-chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="jobseeker-chat-input"
            placeholder="Ask about jobs, resumes, interviews..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="jobseeker-send-button"
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? '...' : '→'}
          </button>
        </form>
        <small className="chat-disclaimer">
          Powered by Gemini AI • Responses may vary
        </small>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;