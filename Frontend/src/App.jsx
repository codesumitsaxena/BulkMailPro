import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Header from './Components/Header';
import Sidebar from './Components/Sidebar';
import StatsCards from './Components/StatsCards';
import CampaignDetailTable from './Components/CampaignDetailTable';
import TemplateGrid from './Components/TemplateGrid';
import TemplateManager from './Components/TemplateManager';
import UploadModal from './Components/UploadModal';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  // State Management
  const [globalStats, setGlobalStats] = useState({
    total: 0,
    sent: 0,
    pending: 0,
    failed: 0
  });
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [view, setView] = useState('campaigns');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Initial Data Fetch
  useEffect(() => {
    fetchGlobalStats();
    fetchTemplates();
  }, [refreshTrigger]);

  // Fetch Global Email Stats - FIXED VERSION
  const fetchGlobalStats = async () => {
    try {
      console.log('🔄 Fetching global stats...');
      
      const campaignsRes = await fetch(`${API_BASE_URL}/campaigns`);
      const campaignsData = await campaignsRes.json();

      if (!campaignsData.success) {
        console.warn('⚠️ No campaigns data');
        return;
      }

      const campaigns = campaignsData.data || [];
      console.log(`📊 Found ${campaigns.length} campaigns`);
      
      let totalStats = { total: 0, sent: 0, pending: 0, failed: 0 };

      for (const campaign of campaigns) {
        try {
          const statsRes = await fetch(`${API_BASE_URL}/queue/campaign/${campaign.id}/stats`);
          const statsData = await statsRes.json();
          
          const clientsRes = await fetch(`${API_BASE_URL}/clients/campaign/${campaign.id}`);
          const clientsData = await clientsRes.json();
          
          const emailStats = statsData.success && statsData.data ? statsData.data : {};
          const totalClients = clientsData.success && clientsData.data ? 
            (clientsData.data.total || clientsData.data.clients?.length || 0) : 0;
          
          totalStats.total += totalClients;
          totalStats.sent += emailStats.sent || 0;
          totalStats.pending += emailStats.pending || 0;
          totalStats.failed += emailStats.failed || 0;
          
          console.log(`Campaign ${campaign.id} (${campaign.campaign_name}):`, {
            total: totalClients,
            sent: emailStats.sent || 0,
            pending: emailStats.pending || 0,
            failed: emailStats.failed || 0
          });
          
        } catch (err) {
          console.error(`❌ Error fetching stats for campaign ${campaign.id}:`, err);
        }
      }

      setGlobalStats(totalStats);
      console.log('✅ Global stats updated:', totalStats);

    } catch (error) {
      console.error('❌ Error fetching global stats:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/templates`);
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data || []);
        console.log('✅ Templates loaded:', data.data?.length || 0);
      }
    } catch (error) {
      console.error('❌ Error fetching templates:', error);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    setRefreshTrigger(prev => prev + 1);
  };

  const exportToCSV = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/queue`);
      const data = await response.json();
      
      if (!data.success || !data.data || data.data.length === 0) {
        alert('No data to export');
        return;
      }

      const emails = data.data;
      const headers = ['Campaign ID', 'Client Name', 'Client Email', 'Subject', 'Status', 'Scheduled At', 'Sent At'];
      const csvData = [
        headers.join(','),
        ...emails.map(e => [
          e.campaign_id || 'N/A',
          `"${e.client_name || 'N/A'}"`,
          e.client_email || 'N/A',
          `"${e.subject || 'N/A'}"`,
          e.status || 'pending',
          e.scheduled_at || '-',
          e.sent_at || '-'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `emails_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ CSV exported successfully');
    } catch (error) {
      console.error('❌ Error exporting CSV:', error);
      alert('Failed to export data');
    }
  };

  const handleCampaignCreated = () => {
    console.log('✅ Campaign created, refreshing data...');
    setShowUploadModal(false);
    handleRefresh();
  };

  const handleTemplateChange = () => {
    console.log('🔄 Template changed, reloading...');
    fetchTemplates();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { 
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          overflow-x: hidden;
        }
        .card-hover { 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
        }
        .card-hover:hover { 
          transform: translateY(-4px); 
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); 
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      {/* Header - Fixed at Top */}
      <Header 
        onNewCampaign={() => setShowUploadModal(true)}
        onNewTemplate={() => setShowTemplateManager(true)}
        onExport={exportToCSV}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        showNewTemplate={view === 'templates'}
      />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-30 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        aria-label="Open Menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Main Layout Container */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          selectedCampaign={selectedCampaign}
          onSelectCampaign={setSelectedCampaign}
          view={view}
          onViewChange={setView}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          refreshTrigger={refreshTrigger}
        />

        {/* Main Content Area - Padding only bottom and sides */}
        <main className="flex-1 lg:ml-80 px-6 pb-2 pt-4 min-h-screen">
          {/* Campaigns View */}
          {view === 'campaigns' && (
            <>
              {/* Stats Cards */}
              <StatsCards 
                totalEmails={globalStats.total}
                sentEmails={globalStats.sent}
                pendingEmails={globalStats.pending}
                failedEmails={globalStats.failed}
              />

              {/* Campaign Detail Table */}
              {selectedCampaign ? (
                <CampaignDetailTable 
                  campaignId={selectedCampaign}
                  key={selectedCampaign}
                />
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-slate-200">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Select a Campaign
                  </h3>
                  <p className="text-slate-500">
                    Choose a campaign from the sidebar to view details
                  </p>
                </div>
              )}
            </>
          )}

          {/* Templates View */}
          {view === 'templates' && (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    Email Templates
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Manage and customize your email templates ({templates.length} total)
                  </p>
                </div>
                <button
                  onClick={() => setShowTemplateManager(true)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-lg"
                >
                  + New Template
                </button>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-slate-500">Loading templates...</p>
                </div>
              ) : (
                <TemplateGrid 
                  templates={templates}
                  onEdit={(templateId) => {
                    setShowTemplateManager(true);
                  }}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleCampaignCreated}
        />
      )}

      {/* Template Manager Modal */}
      {showTemplateManager && (
        <TemplateManager 
          onClose={() => setShowTemplateManager(false)}
          onRefresh={handleTemplateChange}
        />
      )}
    </div>
  );
}

export default App;