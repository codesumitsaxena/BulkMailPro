import React from 'react';
import { Users, CheckCircle, Clock, XCircle } from 'lucide-react';

function StatsCards({ totalEmails, sentEmails, pendingEmails, failedEmails }) {
  const stats = [
    {
      title: 'Total Leads',
      value: totalEmails || 0,
      icon: Users,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Emails Sent',
      value: sentEmails || 0,
      icon: CheckCircle,
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Pending',
      value: pendingEmails || 0,
      icon: Clock,
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      title: 'Failed',
      value: failedEmails || 0,
      icon: XCircle,
      bgColor: 'bg-rose-100',
      iconColor: 'text-rose-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={index}
            className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 card-hover"
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-7 h-7 ${stat.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">
                  {stat.title}
                </p>
                <h3 className="text-3xl font-black text-slate-900">
                  {stat.value}
                </h3>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;