import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Header from './Components/Header';
import Sidebar from './Components/Sidebar';
import StatsCards from './Components/StatsCards';
import CampaignDetailTable from './Components/CampaignDetailTable';
import TemplateGrid from './Components/TemplateGrid';
import TemplateManager from './Components/TemplateManager';
import UploadModal from './Components/UploadModal';
import { INITIAL_TEMPLATES, API_BASE_URL } from './constants/templates';

function App() {
  const [emails, setEmails] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [editingTemplateKey, setEditingTemplateKey] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [view, setView] = useState('campaigns');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const totalEmails = emails.length;
  const sentEmails = emails.filter(e => e.status === 'sent').length;
  const pendingEmails = emails.filter(e => e.status === 'pending').length;
  const failedEmails = emails.filter(e => e.status === 'failed').length;

  useEffect(() => {
    fetchAllEmails();
  }, []);

  const fetchAllEmails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/emails`);
      const data = await response.json();
      if (data.success) {
        setEmails(data.data);
        processCampaigns(data.data);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processCampaigns = (data) => {
    const map = {};
    data.forEach(e => {
      if (!map[e.campaign_id]) {
        map[e.campaign_id] = { 
          campaign_id: e.campaign_id,
          campaign_name: e.campaign_name,
          start_date: e.start_date,
          end_date: e.end_date,
          total: 0, 
          sent: 0,
          pending: 0,
          failed: 0
        };
      }
      map[e.campaign_id].total++;
      if (e.status === 'sent') map[e.campaign_id].sent++;
      else if (e.status === 'pending') map[e.campaign_id].pending++;
      else if (e.status === 'failed') map[e.campaign_id].failed++;
    });
    setCampaigns(Object.values(map));
  };

  const handleUploadCampaign = async ({ campaignName, csvFile, selectedTemplate, template, startDate, endDate }) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('csv', csvFile);
      formData.append('campaign_name', campaignName);
      formData.append('start_date', new Date(startDate).toISOString());
      formData.append('end_date', new Date(endDate).toISOString());
      formData.append('subject', template.subject);
      formData.append('body_template', template.body);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Campaign created successfully!\n${data.data.total_clients} emails added.`);
        setShowUploadModal(false);
        fetchAllEmails();
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Failed to upload campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Campaign', 'Client Name', 'Client Email', 'Status', 'Sent At'];
    const csvData = [
      headers.join(','),
      ...emails.map(e => [
        `"${e.campaign_name}"`,
        `"${e.client_name}"`,
        e.client_email,
        e.status,
        e.sent_at || '-'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emails_export_${Date.now()}.csv`;
    a.click();
  };

  const getSelectedCampaignData = () => {
    if (!selectedCampaign) return null;
    return campaigns.find(c => c.campaign_id === selectedCampaign);
  };

  const getSelectedCampaignEmails = () => {
    if (!selectedCampaign) return [];
    return emails.filter(e => e.campaign_id === selectedCampaign);
  };

  const handleEditTemplate = (templateKey) => {
    setEditingTemplateKey(templateKey);
    setShowTemplateManager(true);
  };

  const handleNewTemplate = () => {
    setEditingTemplateKey(null);
    setShowTemplateManager(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
      `}</style>

      <Header 
        onNewCampaign={() => setShowUploadModal(true)}
        onNewTemplate={handleNewTemplate}
        onExport={exportToCSV}
        onRefresh={fetchAllEmails}
        isLoading={isLoading}
        showNewTemplate={view === 'templates'}
      />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-30 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex">
        {/* Fixed Sidebar */}
        <div className="hidden lg:block lg:fixed lg:left-0 lg:top-20 lg:bottom-0 lg:w-80 lg:overflow-y-auto">
          <Sidebar 
            campaigns={campaigns}
            selectedCampaign={selectedCampaign}
            onSelectCampaign={setSelectedCampaign}
            view={view}
            onViewChange={setView}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        </div>

        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sidebar 
            campaigns={campaigns}
            selectedCampaign={selectedCampaign}
            onSelectCampaign={setSelectedCampaign}
            view={view}
            onViewChange={setView}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        </div>

        {/* Main Content with Left Margin for Fixed Sidebar */}
        <main className="flex-1 lg:ml-80 p-4 sm:p-8 overflow-x-hidden">
          {view === 'campaigns' && (
            <>
              <StatsCards 
                totalEmails={totalEmails}
                sentEmails={sentEmails}
                pendingEmails={pendingEmails}
                failedEmails={failedEmails}
              />

              <CampaignDetailTable 
                campaign={getSelectedCampaignData()}
                emails={getSelectedCampaignEmails()}
              />
            </>
          )}

          {view === 'templates' && (
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Email Templates
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Manage and customize your email templates
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingTemplateKey(null);
                    setShowTemplateManager(true);
                  }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm sm:text-base transition-colors shadow-lg"
                >
                  Manage All Templates
                </button>
              </div>

              <TemplateGrid 
                templates={templates}
                onEdit={handleEditTemplate}
              />
            </div>
          )}
        </main>
      </div>

      {showUploadModal && (
        <UploadModal 
          templates={templates}
          onSubmit={handleUploadCampaign}
          onClose={() => setShowUploadModal(false)}
          isLoading={isLoading}
        />
      )}

      {showTemplateManager && (
        <TemplateManager 
          templates={templates}
          onSave={setTemplates}
          onClose={() => {
            setShowTemplateManager(false);
            setEditingTemplateKey(null);
          }}
          editingTemplateKey={editingTemplateKey}
        />
      )}
    </div>
  );
}

export default App;