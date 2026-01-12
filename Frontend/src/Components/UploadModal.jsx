import React, { useEffect, useState, useCallback, useMemo } from "react";
import { X, FileText, Send } from "lucide-react";
import Papa from "papaparse";

const getDatesBetween = (start, end) => {
  const dates = [];
  const current = new Date(start);
  const endDate = new Date(end);
  while (current <= endDate) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const getTodayDate = () => new Date().toISOString().split("T")[0];

function UploadModal({ onClose }) {
  const [campaignName, setCampaignName] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [templates, setTemplates] = useState([]);
  const [daySchedules, setDaySchedules] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = useMemo(() => getTodayDate(), []);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:5000/api/templates");
        const data = await response.json();
        if (data.success) setTemplates(data.data);
      } catch (error) {
        console.error("Error fetching templates:", error);
        alert("Failed to fetch templates");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const maxEndDate = useMemo(() => startDate ? addDays(startDate, 4) : "", [startDate]);

  const days = useMemo(() => {
    if (!startDate || !endDate) return [];
    return getDatesBetween(startDate, endDate);
  }, [startDate, endDate]);

  const handleCsvUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvFile(file);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        setTotalRows(results.data.length);
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        alert("Failed to parse CSV file");
      },
    });
  }, []);

  useEffect(() => {
    if (days.length === 0 || templates.length === 0 || totalRows === 0) return;

    const rowsPerDay = Math.ceil(totalRows / days.length);
    setDaySchedules((prev) => {
      const updated = {};
      days.forEach((day, index) => {
        const startRow = index * rowsPerDay + 1;
        const endRow = Math.min((index + 1) * rowsPerDay, totalRows);
        updated[day] = prev[day] || {
          template_id: templates[0]?.id || "",
          start_row: startRow,
          end_row: endRow,
        };
      });
      return updated;
    });
  }, [days, templates, totalRows]);

  const updateDaySchedule = useCallback((day, field, value) => {
    setDaySchedules((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: field === "template_id" ? value : parseInt(value),
      },
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (!campaignName.trim()) {
      alert("Please enter campaign name");
      return false;
    }
    if (!csvFile || csvData.length === 0) {
      alert("Please upload a valid CSV file");
      return false;
    }
    if (!startDate || !endDate) {
      alert("Please select start and end dates");
      return false;
    }
    if (days.length === 0) {
      alert("Please select valid date range");
      return false;
    }

    for (const day of days) {
      const schedule = daySchedules[day];
      if (!schedule || !schedule.template_id) {
        alert(`Please select template for ${day}`);
        return false;
      }
      if (schedule.start_row < 1 || schedule.end_row > totalRows) {
        alert(`Invalid row range for ${day}`);
        return false;
      }
      if (schedule.start_row > schedule.end_row) {
        alert(`Start row cannot be greater than end row for ${day}`);
        return false;
      }
    }
    return true;
  }, [campaignName, csvFile, csvData, startDate, endDate, days, daySchedules, totalRows]);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    let campaignId = null;

    try {
      const campaignResponse = await fetch("http://localhost:5000/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_name: campaignName,
          start_date: startDate,
          end_date: endDate,
          total_clients: totalRows,
          csv_file_name: csvFile.name,
          status: "draft",
        }),
      });

      const campaignData = await campaignResponse.json();
      if (!campaignResponse.ok || !campaignData.success) {
        throw new Error(campaignData.message || "Failed to create campaign");
      }

      campaignId = campaignData.data.id;

      const clientsData = csvData.map((row, index) => ({
        campaign_id: campaignId,
        csv_row_number: index + 1,
        client_name: row.name || row.client_name || row.Name || row.ClientName || "",
        client_email: row.email || row.client_email || row.Email || row.ClientEmail || "",
      }));

      const emptyNames = clientsData.filter(c => !c.client_name).length;
      const emptyEmails = clientsData.filter(c => !c.client_email).length;
      
      if (emptyNames > 0 || emptyEmails > 0) {
        throw new Error(`CSV data incomplete: ${emptyNames} missing names, ${emptyEmails} missing emails`);
      }

      const clientsResponse = await fetch("http://localhost:5000/api/clients/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients: clientsData }),
      });

      const clientsResult = await clientsResponse.json();
      if (!clientsResponse.ok || !clientsResult.success) {
        await fetch(`http://localhost:5000/api/campaigns/${campaignId}`, { method: "DELETE" });
        throw new Error(clientsResult.message || "Failed to upload clients");
      }

      const schedulePromises = days.map((day) => {
        const schedule = daySchedules[day];
        return fetch("http://localhost:5000/api/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaign_id: campaignId,
            schedule_date: day,
            template_id: schedule.template_id,
            start_row: schedule.start_row,
            end_row: schedule.end_row,
            status: "pending",
          }),
        }).then(async (res) => {
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(`Failed to create schedule for ${day}: ${data.message}`);
          }
          return data;
        });
      });

      await Promise.all(schedulePromises);
      alert("🎉 Campaign created successfully!");
      onClose();
      window.location.reload();

    } catch (error) {
      console.error("Error creating campaign:", error);
      if (campaignId) {
        try {
          await fetch(`http://localhost:5000/api/campaigns/${campaignId}`, { method: "DELETE" });
        } catch (rollbackError) {
          console.error("Rollback failed:", rollbackError);
        }
      }
      alert(`Failed to create campaign: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
            <div>
              <h2 className="text-lg font-bold">Create Email Campaign</h2>
              <p className="text-xs text-slate-500 mt-0.5">Upload CSV, select dates & assign templates</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Campaign Name */}
            <div>
              <label className="font-semibold text-xs mb-1 block text-slate-700">Campaign Name *</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-3 py-2 text-sm border-2 rounded-lg bg-slate-50 focus:border-indigo-600 outline-none"
                placeholder="e.g. Black Friday Sale 2025"
              />
            </div>

            {/* CSV Upload */}
            <div>
              <label className="font-semibold text-xs mb-1 block text-slate-700">Upload CSV File * (columns: name, email)</label>
              <label className="block border-2 border-dashed p-3 rounded-lg text-center bg-slate-50 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
                <FileText className="mx-auto mb-1.5 text-slate-400" size={28} />
                <p className="font-semibold text-sm text-slate-700">{csvFile ? csvFile.name : "Click to upload CSV"}</p>
                {totalRows > 0 && <p className="text-xs text-indigo-600 mt-1">✅ {totalRows} rows loaded</p>}
              </label>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-xs mb-1 block text-slate-700">Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  min={today}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setEndDate("");
                  }}
                  className="w-full px-3 py-2 text-sm border-2 rounded-lg bg-slate-50 focus:border-indigo-600 outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-xs mb-1 block text-slate-700">End Date * (Max 5 days)</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || today}
                  max={maxEndDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-2 rounded-lg bg-slate-50 focus:border-indigo-600 outline-none"
                  disabled={!startDate}
                />
              </div>
            </div>

            {/* Day-wise Schedule */}
            {days.length > 0 && totalRows > 0 && (
              <div className="space-y-2.5">
                <h3 className="font-bold text-sm flex items-center gap-2 text-slate-800">
                  📅 Day-wise Email Schedule
                  <span className="text-xs font-normal text-slate-500">({days.length} days)</span>
                </h3>

                {days.map((day, index) => {
                  const schedule = daySchedules[day] || {};
                  return (
                    <div key={day} className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg border border-indigo-200">
                      <div className="grid grid-cols-12 gap-2.5 items-center">
                        <div className="col-span-2">
                          <div className="font-bold text-xs">Day {index + 1}</div>
                          <div className="text-[10px] text-slate-600">{day}</div>
                        </div>

                        <div className="col-span-5">
                          <label className="text-[10px] font-semibold text-slate-600 mb-0.5 block">Email Template</label>
                          <select
                            value={schedule.template_id || ""}
                            onChange={(e) => updateDaySchedule(day, "template_id", e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border rounded-lg bg-white focus:border-indigo-600 outline-none"
                          >
                            <option value="">Select Template</option>
                            {templates.map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-5 grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-600 mb-0.5 block">Start Row</label>
                            <input
                              type="number"
                              min="1"
                              max={totalRows}
                              value={schedule.start_row || ""}
                              onChange={(e) => updateDaySchedule(day, "start_row", e.target.value)}
                              className="w-full px-2 py-1.5 text-xs border rounded-lg bg-white focus:border-indigo-600 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-slate-600 mb-0.5 block">End Row</label>
                            <input
                              type="number"
                              min="1"
                              max={totalRows}
                              value={schedule.end_row || ""}
                              onChange={(e) => updateDaySchedule(day, "end_row", e.target.value)}
                              className="w-full px-2 py-1.5 text-xs border rounded-lg bg-white focus:border-indigo-600 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-1.5 text-[10px] text-indigo-700 font-semibold">
                        📧 Will send {schedule.end_row && schedule.start_row ? schedule.end_row - schedule.start_row + 1 : 0} emails on {day}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-3 flex gap-2 bg-slate-50 flex-shrink-0">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Create Campaign
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-white border-2 border-slate-300 rounded-xl font-semibold text-sm hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;