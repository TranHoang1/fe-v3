'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { fetchTableData } from '@/app/lib/api/tableService';
import { addRecord, updateRecord, deleteRecord, exportTableData, importTableData } from '@/app/lib/api/tableActionService';
import { TableFetchResponse, TableFetchRequest, ObjectType, TableRow, TabTableRow, DataObject, SortType, FilterType } from '@/app/lib/api/interfaces';
import { generateColumnsFromFieldMap, ColumnDef, ActionDef } from '../utils/tableUtils';
import { TextFilterOperator, NumericFilterOperator } from '../filters/filter';

export interface FilterState {
  field: string;
  operator: TextFilterOperator | NumericFilterOperator | string;
  value: any;
  secondValue?: any;
  active: boolean;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface UseDataTableProps {
  initialData?: TableFetchResponse | null;
  columns?: ColumnDef[];
  actions?: ActionDef[];
  entityType: ObjectType;
  fetchData?: (request: TableFetchRequest) => Promise<TableFetchResponse>;
  onEdit?: (row: TableRow) => void;
  onDelete?: (row: TableRow) => void;
  onSave?: (row: TableRow | null, editedData: TableRow) => Promise<boolean>;
  onAdd?: () => void;
  onSearchChange?: (search: string) => void;
  onSortChange?: (property: string, direction: string) => void;
  onPageChange?: (page: number) => void;
  onFilterChange?: (filter: string, value: string) => void;
}

export const useDataTable = ({
  initialData,
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
}: UseDataTableProps) => {
  const emptyTableData: TableFetchResponse = {
    totalPage: 0,
    currentPage: 0,
    pageSize: 10,
    totalElements: 0,
    tableName: entityType || 'empty',
    rows: [],
    status: 'NO_DATA' as any,
    message: 'No data available',
    fieldNameMap: {},
    originalRequest: {
      page: 0,
      size: 10,
      sorts: [],
      filters: [],
      search: Object.values(ObjectType).reduce((acc, type) => {
        acc[type] = { objectType: type, key: { keys: [] }, fieldNameMap: {}, description: '', data: { data: {} }, order: 0 };
        return acc;
      }, {} as Record<ObjectType, DataObject>),
      objectType: entityType,
    },
    statistics: { charts: {} },
    relatedLinkedObjects: {},
    first: true,
    last: true,
    empty: true,
    numberOfElements: 0,
  };

  const safeInitialData = initialData || emptyTableData;
  const dataRef = useRef<TableFetchResponse>(safeInitialData);
  const [data, setData] = useState<TableFetchResponse>(safeInitialData);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, FilterState>>({});
  const [openFilterColumn, setOpenFilterColumn] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
    totalItems: safeInitialData.totalElements,
    totalPages: Math.max(1, safeInitialData.totalPage),
  });
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [isAddingNewRow, setIsAddingNewRow] = useState(false);
  const [newRowData, setNewRowData] = useState<TableRow | null>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<TableRow | null>(null);
  const [editedData, setEditedData] = useState<TableRow | null>(null);
  const [editAction, setEditAction] = useState<'save' | 'cancel' | 'delete' | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const isMountedRef = useRef(false);
  const initialFetchDoneRef = useRef(false);
  const currentRequestRef = useRef<string | null>(null);
  const pendingRequestRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sortFieldRef = useRef<string | null>(null);
  const sortDirectionRef = useRef<'asc' | 'desc'>('asc');

  const effectiveColumns = useMemo(() => {
    const cols = columns || (data?.fieldNameMap ? generateColumnsFromFieldMap(data.fieldNameMap) : []);
    return cols.filter(col => !col.hidden);
  }, [columns, data?.fieldNameMap]);

  const handleEdit = useCallback((row: TableRow) => {
    if (row.data?.id && expandedRowId !== row.data?.id) setExpandedRowId(row.data?.id);
    setEditingRowId(row.data?.id || null);
    setEditedData(row);  // Store the whole TableRow object, not just row.data
    if (onEdit) onEdit(row);
  }, [expandedRowId, onEdit]);

  const handleCancelEdit = useCallback(() => {
    setEditAction('cancel');
    setIsEditConfirmOpen(true);
  }, []);

  const handleSaveEdit = useCallback((rowData: TableRow, data: any) => {
    // Clean up data by keeping only primitive values
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      // Keep only primitive values (string, number, boolean) and id field
      if (key === 'id' || (value !== null && typeof value !== 'object')) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    console.log('Clean data:', cleanData);
    const formattedData: TableRow = { data: cleanData };

    setEditedData(formattedData);
    setEditAction('save');

    requestAnimationFrame(() => {
      setIsSaveConfirmOpen(true);
    });
  }, []);

  const handleDeleteClick = useCallback((row: TableRow['data']) => {
    setRowToDelete({ data: row });
    setEditAction('delete');
    setIsDeleteConfirmOpen(true);
  }, []);

  const defaultActions: ActionDef[] = useMemo(() => [
    {
      label: 'Edit',
      onClick: (row: TableRow | null) => {
        if (row) handleEdit(row);
      },
      color: 'blue',
      iconLeft: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
      showDetail: true,
    },
    {
      label: 'Delete',
      onClick: (row: TableRow | null) => {
        if (row?.data) handleDeleteClick(row.data);
      },
      color: 'red',
      iconLeft: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>,
    },
  ], [handleEdit, handleDeleteClick]);

  const effectiveActions = useMemo(() => {
    const rowActions = (actions || []).filter(action => !action.isTableAction);
    // Always include default actions even if no row actions are provided
    return rowActions.length > 0 ? rowActions.concat(defaultActions) : defaultActions;
  }, [actions, defaultActions]);

  const tableActions = useMemo(() => {
    return (actions || []).filter(action => action.isTableAction);
  }, [actions]);

  const columnsWithActiveFilters = useMemo(() => {
    return Object.entries(activeFilters).filter(([_, filter]) => filter.active).map(([key]) => key);
  }, [activeFilters]);

  const defaultFetchData = async (request: TableFetchRequest): Promise<TableFetchResponse> => {
    try {
      const effectiveObjectType = entityType && (typeof entityType === 'string' ? ObjectType[entityType.toUpperCase() as keyof typeof ObjectType] : entityType);
      const requestWithObjectType: TableFetchRequest = { ...request, objectType: request.objectType || effectiveObjectType };
      if (!requestWithObjectType.objectType) {
        console.error('No objectType provided for request:', requestWithObjectType);
        return emptyTableData;
      }
      return await fetchTableData(requestWithObjectType);
    } catch (error) {
      console.error(`Error fetching ${entityType} data:`, error);
      return emptyTableData;
    }
  };

  const effectiveFetchData = fetchData || defaultFetchData;

  const loadData = useCallback(async (options: {
    pageIndex?: number;
    pageSize?: number;
    sortField?: string | null;
    sortDirection?: 'asc' | 'desc' | null;
    filters?: Record<string, FilterState>;
    searchTerm?: string;
    isInitialLoad?: boolean;
    isForceReload?: boolean;
    isSortChange?: boolean;
  } = {}) => {
    if (pendingRequestRef.current) {
      clearTimeout(pendingRequestRef.current);
      pendingRequestRef.current = null;
    }

    const {
      pageIndex = pagination.pageIndex,
      pageSize = pagination.pageSize,
      sortField: requestSortField = sortFieldRef.current || sortField,
      sortDirection: requestSortDirection = sortDirectionRef.current || sortDirection,
      filters = activeFilters,
      searchTerm: requestSearchTerm = searchTerm,
      isInitialLoad = false,
      isForceReload = false,
      isSortChange = false,
    } = options;

    if (initialData && !isForceReload && !isInitialLoad && !isSortChange) return;
    if (!isMountedRef.current) return;

    const requestSignature = JSON.stringify({
      pageIndex,
      pageSize,
      sortField: requestSortField,
      sortDirection: requestSortDirection,
      filters,
      searchTerm: requestSearchTerm,
    });

    if (requestSignature === currentRequestRef.current && !isForceReload) return;
    if (isInitialLoad && initialFetchDoneRef.current) return;

    currentRequestRef.current = requestSignature;
    setIsLoading(true);

    try {
      const apiFilters = Object.entries(filters)
        .filter(([_, filterState]) => filterState.active)
        .map(([field, filterState]) => {
          let filterType: FilterType;
          let minValue = String(filterState.value || '');
          let maxValue = String(filterState.secondValue || '');

          switch (filterState.operator) {
            case 'equals': filterType = FilterType.EQUALS; break;
            case 'contains': filterType = FilterType.CONTAINS; break;
            case 'startsWith': filterType = FilterType.STARTS_WITH; break;
            case 'endsWith': filterType = FilterType.ENDS_WITH; break;
            case 'greaterThan': filterType = FilterType.GREATER_THAN; break;
            case 'lessThan': filterType = FilterType.LESS_THAN; break;
            case 'between': filterType = FilterType.BETWEEN; break;
            default: filterType = FilterType.EQUALS;
          }

          return { field, filterType, minValue, maxValue };
        });

      // Ensure the request is properly formatted with all required fields
      const request: TableFetchRequest = {
        page: pageIndex,
        size: pageSize,
        sorts: requestSortField ? [{ field: requestSortField, sortType: requestSortDirection === 'asc' ? SortType.ASCENDING : SortType.DESCENDING }] : [],
        filters: apiFilters,
        search: dataRef.current.originalRequest?.search || {},
        objectType: entityType
      };

      // Add the entityName field to the request
      if (typeof entityType === 'string') {
        request.entityName = entityType.toLowerCase();
      } else {
        request.entityName = String(entityType).toLowerCase();
      }

      console.log('Sending table data request:', request);
      const response = await effectiveFetchData(request);
      dataRef.current = response;
      setData(response);
      setPagination({
        pageIndex: response.currentPage,
        pageSize: response.pageSize,
        totalItems: response.totalElements,
        totalPages: Math.max(1, response.totalPage),
      });

      if (isInitialLoad) initialFetchDoneRef.current = true;
    } catch (error) {
      console.error(`Error fetching data for ${entityType}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [entityType, initialData, pagination, sortField, sortDirection, activeFilters, searchTerm, effectiveFetchData]);

  useEffect(() => {
    isMountedRef.current = true;
    if (!initialData) {
      const timeoutId = setTimeout(() => loadData({ isInitialLoad: true }), 50);
      pendingRequestRef.current = timeoutId;
    }
    return () => {
      isMountedRef.current = false;
      if (pendingRequestRef.current) clearTimeout(pendingRequestRef.current);
    };
  }, [entityType, initialData, loadData]);

  useEffect(() => {
    if (initialData || !initialFetchDoneRef.current) return;
    if (pendingRequestRef.current) clearTimeout(pendingRequestRef.current);

    const timeoutId = setTimeout(() => {
      sortFieldRef.current = sortField;
      sortDirectionRef.current = sortDirection;
      loadData();
    }, 300);

    pendingRequestRef.current = timeoutId;
    return () => {
      if (pendingRequestRef.current) clearTimeout(pendingRequestRef.current);
    };
  }, [pagination.pageIndex, pagination.pageSize, sortField, sortDirection, activeFilters, searchTerm, loadData, initialData]);

  const handleFilterChange = (columnKey: string, filterState: FilterState) => {
    const updatedFilters = { ...activeFilters, [columnKey]: filterState };
    setActiveFilters(updatedFilters);

    const currentFilter = activeFilters[columnKey];
    const valueChanged = currentFilter?.value !== filterState.value || currentFilter?.secondValue !== filterState.secondValue;
    const activeStateChanged = filterState.active !== currentFilter?.active;

    if (activeStateChanged || (filterState.active && valueChanged)) {
      if (pendingRequestRef.current) clearTimeout(pendingRequestRef.current);
      loadData({ filters: updatedFilters, isSortChange: true });
    }

    if (onFilterChange) onFilterChange(columnKey, filterState.value);
  };

  const handleSortClick = (field: string) => {
    const newDirection = sortField === field ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
    sortFieldRef.current = field;
    sortDirectionRef.current = newDirection;
    setSortField(field);
    setSortDirection(newDirection);

    if (onSortChange) onSortChange(field, newDirection);
    if (pendingRequestRef.current) clearTimeout(pendingRequestRef.current);

    loadData({ sortField: field, sortDirection: newDirection, isSortChange: true });
  };

  const handleAddNewRow = useCallback(() => {
    const emptyData = {} as TableRow['data'];
    effectiveColumns.forEach(col => emptyData[col.key] = null);
    const tempNewRowData: TableRow = { data: { id: -1, ...emptyData } };
    setNewRowData(tempNewRowData);
    setIsAddingNewRow(true);
    if (onAdd) onAdd();
  }, [effectiveColumns, onAdd]);

  const handleConfirmation = useCallback(async (confirmed: boolean) => {
    if (editAction === 'cancel') {
      setIsEditConfirmOpen(false);
      if (confirmed) {
        setEditingRowId(null);
        setIsAddingNewRow(false);
      }
    } else if (editAction === 'save') {
      setIsSaveConfirmOpen(false);
      if (confirmed && editedData) {
        try {
          const isNewRecord = isAddingNewRow || (editedData.data?.id === undefined || editedData.data?.id < 0);
          if (onSave) {
            const saveResult = await onSave(null, editedData);
            if (saveResult) {
              setEditingRowId(null);
              setIsAddingNewRow(false);
              loadData({ isForceReload: true });
            }
          } else {
            const tableRowData: TableRow = { data: editedData.data };
            const result = isNewRecord
              ? await addRecord(entityType, tableRowData, data)
              : await updateRecord(entityType, tableRowData, data);
            if (result.success) {
              setEditingRowId(null);
              setIsAddingNewRow(false);
              loadData({ isForceReload: true });
            } else {
              console.error('Error saving record:', result.message);
            }
          }
        } catch (error) {
          console.error('Error during save operation:', error);
        }
      }
    } else if (editAction === 'delete') {
      setIsDeleteConfirmOpen(false);
      if (confirmed && rowToDelete) {
        try {
          if (onDelete) {
            await onDelete(rowToDelete);
          } else {
            const result = await deleteRecord(entityType, rowToDelete, data);
            if (result.success) {
              loadData({ isForceReload: true });
            } else {
              console.error('Error deleting record:', result.message);
            }
          }
        } catch (error) {
          console.error('Error during delete operation:', error);
        }
      }
    }
  }, [editAction, editedData, editingRowId, isAddingNewRow, loadData, onSave, entityType, data, rowToDelete, onDelete]);

  const handleExportTable = async () => {
    setIsLoading(true);
    try {
      await exportTableData(entityType, data);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleImportTable = (field: boolean) => {
    setIsImportDialogOpen(field);
  };


  const handleActionImportTable = async (confirmed: boolean, file: File) => {
    setIsImportDialogOpen(false);
    setIsLoading(true);
    if (confirmed) {
      try {
        console.log('Import action confirmed');
        await importTableData(entityType, file);
      } catch (error) {
        console.error('Import error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };


  const handleImportComplete = () => {
    // Refresh data after import
    loadData({ isForceReload: true });
  };

  return {
    data,
    pagination,
    setPagination: (newPagination: Partial<PaginationState>) => {
      setPagination(current => ({ ...current, ...newPagination }));
      loadData({ pageIndex: newPagination.pageIndex, pageSize: newPagination.pageSize, isSortChange: true });
    },
    activeFilters,
    setActiveFilters: (filters: Record<string, FilterState>) => {
      setActiveFilters(filters);
      loadData({ filters, isSortChange: true });
    },
    openFilterColumn,
    setOpenFilterColumn,
    expandedRowId,
    setExpandedRowId: (id: number | null) => {
      // Allow null to collapse rows, but prevent expansion during edit mode
      if (editingRowId !== null || isAddingNewRow) return;
      setExpandedRowId(expandedRowId === id ? null : id);
    },
    editingRowId,
    isAddingNewRow,
    newRowData,
    isLoading,
    searchTerm,
    setSearchTerm: (value: string) => {
      setSearchTerm(value);
      if (onSearchChange) onSearchChange(value);
      if (pendingRequestRef.current) clearTimeout(pendingRequestRef.current);
      const timeoutId = setTimeout(() => loadData({ searchTerm: value }), 500);
      pendingRequestRef.current = timeoutId;
    },
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
    tableActions,
    columnsWithActiveFilters,
    handleExportTable,
    handleImportTable,
    isImportDialogOpen,
    setIsImportDialogOpen,
    handleImportComplete,
    handleActionImportTable
  };
};
