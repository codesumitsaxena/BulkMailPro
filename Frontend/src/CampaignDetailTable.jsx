import React, { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, XCircle, Clock, Layout } from 'lucide-react';

function CampaignDetailTable({ campaign, emails }) {
  const [dateColumns, setDateColumns] = useState([]);
  const [clientRows, setClientRows] = useState([]);

  useEffect(() => {
    if (!campaign || !emails.length) return;

    // Generate all dates in campaign range
    const startDate = new Date(campaign.start_date);
    const endDate = new Date(campaign.end_date);
    const dates = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toLocaleDateString('en-GB'));
    }
    setDateColumns(dates);

    // Create client rows with their email status for each date
    const clientMap = new Map();

    emails.forEach(email => {
      const key = `${email.client_name}-${email.client_email}`;
      
      if (!clientMap.has(key)) {
        clientMap.set(key, {
          client_name: email.client_name,
          client_email: email.client_email,
          dateStatus: {}
        });
      }

      const client = clientMap.get(key);
      
      // If email has sent_at, use that date, otherwise use start date
      let emailDate;
      if (email.sent_at) {
        emailDate = new Date(email.sent_at).toLocaleDateString('en-GB');
      } else {
        emailDate = dates[0]; // First date for pending
      }

      client.dateStatus[emailDate] = {
        status: email.status,
        sent_at: email.sent_at
      };
    });

    setClientRows(Array.from(clientMap.values()));
  }, [campaign, emails]);

  if (!campaign) {
    return (
      <div className="bg-white rounded-2xl p-8 md:p-16 text-center">
        <Layout className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 text-base md:text-lg font-semibold">Select a campaign to view details</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    if (status === 'sent') {
      return (
        <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap">
          <CheckCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
          <span className="hidden sm:inline">Sent</span>
          <span className="sm:hidden">✓</span>
        </span>
      );
    } else if (status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 bg-rose-100 text-rose-700 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap">
          <XCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
          <span className="hidden sm:inline">Failed</span>
          <span className="sm:hidden">✗</span>
        </span>
      );
    } else if (status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap">
          <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
          <span className="hidden sm:inline">Pending</span>
          <span className="sm:hidden">⏱</span>
        </span>
      );
    }
    return <span className="text-slate-400 text-xs">-</span>;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Campaign Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
        <h2 className="text-lg md:text-2xl font-black mb-2">{campaign.campaign_name}</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 md:w-4 md:h-4" />
            <span>Start: {new Date(campaign.start_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 md:w-4 md:h-4" />
            <span>End: {new Date(campaign.end_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3 md:w-4 md:h-4" />
            <span>Total: {campaign.total} emails</span>
          </div>
        </div>
      </div>

      {/* Date-wise Table */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm">
            <thead className="bg-indigo-600">
              <tr>
                {dateColumns.map(date => (
                  <th key={date} className="px-4 md:px-8 py-3 md:py-4 text-center text-xs md:text-sm font-bold text-white uppercase min-w-[250px] md:min-w-[300px] border-r border-indigo-500 last:border-r-0">
                    <div className="flex flex-col items-center gap-1 md:gap-2">
                      <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-sm md:text-base">{date}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-slate-50 border-b-2 border-slate-200">
                {dateColumns.map(date => (
                  <td key={date} className="px-2 md:px-4 py-2 md:py-3 text-center border-r border-slate-200 last:border-r-0">
                    <div className="grid grid-cols-2 gap-1 md:gap-2 text-[10px] md:text-xs font-bold text-slate-600">
                      <div>CLIENT NAME</div>
                      <div>CLIENT EMAIL</div>
                      <div>STATUS</div>
                      <div>TIME</div>
                    </div>
                  </td>
                ))}
              </tr>
              {clientRows.map((client, idx) => (
                <tr key={idx} className="hover:bg-slate-50 border-b border-slate-100">
                  {dateColumns.map(date => {
                    const dateInfo = client.dateStatus[date];
                    return (
                      <td key={date} className="px-2 md:px-4 py-3 md:py-4 border-r border-slate-200 last:border-r-0 align-top">
                        {dateInfo ? (
                          <div className="grid grid-cols-2 gap-2 md:gap-3 items-start">
                            <div className="font-semibold text-slate-900 text-xs md:text-sm break-words">
                              {client.client_name}
                            </div>
                            <div className="text-slate-600 text-[10px] md:text-xs break-all">
                              {client.client_email}
                            </div>
                            <div>
                              {getStatusBadge(dateInfo.status)}
                            </div>
                            <div className="text-slate-600 text-[10px] md:text-xs pt-0.5 md:pt-1">
                              {dateInfo.sent_at ? (
                                new Date(dateInfo.sent_at).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })
                              ) : (
                                '-'
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-slate-400 text-[10px] md:text-xs py-3 md:py-4">
                            No email scheduled
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CampaignDetailTable;