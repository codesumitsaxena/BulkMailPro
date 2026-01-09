import React from 'react';
import { Edit3 } from 'lucide-react';

function TemplateCard({ templateKey, template, onEdit }) {
  return (
    <div className="p-4 sm:p-6 bg-slate-50 rounded-xl sm:rounded-2xl border-2 border-slate-200 hover:border-indigo-300 transition-all group">
      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
        <span className="text-2xl sm:text-4xl flex-shrink-0">{template.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 line-clamp-2">
              {template.name}
            </h3>
            <button
              onClick={() => onEdit(templateKey)}
              className="p-1.5 sm:p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
              title="Edit Template"
            >
              <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{template.category}</p>
        </div>
      </div>
      <div className="space-y-2 sm:space-y-3">
        <div>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 mb-1">Subject:</p>
          <p className="text-[10px] sm:text-xs text-slate-600 bg-white p-2 sm:p-3 rounded-lg border border-slate-200 line-clamp-2">
            {template.subject}
          </p>
        </div>
        <div>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 mb-1">Body Preview:</p>
          <p className="text-[10px] sm:text-xs text-slate-600 bg-white p-2 sm:p-3 rounded-lg border border-slate-200 line-clamp-3 sm:line-clamp-4 whitespace-pre-wrap">
            {template.body}
          </p>
        </div>
      </div>
    </div>
  );
}

export default TemplateCard;