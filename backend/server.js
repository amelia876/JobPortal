/*******************************
 * Joblytics Backend API
 *******************************/

const express = require('express');
require('dotenv').config();
const rateLimit = require('express-rate-limit');
const path = require('path');

/* =======================
   ENV VALIDATION
======================= */
console.log('🔍 Environment Check:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('   PORT:', process.env.PORT || '5001 (default)');
console.log('   GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('   GEMINI_API_KEY length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 'N/A');

if (!process.env.GEMINI_API_KEY) {
    console.error("❌ CRITICAL: GEMINI_API_KEY is missing in .env file");
    console.error("   Create a .env file with: GEMINI_API_KEY=your_key_here");
    process.exit(1);
}

/* =======================
   APP SETUP
======================= */
const app = express();
const PORT = process.env.PORT || 5001;

/* =======================
   MIDDLEWARE SETUP
======================= */

// 1. Body Parser with error handling
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf, encoding) => {
        try {
            // Only validate if there's actually content
            if (buf.length > 0) {
                JSON.parse(buf.toString());
            }
        } catch (e) {
            console.error('❌ Invalid JSON in request body');
            res.status(400).json({
                success: false,
                error: 'Invalid JSON in request body',
                details: e.message
            });
            throw new Error('Invalid JSON');
        }
    }
}));

app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 2. CORS Configuration
app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        console.log('🛫 Handling OPTIONS preflight for:', req.path);
        return res.status(200).end();
    }
    
    next();
});

// 3. Request Logging Middleware
app.use((req, res, next) => {
    console.log(`\n📥 ${new Date().toLocaleTimeString()} - ${req.method} ${req.originalUrl}`);
    
    if (req.method === 'POST' && req.body) {
        console.log('   Body keys:', Object.keys(req.body));
        if (req.body.message) {
            console.log('   Message preview:', req.body.message.substring(0, 100));
        }
    }
    
    // Store start time for response time calculation
    req.startTime = Date.now();
    
    // Capture response finish
    const originalEnd = res.end;
    res.end = function(...args) {
        const duration = Date.now() - req.startTime;
        console.log(`📤 ${new Date().toLocaleTimeString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
        originalEnd.apply(res, args);
    };
    
    next();
});

/* =======================
   RATE LIMITING
======================= */
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: false,
    message: {
        success: false,
        error: "Too many AI requests. Please try again later."
    },
    handler: (req, res) => {
        console.warn(`⚠️ Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            error: "Too many AI requests. Please try again later."
        });
    }
});

/* =======================
   IMPORT ROUTES
======================= */
// Import AI routes
const aiRoutes = require('./routes/aiRoutes');

/* =======================
   ASYNC ERROR HANDLER WRAPPER
======================= */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/* =======================
   ROOT & HEALTH ENDPOINTS
======================= */
app.get('/', (req, res) => {
    res.json({
        message: 'Joblytics Backend API',
        status: '✅ Running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            health: '/health',
            test: '/api/test',
            ai: {
                matchSkills: '/api/ai/match-skills (POST)',
                chat: '/api/ai/chat (POST)',
                careerInsights: '/api/ai/career-insights (POST)',
                testSimple: '/api/ai/test-simple (POST)',
                testGemini: '/api/ai/test-gemini (POST)',
                listModels: '/api/ai/list-models (POST)'
            }
        }
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: '✅ Backend is working!',
        timestamp: new Date().toISOString(),
        serverTime: new Date().toLocaleTimeString(),
        requestMethod: req.method,
        requestUrl: req.originalUrl
    });
});

/* =======================
   MOUNT AI ROUTES WITH RATE LIMITING
======================= */
app.use('/api/ai', aiLimiter, aiRoutes);

/* =======================
   ERROR HANDLING MIDDLEWARE
======================= */

// 404 Handler
app.use((req, res) => {
    console.log(`❌ 404: ${req.method} ${req.originalUrl} not found`);
    res.status(404).json({
        success: false,
        error: `Endpoint ${req.method} ${req.originalUrl} not found`,
        suggestion: 'Check / endpoint for available routes',
        timestamp: new Date().toISOString()
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('\n🔥 UNHANDLED SERVER ERROR 🔥');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('Request URL:', req.originalUrl);
    console.error('Request Method:', req.method);
    
    if (req.body) {
        console.error('Request Body:', JSON.stringify(req.body, null, 2));
    }
    
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        requestId: Date.now().toString(36),
        timestamp: new Date().toISOString()
    });
});

/* =======================
   SERVER START
======================= */
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(70));
    console.log(`🚀 JOBLYTICS BACKEND SERVER STARTED`);
    console.log('='.repeat(70));
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`📍 Network: http://0.0.0.0:${PORT}`);
    console.log(`🌐 Frontend: http://localhost:5173`);
    console.log(`📡 CORS: Enabled for localhost:5173`);
    console.log(`🎯 Preflight OPTIONS: Handled`);
    console.log(`📊 Rate Limiting: Enabled (100 requests/15min)`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('='.repeat(70));
    console.log('\n✅ TEST ENDPOINTS:');
    console.log(`   GET  http://localhost:${PORT}/api/test`);
    console.log('='.repeat(70));
    console.log('\n🎯 AI ENDPOINTS:');
    console.log(`   POST /api/ai/match-skills`);
    console.log(`   POST /api/ai/chat`);
    console.log(`   POST /api/ai/career-insights`);
    console.log(`   POST /api/ai/test-simple`);
    console.log(`   POST /api/ai/test-gemini`);
    console.log(`   POST /api/ai/list-models`);
    console.log('='.repeat(70));
    console.log('\n📡 READY FOR REQUESTS FROM: http://localhost:5173');
    console.log('='.repeat(70));
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ PORT ${PORT} IS ALREADY IN USE!`);
        console.error('\nTry one of these solutions:');
        console.error('1. Use a different port: PORT=5002 node server.js');
        console.error('2. Kill the existing process:');
        console.error('   Windows: taskkill /f /im node.js');
        console.error('   Mac/Linux: killall node');
        console.error('3. Wait 60 seconds for the port to be released');
        process.exit(1);
    }
    
    console.error('\n❌ Server startup error:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🔄 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n🔄 SIGINT received. Shutting down...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

// Unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
    console.error('\n❌ UNHANDLED PROMISE REJECTION');
    console.error('Reason:', reason);
});

// Export for testing
module.exports = { app, server };