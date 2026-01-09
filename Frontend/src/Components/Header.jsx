import React from 'react';
import { Zap, Plus, Download, RefreshCw } from 'lucide-react';

function Header({ onNewCampaign, onNewTemplate, onExport, onRefresh, isLoading, showNewTemplate }) {
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
          <button 
            onClick={onNewCampaign}
            className="px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-base"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> 
            <span className="hidden sm:inline">New Campaign</span>
            <span className="sm:hidden">New</span>
          </button>
          <button 
            onClick={onExport}
            className="p-2 sm:p-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg sm:rounded-xl transition-all shadow-sm"
            title="Export to CSV"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
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