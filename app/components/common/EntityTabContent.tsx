'use client';

import { ReactNode } from 'react';
import DataTable from '@/app/components/common/DataTable';
import { ActionDef } from '../common/datatable/utils/tableUtils';
import { TableFetchResponse, ObjectType, FetchStatus, SortType, DataObject } from '@/app/lib/api/interfaces';
import { fetchTableData } from '@/app/lib/api/tableService';

// Helper function to extract related table data from the source table
function getRelatedTableData(
  sourceTable: TableFetchResponse,
  entityId: number,
  relatedTableName: string
): TableFetchResponse | null {
  // Check if the source table has relatedLinkedObjects
  if (!sourceTable.relatedLinkedObjects || 
      !Object.keys(sourceTable.relatedLinkedObjects).includes(relatedTableName)) {
    return null;
  }
  
  // Try to find the related table data in the source table's relatedLinkedObjects
  // This would typically require access to API data structures
  // Return null if not found
  return null;
}

// Function to fetch related table data from the API
async function fetchRelatedTableData(
  sourceTableName: string,
  entityId: number,
  relatedTableName: string,
  request: any
): Promise<TableFetchResponse> {
  // Create a request with proper filters to get related data
  const tableRequest = {
    ...request,
    objectType: relatedTableName.toUpperCase() as unknown as ObjectType,
    filters: [
      ...request.filters || [],
      {
        field: `${sourceTableName.toLowerCase()}Id`,
        filterType: 'EQUALS',
        minValue: entityId.toString(),
        maxValue: entityId.toString()
      }
    ]
  };
  
  // Use the fetchTableData service
  return await fetchTableData(tableRequest);
}

interface EntityTabContentProps {
  entityId: number;
  sourceTable: TableFetchResponse;
  relatedTableName: string;
  title: string;
  emptyMessage?: string;
  actions?: ActionDef[];
  renderDetailView?: (rowData: any) => ReactNode;
  addItemButton?: {
    label: string;
    onClick: () => void;
  };
  filterOptions?: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
}

export default function EntityTabContent({
  entityId,
  sourceTable,
  relatedTableName,
  title,
  emptyMessage = "No data found.",
  actions = [],
  renderDetailView,
  addItemButton,
  filterOptions = []
}: EntityTabContentProps) {
  // Get related data from the source table
  const relatedTable = getRelatedTableData(sourceTable, entityId, relatedTableName) || {
    status: FetchStatus.NO_DATA,  // Required by TableFetchResponse interface
    message: "No data available",  // Required by TableFetchResponse
    totalPage: 0,                  // Use totalPage instead of totalPages
    currentPage: 0,
    pageSize: 0,
    totalElements: 0,
    tableName: `entity_${relatedTableName}`,
    rows: [],
    fieldNameMap: {},              // Required by TableFetchResponse
    relatedLinkedObjects: {},      // Required by TableFetchResponse
    originalRequest: {
      page: 0,
      size: 10,
      sorts: [{ 
        field: "name", 
        sortType: SortType.ASCENDING // Use sortType instead of order
      }],
      filters: [],
      // Create a properly formatted search object
      search: Object.values(ObjectType).reduce((acc, type) => {
        acc[type] = {
          objectType: type,
          key: { keys: [] },
          fieldNameMap: {},
          description: '',
          data: { data: {} },
          order: 0
        };
        return acc;
      }, {} as Record<ObjectType, DataObject>),
      objectType: ObjectType[relatedTableName.toUpperCase() as keyof typeof ObjectType] || ObjectType.Event
    },
    statistics: {
      charts: {}  // Proper structure for statistics
    },
    // Additional optional properties for TableFetchResponse
    first: true,
    last: true,
    empty: true,
    numberOfElements: 0
  };

  // Function to fetch data with filtering, pagination, etc.
  const fetchData = async (request: any) => {
    try {
      return await fetchRelatedTableData(
        sourceTable.tableName,
        entityId,
        relatedTableName,
        request
      );
    } catch (error) {
      console.error(`Error fetching ${relatedTableName} for ${sourceTable.tableName} ${entityId}:`, error);
      return relatedTable; // Return existing data if fetch fails
    }
  };
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <DataTable 
        data={relatedTable}
        entityType={relatedTableName.toUpperCase() as unknown as ObjectType}
        actions={actions}
        detailView={renderDetailView}
        filterOptions={filterOptions}
        addItemButton={addItemButton}
        urlStatePrefix={`entity_${entityId}_${relatedTableName}`}
        emptyMessage={emptyMessage}
        fetchData={fetchData}
      />
    </div>
  );
}
