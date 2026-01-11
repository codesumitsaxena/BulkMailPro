// =====================================================
// FILE: server.js (UPDATED)
// =====================================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const templateRoutes = require('./routes/templateRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const emailRoutes = require('./routes/emailRoutes');
const campaignClientRoutes = require('./routes/campaignClientRoutes');
const campaignScheduleRoutes = require('./routes/campaignScheduleRoutes');
const emailQueueRoutes = require('./routes/emailQueueRoutes');
const campaignTrackingRoutes = require('./routes/campaignTrackingRoutes'); // ✅ NEW

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/templates', templateRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/clients', campaignClientRoutes);
app.use('/api/schedules', campaignScheduleRoutes);
app.use('/api/queue', emailQueueRoutes);
app.use('/api', campaignTrackingRoutes); // ✅ NEW - Tracking routes

// Health check
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Email Campaign Automation API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      templates: '/api/templates',
      campaigns: '/api/campaigns',
      emails: '/api/emails',
      clients: '/api/clients',
      schedules: '/api/schedules',
      queue: '/api/queue',
      tracking: '/api/campaign/:id/tracking' // ✅ NEW
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('📡 Available Routes:');
  console.log(`   Templates:  http://localhost:${PORT}/api/templates`);
  console.log(`   Campaigns:  http://localhost:${PORT}/api/campaigns`);
  console.log(`   Emails:     http://localhost:${PORT}/api/emails`);
  console.log(`   Clients:    http://localhost:${PORT}/api/clients`);
  console.log(`   Schedules:  http://localhost:${PORT}/api/schedules`);
  console.log(`   Queue:      http://localhost:${PORT}/api/queue`);
  console.log(`   📊 Tracking: http://localhost:${PORT}/api/campaign/:id/tracking`); // ✅ NEW
  console.log('═══════════════════════════════════════════════════════');
});
