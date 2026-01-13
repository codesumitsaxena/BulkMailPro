const express = require('express');
const axios = require('axios');
const router = express.Router();

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

console.log('🔗 N8N Webhook URL configured:', N8N_WEBHOOK_URL ? '✅ Yes' : '❌ No');

if (!N8N_WEBHOOK_URL) {
  console.error('❌ CRITICAL: N8N_WEBHOOK_URL is missing in .env file!');
}

/**
 * POST /api/trigger-campaign
 */
router.post('/trigger-campaign', async (req, res) => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Triggering N8N campaign workflow...');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔗 Target URL:', N8N_WEBHOOK_URL);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!N8N_WEBHOOK_URL) {
      throw new Error('N8N_WEBHOOK_URL not configured in .env file');
    }

    const response = await axios.post(
      N8N_WEBHOOK_URL,
      req.body,
      {
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'BulkMailPro-Backend/1.0'
        },
        timeout: 30000, // 30 seconds
        validateStatus: (status) => status < 600 // Don't throw on 4xx/5xx
      }
    );

    console.log('✅ N8N Response Status:', response.status);
    console.log('✅ N8N Response Data:', JSON.stringify(response.data, null, 2));

    // Check if N8N returned an error status
    if (response.status >= 400) {
      return res.status(response.status).json({
        success: false,
        message: 'N8N workflow returned an error',
        statusCode: response.status,
        n8nResponse: response.data,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Campaign workflow triggered successfully',
      data: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ N8N ERROR DETAILS:');
    console.error('Message:', error.message);
    console.error('Response Status:', error.response?.status);
    console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Full Error:', error);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    res.status(500).json({
      success: false,
      message: 'Failed to trigger N8N workflow',
      error: error.message,
      details: error.response?.data || 'No additional details',
      statusCode: error.response?.status || 500,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/test-n8n
 * Safe test endpoint
 */
router.post('/test-n8n', async (req, res) => {
  try {
    console.log('🧪 Testing N8N connection...');
    
    if (!N8N_WEBHOOK_URL) {
      return res.status(500).json({
        success: false,
        message: 'N8N_WEBHOOK_URL not configured in .env file'
      });
    }

    const response = await axios.post(
      N8N_WEBHOOK_URL,
      {
        action: 'test',
        source: 'backend',
        timestamp: new Date().toISOString()
      },
      { 
        timeout: 8000,
        validateStatus: (status) => status < 600
      }
    );

    console.log('✅ N8N Test Response:', response.status, response.data);

    res.json({
      success: true,
      message: 'N8N connection test successful',
      statusCode: response.status,
      data: response.data
    });

  } catch (error) {
    console.error('❌ N8N Test Failed:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to connect to N8N',
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
});

/**
 * GET /api/campaign-status
 * Backend health check
 */
router.get('/campaign-status', (req, res) => {
  res.json({
    success: true,
    status: 'backend-online',
    n8nConfigured: Boolean(N8N_WEBHOOK_URL),
    n8nUrl: N8N_WEBHOOK_URL ? 'Configured' : 'Missing',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;