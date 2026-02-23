import { useEffect, useState } from 'react';

export const DEFAULT_TABLE_PAGE_SIZES = [5, 10, 25, 50];

export const useTablePagination = (items = [], options = {}) => {
  const initialRowsPerPage = options.initialRowsPerPage ?? 10;

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPageState] = useState(initialRowsPerPage);

  const safeItems = Array.isArray(items) ? items : [];
  const totalItems = safeItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  useEffect(() => {
    setPage((prevPage) => Math.min(prevPage, totalPages));
  }, [totalPages]);

  const startIndex = totalItems === 0 ? 0 : (page - 1) * rowsPerPage;
  const endIndex = totalItems === 0 ? 0 : Math.min(startIndex + rowsPerPage, totalItems);
  const paginatedItems = safeItems.slice(startIndex, startIndex + rowsPerPage);

  const setRowsPerPage = (value) => {
    const nextRowsPerPage = Math.max(1, Number(value) || initialRowsPerPage);
    setRowsPerPageState(nextRowsPerPage);
    setPage(1);
  };

  return {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedItems
  };
};

export default useTablePagination;
