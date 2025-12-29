const Groq = require("groq-sdk");

/* =======================
   INITIALIZE GROQ CLIENT
======================= */
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/* =======================
   HELPER FUNCTIONS
======================= */

// Test if Groq is working
const testGroqConnection = async () => {
    try {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is missing');
        }
        
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Say 'Hello World'" }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 50,
        });
        
        return {
            success: true,
            response: completion.choices[0]?.message?.content || "No response"
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

/* =======================
   1. INTELLIGENT JOB MATCHING
   Match real Firebase jobs with user profile using AI
======================= */
const matchJobsIntelligently = async (req, res) => {
    try {
        const { userProfile, jobs } = req.body;

        if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Jobs array is required and must not be empty"
            });
        }

        console.log(`🎯 Matching ${jobs.length} jobs with user profile...`);

        const prompt = `You are an expert career matching AI. Analyze the user's profile and match them with suitable jobs from the provided list.

USER PROFILE:
- Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
- Experience Level: ${userProfile.experience || 'Not specified'}
- Location: ${userProfile.location || 'Not specified'}
- Education: ${userProfile.education || 'Not specified'}
- Preferences: ${JSON.stringify(userProfile.preferences || {})}

AVAILABLE JOBS (${jobs.length} total):
${jobs.map((job, idx) => `
${idx + 1}. ${job.title} at ${job.employerName}
   - Location: ${job.location}
   - Experience: ${job.minExperience || job.experienceRequired}
   - Type: ${job.jobStatus}
   - Status: ${job.status}
   - ID: ${job.id}
