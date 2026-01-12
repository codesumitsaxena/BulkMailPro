import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Plus, Edit3, Trash2, Save, ChevronLeft, ChevronRight } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';
const TEMPLATES_PER_PAGE = 2;

function TemplateManager({ onClose, onRefresh }) {
  const [templates, setTemplates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newTemplate, setNewTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/templates`);
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      alert('Failed to fetch templates');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = useMemo(() => Math.ceil(templates.length / TEMPLATES_PER_PAGE), [templates.length]);

  const visibleTemplates = useMemo(() => {
    const start = currentPage * TEMPLATES_PER_PAGE;
    return templates.slice(start, start + TEMPLATES_PER_PAGE);
  }, [templates, currentPage]);

  const handleAddNew = useCallback(() => {
    setNewTemplate({
      name: 'New Template',
      subject: 'Subject line here',
      body_template: 'Email body here...\n\nAvailable variables:\n{{client_name}}\n{{company_name}}'
    });
    setEditingId(null);
  }, []);

  const handleSaveNew = async () => {
    if (!newTemplate?.name || !newTemplate?.subject || !newTemplate?.body_template) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate)
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Template created successfully!');
        setNewTemplate(null);
        fetchTemplates();
        if (onRefresh) onRefresh();
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error('Error creating template:', error);
      alert('❌ Failed to create template');
    }
  };

  const handleDelete = async (id) => {
    const template = templates.find(t => t.id === id);
    
    if (!window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Template deleted successfully!');
        fetchTemplates();
        if (onRefresh) onRefresh();
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('❌ Failed to delete template');
    }
  };

  const handleEdit = useCallback((id, field, value) => {
    setTemplates(templates => templates.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  }, []);

  const handleSaveEdit = async (id) => {
    const template = templates.find(t => t.id === id);

    if (!template.name || !template.subject || !template.body_template) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: template.name,
          subject: template.subject,
          body_template: template.body_template
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Template updated successfully!');
        setEditingId(null);
        fetchTemplates();
        if (onRefresh) onRefresh();
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating template:', error);
      alert('❌ Failed to update template');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-black text-slate-900">Manage Email Templates</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col p-4">
          <button
            onClick={handleAddNew}
            className="w-full mb-4 p-3 border-2 border-dashed border-indigo-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-indigo-600 font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Template
          </button>

          {newTemplate && (
            <div className="mb-4 p-4 bg-indigo-50 border-2 border-indigo-300 rounded-lg">
              <h3 className="font-bold text-sm mb-3">Create New Template</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-0.5 block">Template Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Welcome Email"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="w-full px-3 py-1.5 border-2 border-slate-200 rounded-lg text-sm focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-0.5 block">Email Subject *</label>
                  <input
                    type="text"
                    placeholder="e.g. Welcome to {{company_name}}"
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                    className="w-full px-3 py-1.5 border-2 border-slate-200 rounded-lg text-sm focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-0.5 block">Email Body *</label>
                  <textarea
                    placeholder="Hi {{client_name}},&#10;&#10;We're excited to have you on board!"
                    value={newTemplate.body_template}
                    onChange={(e) => setNewTemplate({ ...newTemplate, body_template: e.target.value })}
                    rows="6"
                    className="w-full px-3 py-1.5 border-2 border-slate-200 rounded-lg font-mono text-xs focus:border-indigo-600 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    💡 Use: {'{{'} client_name {'}}'}, {'{{'} company_name {'}}'}
                  </p>
                </div>

                <button
                  onClick={handleSaveNew}
                  className="w-full px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Create Template
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-slate-500 font-semibold text-sm">No templates yet</p>
                <p className="text-xs text-slate-400 mt-1">Click "Add New Template" to create one</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="grid grid-cols-2 gap-3 flex-1">
                {visibleTemplates.map((template) => (
                  <div key={template.id} className="p-3 bg-white border-2 border-slate-200 rounded-lg hover:border-indigo-200 transition-all overflow-y-auto">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        {editingId === template.id ? (
                          <input
                            type="text"
                            value={template.name}
                            onChange={(e) => handleEdit(template.id, 'name', e.target.value)}
                            className="font-bold text-sm border-b-2 border-indigo-600 w-full focus:outline-none"
                          />
                        ) : (
                          <h3 className="font-bold text-sm truncate">{template.name}</h3>
                        )}
                        <p className="text-[10px] text-slate-400 mt-0.5">ID: {template.id}</p>
                      </div>

                      <div className="flex gap-1">
                        {editingId === template.id ? (
                          <button
                            onClick={() => handleSaveEdit(template.id)}
                            className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                            title="Save"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingId(template.id)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {editingId === template.id ? (
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 mb-0.5 block">Subject</label>
                          <input
                            type="text"
                            value={template.subject}
                            onChange={(e) => handleEdit(template.id, 'subject', e.target.value)}
                            className="w-full px-2 py-1.5 border-2 rounded text-xs focus:border-indigo-600 outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 mb-0.5 block">Body</label>
                          <textarea
                            rows="8"
                            value={template.body_template}
                            onChange={(e) => handleEdit(template.id, 'body_template', e.target.value)}
                            className="w-full px-2 py-1.5 border-2 rounded font-mono text-[10px] focus:border-indigo-600 outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500">Subject:</p>
                          <p className="text-xs text-slate-700">{template.subject}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500">Body Preview:</p>
                          <p className="text-[10px] text-slate-600 line-clamp-4 whitespace-pre-wrap">
                            {template.body_template}
                          </p>
                        </div>
                        <p className="text-[9px] text-slate-400">
                          Created: {new Date(template.created_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs text-slate-600 font-semibold">
                    Page {currentPage + 1} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-3 border-t flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplateManager;