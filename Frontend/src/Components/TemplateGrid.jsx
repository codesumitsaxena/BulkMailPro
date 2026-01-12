import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Save, X } from 'lucide-react';

const TEMPLATES_PER_PAGE = 2;
const API_BASE_URL = 'http://localhost:5000/api';

function TemplateGrid({ templates = [], onEdit }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editedTemplates, setEditedTemplates] = useState({});

  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(templates.length / TEMPLATES_PER_PAGE)), 
    [templates.length]
  );

  const visibleTemplates = useMemo(() => {
    if (!templates || templates.length === 0) return [];
    const start = currentPage * TEMPLATES_PER_PAGE;
    return templates.slice(start, start + TEMPLATES_PER_PAGE);
  }, [templates, currentPage]);

  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => (prev + 1) % totalPages);
  }, [totalPages]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage(prev => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  const handleEdit = useCallback((templateId) => {
    const template = templates.find(t => t.id === templateId);
    setEditingId(templateId);
    setEditedTemplates(prev => ({
      ...prev,
      [templateId]: {
        name: template.name,
        subject: template.subject,
        body_template: template.body_template
      }
    }));
  }, [templates]);

  const handleFieldChange = useCallback((templateId, field, value) => {
    setEditedTemplates(prev => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        [field]: value
      }
    }));
  }, []);

  const handleSave = async (templateId) => {
    const editedData = editedTemplates[templateId];
    
    if (!editedData.name || !editedData.subject || !editedData.body_template) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData)
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Template updated successfully!');
        setEditingId(null);
        if (onEdit) onEdit();
        window.location.reload();
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating template:', error);
      alert('❌ Failed to update template');
    }
  };

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setEditedTemplates({});
  }, []);

  if (!templates || templates.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-slate-500 font-semibold">No templates found</p>
        <p className="text-sm text-slate-400 mt-2">Create your first template to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="grid grid-cols-2 gap-3 flex-1">
        {visibleTemplates.map((template) => {
          const isEditing = editingId === template.id;
          const editedData = editedTemplates[template.id] || template;

          return (
            <div
              key={template.id}
              className="bg-slate-50 rounded-xl border-2 border-slate-200 hover:border-indigo-300 transition-all group flex flex-col overflow-hidden"
            >
              {isEditing ? (
                <div className="p-3 flex flex-col h-full overflow-y-auto">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-sm text-indigo-600">Editing Template</h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleSave(template.id)}
                        className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                        title="Save"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 flex-1">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 mb-0.5 block">Template Name</label>
                      <input
                        type="text"
                        value={editedData.name}
                        onChange={(e) => handleFieldChange(template.id, 'name', e.target.value)}
                        className="w-full px-2 py-1.5 border-2 rounded text-xs focus:border-indigo-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 mb-0.5 block">Subject</label>
                      <input
                        type="text"
                        value={editedData.subject}
                        onChange={(e) => handleFieldChange(template.id, 'subject', e.target.value)}
                        className="w-full px-2 py-1.5 border-2 rounded text-xs focus:border-indigo-600 outline-none"
                      />
                    </div>

                    <div className="flex-1 flex flex-col">
                      <label className="text-[10px] font-semibold text-slate-600 mb-0.5 block">Body Template</label>
                      <textarea
                        value={editedData.body_template}
                        onChange={(e) => handleFieldChange(template.id, 'body_template', e.target.value)}
                        rows="12"
                        className="w-full px-2 py-1.5 border-2 rounded font-mono text-[10px] focus:border-indigo-600 outline-none flex-1"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 flex flex-col h-[70vh]">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                          {template.name || 'Untitled Template'}
                        </h3>
                        <button
                          onClick={() => handleEdit(template.id)}
                          className="p-1.5 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                          title="Edit Template"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">ID: {template.id}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 flex-1 overflow-y-hidden">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-700 mb-0.5">Subject:</p>
                      <p className="text-[11px] text-slate-600 bg-white p-1.5 rounded border border-slate-200 line-clamp-2">
                        {template.subject || 'No subject'}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold text-slate-700 mb-0.5">Body Preview:</p>
                      <p className="text-[10px] text-slate-600 bg-white p-1.5 rounded border border-slate-200 whitespace-pre-wrap overflow-y-auto max-h-[430px]">
                        {template.body_template || 'No content'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-slate-200">
          <button
            onClick={goToPrevPage}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-7 h-7 rounded font-bold text-xs transition-all ${
                  currentPage === index
                    ? 'bg-indigo-600 text-white scale-110'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={goToNextPage}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="text-center">
        <p className="text-[10px] text-slate-500">
          Showing <span className="font-semibold text-slate-700">{currentPage * TEMPLATES_PER_PAGE + 1}</span> to{' '}
          <span className="font-semibold text-slate-700">
            {Math.min((currentPage + 1) * TEMPLATES_PER_PAGE, templates.length)}
          </span>{' '}
          of <span className="font-semibold text-slate-700">{templates.length}</span> templates
        </p>
      </div>
    </div>
  );
}

export default TemplateGrid;