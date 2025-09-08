import { ColumnDef } from '../utils/tableUtils';
import { X } from 'lucide-react';

export enum TextFilterOperator {
  EQUALS = 'equals',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
}

export enum NumericFilterOperator {
  EQUALS = 'equals',
  BETWEEN = 'between',
  GREATER_THAN = 'greaterThan',
  LESS_THAN = 'lessThan',
}

export interface FilterState {
  field: string;
  operator: TextFilterOperator | NumericFilterOperator | string;
  value: any;
  secondValue?: any;
  active: boolean;
}

export const TextFilter: React.FC<{
  column: ColumnDef;
  filterState: FilterState;
  onChange: (filterState: FilterState) => void;
  onClose: () => void;
}> = ({ column, filterState, onChange, onClose }) => {
  return (
    <div className="p-2 bg-[#2d2d2d] border border-[#3c3c3c] rounded shadow-lg absolute z-[200] w-64 mt-1">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Filter {column.header}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close filter">
          <X size={16} />
        </button>
      </div>
      <select
        className="mb-2 w-full bg-[#3c3c3c] text-white p-1 rounded"
        value={filterState.operator}
        onChange={(e) => onChange({ ...filterState, operator: e.target.value as TextFilterOperator })}
      >
        <option value={TextFilterOperator.EQUALS}>Equals</option>
        <option value={TextFilterOperator.CONTAINS}>Contains</option>
        <option value={TextFilterOperator.STARTS_WITH}>Starts with</option>
        <option value={TextFilterOperator.ENDS_WITH}>Ends with</option>
      </select>
      <input
        type="text"
        className="w-full bg-[#3c3c3c] text-white p-1 rounded mb-2"
        value={filterState.value || ''}
        onChange={(e) => onChange({ ...filterState, value: e.target.value })}
        placeholder="Enter value..."
      />
      <div className="flex justify-between">
        <button
          className="bg-red-700 text-white px-2 py-1 rounded text-xs"
          onClick={() => onChange({ ...filterState, active: false, value: '' })}
        >
          Clear
        </button>
        <button
          className="bg-[#007acc] text-white px-2 py-1 rounded text-xs"
          onClick={() => {
            onChange({ ...filterState, active: true });
            onClose();
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export const NumericFilter: React.FC<{
  column: ColumnDef;
  filterState: FilterState;
  onChange: (filterState: FilterState) => void;
  onClose: () => void;
}> = ({ column, filterState, onChange, onClose }) => {
  const isDateField = ['DATE', 'DATETIME', 'TIME'].includes(column.fieldType);
  const inputType = isDateField ? (column.fieldType === 'TIME' ? 'time' : 'datetime-local') : 'number';

  return (
    <div className="p-2 bg-[#2d2d2d] border border-[#3c3c3c] rounded shadow-lg absolute z-[200] w-64 mt-1">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Filter {column.header}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close filter">
          <X size={16} />
        </button>
      </div>
      <select
        className="mb-2 w-full bg-[#3c3c3c] text-white p-1 rounded"
        value={filterState.operator}
        onChange={(e) => onChange({ ...filterState, operator: e.target.value as NumericFilterOperator })}
      >
        <option value={NumericFilterOperator.EQUALS}>Equals</option>
        <option value={NumericFilterOperator.GREATER_THAN}>Greater than</option>
        <option value={NumericFilterOperator.LESS_THAN}>Less than</option>
        <option value={NumericFilterOperator.BETWEEN}>Between</option>
      </select>
      {filterState.operator === NumericFilterOperator.BETWEEN ? (
        <>
          <div className="flex items-center gap-2 mb-2">
            <input
              type={inputType}
              className="flex-1 bg-[#3c3c3c] text-white p-1 rounded"
              value={filterState.value || ''}
              onChange={(e) => onChange({ ...filterState, value: e.target.value })}
              placeholder="Min value"
            />
            <span>to</span>
            <input
              type={inputType}
              className="flex-1 bg-[#3c3c3c] text-white p-1 rounded"
              value={filterState.secondValue || ''}
              onChange={(e) => onChange({ ...filterState, secondValue: e.target.value })}
              placeholder="Max value"
            />
          </div>
        </>
      ) : (
        <input
          type={inputType}
          className="w-full bg-[#3c3c3c] text-white p-1 rounded mb-2"
          value={filterState.value || ''}
          onChange={(e) => onChange({ ...filterState, value: e.target.value })}
          placeholder={isDateField ? 'Select date/time...' : 'Enter value...'}
        />
      )}
      <div className="flex justify-between">
        <button
          className="bg-red-700 text-white px-2 py-1 rounded text-xs"
          onClick={() => onChange({ ...filterState, active: false, value: '', secondValue: '' })}
        >
          Clear
        </button>
        <button
          className="bg-[#007acc] text-white px-2 py-1 rounded text-xs"
          onClick={() => {
            onChange({ ...filterState, active: true });
            onClose();
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export const BooleanFilter: React.FC<{
  column: ColumnDef;
  filterState: FilterState;
  onChange: (filterState: FilterState) => void;
  onClose: () => void;
}> = ({ column, filterState, onChange, onClose }) => {
  return (
    <div className="p-2 bg-[#2d2d2d] border border-[#3c3c3c] rounded shadow-lg absolute z-[200] w-64 mt-1">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Filter {column.header}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close filter">
          <X size={16} />
        </button>
      </div>
      <div className="flex gap-4 mb-2">
        <label className="flex items-center">
          <input
            type="radio"
            name={`bool-filter-${column.key}`}
            checked={filterState.value === true}
            onChange={() => onChange({ ...filterState, value: true })}
            className="mr-1"
          />
          True
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name={`bool-filter-${column.key}`}
            checked={filterState.value === false}
            onChange={() => onChange({ ...filterState, value: false })}
            className="mr-1"
          />
          False
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name={`bool-filter-${column.key}`}
            checked={filterState.value === null || filterState.value === undefined}
            onChange={() => onChange({ ...filterState, value: null })}
            className="mr-1"
          />
          All
        </label>
      </div>
      <div className="flex justify-between">
        <button
          className="bg-red-700 text-white px-2 py-1 rounded text-xs"
          onClick={() => onChange({ ...filterState, active: false, value: null })}
        >
          Clear
        </button>
        <button
          className="bg-[#007acc] text-white px-2 py-1 rounded text-xs"
          onClick={() => {
            onChange({ ...filterState, active: filterState.value !== null });
            onClose();
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export const ColumnFilter: React.FC<{
  column: ColumnDef;
  filterState: FilterState;
  onChange: (filterState: FilterState) => void;
  onClose: () => void;
}> = ({ column, filterState, onChange, onClose }) => {
  if (column.fieldType === 'BOOLEAN') return <BooleanFilter column={column} filterState={filterState} onChange={onChange} onClose={onClose} />;
  if (['NUMBER', 'DATE', 'DATETIME', 'TIME'].includes(column.fieldType)) return <NumericFilter column={column} filterState={filterState} onChange={onChange} onClose={onClose} />;
  return <TextFilter column={column} filterState={filterState} onChange={onChange} onClose={onClose} />;
};