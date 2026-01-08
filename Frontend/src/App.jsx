import React, { useState, useEffect } from 'react';
import { 
  Mail, Upload, Download, RefreshCw, Clock, 
  Search, Users, Zap, FileText, 
  CheckCircle, XCircle, AlertCircle, Eye, X, 
  ChevronRight, ChevronLeft, Layout, Plus, Edit3, Save, Trash2, Calendar
} from 'lucide-react';
import CampaignDetailTable from './CampaignDetailTable'

// ============================================================================
// CONSTANTS & INITIAL DATA
// ============================================================================

const API_BASE_URL = 'http://localhost:5000/api';

const INITIAL_TEMPLATES = {
  bde: {
    name: 'BDE Partnership Outreach',
    icon: '',
    category: 'Business Development',
    subject: 'Strategic Partnership Opportunity with {{company_name}}',
    body: `Dear {{client_name}},

I hope this message finds you in great spirits.

I'm reaching out from {{our_company}}, a leading provider in digital transformation solutions. We've been following {{company_name}}'s impressive growth trajectory and believe there's a compelling opportunity for strategic collaboration.

**Why Partner With Us:**
✓ 15+ years of industry expertise
✓ 500+ successful enterprise implementations
✓ ROI-driven approach with measurable outcomes
✓ Dedicated account management team

**Proposed Next Steps:**
1. Quick 15-minute discovery call
2. Custom solution presentation
3. Pilot program discussion

I'd love to schedule a brief conversation this week to explore how we can drive mutual growth. 

Would Tuesday or Thursday afternoon work for a quick call?

Looking forward to connecting,

{{sender_name}}
{{sender_title}}
{{our_company}}
{{contact_phone}} | {{contact_email}}`
  },
  
  seo: {
    name: 'SEO Services Offer',
    icon: '',
    category: 'Digital Marketing',
    subject: 'Boost {{company_name}} Rankings - Free SEO Audit Included',
    body: `Hi {{client_name}},

I recently analyzed {{company_name}}'s online presence and noticed some significant opportunities to increase your organic traffic.

**Current Situation:**
Our preliminary audit shows that you're missing out on 2,500+ monthly searches in your industry.

**What We Offer:**
✅ Comprehensive Technical SEO Audit
✅ Competitor Gap Analysis
✅ Custom Keyword Strategy Blueprint
✅ On-Page Optimization Roadmap

**Results We've Achieved:**
• 250% average traffic increase within 6 months
• 180% boost in qualified leads

Can I share the preliminary findings I've compiled for {{company_name}}?

Best regards,
{{sender_name}}
SEO Strategist`
  },

  webDesign: {
    name: 'Website Design Proposal',
    icon: '',
    category: 'Web Development',
    subject: 'Transform {{company_name}} Digital Experience',
    body: `Hello {{client_name}},

Your website is the digital front door to {{company_name}}.

**Our Approach:**
Conversion-Focused Design
Mobile-First Development
Lightning-Fast Load Times
SEO-Optimized Architecture

I'd love to show you our recent work.

Creative regards,
{{sender_name}}`
  },

  coldEmail: {
    name: 'Cold Sales Outreach',
    icon: '',
    category: 'Sales',
    subject: 'Quick question about {{company_name}} growth goals',
    body: `Hi {{client_name}},

I'll keep this brief since I know your time is valuable.

We've helped companies in your industry achieve:
→ 45% increase in qualified leads
→ 60% faster sales cycles

Would you be open to a quick 10-minute demo?

Cheers,
{{sender_name}}`
  },

  followUp: {
    name: 'Professional Follow-Up',
    icon: '',
    category: 'Follow-Up',
    subject: 'Re: Following up - {{previous_subject}}',
    body: `Hi {{client_name}},

I wanted to circle back on my previous email regarding {{previous_topic}}.

Just reply with 1, 2, or 3 and I'll take it from there.

Best regards,
{{sender_name}}`
  }
};

// ============================================================================
// HEADER COMPONENT
// ============================================================================

function Header({ onNewCampaign, onExport, onRefresh, isLoading }) {
  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-[95%] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-30 rounded-full"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="text-white w-6 h-6" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Bulk<span className="text-indigo-600">Mail</span>Pro
            </h1>
            <p className="text-xs text-slate-500 font-medium">Enterprise Email Automation</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onNewCampaign}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Campaign
          </button>
          <button 
            onClick={onExport}
            className="p-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-all shadow-sm"
          >
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={onRefresh}
            className="p-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-all shadow-sm"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// STATS CARDS COMPONENT
