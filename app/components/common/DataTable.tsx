'use client';

import { ObjectType, TableFetchResponse, TabTableRow, DataObject } from '@/app/lib/api/interfaces';
import { useDataTable } from './datatable/hooks/useDataTable';
import { TableHeader } from './datatable/TableHeader';
import { TableBody } from './datatable/TableBody';
import { TablePagination } from './datatable/TablePagination';
import { TableActions } from './datatable/TableActions';
import ImportDialog from './datatable/ImportDialog';
import { ConfirmationDialog } from './datatable/ConfirmationDialog';
import { ColumnDef, ActionDef } from './datatable/utils/tableUtils';
import { useMemo } from 'react';

interface DataTableProps {
    data?: TableFetchResponse | null;
    columns?: ColumnDef[];
    actions?: ActionDef[];
    detailView?: (rowData: TabTableRow) => React.ReactNode;
    detailViewMode?: 'custom' | 'auto' | 'tabs';
    entityType: ObjectType;
    addItemButton?: { label: string; onClick: () => void } | boolean;
    filterOptions?: { key: string; label: string; options: { value: string; label: string }[] }[];
    urlStatePrefix?: string;
    emptyMessage?: string;
    onPageChange?: (page: number) => void;
    onSortChange?: (property: string, direction: string) => void;
    onSearchChange?: (search: string) => void;
    onFilterChange?: (filter: string, value: string) => void;
    fetchData?: (request: import('@/app/lib/api/interfaces').TableFetchRequest) => Promise<TableFetchResponse>;
    showDetailView?: boolean;
    activeTab?: string;
    statusField?: string;
    search?: Record<ObjectType, DataObject>;
    showSearchBox?: boolean;
    onEdit?: (row: import('@/app/lib/api/interfaces').TableRow) => void;
    onDelete?: (row: import('@/app/lib/api/interfaces').TableRow) => void;
    showDefaultActions?: boolean;
    onSave?: (row: import('@/app/lib/api/interfaces').TableRow | null, editedData: import('@/app/lib/api/interfaces').TableRow) => Promise<boolean>;
    onAdd?: () => void;
}

export default function DataTable({
    data,
    columns,
    actions,
    detailView,
    detailViewMode = 'auto',
    entityType,
    addItemButton,
    filterOptions,
    urlStatePrefix,
    emptyMessage = 'No data found.',
    onPageChange,
    onSortChange,
    onSearchChange,
    onFilterChange,
    fetchData,
    showDetailView = true,
    activeTab,
    statusField = 'status',
    search,
    showSearchBox = false,
    onEdit,
    onDelete,
    showDefaultActions = true,
    onSave,
    onAdd,
}: DataTableProps) {
    const {
        data: tableData,
        pagination,
        setPagination,
        activeFilters,
        setActiveFilters,
        openFilterColumn,
        setOpenFilterColumn,
        expandedRowId,
        setExpandedRowId,
        editingRowId,
        isAddingNewRow,
        newRowData,
        isLoading,
        searchTerm,
        setSearchTerm,
        sortField,
        sortDirection,
        handleSortClick,
        handleEdit,
        handleCancelEdit,
        handleSaveEdit,
        handleDeleteClick,
        handleAddNewRow,
        handleConfirmation,
        isEditConfirmOpen,
        isSaveConfirmOpen,
        isDeleteConfirmOpen,
        editAction,
        effectiveColumns,
        effectiveActions,
        tableActions: defaultTableActions,
        columnsWithActiveFilters,
        isImportDialogOpen,
        handleExportTable,
        handleImportTable,
        handleActionImportTable
    } = useDataTable({
        initialData: data,
        columns,
        actions,
        entityType,
        fetchData,
        onEdit,
        onDelete,
        onSave,
        onAdd,
        onSearchChange,
        onSortChange,
        onPageChange,
        onFilterChange,
    });

    // Process the table actions to add functionality
    const processedTableActions = useMemo(() => {
        return (defaultTableActions || []).map(action => {
            // If this is an export action, attach the export functionality
            if (action.label.toLowerCase() === 'export') {
                return {
                    ...action,
                    onClick: () => handleExportTable()
                };
            }
            // If this is an import action, attach import functionality
            if (action.label.toLowerCase() === 'import') {
                return {
                    ...action,
                    onClick: () => handleImportTable(true)
                };
            }
            return action;
        });
    }, [defaultTableActions, handleExportTable, handleImportTable]);

    return (
        <div className="w-full relative flex flex-col">
            <TableActions
                showSearchBox={showSearchBox}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                columnsWithActiveFilters={columnsWithActiveFilters}
                effectiveColumns={effectiveColumns}
                activeFilters={activeFilters}
                setActiveFilters={setActiveFilters}
                filterOptions={filterOptions}
                tableActions={processedTableActions}
                addItemButton={addItemButton}
                entityType={entityType}
                isLoading={isLoading}
                handleAddNewRow={handleAddNewRow}
            />
            <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded-md overflow-hidden relative w-full flex-grow flex flex-col">
                <div className="overflow-x-auto w-full flex-1" style={{ maxWidth: '100%' }}>
                    <table className="relative table-auto min-w-full table-fixed" aria-busy={isLoading} role="grid" style={{ tableLayout: 'fixed' }}>
                        <TableHeader
                            columns={effectiveColumns}
                            sortField={sortField}
                            sortDirection={sortDirection}
                            handleSortClick={handleSortClick}
                            activeFilters={activeFilters}
                            openFilterColumn={openFilterColumn}
                            setOpenFilterColumn={setOpenFilterColumn}
                            setActiveFilters={setActiveFilters}
                            showDetailView={showDetailView}
                            showDefaultActions={showDefaultActions}
                            handleAddNewRow={handleAddNewRow}
                            isAddingNewRow={isAddingNewRow}
                            editingRowId={editingRowId}
                        />
                        <TableBody
                            data={tableData}
                            columns={effectiveColumns}
                            actions={effectiveActions}
                            detailView={detailView}
                            detailViewMode={detailViewMode}
                            entityType={entityType}
                            search={search}
                            showDetailView={showDetailView}
                            expandedRowId={expandedRowId}
                            setExpandedRowId={setExpandedRowId}
                            editingRowId={editingRowId}
                            isAddingNewRow={isAddingNewRow}
                            newRowData={newRowData}
                            handleRowClick={setExpandedRowId}
                            handleCancelEdit={handleCancelEdit}
                            handleSaveEdit={handleSaveEdit}
                            isLoading={isLoading}
                            emptyMessage={emptyMessage}
                            showDefaultActions={showDefaultActions}
                        />
                    </table>
                    {tableData.rows.length > 0 && (
                        <TablePagination
                            pagination={pagination}
                            setPagination={setPagination}
                        />
                    )}
                </div>
            </div>
            <ConfirmationDialog
                isEditConfirmOpen={isEditConfirmOpen}
                isSaveConfirmOpen={isSaveConfirmOpen}
                isDeleteConfirmOpen={isDeleteConfirmOpen}
                handleConfirmation={handleConfirmation}
                editAction={editAction}
            />
            <ImportDialog 
            open={isImportDialogOpen} 
            handleImportTable = {handleImportTable}
            handleActionImportTable = {handleActionImportTable} />
        </div>
    );
}
