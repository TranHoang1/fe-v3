import { Fragment } from 'react';
import { TableFetchResponse, TabTableRow, ObjectType, TableRow, DataObject } from '@/app/lib/api/interfaces';
import { ColumnDef, ActionDef, safeRenderValue } from './utils/tableUtils';
import {EntityDetailTabs} from '../EntityDetailTabs';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface TableBodyProps {
  data: TableFetchResponse;
  columns: ColumnDef[];
  actions: ActionDef[];
  detailView?: (rowData: TabTableRow) => React.ReactNode;
  detailViewMode: 'custom' | 'auto' | 'tabs';
  entityType: ObjectType;
  search?: Record<ObjectType, DataObject>;
  showDetailView: boolean;
  expandedRowId: number | null;
  setExpandedRowId: (id: number | null) => void;
  editingRowId: number | null;
  isAddingNewRow: boolean;
  newRowData: TableRow | null;
  handleRowClick: (id: number | null) => void;
  handleCancelEdit: () => void;
  handleSaveEdit: (rowData: TableRow, data: TableRow) => void;
  isLoading: boolean;
  emptyMessage: string;
  showDefaultActions: boolean;
}

export const TableBody: React.FC<TableBodyProps> = ({
  data,
  columns,
  actions,
  detailView,
  detailViewMode,
  entityType,
  search,
  showDetailView,
  expandedRowId,
  setExpandedRowId,
  editingRowId,
  isAddingNewRow,
  newRowData,
  handleRowClick,
  handleCancelEdit,
  handleSaveEdit,
  isLoading,
  emptyMessage,
  showDefaultActions,
}) => {
  const renderRowDetail = (row: TabTableRow) => {
    if (editingRowId === row.data?.id) {
      return (
        <EntityDetailTabs
          tableRow={row}
          entityType={entityType}
          tableInfo={data}
          search={search}
          isEditing={true}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={(editedData) => handleSaveEdit(row, editedData)}
          columns={columns}
        />
      );
    }
    if (detailView && detailViewMode === 'custom') return detailView(row);
    return (
      <EntityDetailTabs
        tableRow={row}
        entityType={entityType}
        tableInfo={data}
        search={search}
        isEditing={false}
        columns={columns}
      />
    );
  };

  return (
    <tbody className="divide-y divide-[#3c3c3c]">
      {isAddingNewRow && newRowData && (
        <>
          <tr className="bg-[#2a2d2e] relative z-[200]">
            {showDetailView && (
              <td className="w-10 p-3">
                <ChevronDown className="h-4 w-4 text-[#007acc]" />
              </td>
            )}
            {columns.map(column => (
              <td key={column.key} className="p-3 break-words">
                {column.render ? column.render(newRowData.data?.[column.key], newRowData) : safeRenderValue(newRowData.data?.[column.key])}
              </td>
            ))}
            {showDefaultActions && (
              <td className="p-3 text-right">
                <div className="flex justify-end space-x-2">
                  <button
                    className="flex items-center text-xs px-2 py-1 rounded bg-red-800 text-red-100"
                    onClick={() => handleCancelEdit()}
                    aria-label="Cancel adding new row"
                  >
                    <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    Cancel
                  </button>
                </div>
              </td>
            )}
          </tr>
          <tr className="relative z-[200]">
            <td colSpan={columns.length + (showDetailView ? 1 : 0) + (showDefaultActions ? 1 : 0)} className="p-0 bg-[#252525] border-t border-[#3c3c3c]">
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="p-4 relative" style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', position: 'relative', left: 0, tableLayout: 'fixed' }}>
                      <EntityDetailTabs
                        tableRow={newRowData as TabTableRow}
                        entityType={entityType}
                        tableInfo={data}
                        search={search}
                        isEditing={true}
                        isNewRow={true}
                        onCancelEdit={handleCancelEdit}
                        onSaveEdit={(editedData) => handleSaveEdit(newRowData, editedData)}
                        columns={columns}
                        excludedStatusOptions={['DELETE']}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </>
      )}
      {isLoading ? (
        <tr>
          <td colSpan={columns.length + (showDetailView ? 1 : 0) + (showDefaultActions ? 1 : 0)} className="p-8 text-center">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td>
                    <div className="animate-spin h-8 w-8 border-4 border-[#007acc] border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-400">Loading data...</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      ) : data.rows.length > 0 ? (
        data.rows.map((row, idx) => {
          // Ensure we have a unique primitive key
          const rowId = row.data?.id;
          const uniqueKey = typeof rowId === 'object' 
            ? `row_${idx}_${JSON.stringify(rowId)}`
            : rowId 
              ? `row_${rowId}`
              : `row_${idx}`;
          
          return (
          <Fragment key={uniqueKey}>
            {/* Main row */}
            <tr
              className={`${idx % 2 === 0 ? 'bg-[#1e1e1e]' : 'bg-[#252525]'} ${showDetailView ? 'cursor-pointer hover:bg-[#2a2d2e]' : ''} ${expandedRowId === row.data?.id ? 'bg-[#2a2d2e]' : ''}`}
              onClick={() => {
                // Only handle row clicks if not in edit mode
                if (editingRowId === null) {
                  handleRowClick(row.data?.id || null);
                }
              }}
              role="row"
              style={{ tableLayout: 'fixed', width: '100%' }}
            >
              {/* Toggle column */}
              {showDetailView && (
                <td className="w-10 p-3" style={{ width: '40px', minWidth: '40px', maxWidth: '40px' }}>
                  {expandedRowId === row.data?.id ? (
                    <ChevronDown className="h-4 w-4 text-[#007acc]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </td>
              )}
              
              {/* Data columns */}
              {columns.map((column) => {
                const cellWidth = 
                  column.key === 'id' ? '80px' : 
                  column.key === 'status' ? '120px' : 
                  column.key === 'name' ? '200px' :
                  '150px';
                
                return (
                  <td 
                    key={column.key} 
                    className="p-3 break-words"
                    data-column-key={column.key}
                    style={{
                      width: cellWidth,
                      minWidth: cellWidth,
                      maxWidth: column.key === 'description' ? '300px' : cellWidth
                    }}
                  >
                    {column.render ? column.render(row.data[column.key], row) : safeRenderValue(row.data[column.key])}
                  </td>
                );
              })}
              
              {/* Actions column */}
              {showDefaultActions && (
                <td className="p-3 text-right" style={{ width: '150px', minWidth: '150px' }}>
                  <div className="flex justify-end space-x-2">
                    {actions.map(action => (
                      <button
                        key={action.label}
                        className={`flex items-center text-xs px-2 py-1 rounded ${action.color === 'blue' ? 'bg-blue-800 text-blue-100' : action.color === 'red' ? 'bg-red-800 text-red-100' : action.color === 'green' ? 'bg-green-800 text-green-100' : action.color === 'yellow' ? 'bg-yellow-800 text-yellow-100' : 'bg-[#3c3c3c] text-white'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (editingRowId !== null || isAddingNewRow) return;
                          action.onClick(row);
                          // If the action is Edit, don't collapse the row
                          // This is the key fix to prevent collapsing when editing
                          if (action.showDetail && action.label !== 'Edit') {
                            handleRowClick(row.data?.id || null);
                          }
                        }}
                        disabled={editingRowId !== null || isAddingNewRow}
                        aria-label={`${action.label} row ${row.data?.id}`}
                      >
                        {action.iconLeft}
                        <span className="mx-1">{action.label}</span>
                        {action.iconRight}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
            
            {/* Expanded detail row - Show it for both normal and edit modes */}
            {row.data?.id && (expandedRowId === row.data.id || editingRowId === row.data.id) && (
              <tr>
                {/* This is the key fix */}
                <td colSpan={columns.length + (showDetailView ? 1 : 0) + (showDefaultActions ? 1 : 0)}>
                  {/* Remove any nested table structure causing the misalignment */}
                  <div className="bg-[#252525] border-t border-[#3c3c3c] p-4">
                    {renderRowDetail(row as TabTableRow)}
                  </div>
                </td>
              </tr>
            )}

            {/* Remove the absolute positioned overlay that was blocking interactions */}
          </Fragment>
          );
        })
      ) : (
        <tr>
          <td colSpan={columns.length + (showDetailView ? 1 : 0) + (showDefaultActions ? 1 : 0)} className="p-8 text-center text-gray-400">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td>
                    {emptyMessage}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </tbody>
  );
};