// ============================================================================

function StatsCards({ totalEmails, sentEmails, pendingEmails, failedEmails }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 card-hover">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Users className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Leads</p>
            <h3 className="text-3xl font-black text-slate-900">{totalEmails}</h3>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 card-hover">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Emails Sent</p>
            <h3 className="text-3xl font-black text-slate-900">{sentEmails}</h3>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 card-hover">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
            <Clock className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Pending</p>
            <h3 className="text-3xl font-black text-slate-900">{pendingEmails}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 card-hover">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center">
            <XCircle className="w-7 h-7 text-rose-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Failed</p>
            <h3 className="text-3xl font-black text-slate-900">{failedEmails}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

function Sidebar({ 
  campaigns, 
  selectedCampaign, 
  onSelectCampaign, 
  templates, 
  onManageTemplates,
  view,
  onViewChange
}) {
  return (
    <div className="w-80 bg-white border-r border-slate-200 h-[calc(100vh-5rem)] overflow-y-auto">
      {/* View Selector */}
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Dashboard Views</h2>
        <div className="space-y-2">
          <button
            onClick={() => onViewChange('campaigns')}
            className={`w-full px-4 py-3 rounded-xl font-semibold text-left transition-all flex items-center gap-2 ${
              view === 'campaigns' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Layout className="w-5 h-5" /> All Campaigns
          </button>
          <button
            onClick={() => onViewChange('templates')}
            className={`w-full px-4 py-3 rounded-xl font-semibold text-left transition-all flex items-center gap-2 ${
              view === 'templates' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-5 h-5" /> Templates
          </button>
        </div>
      </div>

      {/* Active Campaigns List */}
      {view === 'campaigns' && (
        <div className="p-4 space-y-2">
          <h3 className="text-sm font-bold text-slate-500 uppercase px-2 mb-3">Active Campaigns</h3>
          {campaigns.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">No campaigns yet</p>
            </div>
          ) : (
            campaigns.map(camp => (
              <button
                key={camp.campaign_id}
                onClick={() => onSelectCampaign(camp.campaign_id)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedCampaign === camp.campaign_id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-slate-100 hover:border-indigo-200 bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900 text-sm">{camp.campaign_name}</h4>
                  <span className="text-xs font-mono text-slate-400">#{camp.campaign_id}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-600 to-blue-600"
                      style={{width: `${camp.total > 0 ? (camp.sent/camp.total)*100 : 0}%`}}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-600 font-semibold">{camp.sent} sent</span>
                    <span className="text-slate-400">{camp.total} total</span>
                  </div>
                  {camp.start_date && camp.end_date && (
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(camp.start_date).toLocaleDateString()} - {new Date(camp.end_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Templates List */}
      {/* {view === 'templates' && (
        <div className="p-4 space-y-2">
          <h3 className="text-sm font-bold text-slate-500 uppercase px-2 mb-3">Email Templates</h3>
          {Object.entries(templates).map(([key, template]) => (
            <div key={key} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{template.icon}</span>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-sm">{template.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{template.category}</p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{template.subject}</p>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={onManageTemplates}
            className="w-full px-4 py-3 mt-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Manage Templates
          </button>
        </div>
      )} */}
    </div>
  );
}

// ============================================================================
// CAMPAIGN DETAIL TABLE - DATE-WISE VIEW
// ============================================================================



// ============================================================================
// TEMPLATE MANAGER MODAL
// ============================================================================

function TemplateManager({ templates, onSave, onClose }) {
  const [localTemplates, setLocalTemplates] = useState(templates);
  const [editingKey, setEditingKey] = useState(null);
  const [newTemplate, setNewTemplate] = useState(null);

  const handleAddNew = () => {
    const key = `custom_${Date.now()}`;
    setNewTemplate({
      key,
      name: 'New Template',
      icon: '📧',
      category: 'Custom',
      subject: 'Subject line here',
      body: 'Email body here...'
    });
  };

  const handleSaveNew = () => {
    if (newTemplate) {
      setLocalTemplates({...localTemplates, [newTemplate.key]: newTemplate});
      setNewTemplate(null);
    }
  };

  const handleDelete = (key) => {
    const updated = {...localTemplates};
    delete updated[key];
    setLocalTemplates(updated);
  };

  const handleEdit = (key, field, value) => {
    setLocalTemplates({
      ...localTemplates,
      [key]: {...localTemplates[key], [field]: value}
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900">Manage Email Templates</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <button
            onClick={handleAddNew}
            className="w-full mb-6 p-4 border-2 border-dashed border-indigo-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-indigo-600 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add New Template
          </button>

          {newTemplate && (
            <div className="mb-6 p-6 bg-indigo-50 border-2 border-indigo-300 rounded-xl">
              <h3 className="font-bold text-lg mb-4">New Template</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Template Name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Icon (emoji)"
                  value={newTemplate.icon}
                  onChange={(e) => setNewTemplate({...newTemplate, icon: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg"
                />
                <textarea
                  placeholder="Email body"
                  value={newTemplate.body}
                  onChange={(e) => setNewTemplate({...newTemplate, body: e.target.value})}
                  rows="6"
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-mono text-sm"
                />
                <button
                  onClick={handleSaveNew}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
                >
                  Save Template
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {Object.entries(localTemplates).map(([key, template]) => (
              <div key={key} className="p-6 bg-white border-2 border-slate-200 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    {editingKey === key ? (
                      <input
                        type="text"
                        value={template.name}
                        onChange={(e) => handleEdit(key, 'name', e.target.value)}
                        className="font-bold text-lg border-b-2 border-indigo-600"
                      />
                    ) : (
                      <h3 className="font-bold text-lg">{template.name}</h3>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingKey(editingKey === key ? null : key)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {key.startsWith('custom_') && (
                      <button
                        onClick={() => handleDelete(key)}
                        className="p-2 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {editingKey === key ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={template.subject}
                      onChange={(e) => handleEdit(key, 'subject', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg"
                      placeholder="Subject"
                    />
                    <textarea
                      value={template.body}
                      onChange={(e) => handleEdit(key, 'body', e.target.value)}
                      rows="8"
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-mono text-sm"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-600">{template.subject}</p>
                    <p className="text-xs text-slate-500 line-clamp-3">{template.body}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex gap-3">
          <button
            onClick={() => {
              onSave(localTemplates);
              onClose();
            }}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
          >
            Save All Changes
          </button>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// UPLOAD CAMPAIGN MODAL
// ============================================================================

function UploadModal({ templates, onSubmit, onClose, isLoading }) {
  const [campaignName, setCampaignName] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(Object.keys(templates)[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!csvFile || !campaignName || !selectedTemplate || !startDate || !endDate) {
      alert('Please fill all required fields');
      return;
    }
    
    if (new Date(endDate) < new Date(startDate)) {
      alert('End date must be after start date');
      return;
    }
    
    onSubmit({ 
      campaignName, 
      csvFile, 
      selectedTemplate, 
      template: templates[selectedTemplate],
      startDate,
      endDate
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Create Campaign</h2>
                <p className="text-slate-500 mt-1">Configure your email sequence</p>
              </div>
              <button type="button" onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Campaign Name *</label>
                <input 
                  type="text"
                  required
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                  placeholder="e.g., Q1 2025 Outreach"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Start Date *</label>
                  <input 
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">End Date *</label>
                  <input 
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Upload CSV File *</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors bg-slate-50">
                  <input 
                    type="file"
                    accept=".csv"
                    required
                    onChange={(e) => setCsvFile(e.target.files[0])}
                    className="hidden"
                    id="csv-file"
                  />
                  <label htmlFor="csv-file" className="cursor-pointer">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    {csvFile ? (
                      <p className="text-slate-900 font-semibold">{csvFile.name}</p>
                    ) : (
                      <>
                        <p className="text-slate-900 font-semibold mb-1">Click to upload CSV</p>
                        <p className="text-xs text-slate-500">Required: client_name, client_email</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Select Email Template *</label>
                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                  {Object.entries(templates).map(([key, template]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedTemplate(key)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedTemplate === key
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{template.icon}</span>
                        <div>
                          <div className="font-bold text-slate-900">{template.name}</div>
                          <div className="text-xs text-slate-500">{template.category}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 pb-8 flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Creating...' : 'Create Campaign'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

function BulkEmailDashboard() {
  const [emails, setEmails] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [view, setView] = useState('campaigns');

  const totalEmails = emails.length;
  const sentEmails = emails.filter(e => e.status === 'sent').length;
  const pendingEmails = emails.filter(e => e.status === 'pending').length;
  const failedEmails = emails.filter(e => e.status === 'failed').length;

  useEffect(() => {
    fetchAllEmails();
  }, []);

  const fetchAllEmails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/emails`);
      const data = await response.json();
      if (data.success) {
        setEmails(data.data);
        processCampaigns(data.data);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processCampaigns = (data) => {
    const map = {};
    data.forEach(e => {
      if (!map[e.campaign_id]) {
        map[e.campaign_id] = { 
          campaign_id: e.campaign_id,
          campaign_name: e.campaign_name,
          start_date: e.start_date,
          end_date: e.end_date,
          total: 0, 
          sent: 0,
          pending: 0
        };
      }
      map[e.campaign_id].total++;
      if (e.status === 'sent') map[e.campaign_id].sent++;
      else map[e.campaign_id].pending++;
    });
    setCampaigns(Object.values(map));
  };

  const handleUploadCampaign = async ({ campaignName, csvFile, selectedTemplate, template, startDate, endDate }) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('csv', csvFile);
      formData.append('campaign_name', campaignName);
      formData.append('start_date', new Date(startDate).toISOString());
      formData.append('end_date', new Date(endDate).toISOString());
      formData.append('subject', template.subject);
      formData.append('body_template', template.body);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Campaign created successfully!\n${data.data.total_clients} emails added.`);
        setShowUploadModal(false);
        fetchAllEmails();
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Failed to upload campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Campaign', 'Client Name', 'Client Email', 'Status', 'Sent At'];
    const csvData = [
      headers.join(','),
      ...emails.map(e => [
        `"${e.campaign_name}"`,
        `"${e.client_name}"`,
        e.client_email,
        e.status,
        e.sent_at || '-'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emails_export_${Date.now()}.csv`;
    a.click();
  };

  const getSelectedCampaignData = () => {
    if (!selectedCampaign) return null;
    return campaigns.find(c => c.campaign_id === selectedCampaign);
  };

  const getSelectedCampaignEmails = () => {
    if (!selectedCampaign) return [];
    return emails.filter(e => e.campaign_id === selectedCampaign);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
      `}</style>

      <Header 
        onNewCampaign={() => setShowUploadModal(true)}
        onExport={exportToCSV}
        onRefresh={fetchAllEmails}
        isLoading={isLoading}
      />

      <div className="flex">
        <Sidebar 
          campaigns={campaigns}
          selectedCampaign={selectedCampaign}
          onSelectCampaign={setSelectedCampaign}
          templates={templates}
          onManageTemplates={() => setShowTemplateManager(true)}
          view={view}
          onViewChange={setView}
        />

        <main className="flex-1 p-8">
          {view === 'campaigns' && (
            <>
              <StatsCards 
                totalEmails={totalEmails}
                sentEmails={sentEmails}
                pendingEmails={pendingEmails}
                failedEmails={failedEmails}
              />

              <CampaignDetailTable 
                campaign={getSelectedCampaignData()}
                emails={getSelectedCampaignEmails()}
              />
            </>
          )}

          {view === 'templates' && (
            <div className="bg-white  rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">Email Templates</h2>
                <button
                  onClick={() => setShowTemplateManager(true)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Manage Templates
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(templates).map(([key, template]) => (
                  <div key={key} className="p-6 bg-slate-50 rounded-xl border-2 border-slate-200 hover:border-indigo-300 transition-all">
                    <div className="flex items-start gap-4 mb-4">
                      <span className="text-4xl">{template.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-900">{template.name}</h3>
                        <p className="text-sm text-slate-500">{template.category}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700">Subject:</p>
                      <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">{template.subject}</p>
                      <p className="text-sm font-semibold text-slate-700 mt-3">Body Preview:</p>
                      <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 line-clamp-4">{template.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {showUploadModal && (
        <UploadModal 
          templates={templates}
          onSubmit={handleUploadCampaign}
          onClose={() => setShowUploadModal(false)}
          isLoading={isLoading}
        />
      )}

      {showTemplateManager && (
        <TemplateManager 
          templates={templates}
          onSave={setTemplates}
          onClose={() => setShowTemplateManager(false)}
        />
      )}
    </div>
  );
}

export default BulkEmailDashboard;