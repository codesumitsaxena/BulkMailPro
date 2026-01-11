import React, { useEffect, useState } from 'react';
import { Layout, FileText, Calendar, AlertCircle, X, RefreshCw } from 'lucide-react';

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
            const statsRes = await fetch(
              `http://localhost:5000/api/queue/campaign/${campaign.id}/stats`
            );
            const statsData = await statsRes.json();

            const clientsRes = await fetch(
              `http://localhost:5000/api/clients/campaign/${campaign.id}`
            );
            const clientsData = await clientsRes.json();

            const totalClients = clientsData.success && clientsData.data ? 
              (clientsData.data.total || clientsData.data.clients?.length || 0) : 0;
            
            const sent = statsData.success ? (statsData.data.sent || 0) : 0;
            const pending = statsData.success ? (statsData.data.pending || 0) : 0;
            const failed = statsData.success ? (statsData.data.failed || 0) : 0;

            console.log(`Campaign ${campaign.id}: Total=${totalClients}, Sent=${sent}, Pending=${pending}, Failed=${failed}`);

            return {
              campaign_id: campaign.id,
              campaign_name: campaign.campaign_name,
              start_date: campaign.start_date,
              end_date: campaign.end_date,
              total: totalClients,
              sent: sent,
              pending: pending,
              failed: failed,
              created_at: campaign.created_at,
            };
          } catch (err) {
            console.error(`Error fetching stats for campaign ${campaign.id}:`, err);
            return {
              campaign_id: campaign.id,
              campaign_name: campaign.campaign_name,
              start_date: campaign.start_date,
              end_date: campaign.end_date,
              total: 0,
              sent: 0,
              pending: 0,
              failed: 0,
              created_at: campaign.created_at,
            };
          }
        })
      );

      campaignsWithStats.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      setCampaigns(campaignsWithStats);
      console.log('✅ Campaigns loaded:', campaignsWithStats.length);

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

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onCloseMobile}
        ></div>
      )}

      {/* Sidebar - Fixed Position */}
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
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
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
              const completionPercent = camp.total > 0 ? Math.round((camp.sent / camp.total) * 100) : 0;
              
              return (
                <button
                  key={camp.campaign_id}
                  onClick={() => {
                    onSelectCampaign(camp.campaign_id);
                    onCloseMobile();
                  }}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedCampaign === camp.campaign_id
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
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
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="bg-slate-100 rounded-lg p-2 text-center">
                      <div className="text-sm font-black text-slate-700">
                        {camp.total}
                      </div>
                      <div className="text-[9px] text-slate-500 font-semibold">
                        Total
                      </div>
                    </div>
                    <div className="bg-emerald-100 rounded-lg p-2 text-center">
                      <div className="text-sm font-black text-emerald-700">
                        {camp.sent}
                      </div>
                      <div className="text-[9px] text-emerald-600 font-semibold">
                        Sent
                      </div>
                    </div>
                    <div className="bg-amber-100 rounded-lg p-2 text-center">
                      <div className="text-sm font-black text-amber-700">
                        {camp.pending}
                      </div>
                      <div className="text-[9px] text-amber-600 font-semibold">
                        Queue
                      </div>
                    </div>
                    <div className="bg-rose-100 rounded-lg p-2 text-center">
                      <div className="text-sm font-black text-rose-700">
                        {camp.failed}
                      </div>
                      <div className="text-[9px] text-rose-600 font-semibold">
                        Failed
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${completionPercent}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-2">
                      <span className="text-slate-700 font-bold">
                        {completionPercent}% Complete
                      </span>
                      <span className="text-slate-500 font-medium">
                        {camp.sent}/{camp.total}
                      </span>
                    </div>
                  </div>

                  {/* Date Range */}
                  {camp.start_date && camp.end_date && (
                    <div className="text-xs text-slate-500 flex items-center gap-1 pt-3 mt-3 border-t border-slate-200">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">
                        {new Date(camp.start_date).toLocaleDateString('en-GB')} - {new Date(camp.end_date).toLocaleDateString('en-GB')}
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