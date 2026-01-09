import React, { useEffect, useMemo, useState } from "react";
import { X, FileText } from "lucide-react";

/* ---------------- Utils ---------------- */
function getDatesBetween(start, end) {
  const dates = [];
  const current = new Date(start);

  while (current <= new Date(end)) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

/* ---------------- Component ---------------- */
function UploadModal({
  templates = {},
  onSubmit,
  onClose,
  isLoading = false,
}) {
  const [campaignName, setCampaignName] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dayTemplates, setDayTemplates] = useState({});

  const templateOptions = Object.entries(templates);

  /* ---------- Max 5 days logic ---------- */
  const maxEndDate = startDate ? addDays(startDate, 4) : "";

  /* ---------- Days ---------- */
  const days = useMemo(() => {
    if (!startDate || !endDate) return [];
    return getDatesBetween(startDate, endDate);
  }, [startDate, endDate]);

  /* ---------- Init day templates ---------- */
useEffect(() => {
  if (days.length === 0 || templateOptions.length === 0) return;

  setDayTemplates(prev => {
    const updated = { ...prev };
    const defaultTemplate = templateOptions[0][0];

    days.forEach(day => {
      if (!updated[day]) {
        updated[day] = defaultTemplate;
      }
    });

    // remove extra days (if date range reduced)
    Object.keys(updated).forEach(day => {
      if (!days.includes(day)) {
        delete updated[day];
      }
    });

    return updated;
  });
}, [days, templateOptions]);


  /* ---------- Submit ---------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!campaignName || !csvFile || !startDate || !endDate) {
      alert("Please fill all required fields");
      return;
    }

    onSubmit({
      campaignName,
      csvFile,
      startDate,
      endDate,
      dayTemplates, // 🔥 KEY OUTPUT
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b flex justify-between">
            <div>
              <h2 className="text-2xl font-black">Create Campaign</h2>
              <p className="text-sm text-slate-500">
                Max 5 days email sequence
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-slate-100 rounded-xl"
            >
              <X />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {/* Campaign Name */}
            <div>
              <label className="font-bold text-sm mb-2 block">
                Campaign Name *
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-xl bg-slate-50"
                required
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-sm mb-2 block">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setEndDate("");
                  }}
                  className="w-full px-4 py-3 border-2 rounded-xl bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-sm mb-2 block">
                  End Date * (Max 5 days)
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={maxEndDate}   // 🔥 MAX 5 DAYS
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-xl bg-slate-50"
                  required
                />
              </div>
            </div>

            {/* CSV */}
            <div>
              <label className="font-bold text-sm mb-2 block">
                Upload CSV *
              </label>
              <label className="block border-2 border-dashed p-6 rounded-xl text-center bg-slate-50 cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                />
                <FileText className="mx-auto mb-2 text-slate-400" size={40} />
                {csvFile ? csvFile.name : "Click to upload CSV"}
              </label>
            </div>

            {/* Day-wise Template Dropdown */}
            {days.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-black text-lg">
                  Day-wise Template Selection
                </h3>

                {days.map((day, index) => (
                  <div
                    key={day}
                    className="grid grid-cols-3 items-center gap-4 bg-slate-50 p-4 rounded-xl"
                  >
                    <div className="font-bold">
                      Day {index + 1}
                    </div>

                    <div className="text-sm text-slate-500">
                      {day}
                    </div>

                    <select
                      value={dayTemplates[day] || ""}
                      onChange={(e) =>
                        setDayTemplates((prev) => ({
                          ...prev,
                          [day]: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border-2 rounded-lg bg-white"
                    >
                      {templateOptions.map(([key, t]) => (
                        <option key={key} value={key}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-6 flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold"
            >
              {isLoading ? "Creating..." : "Create Campaign"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 bg-slate-100 rounded-xl font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadModal;
