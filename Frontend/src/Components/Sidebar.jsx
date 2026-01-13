import React, { useEffect, useState } from 'react';
import { Layout, FileText, Calendar, AlertCircle, X, RefreshCw, CheckCircle, Clock } from 'lucide-react';

function Sidebar({ 
  selectedCampaign, 
  onSelectCampaign, 
  view,
  onViewChange,
  isMobileOpen,
  onCloseMobile,
  refreshTrigger = 0
}) {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCampaigns();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchCampaigns, 100000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const campaignsRes = await fetch('http://localhost:5000/api/campaigns');
      const campaignsData = await campaignsRes.json();

      if (!campaignsData.success) {
        throw new Error(campaignsData.message || 'Failed to fetch campaigns');
      }

      const campaignsList = campaignsData.data || [];

      const campaignsWithStats = await Promise.all(
        campaignsList.map(async (campaign) => {
          try {
            console.log(`\n🔍 Fetching stats for campaign ${campaign.id}...`);
            
            // 🔥 METHOD 1: Try fetching from campaign-client endpoint
            let totalClients = 0;
            
            try {
              const clientsRes = await fetch(
                `http://localhost:5000/api/campaign-client/campaign/${campaign.id}`
              );
              const clientsData = await clientsRes.json();
              
              console.log(`📦 Clients API response:`, clientsData);

              if (clientsData.success && clientsData.data) {
                // Try different response formats
                if (typeof clientsData.data.total === 'number') {
                  totalClients = clientsData.data.total;
                } else if (Array.isArray(clientsData.data.clients)) {
                  totalClients = clientsData.data.clients.length;
                } else if (Array.isArray(clientsData.data)) {
                  totalClients = clientsData.data.length;
                } else if (clientsData.data.count) {
                  totalClients = clientsData.data.count;
                }
              }
            } catch (err) {
              console.warn(`⚠️ Could not fetch clients from campaign-client endpoint:`, err.message);
            }

            // 🔥 METHOD 2: If totalClients is still 0, count from email_queue
            if (totalClients === 0) {
              try {
                const queueRes = await fetch(
                  `http://localhost:5000/api/email-queue/campaign/${campaign.id}`
                );
                const queueData = await queueRes.json();
                
                if (queueData.success && queueData.data) {
                  if (Array.isArray(queueData.data)) {
                    // Get unique client_ids
                    const uniqueClients = new Set(queueData.data.map(email => email.client_id));
                    totalClients = uniqueClients.size;
                  } else if (queueData.data.count) {
                    totalClients = queueData.data.count;
                  }
                }
                
                console.log(`📧 Email queue unique clients: ${totalClients}`);
              } catch (err) {
                console.warn(`⚠️ Could not fetch from email queue:`, err.message);
              }
            }

            console.log(`✅ Total clients for campaign ${campaign.id}: ${totalClients}`);

            // Fetch email queue stats
            const statsRes = await fetch(
              `http://localhost:5000/api/email-queue/stats/campaign/${campaign.id}`
            );
            const statsData = await statsRes.json();
            
            const sent = statsData.success ? (statsData.data.sent || 0) : 0;
            const pending = statsData.success ? (statsData.data.pending || 0) : 0;
            const failed = statsData.success ? (statsData.data.failed || 0) : 0;

            console.log(`📊 Stats - Sent: ${sent}, Pending: ${pending}, Failed: ${failed}`);

            // Fetch schedule status
            let scheduleStatus = 'Not Started';
            let scheduleCount = { pending: 0, completed: 0 };
            
            try {
              const schedulesRes = await fetch(
                `http://localhost:5000/api/campaign-schedule/campaign/${campaign.id}`
              );
              const schedulesData = await schedulesRes.json();
              
              if (schedulesData.success && schedulesData.data && schedulesData.data.schedules) {
                const schedules = schedulesData.data.schedules;
                scheduleCount.pending = schedules.filter(s => s.status === 'pending').length;
                scheduleCount.completed = schedules.filter(s => s.status === 'completed').length;
                
                if (schedules.length === 0) {
                  scheduleStatus = 'Not Started';
                } else if (scheduleCount.completed > 0 && scheduleCount.pending === 0) {
                  scheduleStatus = 'Completed';
                } else if (scheduleCount.pending > 0 || sent > 0) {
                  scheduleStatus = 'In Progress';
                } else {
                  scheduleStatus = 'Not Started';
                }
              }
            } catch (err) {
              console.warn(`Could not fetch schedules for campaign ${campaign.id}`);
            }

            // Calculate completion percentage
            const completionPercent = totalClients > 0 
              ? Math.round((sent / totalClients) * 100) 
              : 0;

            console.log(`📈 Completion: ${completionPercent}% (${sent}/${totalClients})\n`);

            return {
              campaign_id: campaign.id,
              campaign_name: campaign.campaign_name,
              start_date: campaign.start_date,
              end_date: campaign.end_date,
              total: totalClients,
              sent: sent,
              pending: pending,
              failed: failed,
              scheduleStatus: scheduleStatus,
              scheduleCount: scheduleCount,
              completionPercent: completionPercent,
              created_at: campaign.created_at,
            };
          } catch (err) {
            console.error(`❌ Error fetching stats for campaign ${campaign.id}:`, err);
            return {
              campaign_id: campaign.id,
              campaign_name: campaign.campaign_name,
              start_date: campaign.start_date,
              end_date: campaign.end_date,
              total: 0,
              sent: 0,
              pending: 0,
              failed: 0,
              scheduleStatus: 'Not Started',
              scheduleCount: { pending: 0, completed: 0 },
              completionPercent: 0,
              created_at: campaign.created_at,
            };
          }
        })
      );

      campaignsWithStats.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      setCampaigns(campaignsWithStats);
      
      console.log('✅ All campaigns loaded:', campaignsWithStats.map(c => ({
        id: c.campaign_id,
        name: c.campaign_name,
        total: c.total,
        sent: c.sent,
        completion: `${c.completionPercent}%`
      })));

      if (!selectedCampaign && campaignsWithStats.length > 0) {
        onSelectCampaign(campaignsWithStats[0].campaign_id);
      }

    } catch (err) {
      console.error('❌ Error fetching campaigns:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    if (status === 'Completed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
          <CheckCircle className="w-3 h-3" />
          Completed
        </span>
      );
    }
    if (status === 'In Progress') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
          <Clock className="w-3 h-3" />
          In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">
        <Calendar className="w-3 h-3" />
        Not Started
      </span>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onCloseMobile}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 top-20 z-40
        w-80 bg-white border-r border-slate-200 
        flex flex-col
        h-[calc(100vh-5rem)]
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-lg z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* View Selector */}
        <div className="p-6 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Dashboard Views
          </h2>
          <div className="space-y-2">
            <button
              onClick={() => {
                onViewChange('campaigns');
                onCloseMobile();
              }}
              className={`w-full px-4 py-3 rounded-xl font-semibold text-left transition-all flex items-center gap-2 ${
                view === 'campaigns' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Layout className="w-5 h-5" /> All Campaigns
            </button>
            <button
              onClick={() => {
                onViewChange('templates');
                onCloseMobile();
              }}
              className={`w-full px-4 py-3 rounded-xl font-semibold text-left transition-all flex items-center gap-2 ${
                view === 'templates' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-5 h-5" /> Templates
            </button>
          </div>
        </div>

        {/* Active Campaigns List */}
        {view === 'campaigns' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active Campaigns
              </h3>
              <button
                onClick={fetchCampaigns}
                disabled={isLoading}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh campaigns"
              >
                <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Loading State */}
            {isLoading && campaigns.length === 0 && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                <p className="text-sm text-slate-500">Loading campaigns...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-center">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                <p className="text-xs text-rose-700 font-semibold mb-2">Error loading campaigns</p>
                <p className="text-xs text-rose-600">{error}</p>
                <button
                  onClick={fetchCampaigns}
                  className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && campaigns.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm font-semibold mb-1">No campaigns yet</p>
                <p className="text-xs text-slate-400">Create your first campaign to get started</p>
              </div>
            )}

            {/* Campaigns List */}
            {!isLoading && !error && campaigns.map((camp) => {
              return (
                <button
                  key={camp.campaign_id}
                  onClick={() => {
                    onSelectCampaign(camp.campaign_id);
                    onCloseMobile();
                  }}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedCampaign === camp.campaign_id
                      ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                      : 'border-slate-200 hover:border-indigo-300 bg-white hover:shadow-md'
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-2 flex-1 pr-2">
                      {camp.campaign_name}
                    </h4>
                    <span className="text-xs font-mono text-slate-400 flex-shrink-0">
                      #{camp.campaign_id}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-3">
                    <StatusBadge status={camp.scheduleStatus} />
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="bg-slate-100 rounded-lg p-2 text-center">
                      <div className="text-sm font-black text-slate-700">
                        {camp.total}
                      </div>
                      <div className="text-[9px] text-slate-500 font-semibold uppercase">
                        Total
                      </div>
                    </div>
                    <div className="bg-emerald-100 rounded-lg p-2 text-center">
                      <div className="text-sm font-black text-emerald-700">
                        {camp.sent}
                      </div>
                      <div className="text-[9px] text-emerald-600 font-semibold uppercase">
                        Sent
                      </div>
                    </div>
                    <div className="bg-amber-100 rounded-lg p-2 text-center">
                      <div className="text-sm font-black text-amber-700">
                        {camp.pending}
                      </div>
                      <div className="text-[9px] text-amber-600 font-semibold uppercase">
                        Pending
                      </div>
                    </div>
                    <div className="bg-rose-100 rounded-lg p-2 text-center">
                      <div className="text-sm font-black text-rose-700">
                        {camp.failed}
                      </div>
                      <div className="text-[9px] text-rose-600 font-semibold uppercase">
                        Failed
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 transition-all duration-700 ease-out shadow-sm"
                        style={{ width: `${camp.completionPercent}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-2">
                      <span className="text-slate-700 font-bold">
                        {camp.completionPercent}% Complete
                      </span>
                      <span className="text-slate-500 font-semibold">
                        {camp.sent}/{camp.total}
                      </span>
                    </div>
                  </div>

                  {/* Date Range */}
                  {camp.start_date && camp.end_date && (
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-3 border-t border-slate-200">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">
                        {new Date(camp.start_date).toLocaleDateString('en-GB', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })} - {new Date(camp.end_date).toLocaleDateString('en-GB', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default Sidebar;