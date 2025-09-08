import { PaginationState } from './hooks/useDataTable';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100, 500, 1000];

interface TablePaginationProps {
  pagination: PaginationState;
  setPagination: (pagination: Partial<PaginationState>) => void;
}

export const TablePagination: React.FC<TablePaginationProps> = ({ pagination, setPagination }) => {
  const { pageIndex, pageSize, totalItems, totalPages } = pagination;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-1 border-t border-[#3c3c3c]">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">
          {totalItems > 0 ? `Showing ${pageIndex * pageSize + 1}-${Math.min((pageIndex + 1) * pageSize, totalItems)} of ${totalItems}` : 'No results'}
        </span>
        <select
          value={pageSize}
          onChange={(e) => setPagination({ pageSize: Number(e.target.value), pageIndex: 0 })}
          className="bg-[#3c3c3c] text-white text-sm px-2 py-1 rounded"
          aria-label="Items per page"
        >
          {PAGE_SIZE_OPTIONS.map(size => (
            <option key={size} value={size}>{size} per page</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPagination({ pageIndex: 0 })}
          disabled={pageIndex === 0}
          className={`p-1 rounded ${pageIndex === 0 ? 'text-gray-600' : 'text-gray-400 hover:bg-[#3c3c3c]'}`}
          aria-label="Go to first page"
        >
          <ChevronsLeft size={18} />
        </button>
        <button
          onClick={() => setPagination({ pageIndex: pageIndex - 1 })}
          disabled={pageIndex === 0}
          className={`p-1 rounded ${pageIndex === 0 ? 'text-gray-600' : 'text-gray-400 hover:bg-[#3c3c3c]'}`}
          aria-label="Go to previous page"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={pageIndex + 1}
            onChange={(e) => {
              const page = parseInt(e.target.value) - 1;
              if (page >= 0 && page < totalPages) setPagination({ pageIndex: page });
            }}
            className="w-12 bg-[#3c3c3c] text-white text-center py-1 rounded"
            aria-label="Current page"
          />
          <span className="mx-1 text-sm text-gray-400">of {totalPages}</span>
        </div>
        <button
          onClick={() => setPagination({ pageIndex: pageIndex + 1 })}
          disabled={pageIndex >= totalPages - 1}
          className={`p-1 rounded ${pageIndex >= totalPages - 1 ? 'text-gray-600' : 'text-gray-400 hover:bg-[#3c3c3c]'}`}
          aria-label="Go to next page"
        >
          <ChevronRight size={18} />
        </button>
        <button
          onClick={() => setPagination({ pageIndex: totalPages - 1 })}
          disabled={pageIndex >= totalPages - 1}
          className={`p-1 rounded ${pageIndex >= totalPages - 1 ? 'text-gray-600' : 'text-gray-400 hover:bg-[#3c3c3c]'}`}
          aria-label="Go to last page"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
};