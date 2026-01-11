import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

function CampaignDetailTable({ campaignId }) {
  const [campaign, setCampaign] = useState(null);
  const [dates, setDates] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const perPage = 6;

  const API_BASE = "http://localhost:5000/api";

  useEffect(() => {
    if (!campaignId) return;
    fetchAllData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [campaignId]);

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/campaign/${campaignId}/tracking`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch data');
      }
      
      const { campaign, dates, clients, stats } = result.data;
      
      setCampaign(campaign);
      setDates(dates);
      
      const rowsArray = clients.map(client => ({
        name: client.client_name,
        email: client.client_email,
        rowNumber: client.csv_row,
        days: client.dateStatus
      }));
      
      setRows(rowsArray);
      setPage(1);
      
      console.log('✅ Data loaded:', {
        campaign: campaign.name,
        dates: dates.length,
        clients: clients.length,
        stats
      });
      
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const start = (page - 1) * perPage;
  const visibleRows = rows.slice(start, start + perPage);
  const totalPages = Math.ceil(rows.length / perPage);

  const statusBadge = (status, error) => {
    if (status === "sent") {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-semibold">
          <CheckCircle className="w-3 h-3" /> Sent
        </div>
      );
    }
    if (status === "failed") {
      return (
        <div 
          className="inline-flex items-center gap-1 px-2 py-1 bg-rose-50 text-rose-700 rounded-md text-xs font-semibold cursor-help"
          title={error || "Failed to send"}
        >
          <XCircle className="w-3 h-3" /> Failed
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-semibold">
        <Clock className="w-3 h-3" /> Pending
      </div>
    );
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    return { day, month, weekday };
  };

  if (isLoading && !campaign) {
    return (
      <div className="bg-white p-10 rounded-2xl text-center shadow border">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading campaign data...</p>
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="bg-white p-10 rounded-2xl text-center shadow border">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <p className="text-rose-600 font-semibold mb-2">Error loading campaign</p>
        <p className="text-sm text-slate-600">{error}</p>
        <button
          onClick={fetchAllData}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="bg-white p-10 rounded-2xl text-center shadow border text-slate-500">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Select a Campaign</h3>
        <p>Choose a campaign from the sidebar to view details</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold">{campaign.name}</h3>
              <p className="text-sm text-indigo-100 mt-1">
                {new Date(campaign.start_date).toLocaleDateString('en-GB')} - {new Date(campaign.end_date).toLocaleDateString('en-GB')}
              </p>
            </div>
            <button
              onClick={fetchAllData}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="p-10 text-center">
          <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold mb-2">No Clients in Campaign</p>
          <p className="text-sm text-slate-500">
            Upload a CSV file to add clients to this campaign.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">{campaign.name}</h3>
            <p className="text-xs text-indigo-100 mt-0.5">
              {new Date(campaign.start_date).toLocaleDateString('en-GB')} - {new Date(campaign.end_date).toLocaleDateString('en-GB')}
            </p>
          </div>
          <button
            onClick={fetchAllData}
            disabled={isLoading}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-3 px-4 py-3 bg-slate-50 border-b">
        <div className="text-center">
          <div className="text-xl font-black text-slate-700">{rows.length}</div>
          <div className="text-[10px] text-slate-500 font-semibold">Total</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-black text-emerald-600">
            {rows.reduce((sum, row) => 
              sum + Object.values(row.days).filter(d => d.status === 'sent').length, 0
            )}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold">Sent</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-black text-amber-600">
            {rows.reduce((sum, row) => 
              sum + Object.values(row.days).filter(d => d.status === 'pending').length, 0
            )}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-black text-rose-600">
            {rows.reduce((sum, row) => 
              sum + Object.values(row.days).filter(d => d.status === 'failed').length, 0
            )}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold">Failed</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-100 border-b-2">
            <tr>
              <th className="px-3 py-2 text-left w-[220px] min-w-[220px] font-bold text-slate-700 sticky left-0 bg-slate-100 z-10 border-r">
                Client Info
              </th>
              
              {dates.map((d) => {
                const { day, month, weekday } = formatDate(d);
                return (
                  <th
                    key={d}
                    className="px-2 py-2 text-center font-bold text-slate-700 border-l"
                  >
                    <div className="text-sm font-black text-indigo-600">{day}</div>
                    <div className="text-[10px] text-slate-600">{month}</div>
                    <div className="text-[9px] text-slate-400 font-normal">{weekday}</div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {visibleRows.map((row, i) => (
              <tr key={i} className="border-b hover:bg-slate-50 transition-colors">
                <td className="px-3 py-2.5 sticky left-0 bg-white z-10 border-r">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[10px] flex-shrink-0">
                      {row.rowNumber}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 truncate text-xs">
                        {row.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {row.email}
                      </div>
                    </div>
                  </div>
                </td>

                {dates.map((d) => {
                  const info = row.days[d];
                  return (
                    <td key={d} className="px-2 py-2.5 text-center border-l">
                      {info ? (
                        <div className="flex flex-col items-center gap-1">
                          {statusBadge(info.status, info.error_message)}
                          {info.sent_at && (
                            <div className="text-[9px] text-slate-500 font-medium">
                              {new Date(info.sent_at).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-lg">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-t">
          <span className="text-xs text-slate-600">
            {start + 1}-{Math.min(start + perPage, rows.length)} of {rows.length}
          </span>

          <div className="flex gap-1.5 items-center">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 border rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1.5 text-xs font-semibold">
              {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 border rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CampaignDetailTable;