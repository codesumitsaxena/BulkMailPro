import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function CampaignDetailTable({ campaign, emails }) {
  const [dates, setDates] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 10;

  /* =======================
     BUILD DAYS + ROWS
  ======================== */
  useEffect(() => {
    if (!campaign || !emails?.length) return;

    // Generate date range (max 5 days assumed)
    const start = new Date(campaign.start_date);
    const end = new Date(campaign.end_date);
    const dateArr = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dateArr.push(new Date(d).toLocaleDateString("en-GB"));
    }
    setDates(dateArr);

    // Group by client
    const map = new Map();

    emails.forEach((e) => {
      const key = `${e.client_email}`;
      if (!map.has(key)) {
        map.set(key, {
          name: e.client_name,
          email: e.client_email,
          days: {},
        });
      }

      const day =
        e.sent_at
          ? new Date(e.sent_at).toLocaleDateString("en-GB")
          : dateArr[0];

      map.get(key).days[day] = {
        status: e.status,
        time: e.sent_at,
      };
    });

    setRows([...map.values()]);
    setPage(1);
  }, [campaign, emails]);

  /* =======================
     PAGINATION
  ======================== */
  const start = (page - 1) * perPage;
  const visibleRows = rows.slice(start, start + perPage);
  const totalPages = Math.ceil(rows.length / perPage);

  /* =======================
     STATUS BADGE
  ======================== */
  const statusBadge = (status) => {
    if (status === "sent")
      return (
        <span className="flex items-center gap-1 text-emerald-700 text-xs font-semibold">
          <CheckCircle className="w-4 h-4" /> Sent
        </span>
      );
    if (status === "failed")
      return (
        <span className="flex items-center gap-1 text-rose-700 text-xs font-semibold">
          <XCircle className="w-4 h-4" /> Failed
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-amber-700 text-xs font-semibold">
        <Clock className="w-4 h-4" /> Pending
      </span>
    );
  };

  if (!campaign)
    return (
      <div className="bg-white p-10 rounded-xl text-center text-slate-500">
        Select a campaign
      </div>
    );

  /* =======================
     UI
  ======================== */
  return (
    <div className="bg-white rounded-2xl shadow border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left min-w-[200px]">
                Client
              </th>
              {dates.map((d) => (
                <th
                  key={d}
                  className="px-4 py-3 text-center min-w-[140px]"
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {visibleRows.map((row, i) => (
              <tr
                key={i}
                className="border-b hover:bg-slate-50"
              >
                {/* CLIENT INFO */}
                <td className="px-4 py-4">
                  <div className="font-semibold text-slate-900">
                    {row.name}
                  </div>
                  <div className="text-xs text-slate-500 break-all">
                    {row.email}
                  </div>
                </td>

                {/* DAY CELLS */}
                {dates.map((d) => {
                  const info = row.days[d];
                  return (
                    <td
                      key={d}
                      className="px-4 py-4 text-center"
                    >
                      {info ? (
                        <div className="space-y-1">
                          {statusBadge(info.status)}
                          <div className="text-xs text-slate-500">
                            {info.time
                              ? new Date(info.time).toLocaleTimeString(
                                  "en-US",
                                  { hour: "2-digit", minute: "2-digit" }
                                )
                              : "-"}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">
                          —
                        </span>
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
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50">
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2 border rounded disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 border rounded disabled:opacity-40"
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
