import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DEFAULT_TABLE_PAGE_SIZES } from '../../hooks/usePagination';

const buildPageItems = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  const normalized = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const items = [];
  for (let index = 0; index < normalized.length; index += 1) {
    const value = normalized[index];
    const previous = normalized[index - 1];
    if (previous && value - previous > 1) {
      items.push('ellipsis');
    }
    items.push(value);
  }

  return items;
};

const TablePagination = ({
  page,
  totalItems,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  isDarkMode = false,
  rowsPerPageOptions = DEFAULT_TABLE_PAGE_SIZES,
  className = '',
  itemLabel = 'items'
}) => {
  const safeRowsPerPage = Math.max(1, Number(rowsPerPage) || 10);
  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / safeRowsPerPage));
  const safePage = Math.min(Math.max(1, page || 1), totalPages);
  const start = totalItems > 0 ? (safePage - 1) * safeRowsPerPage + 1 : 0;
  const end = totalItems > 0 ? Math.min(safePage * safeRowsPerPage, totalItems) : 0;
  const pageItems = buildPageItems(safePage, totalPages);
  const showRowsSelect = typeof onRowsPerPageChange === 'function';

  const baseText = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const mutedText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const surface = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const controlSurface = isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200';
  const controlHover = isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50';
  const disabledStyles = isDarkMode ? 'text-gray-500 border-gray-700' : 'text-gray-300 border-gray-200';

  return (
    <div className={`border-t ${borderColor} ${surface} px-4 py-4 sm:px-6 ${className}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          {showRowsSelect && (
            <>
              <span className={`text-sm ${baseText}`}>Rows per page</span>
              <select
                value={safeRowsPerPage}
                onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
                className={`h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-primary-500 ${controlSurface} ${baseText}`}
              >
                {rowsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </>
          )}
          {!showRowsSelect && (
            <span className={`text-sm ${mutedText}`}>
              {start}-{end} of {totalItems} {itemLabel}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:justify-end">
          {showRowsSelect && (
            <span className={`text-sm whitespace-nowrap ${mutedText}`}>
              {start}-{end} of {totalItems}
            </span>
          )}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange?.(safePage - 1)}
              disabled={safePage <= 1}
              className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-colors ${
                safePage <= 1 ? disabledStyles : `${controlSurface} ${controlHover} ${baseText}`
              }`}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {pageItems.map((item, index) =>
              item === 'ellipsis' ? (
                <span
                  key={`ellipsis-${index}`}
                  className={`h-9 min-w-9 px-2 inline-flex items-center justify-center text-sm ${mutedText}`}
                >
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => onPageChange?.(item)}
                  className={`h-9 min-w-9 px-3 rounded-xl text-sm font-medium transition-colors ${
                    item === safePage
                      ? 'bg-primary-600 text-white'
                      : `border ${controlSurface} ${controlHover} ${baseText}`
                  }`}
                  aria-current={item === safePage ? 'page' : undefined}
                >
                  {item}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => onPageChange?.(safePage + 1)}
              disabled={safePage >= totalPages}
              className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-colors ${
                safePage >= totalPages ? disabledStyles : `${controlSurface} ${controlHover} ${baseText}`
              }`}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