`).join('')}

TASK:
1. Score each job (0-100) based on how well it matches the user's profile
2. Consider: skills alignment, location match, experience level, job type preferences
3. Provide reasons why each job is a good or bad match
4. Suggest related skills the user should learn for better matches

RESPONSE FORMAT (JSON only):
{
  "matchedJobs": [
    {
      "id": "job_id",
      "title": "Job Title",
      "employerName": "Company Name",
      "location": "Location",
      "matchScore": 95,
      "matchReason": "Why this is a great match",
      "requiredSkills": ["skill1", "skill2"],
      "skillsYouHave": ["user_skill1"],
      "skillsToLearn": ["skill_to_learn"],
      "whyGreatFit": "Detailed explanation"
    }
  ],
  "insights": {
    "topSkills": ["your top skills"],
    "skillGaps": ["skills to improve"],
    "locationAdvantage": "location insights",
    "recommendedActions": ["action1", "action2"]
  }
}

Return ONLY valid JSON, no additional text. Sort jobs by matchScore (highest first).`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a career matching AI. Always respond with valid JSON only."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.6,
            max_tokens: 3000,
            response_format: { type: "json_object" }
        });

        const responseText = completion.choices[0]?.message?.content || "{}";
        let parsedResponse;

        try {
            parsedResponse = JSON.parse(responseText);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError.message);
            // Fallback: return jobs with basic scoring
            parsedResponse = {
                matchedJobs: jobs.slice(0, 10).map(job => ({
                    ...job,
                    matchScore: 75,
                    matchReason: "Based on your profile",
                    whyGreatFit: "This role aligns with your experience and skills"
                })),
                insights: {
                    topSkills: userProfile.skills?.slice(0, 3) || [],
                    skillGaps: ["TypeScript", "Cloud Services"],
                    recommendedActions: ["Update your profile", "Apply to matched jobs"]
                }
            };
        }

        console.log(`✅ Matched ${parsedResponse.matchedJobs?.length || 0} jobs`);

        res.json({
            success: true,
            matchedJobs: parsedResponse.matchedJobs || [],
            insights: parsedResponse.insights || {},
            totalJobsAnalyzed: jobs.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("❌ Job Matching Error:", error);
        res.status(500).json({
            success: false,
            error: "Unable to match jobs at this time",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

/* =======================
   2. PROFILE ANALYSIS & ANALYTICS
   Analyze user's career profile and provide insights
======================= */
const analyzeProfile = async (req, res) => {
    try {
        const { profile, applicationCount, savedJobsCount, recentApplications } = req.body;

        const prompt = `Analyze this job seeker's career profile and provide detailed insights.

PROFILE:
- Skills: ${profile.skills?.join(', ') || 'Not specified'}
- Experience: ${profile.experience || 'Not specified'}
- Location: ${profile.location || 'Not specified'}
- Education: ${profile.education || 'Not specified'}

ACTIVITY:
- Total Applications: ${applicationCount || 0}
- Saved Jobs: ${savedJobsCount || 0}
- Recent Applications: ${recentApplications?.map(app => app.title || app.jobTitle).join(', ') || 'None'}

Provide comprehensive analytics in JSON format:
{
  "analytics": {
    "profileStrength": "Score 0-100 with explanation",
    "skillGaps": ["Skills user should learn"],
    "marketDemand": "High/Medium/Low for user's skills",
    "applicationEffectiveness": "Analysis of application success rate",
    "recommendations": ["Actionable recommendations"],
    "careerPath": "Suggested career progression",
    "estimatedSalaryRange": "Based on skills and experience",
    "topIndustries": ["Industries user should target"]
  },
  "strengths": ["User's key strengths"],
  "improvements": ["Areas to improve"]
}`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a career analyst AI. Respond with valid JSON only." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.6,
            max_tokens: 2000,
            response_format: { type: "json_object" }
        });

        const responseText = completion.choices[0]?.message?.content || "{}";
        const analysis = JSON.parse(responseText);

        res.json({
            success: true,
            analytics: analysis.analytics || {},
            strengths: analysis.strengths || [],
            improvements: analysis.improvements || [],
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("❌ Profile Analysis Error:", error);
        res.status(500).json({
            success: false,
            error: "Unable to analyze profile"
        });
    }
};

/* =======================
   3. RESUME GENERATION
   AI-powered resume content generation
======================= */
const generateResumeContent = async (req, res) => {
    try {
        const { profile } = req.body;

        const prompt = `Generate professional resume content for this job seeker.

PROFILE:
- Name: ${profile.firstName} ${profile.lastName}
- Skills: ${profile.skills?.join(', ') || 'Not specified'}
- Experience: ${profile.experience || 'Not specified'}
- Education: ${profile.education || 'Not specified'}
- Bio: ${profile.bio || 'Not specified'}

Generate:
1. A compelling professional summary (3-4 sentences)
2. Optimized skill categorization
3. Achievement-focused bullet points (if work experience provided)

Response format (JSON):
{
  "summary": "Professional summary text",
  "skills": ["Categorized skills"],
  "achievements": ["Achievement-focused points"],
  "tips": ["Resume improvement tips"]
}`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a professional resume writer. Respond with valid JSON only." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1500,
            response_format: { type: "json_object" }
        });

        const responseText = completion.choices[0]?.message?.content || "{}";
        const resumeContent = JSON.parse(responseText);

        res.json({
            success: true,
            ...resumeContent,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("❌ Resume Generation Error:", error);
        res.status(500).json({
            success: false,
            error: "Unable to generate resume content"
        });
    }
};

/* =======================
   4. CAREER TIPS & COACHING
   Personalized career advice
======================= */
const getCareerTips = async (req, res) => {
    try {
        const { userProfile, analytics } = req.body;

        const prompt = `As an AI career coach, provide personalized career tips for this job seeker.

USER PROFILE:
- Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
- Experience: ${userProfile.experience || 'Not specified'}
- Location: ${userProfile.location || 'Not specified'}

ANALYTICS DATA:
${JSON.stringify(analytics || {}, null, 2)}

Provide 5-7 actionable career tips specific to this user. Format as JSON:
{
  "tips": [
    "Specific, actionable tip 1",
    "Specific, actionable tip 2",
    ...
  ],
  "urgentActions": ["Most important actions to take now"],
  "longTermGoals": ["Career goals to work toward"]
}`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a career coach AI. Respond with valid JSON only." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1500,
            response_format: { type: "json_object" }
        });

        const responseText = completion.choices[0]?.message?.content || "{}";
        const tips = JSON.parse(responseText);

        res.json({
            success: true,
            ...tips,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("❌ Career Tips Error:", error);
        res.status(500).json({
            success: false,
            error: "Unable to generate career tips"
        });
    }
};

/* =======================
   5. AI CHAT (Enhanced Career Coach)
======================= */
const chatWithAI = async (req, res) => {
    try {
        console.log('💬 Chat request received');
        const { message, context = "General career advice" } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: "Valid message is required"
            });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({
                success: false,
                error: "AI service configuration error"
            });
        }

        const systemPrompt = `You are JobLytics AI Career Coach - a knowledgeable, friendly, and encouraging career advisor.

Your expertise includes:
- Job search strategies
- Resume and cover letter optimization
- Interview preparation and techniques
- Skill development recommendations
- Career path guidance
- Salary negotiation tips
- Nigerian and US job markets
- Remote work opportunities
- Professional networking

User Context: ${context}

Provide helpful, specific, and actionable career advice. Keep responses:
- Conversational and encouraging
- Practical with real-world examples
- Under 250 words
- Focused on career development

If asked about non-career topics, politely redirect to career-related discussion.`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.8,
            max_tokens: 800,
        });

        const responseText = completion.choices[0]?.message?.content || 
            "I'm here to help with your career questions! How can I assist you today?";

        console.log('✅ Chat response generated');

        res.json({
            success: true,
            response: responseText,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("❌ Chat Error:", error);
        res.status(500).json({
            success: false,
            error: "Unable to process chat request",
            fallbackResponse: "Hello! I'm here to help with career questions. How can I assist you today?"
        });
    }
};

/* =======================
   6. NOTIFICATION INTELLIGENCE
   Analyze and generate smart notifications
======================= */
const getNotificationIntelligence = async (req, res) => {
    try {
        const { userProfile, notifications, applications, savedJobs, jobMatches, messages } = req.body;

        console.log('🔔 Processing notification intelligence...');

        const prompt = `You are a smart notification system for a job portal. Analyze the user's activity and generate relevant, timely notifications.

USER PROFILE:
- Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
- Experience: ${userProfile.experience || 'Not specified'}
- Location: ${userProfile.location || 'Not specified'}
- Job Preferences: ${JSON.stringify(userProfile.preferences || {})}

RECENT ACTIVITY:
- Applications: ${applications?.length || 0} total applications
- Saved Jobs: ${savedJobs?.length || 0} saved jobs
- Unread Messages: ${messages?.filter(m => !m.read).length || 0} unread messages
- Job Matches: ${jobMatches?.length || 0} new job matches

EXISTING NOTIFICATIONS (${notifications?.length || 0}):
${notifications?.slice(0, 5).map(n => `• ${n.type}: ${n.message}`).join('\n') || 'No recent notifications'}

TASK:
Analyze the user's situation and generate 3-5 relevant notifications. Consider:
1. New jobs that match their profile
2. Application status updates
3. Interview reminders
4. Messages that need attention
5. Profile improvement suggestions
6. Time-based triggers (e.g., "You haven't applied in 3 days")

For each notification, provide:
- type: "job_match" | "application_update" | "interview" | "message" | "profile" | "reminder" | "hiring"
- priority: "high" | "medium" | "low"
- title: Short descriptive title
- message: Clear, actionable message
- actionUrl: Where to navigate (e.g., "/job-search", "/applications", "/messages")
- icon: Emoji for visual indicator
- data: Additional context if needed

Response format (JSON only):
{
  "notifications": [
    {
      "type": "job_match",
      "priority": "high",
      "title": "New Job Match",
      "message": "Senior Frontend Developer at TechCorp matches 95% of your skills",
      "actionUrl": "/job-search",
      "icon": "🎯",
      "data": {
        "matchScore": 95,
        "jobId": "job_123",
        "company": "TechCorp"
      }
    }
  ],
  "insights": {
    "unreadSummary": "Summary of what needs attention",
    "suggestedActions": ["action1", "action2"],
    "priorityCount": {
      "high": 2,
      "medium": 3,
      "low": 1
    }
  }
}`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a smart notification system. Always respond with valid JSON only."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 2000,
            response_format: { type: "json_object" }
        });

        const responseText = completion.choices[0]?.message?.content || "{}";
        const parsedResponse = JSON.parse(responseText);

        console.log(`✅ Generated ${parsedResponse.notifications?.length || 0} smart notifications`);

        res.json({
            success: true,
            notifications: parsedResponse.notifications || [],
            insights: parsedResponse.insights || {},
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("❌ Notification Intelligence Error:", error);
        // Return fallback notifications
        res.json({
            success: true,
            notifications: [
                {
                    type: "reminder",
                    priority: "medium",
                    title: "Complete Your Profile",
                    message: "Add more skills to get better job matches",
                    actionUrl: "/jobseeker/profile",
                    icon: "👤"
                }
            ],
            insights: {
                unreadSummary: "Check your messages and applications",
                suggestedActions: ["Update profile", "Apply to new jobs"],
                priorityCount: { high: 0, medium: 1, low: 0 }
            }
        });
    }
};

/* =======================
   7. MESSAGE SUMMARIZATION
   Summarize unread messages for notifications
======================= */
const summarizeMessages = async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.json({
                success: true,
                summary: "No new messages",
                urgent: false,
                count: 0
            });
        }

        const unreadMessages = messages.filter(m => !m.read);
        
        if (unreadMessages.length === 0) {
            return res.json({
                success: true,
                summary: "No unread messages",
                urgent: false,
                count: 0
            });
        }

        const prompt = `Summarize these messages for a notification:

Messages (${unreadMessages.length} unread):
${unreadMessages.slice(0, 5).map((msg, idx) => 
`${idx + 1}. From: ${msg.senderName || 'Unknown'} - ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`
).join('\n')}

Provide a brief summary (1-2 sentences) and indicate if any are urgent.
Response format (JSON):
{
  "summary": "Brief summary of messages",
  "urgent": true/false,
  "count": ${unreadMessages.length},
  "senders": ["sender1", "sender2"]
}`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Summarize messages concisely. Respond with JSON only." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 500,
            response_format: { type: "json_object" }
        });

        const responseText = completion.choices[0]?.message?.content || "{}";
        const summary = JSON.parse(responseText);

        res.json({
            success: true,
            ...summary,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("❌ Message Summarization Error:", error);
        res.json({
            success: true,
            summary: `You have ${messages?.filter(m => !m.read).length || 0} unread messages`,
            urgent: false,
            count: messages?.filter(m => !m.read).length || 0,
            senders: []
        });
    }
};

