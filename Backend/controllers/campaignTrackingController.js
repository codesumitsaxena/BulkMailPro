const db = require('../config/db');

const getCampaignTracking = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaignQuery = `
      SELECT 
        id,
        campaign_name,
        start_date,
        end_date,
        total_clients,
        status
      FROM campaign 
      WHERE id = ?
    `;
    
    const [campaignResult] = await db.execute(campaignQuery, [campaignId]);
    
    if (!campaignResult || campaignResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    const campaign = campaignResult[0];
    
    // 2. Generate date range
    const dates = [];
    const startDate = new Date(campaign.start_date);
    const endDate = new Date(campaign.end_date);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    
    const trackingQuery = `
      SELECT 
        cc.id as client_id,
        cc.client_name,
        cc.client_email,
        cc.csv_row,
        cs.id as schedule_id,
        cs.schedule_date,
        eq.id as queue_id,
        eq.status,
        eq.sent_at,
        eq.error_message
      FROM campaign_client cc
      LEFT JOIN campaign_schedule cs ON cs.campaign_id = cc.campaign_id 
        AND cc.csv_row BETWEEN cs.start_row AND cs.end_row
      LEFT JOIN email_queue eq ON eq.client_id = cc.id 
        AND eq.schedule_id = cs.id
      WHERE cc.campaign_id = ?
      ORDER BY cc.csv_row, cs.schedule_date
    `;
    
    const [trackingData] = await db.execute(trackingQuery, [campaignId]);
    
    // 4. Transform data into client-wise format with date status
    const clientsMap = new Map();
    
    trackingData.forEach(row => {
      if (!clientsMap.has(row.client_id)) {
        clientsMap.set(row.client_id, {
          client_id: row.client_id,
          client_name: row.client_name,
          client_email: row.client_email,
          csv_row: row.csv_row,
          dateStatus: {}
        });
      }
      
      const client = clientsMap.get(row.client_id);
      
      // Add status for each date
      if (row.schedule_date) {
        const dateKey = new Date(row.schedule_date).toISOString().split('T')[0];
        client.dateStatus[dateKey] = {
          schedule_id: row.schedule_id,
          queue_id: row.queue_id,
          status: row.status || 'not_queued',
          sent_at: row.sent_at,
          error_message: row.error_message
        };
      }
    });
    
    const clients = Array.from(clientsMap.values());
    
    // 5. Calculate summary statistics
    const stats = {
      total_clients: clients.length,
      total_scheduled: 0,
      total_sent: 0,
      total_pending: 0,
      total_failed: 0
    };
    
    clients.forEach(client => {
      Object.values(client.dateStatus).forEach(dateStatus => {
        if (dateStatus.status !== 'not_queued') {
          stats.total_scheduled++;
        }
        if (dateStatus.status === 'sent') {
          stats.total_sent++;
        }
        if (dateStatus.status === 'pending') {
          stats.total_pending++;
        }
        if (dateStatus.status === 'failed') {
          stats.total_failed++;
        }
      });
    });
    
    // 6. Return formatted response
    res.json({
      success: true,
      data: {
        campaign: {
          id: campaign.id,
          name: campaign.campaign_name,
          start_date: campaign.start_date,
          end_date: campaign.end_date,
          status: campaign.status
        },
        dates,
        clients,
        stats
      }
    });
    
  } catch (error) {
    console.error('Error fetching campaign tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaign tracking data',
      error: error.message
    });
  }
};

