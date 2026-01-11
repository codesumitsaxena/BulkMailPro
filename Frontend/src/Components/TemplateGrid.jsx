import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';

function TemplateGrid({ templates, onEdit }) {
  const [currentPage, setCurrentPage] = useState(0);
  const templatesPerPage = 4;
  const totalPages = Math.ceil(templates.length / templatesPerPage);

  const getCurrentTemplates = () => {
    const start = currentPage * templatesPerPage;
    const end = start + templatesPerPage;
    return templates.slice(start, end);
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-slate-500 font-semibold">No templates found</p>
        <p className="text-sm text-slate-400 mt-2">Create your first template to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {getCurrentTemplates().map((template) => (
          <div
            key={template.id}
            className="p-4 sm:p-6 bg-slate-50 rounded-xl sm:rounded-2xl border-2 border-slate-200 hover:border-indigo-300 transition-all group relative"
          >
            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <span className="text-2xl sm:text-4xl flex-shrink-0">📧</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 line-clamp-2">
                    {template.name}
                  </h3>
                  <button
                    onClick={() => onEdit(template.id)}
                    className="p-1.5 sm:p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    title="Edit Template"
                  >
                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">ID: {template.id}</p>
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
                  {template.body_template}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-200">
          <button
            onClick={goToPrevPage}
            className="p-2 sm:p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base font-semibold"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-bold text-sm sm:text-base transition-all ${
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
            className="p-2 sm:p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base font-semibold"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      )}

      {/* Page Indicator */}
      <div className="text-center">
        <p className="text-xs sm:text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{currentPage * templatesPerPage + 1}</span> to{' '}
          <span className="font-semibold text-slate-700">
            {Math.min((currentPage + 1) * templatesPerPage, templates.length)}
          </span>{' '}
          of <span className="font-semibold text-slate-700">{templates.length}</span> templates
        </p>
      </div>
    </div>
  );
}

export default TemplateGrid;