/* =======================
   TEST ENDPOINTS
======================= */
const testSimple = (req, res) => {
    console.log('✅ Test endpoint called');
    res.json({
        success: true,
        message: 'Backend is working correctly!',
        timestamp: new Date().toISOString(),
        serverInfo: {
            nodeVersion: process.version,
            platform: process.platform,
            uptime: process.uptime()
        }
    });
};

const testGemini = async (req, res) => {
    console.log('🧪 Testing Groq initialization...');
    const result = await testGroqConnection();
    
    if (result.success) {
        res.json({
            success: true,
            message: 'Groq API is working correctly!',
            aiResponse: result.response,
            apiKeyLength: process.env.GROQ_API_KEY?.length || 0,
            model: "llama-3.3-70b-versatile"
        });
    } else {
        res.status(500).json({
            success: false,
            error: 'Groq test failed',
            message: result.error,
            suggestion: 'Check your .env file and ensure GROQ_API_KEY is valid'
        });
    }
};

const listModels = async (req, res) => {
    res.json({
        success: true,
        availableModels: [
            { name: "llama-3.3-70b-versatile", status: "✅ Active (Recommended)" },
            { name: "llama-3.1-70b-versatile", status: "✅ Available" },
            { name: "mixtral-8x7b-32768", status: "✅ Available" }
        ]
    });
};

