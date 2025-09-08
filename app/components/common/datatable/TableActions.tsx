import { FilterState } from './hooks/useDataTable';
import { ColumnDef, ActionDef } from './utils/tableUtils';
import { ObjectType } from '@/app/lib/api/interfaces';
import { Search, X, Plus, Download } from 'lucide-react';

interface TableActionsProps {
  showSearchBox: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  columnsWithActiveFilters: string[];
  effectiveColumns: ColumnDef[];
  activeFilters: Record<string, FilterState>;
  setActiveFilters: (filters: Record<string, FilterState>) => void;
  filterOptions?: { key: string; label: string; options: { value: string; label: string }[] }[];
  tableActions?: ActionDef[];
  addItemButton?: { label: string; onClick: () => void } | boolean;
  entityType: ObjectType;
  isLoading: boolean;
  handleAddNewRow: () => void;
}

export const TableActions: React.FC<TableActionsProps> = ({
  showSearchBox,
  searchTerm,
  setSearchTerm,
  columnsWithActiveFilters,
  effectiveColumns,
  activeFilters,
  setActiveFilters,
  filterOptions,
  tableActions,
  addItemButton,
  entityType,
  isLoading,
  handleAddNewRow,
}) => {
  const actualAddItemButton = typeof addItemButton === 'boolean' && addItemButton
    ? { label: `Add ${entityType.charAt(0).toUpperCase() + entityType.slice(1).toLowerCase()}`, onClick: handleAddNewRow }
    : addItemButton;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
      <div className="flex items-center gap-2">
        {showSearchBox && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 py-2 pr-4 bg-[#3c3c3c] rounded focus:outline-none focus:ring-1 focus:ring-[#007acc]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search table"
            />
          </div>
        )}
        {columnsWithActiveFilters.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center">
            <span className="text-sm text-gray-400">Filters:</span>
            {columnsWithActiveFilters.map(columnKey => {
              const column = effectiveColumns.find(col => col.key === columnKey);
              if (!column) return null;
              return (
                <div key={columnKey} className="bg-[#3c3c3c] text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <span>{column.header}</span>
                  <button
                    onClick={() => setActiveFilters({ ...activeFilters, [columnKey]: { ...activeFilters[columnKey], active: false } })}
                    className="text-gray-400 hover:text-white"
                    aria-label={`Remove filter for ${column.header}`}
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
            <button
              onClick={() => setActiveFilters(Object.keys(activeFilters).reduce((acc, key) => ({ ...acc, [key]: { ...activeFilters[key], active: false } }), {}))}
              className="text-xs text-[#007acc] hover:underline"
              aria-label="Clear all filters"
            >
              Clear all
            </button>
          </div>
        )}
        {filterOptions?.map(filter => (
          <select
            key={filter.key}
            className="bg-[#3c3c3c] text-white px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#007acc]"
            value={activeFilters[filter.key]?.value || 'all'}
            onChange={(e) => setActiveFilters({ ...activeFilters, [filter.key]: { field: filter.key, operator: 'equals', value: e.target.value, active: e.target.value !== 'all' } })}
            aria-label={`Filter by ${filter.label}`}
          >
            {filter.options.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        {tableActions?.map((action, index) => (
          <button
            key={index}
            onClick={() => action.onClick && action.onClick(null)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1.5 ${
              action.color ? `bg-${action.color}-700 hover:bg-${action.color}-600 text-white` : 'bg-blue-700 hover:bg-blue-600 text-white'
            }`}
            disabled={isLoading}
          >
            {action.iconLeft && <span>{action.iconLeft}</span>}
            {action.label}
            {action.iconRight && <span>{action.iconRight}</span>}
          </button>
        ))}
        
        {actualAddItemButton && (
          <button
            onClick={actualAddItemButton.onClick}
            className="px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            {actualAddItemButton.label}
          </button>
        )}
      </div>
    </div>
  );
};