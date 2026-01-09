import React from 'react';
import { Users, CheckCircle, Clock, XCircle } from 'lucide-react';

function StatsCards({ totalEmails, sentEmails, pendingEmails, failedEmails }) {
  const stats = [
    {
      title: 'Total Leads',
      value: totalEmails,
      icon: Users,
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    },
    {
      title: 'Emails Sent',
      value: sentEmails,
      icon: CheckCircle,
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Pending',
      value: pendingEmails,
      icon: Clock,
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      title: 'Failed',
      value: failedEmails,
      icon: XCircle,
      bgColor: 'bg-rose-100',
      iconColor: 'text-rose-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={index}
            className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-slate-100 card-hover"
          >
            <div className="flex items-center gap-2 sm:gap-4">
              <div className={`w-10 h-10 sm:w-14 sm:h-14 ${stat.bgColor} rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 sm:w-7 sm:h-7 ${stat.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm font-semibold text-slate-500 uppercase tracking-wide truncate">
                  {stat.title}
                </p>
                <h3 className="text-xl sm:text-3xl font-black text-slate-900">
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