// Legacy endpoints (keeping for compatibility)
const matchSkills = async (req, res) => {
    // This is the old endpoint - redirect to new intelligent matching
    console.log('⚠️ Using legacy matchSkills endpoint - consider using matchJobsIntelligently');
    
    try {
        const { skills, location = "Nigeria", experienceLevel = "Not specified" } = req.body;
        
        if (!skills || !Array.isArray(skills) || skills.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Skills array is required"
            });
        }

        // Simple skill-based matching without specific jobs
        const prompt = `Suggest 5 job roles for someone with these skills: ${skills.join(', ')}
        Location: ${location}
        Experience: ${experienceLevel}
        
        Return JSON only with matchedJobs array.`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a career advisor. Respond with valid JSON only." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 2000,
            response_format: { type: "json_object" }
        });

        const responseText = completion.choices[0]?.message?.content || "{}";
        const parsed = JSON.parse(responseText);

        res.json({
            success: true,
            matchedJobs: parsed.matchedJobs || [],
            summary: `Based on your ${skills.length} skills`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("❌ Skills Matching Error:", error);
        res.status(500).json({
            success: false,
            error: "Unable to match skills"
        });
    }
};

const getCareerInsights = async (req, res) => {
    // Legacy endpoint - redirect to analyzeProfile
    return analyzeProfile(req, res);
};

/* =======================
   EXPORTS - UPDATED TO INCLUDE getNotificationIntelligence and summarizeMessages
======================= */
module.exports = {
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
    getNotificationIntelligence,  // ADDED: This was missing
    summarizeMessages,            // ADDED: This was also missing
    
    // Legacy endpoints (for backward compatibility)
    matchSkills,
    getCareerInsights
};