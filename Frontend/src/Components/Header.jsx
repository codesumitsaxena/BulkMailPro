import React, { useState, useEffect } from 'react';
import { Zap, Plus, Download, RefreshCw, Play, Square } from 'lucide-react';

function Header({ onNewCampaign, onNewTemplate, onExport, onRefresh, isLoading, showNewTemplate }) {
  const [isCampaignRunning, setIsCampaignRunning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [pendingEmailCount, setPendingEmailCount] = useState(0);
  const [isFetchingCount, setIsFetchingCount] = useState(false);

  // ✅ Remove BACKEND_API since you're using the full URL in the fetch
  const EMAIL_QUEUE_API = 'http://localhost:5000/api/email-queue/pending/ready';
  const TRIGGER_CAMPAIGN_API = 'http://localhost:5000/api/trigger-campaign';

  // Fetch pending email count
  const fetchPendingCount = async () => {
    setIsFetchingCount(true);
    try {
      const response = await fetch(EMAIL_QUEUE_API);
      if (response.ok) {
        const result = await response.json();
        // Handle nested structure: result.data.count
        const count = result.data?.count || result.count || 0;
        setPendingEmailCount(count);
        console.log('✅ Pending emails count:', count);
      }
    } catch (error) {
      console.error('❌ Error fetching pending email count:', error);
      setPendingEmailCount(0);
    } finally {
      setIsFetchingCount(false);
    }
  };

  // Fetch count on component mount and set up interval
  useEffect(() => {
    fetchPendingCount();
    // Set up interval to refresh count every 10 seconds
    const interval = setInterval(fetchPendingCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCampaignToggle = async () => {
    // Don't allow starting if no emails pending
    if (!isCampaignRunning && pendingEmailCount === 0) {
      alert('No pending emails to send. Please add emails to the queue first.');
      return;
    }

    setIsStarting(true);
    
    try {
      // ✅ Use the constant instead of hardcoding
      const response = await fetch(TRIGGER_CAMPAIGN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isCampaignRunning ? 'stop' : 'start',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        setIsCampaignRunning(!isCampaignRunning);
        console.log(`✅ Campaign ${isCampaignRunning ? 'stopped' : 'started'}`, result);
        
        // Refresh count after starting
        if (!isCampaignRunning) {
          setTimeout(fetchPendingCount, 1000);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to toggle campaign:', errorData);
        alert(`Failed to toggle campaign: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error toggling campaign:', error);
      alert('Error connecting to server. Please check your connection.');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-full mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-30 rounded-full"></div>
            <div className="relative w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="text-white w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900">
              Bulk<span className="text-indigo-600">Mail</span>Pro
            </h1>
            <p className="text-[9px] sm:text-xs text-slate-500 font-medium hidden sm:block">
              Enterprise Email Automation
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Start/Stop Campaign Button with Count Badge */}
          <div className="relative">
            {/* Pending Email Count Badge */}
            {!isCampaignRunning && (
              <div className="absolute -top-2 -right-2 z-10">
                <div className={`px-2 py-1 rounded-full text-xs font-bold shadow-lg ${
                  pendingEmailCount === 0 
                    ? 'bg-gray-400 text-white' 
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white animate-pulse'
                }`}>
                  {isFetchingCount ? '...' : pendingEmailCount}
                </div>
              </div>
            )}
            
            <button 
              onClick={handleCampaignToggle}
              disabled={isStarting || (!isCampaignRunning && pendingEmailCount === 0)}
              className={`px-3 py-2 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-base ${
                isCampaignRunning 
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-rose-200' 
                  : pendingEmailCount === 0
                    ? 'bg-gray-400 text-white cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-emerald-200'
              } ${isStarting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isStarting ? (
                <>
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  <span className="hidden sm:inline">Processing...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : isCampaignRunning ? (
                <>
                  <Square className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Stop Campaign</span>
                  <span className="sm:hidden">Stop</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Start Campaign</span>
                  <span className="sm:hidden">Start</span>
                </>
              )}
            </button>
          </div>

          {/* New Campaign Button */}
          <button 
            onClick={onNewCampaign}
            className="px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-base"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> 
            <span className="hidden sm:inline">New Campaign</span>
            <span className="sm:hidden">New</span>
          </button>

          {/* Export Button */}
          <button 
            onClick={onExport}
            className="p-2 sm:p-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg sm:rounded-xl transition-all shadow-sm"
            title="Export to CSV"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Refresh Button */}
          <button 
            onClick={onRefresh}
            className="p-2 sm:p-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg sm:rounded-xl transition-all shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;