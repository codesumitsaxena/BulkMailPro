const CampaignSchedule = require('../models/CampaignSchedule');
const CampaignClient = require('../models/CampaignClient');
const TemplateModel = require('../models/templateModel');
const EmailQueue = require('../models/EmailQueue');

// Create a new schedule AND populate email_queue
exports.createSchedule = async (req, res) => {
  try {
    const { campaign_id, schedule_date, template_id, start_row, end_row, status } = req.body;

    // ✅ Step 1: Validation
    if (!campaign_id || !schedule_date || !template_id || !start_row || !end_row) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: campaign_id, schedule_date, template_id, start_row, end_row'
      });
    }

    // Validate row range
    if (parseInt(start_row) > parseInt(end_row)) {
      return res.status(400).json({
        success: false,
        message: 'start_row cannot be greater than end_row'
      });
    }

    console.log(`\n🚀 Creating schedule for campaign ${campaign_id}`);
    console.log(`📅 Schedule Date: ${schedule_date}`);
    console.log(`📝 Template ID: ${template_id}`);
    console.log(`📊 Row Range: ${start_row} - ${end_row}`);

    // ✅ Step 2: Create Schedule Entry
    const scheduleId = await CampaignSchedule.create(req.body);
    console.log(`✅ Schedule created with ID: ${scheduleId}`);

    // ✅ Step 3: Fetch Template Details
    const template = await TemplateModel.getById(template_id);
    
    if (!template) {
      await CampaignSchedule.delete(scheduleId);
      return res.status(404).json({
        success: false,
        message: `Template with ID ${template_id} not found`
      });
    }

    console.log(`📝 Template loaded: "${template.name}"`);
    console.log(`📧 Subject: "${template.subject}"`);

    // ✅ Step 4: Fetch Clients for Row Range
    const clients = await CampaignClient.findByRowRange(campaign_id, start_row, end_row);
    
    if (!clients || clients.length === 0) {
      console.warn(`⚠️ No clients found for campaign ${campaign_id} between rows ${start_row}-${end_row}`);
      return res.status(201).json({
        success: true,
        message: 'Schedule created but no clients found in this row range',
        data: {
          schedule: await CampaignSchedule.findById(scheduleId),
          emails_queued: 0,
          clients_count: 0
        }
      });
    }

    console.log(`👥 Found ${clients.length} clients to process`);

    // ✅ Step 5: Prepare Email Queue Data
    // 🔥 FIX 1: Convert DATE to DATETIME format (YYYY-MM-DD HH:MM:SS)
    const scheduledDateTime = `${schedule_date} 00:00:00`;
    
    console.log(`📦 Preparing ${clients.length} email queue entries...`);
    console.log(`📅 Scheduled DateTime: ${scheduledDateTime}`);

   const emailQueueData = clients.map(client => {
  return {
    campaign_id: campaign_id,
    schedule_id: scheduleId,
    client_id: client.id,
    template_id: template_id,
    client_name: client.client_name,
    client_email: client.client_email,
    subject: template.subject || 'No Subject',
    body_html: '',  
    body_text: template.body_template || 'No Content',
    scheduled_at: scheduledDateTime,
    status: 'pending',
    max_retries: 3
  };
});

    console.log(`✅ Email queue data prepared`);
    console.log(`📝 Sample body_text preview: "${emailQueueData[0]?.body_text?.substring(0, 50)}..."`);

    // ✅ Step 6: Bulk Insert into Email Queue
    const emailQueueResult = await EmailQueue.bulkCreate(emailQueueData);
    
    if (!emailQueueResult || emailQueueResult.affectedRows === 0) {
      console.error('❌ Failed to insert emails into queue');
      return res.status(500).json({
        success: false,
        message: 'Schedule created but failed to queue emails',
        data: {
          schedule: await CampaignSchedule.findById(scheduleId),
          error: 'Bulk insert returned 0 affected rows'
        }
      });
    }

    console.log(`✅ Successfully queued ${emailQueueResult.affectedRows} emails`);

    // ✅ Step 7: Verify counts match
    if (emailQueueResult.affectedRows !== clients.length) {
      console.warn(`⚠️ Warning: Queued ${emailQueueResult.affectedRows} emails but found ${clients.length} clients`);
    }

    // ✅ Step 8: Return Success Response
    const schedule = await CampaignSchedule.findById(scheduleId);
    
    console.log(`\n🎉 Schedule ${scheduleId} created successfully!`);
    console.log(`📊 Summary: ${emailQueueResult.affectedRows} emails queued from ${clients.length} clients`);
    console.log(`📅 Scheduled for: ${scheduledDateTime}\n`);

    res.status(201).json({
      success: true,
      message: `Schedule created and ${emailQueueResult.affectedRows} emails queued successfully`,
      data: {
        schedule,
        emails_queued: emailQueueResult.affectedRows,
        clients_count: clients.length,
        template_name: template.name,
        row_range: `${start_row}-${end_row}`,
        scheduled_date: scheduledDateTime
      }
    });

  } catch (error) {
    console.error('\n❌ Error creating schedule:', error.message);
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating schedule',
      error: error.message
    });
  }
};

// Get schedule by ID
exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await CampaignSchedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching schedule',
      error: error.message
    });
  }
};

// Get all schedules for a campaign
exports.getSchedulesByCampaign = async (req, res) => {
  try {
    const schedules = await CampaignSchedule.findByCampaignId(req.params.campaignId);
    
    res.json({
      success: true,
      data: {
        schedules,
        count: schedules.length
      }
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching schedules',
      error: error.message
    });
  }
};

// Get schedules by status
exports.getSchedulesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['pending', 'completed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const schedules = await CampaignSchedule.findByStatus(status);
    
    res.json({
      success: true,
      data: {
        schedules,
        count: schedules.length,
        status
      }
    });
  } catch (error) {
    console.error('Error fetching schedules by status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching schedules',
      error: error.message
    });
  }
};

// Get pending schedules for today
exports.getPendingToday = async (req, res) => {
  try {
    const schedules = await CampaignSchedule.getPendingToday();
    
    res.json({
      success: true,
      data: {
        schedules,
        count: schedules.length
      }
    });
  } catch (error) {
    console.error('Error fetching pending schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending schedules',
      error: error.message
    });
  }
};

// Update schedule
exports.updateSchedule = async (req, res) => {
  try {
    const updated = await CampaignSchedule.update(req.params.id, req.body);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found or no changes made'
      });
    }
    
    const schedule = await CampaignSchedule.findById(req.params.id);
    
    res.json({
      success: true,
      message: 'Schedule updated successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating schedule',
      error: error.message
    });
  }
};

// Update schedule status
exports.updateScheduleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'completed'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const updated = await CampaignSchedule.updateStatus(req.params.id, status);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    const schedule = await CampaignSchedule.findById(req.params.id);
    
    res.json({
      success: true,
      message: 'Schedule status updated successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Error updating schedule status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating schedule status',
      error: error.message
    });
  }
};

// Cancel schedule
exports.cancelSchedule = async (req, res) => {
  try {
    const cancelled = await CampaignSchedule.cancel(req.params.id);
    
    if (!cancelled) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found or cannot be cancelled'
      });
    }
    
    const schedule = await CampaignSchedule.findById(req.params.id);
    
    res.json({
      success: true,
      message: 'Schedule cancelled successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Error cancelling schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling schedule',
      error: error.message
    });
  }
};

// Delete schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const deleted = await CampaignSchedule.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting schedule',
      error: error.message
    });
  }
};