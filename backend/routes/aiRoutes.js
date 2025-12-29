const express = require('express');
const { 
    // Test endpoints
    testSimple,
    testGemini,
    listModels,
    
    // Main AI features
    matchJobsIntelligently,
    analyzeProfile,
    generateResumeContent,
    getCareerTips,
    chatWithAI,
    getNotificationIntelligence,  // ADDED THIS
    summarizeMessages,            // ADDED THIS
    
    // Legacy endpoints
    matchSkills,
    getCareerInsights
} = require('../controllers/aiController');

const router = express.Router();

/* =======================
   TEST ENDPOINTS
======================= */
router.post('/test-simple', testSimple);
router.post('/test-gemini', testGemini);
router.post('/list-models', listModels);

/* =======================
   MAIN AI FEATURES
   
   Feature #1: AI-Powered Job Matching
   Feature #2: Personalized Recommendations
   Feature #3: Resume Builder
   Feature #4: AI Career Coach
   Feature #5: Smart Notifications (via other endpoints)
   Feature #6: Analytics Dashboard
======================= */

// Feature #1 & #2: Intelligent job matching with real Firebase jobs
router.post('/match-jobs-intelligent', matchJobsIntelligently);

// Feature #6: Profile analysis and analytics
router.post('/analyze-profile', analyzeProfile);

// Feature #3: AI-powered resume generation
router.post('/generate-resume', generateResumeContent);

// Feature #4 & #5: Career coaching and tips
router.post('/career-tips', getCareerTips);
router.post('/chat', chatWithAI);

// Feature #5: Smart Notifications
router.post('/notification-intelligence', getNotificationIntelligence);
router.post('/summarize-messages', summarizeMessages);

/* =======================
   LEGACY ENDPOINTS
   (Keeping for backward compatibility)
======================= */
router.post('/match-skills', matchSkills);
router.post('/career-insights', getCareerInsights);

// Alias routes for convenience
router.post('/recommend-jobs', matchJobsIntelligently);
router.post('/notification-insights', getCareerTips);

module.exports = router;