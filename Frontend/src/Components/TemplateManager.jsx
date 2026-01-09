import React, { useState } from 'react';
import { X, Plus, Edit3, Trash2, Save } from 'lucide-react';

function TemplateManager({ templates, onSave, onClose, editingTemplateKey = null }) {
  const [localTemplates, setLocalTemplates] = useState(templates);
  const [editingKey, setEditingKey] = useState(editingTemplateKey);
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
    setEditingKey(null);
  };

  const handleSaveNew = () => {
    if (newTemplate) {
      setLocalTemplates({ ...localTemplates, [newTemplate.key]: newTemplate });
      setNewTemplate(null);
    }
  };

  const handleDelete = (key) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      const updated = { ...localTemplates };
      delete updated[key];
      setLocalTemplates(updated);
      if (editingKey === key) setEditingKey(null);
    }
  };

  const handleEdit = (key, field, value) => {
    setLocalTemplates({
      ...localTemplates,
      [key]: { ...localTemplates[key], [field]: value }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg sm:text-2xl font-black text-slate-900">
            Manage Email Templates
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <button
            onClick={handleAddNew}
            className="w-full mb-4 sm:mb-6 p-3 sm:p-4 border-2 border-dashed border-indigo-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-indigo-600 font-semibold text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add New Template
          </button>

          {/* New Template Form */}
          {newTemplate && (
            <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-indigo-50 border-2 border-indigo-300 rounded-xl">
              <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">New Template</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Template Name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border-2 border-slate-200 rounded-lg text-sm sm:text-base focus:border-indigo-600 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Icon (emoji)"
                  value={newTemplate.icon}
                  onChange={(e) => setNewTemplate({ ...newTemplate, icon: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border-2 border-slate-200 rounded-lg text-sm sm:text-base focus:border-indigo-600 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border-2 border-slate-200 rounded-lg text-sm sm:text-base focus:border-indigo-600 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border-2 border-slate-200 rounded-lg text-sm sm:text-base focus:border-indigo-600 focus:outline-none"
                />
                <textarea
                  placeholder="Email body"
                  value={newTemplate.body}
                  onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                  rows="6"
                  className="w-full px-3 sm:px-4 py-2 border-2 border-slate-200 rounded-lg font-mono text-xs sm:text-sm focus:border-indigo-600 focus:outline-none"
                />
                <button
                  onClick={handleSaveNew}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm sm:text-base transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Template
                </button>
              </div>
            </div>
          )}

          {/* Existing Templates */}
          <div className="space-y-3 sm:space-y-4">
            {Object.entries(localTemplates)
              .filter(([key]) => {
                if (editingKey) {
                  return key === editingKey;
                }
                return true;
              })
              .map(([key, template]) => (
                <div key={key} className="p-4 sm:p-6 bg-white border-2 border-slate-200 rounded-xl">

                  {/* Header */}
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1">
                      <span className="text-xl sm:text-2xl">{template.icon}</span>

                      {editingKey === key ? (
                        <input
                          type="text"
                          value={template.name}
                          onChange={(e) => handleEdit(key, 'name', e.target.value)}
                          className="font-bold text-base sm:text-lg border-b-2 border-indigo-600 flex-1 focus:outline-none"
                        />
                      ) : (
                        <h3 className="font-bold text-base sm:text-lg">{template.name}</h3>
                      )}
                    </div>

                    <button
                      onClick={() => setEditingKey(editingKey === key ? null : key)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Body */}
                  {editingKey === key ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={template.subject}
                        onChange={(e) => handleEdit(key, 'subject', e.target.value)}
                        className="w-full px-4 py-2 border-2 rounded-lg"
                        placeholder="Subject"
                      />

                      <textarea
                        rows="8"
                        value={template.body}
                        onChange={(e) => handleEdit(key, 'body', e.target.value)}
                        className="w-full px-4 py-2 border-2 rounded-lg font-mono"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 line-clamp-3">
                      {template.body}
                    </p>
                  )}
                </div>
              ))}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-200 flex gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={() => {
              onSave(localTemplates);
              onClose();
            }}
            className="flex-1 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm sm:text-base transition-colors"
          >
            Save All Changes
          </button>
          <button
            onClick={onClose}
            className="px-6 sm:px-8 py-2.5 sm:py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-sm sm:text-base transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplateManager;