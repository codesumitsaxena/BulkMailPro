import React from 'react';
import { Layout, FileText, Calendar, AlertCircle, X } from 'lucide-react';

function Sidebar({ 
  campaigns, 
  selectedCampaign, 
  onSelectCampaign, 
  view,
  onViewChange,
  isMobileOpen,
  onCloseMobile
}) {
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
        fixed lg:static inset-y-0 left-0 z-50
        w-72 sm:w-80 bg-white border-r border-slate-200 
        h-screen lg:h-[calc(100vh-5rem)] overflow-y-auto
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* View Selector */}
        <div className="p-4 sm:p-6 border-b border-slate-200">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">
            Dashboard Views
          </h2>
          <div className="space-y-2">
            <button
              onClick={() => {
                onViewChange('campaigns');
                onCloseMobile();
              }}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-left transition-all flex items-center gap-2 text-sm sm:text-base ${
                view === 'campaigns' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Layout className="w-4 h-4 sm:w-5 sm:h-5" /> All Campaigns
            </button>
            <button
              onClick={() => {
                onViewChange('templates');
                onCloseMobile();
              }}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-left transition-all flex items-center gap-2 text-sm sm:text-base ${
                view === 'templates' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> Templates
            </button>
          </div>
        </div>

        {/* Active Campaigns List */}
        {view === 'campaigns' && (
          <div className="p-3 sm:p-4 space-y-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-500 uppercase px-2 mb-3">
              Active Campaigns
            </h3>
            {campaigns.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2" />
                <p className="text-xs sm:text-sm">No campaigns yet</p>
              </div>
            ) : (
              campaigns.map(camp => (
                <button
                  key={camp.campaign_id}
                  onClick={() => {
                    onSelectCampaign(camp.campaign_id);
                    onCloseMobile();
                  }}
                  className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all text-left ${
                    selectedCampaign === camp.campaign_id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-slate-100 hover:border-indigo-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 flex-1">
                      {camp.campaign_name}
                    </h4>
                    <span className="text-[10px] sm:text-xs font-mono text-slate-400 flex-shrink-0 ml-2">
                      #{camp.campaign_id}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-emerald-50 rounded-lg p-2 text-center">
                        <div className="text-xs sm:text-sm font-black text-emerald-700">
                          {camp.sent}
                        </div>
                        <div className="text-[8px] sm:text-[10px] text-emerald-600 font-semibold">
                          Sent
                        </div>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-2 text-center">
                        <div className="text-xs sm:text-sm font-black text-amber-700">
                          {camp.pending}
                        </div>
                        <div className="text-[8px] sm:text-[10px] text-amber-600 font-semibold">
                          Pending
                        </div>
                      </div>
                      <div className="bg-rose-50 rounded-lg p-2 text-center">
                        <div className="text-xs sm:text-sm font-black text-rose-700">
                          {camp.failed || 0}
                        </div>
                        <div className="text-[8px] sm:text-[10px] text-rose-600 font-semibold">
                          Failed
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="h-1.5 sm:h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 transition-all duration-500"
                          style={{width: `${camp.total > 0 ? (camp.sent/camp.total)*100 : 0}%`}}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[9px] sm:text-xs mt-1.5">
                        <span className="text-slate-500 font-medium">
                          {camp.total > 0 ? Math.round((camp.sent/camp.total)*100) : 0}% Complete
                        </span>
                        <span className="text-slate-400 font-medium">
                          {camp.total} total
                        </span>
                      </div>
                    </div>

                    {/* Date Range */}
                    {camp.start_date && camp.end_date && (
                      <div className="text-[9px] sm:text-xs text-slate-500 flex items-center gap-1 pt-1 border-t border-slate-200">
                        <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                        <span className="truncate">
                          {new Date(camp.start_date).toLocaleDateString('en-GB')} - {new Date(camp.end_date).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Sidebar;