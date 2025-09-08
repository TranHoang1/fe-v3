import { ColumnDef } from './utils/tableUtils';
import { FilterState } from './hooks/useDataTable';
import { ColumnFilter } from './filters/filter';
import { ChevronUp, ChevronDown, Filter, Plus } from 'lucide-react';

interface TableHeaderProps {
  columns: ColumnDef[];
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  handleSortClick: (field: string) => void;
  activeFilters: Record<string, FilterState>;
  openFilterColumn: string | null;
  setOpenFilterColumn: (column: string | null) => void;
  setActiveFilters: (filters: Record<string, FilterState>) => void;
  showDetailView: boolean;
  showDefaultActions: boolean;
  handleAddNewRow: () => void;
  isAddingNewRow: boolean;
  editingRowId: number | null;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  sortField,
  sortDirection,
  handleSortClick,
  activeFilters,
  openFilterColumn,
  setOpenFilterColumn,
  setActiveFilters,
  showDetailView,
  showDefaultActions,
  handleAddNewRow,
  isAddingNewRow,
  editingRowId,
}) => {
  return (
    <thead className="bg-[#2d2d2d] text-white font-medium sticky top-0 z-[10]">
      <tr>
        {showDetailView && <th className="w-10 p-3 whitespace-nowrap" scope="col"></th>}
        {columns.map(column => (
          <th
            key={column.key}
            className="text-left p-3 relative"
            scope="col"
            style={{ width: column.key === 'viewId' ? '80px' : 'auto', minWidth: column.key === 'viewId' ? '80px' : '120px' }}
          >
            <div className="flex items-start">
              <button
                className={`flex-grow flex flex-wrap items-center mr-5 ${column.sortable ? 'cursor-pointer hover:text-[#007acc]' : ''} ${sortField === column.key ? 'text-[#007acc]' : ''}`}
                onClick={() => column.sortable && handleSortClick(column.key)}
                disabled={!column.sortable}
                aria-sort={sortField === column.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                aria-label={`Sort by ${column.header}`}
              >
                <span className="break-words hyphens-auto pr-1">{column.header}</span>
                {sortField === column.key && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
              </button>
              {column.filterable && (
                <button
                  className={`absolute right-3 top-3 p-1 rounded-full hover:bg-[#3c3c3c] ${activeFilters[column.key]?.active ? 'text-[#007acc]' : 'text-gray-400'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenFilterColumn(openFilterColumn === column.key ? null : column.key);
                  }}
                  aria-label={`Filter by ${column.header}`}
                >
                  <Filter size={14} />
                </button>
              )}
            </div>
            {openFilterColumn === column.key && (
              <ColumnFilter
                column={column}
                filterState={activeFilters[column.key] || {
                  field: column.key,
                  operator: column.fieldType === 'BOOLEAN' ? 'equals' : ['NUMBER', 'DATE', 'DATETIME', 'TIME'].includes(column.fieldType) ? 'equals' : 'contains',
                  value: null,
                  active: false,
                }}
                onChange={(filterState) => setActiveFilters({ ...activeFilters, [column.key]: filterState })}
                onClose={() => setOpenFilterColumn(null)}
              />
            )}
          </th>
        ))}
        {showDefaultActions && (
          <th className="text-right p-3 whitespace-nowrap" scope="col" style={{ width: 'auto', minWidth: '150px' }}>
            <div className="flex items-center justify-between">
              <span>Actions</span>
              <button
                onClick={handleAddNewRow}
                className="flex items-center justify-center p-1 bg-green-700 text-white rounded hover:bg-green-800"
                title="Add new row"
                disabled={isAddingNewRow || editingRowId !== null}
                aria-label="Add new row"
              >
                <Plus size={16} />
              </button>
            </div>
          </th>
        )}
      </tr>
    </thead>
  );
};