// Get TODAY's tracking data only - Auto updates daily
const getTodayTracking = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const today = new Date().toISOString().split('T')[0]; // Auto gets today's date
    
    console.log(`📅 Fetching data for today: ${today}`);
    
    // Get campaign details
    const campaignQuery = `
      SELECT id, campaign_name, start_date, end_date, total_clients, status
      FROM campaign WHERE id = ?
    `;
    const [campaignResult] = await db.execute(campaignQuery, [campaignId]);
    
    if (!campaignResult || campaignResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    const campaign = campaignResult[0];
    
    // Get only today's schedule and related data
    const trackingQuery = `
      SELECT 
        cc.id as client_id,
        cc.client_name,
        cc.client_email,
        cc.csv_row,
        cs.id as schedule_id,
        cs.schedule_date,
        eq.id as queue_id,
        eq.status,
        eq.sent_at,
        eq.error_message
      FROM campaign_client cc
      INNER JOIN campaign_schedule cs ON cs.campaign_id = cc.campaign_id 
        AND cc.csv_row BETWEEN cs.start_row AND cs.end_row
        AND DATE(cs.schedule_date) = ?
      LEFT JOIN email_queue eq ON eq.client_id = cc.id 
        AND eq.schedule_id = cs.id
      WHERE cc.campaign_id = ?
      ORDER BY cc.csv_row
    `;
    
    const [trackingData] = await db.execute(trackingQuery, [today, campaignId]);
    
    console.log(`✅ Found ${trackingData.length} clients scheduled for today`);
    
    // Format response
    const clients = trackingData.map(row => ({
      client_id: row.client_id,
      client_name: row.client_name,
      client_email: row.client_email,
      csv_row: row.csv_row,
      status: row.status || 'pending',
      sent_at: row.sent_at,
      error_message: row.error_message
    }));
    
    // Calculate stats
    const stats = {
      total_clients: clients.length,
      total_sent: clients.filter(c => c.status === 'sent').length,
      total_pending: clients.filter(c => c.status === 'pending').length,
      total_failed: clients.filter(c => c.status === 'failed').length
    };
    
    res.json({
      success: true,
      data: {
        campaign: {
          id: campaign.id,
          name: campaign.campaign_name,
          start_date: campaign.start_date,
          end_date: campaign.end_date,
          status: campaign.status
        },
        today: today,
        clients,
        stats
      }
    });
    
  } catch (error) {
    console.error('Error fetching today tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today tracking data',
      error: error.message
    });
  }
};

// Get real-time status updates (for polling)
const getStatusUpdates = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { since } = req.query;
    
    let query = `
      SELECT 
        eq.id as queue_id,
        eq.client_id,
        eq.schedule_id,
        eq.status,
        eq.sent_at,
        eq.error_message,
        cs.schedule_date
      FROM email_queue eq
      JOIN campaign_schedule cs ON eq.schedule_id = cs.id
      WHERE eq.campaign_id = ?
    `;
    
    const params = [campaignId];
    
    if (since) {
      query += ` AND (eq.sent_at > ? OR eq.created_at > ?)`;
      params.push(since, since);
    }
    
    query += ` ORDER BY eq.id`;
    
    const [updates] = await db.execute(query, params);
    
    res.json({
      success: true,
      data: {
        updates,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error fetching status updates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching status updates',
      error: error.message
    });
  }
};

// Get schedule overview (for dashboard)
const getScheduleOverview = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const query = `
      SELECT 
        cs.id as schedule_id,
        cs.schedule_date,
        cs.start_row,
        cs.end_row,
        cs.status as schedule_status,
        COUNT(eq.id) as total_emails,
        SUM(CASE WHEN eq.status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN eq.status = 'sent' THEN 1 ELSE 0 END) as sent_count,
        SUM(CASE WHEN eq.status = 'failed' THEN 1 ELSE 0 END) as failed_count
      FROM campaign_schedule cs
      LEFT JOIN email_queue eq ON eq.schedule_id = cs.id
      WHERE cs.campaign_id = ?
      GROUP BY cs.id, cs.schedule_date, cs.start_row, cs.end_row, cs.status
      ORDER BY cs.schedule_date
    `;
    
    const [overview] = await db.execute(query, [campaignId]);
    
    res.json({
      success: true,
      data: {
        schedules: overview
      }
    });
    
  } catch (error) {
    console.error('Error fetching schedule overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching schedule overview',
      error: error.message
    });
  }
};

// ✅ Export all functions
module.exports = {
  getCampaignTracking,
  getTodayTracking,
  getStatusUpdates,
  getScheduleOverview
};