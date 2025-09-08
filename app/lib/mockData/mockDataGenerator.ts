import {
  TableFetchResponse,
  ObjectType,
  FetchStatus,
  SortType,
  FilterType,
  FieldType,
  TableRow,
  ColumnInfo,
  DataObjectKey
} from '../api/interfaces';

/**
 * Creates base mock data for a table with the specified parameters
 */
export function createMockTableData(
  objectType: ObjectType,
  tableName: string,
  rows: TableRow[],
  totalElements: number = rows.length,
  page: number = 0,
  size: number = 10
): TableFetchResponse {  // Create column info based on the first row's data keys
  const fieldNameMap: Record<string, ColumnInfo> = {};
  
  if (rows.length > 0) {
    const firstRowKeys = Object.keys(rows[0].data);
    firstRowKeys.forEach(key => {
      const columnInfo: ColumnInfo = {
        objectType: objectType, // Required property from ColumnInfo interface
        fieldName: key,
        fieldType: getFieldTypeForValue(rows[0].data[key]),
        sortType: SortType.NONE
      };
      fieldNameMap[key] = columnInfo;
    });
  }
  
  // Create table key
  const tableKey: DataObjectKey = {
    keys: ['id']
  };
  
  return {
    status: FetchStatus.SUCCESS,
    message: "Success",
    originalRequest: {
      page,
      size,
      sorts: [],
      filters: [],
      search: {} as Record<ObjectType, any>,
      objectType
    },
    key: tableKey,
    totalPage: Math.ceil(totalElements / size),
    currentPage: page,
    pageSize: size,
    totalElements,
    tableName,
    fieldNameMap,
    rows,
    relatedLinkedObjects: {},
    statistics: {
      charts: {}
    },
    first: page === 0,
    last: page >= Math.ceil(totalElements / size) - 1,
    empty: rows.length === 0,
    numberOfElements: rows.length
  };
}

// Helper function to determine field type from a value
function getFieldTypeForValue(value: any): FieldType {
  if (value === null || value === undefined) return FieldType.STRING;
  
  switch (typeof value) {
    case 'number': return FieldType.NUMBER;
    case 'boolean': return FieldType.BOOLEAN;
    case 'string': 
      // Try to detect dates
      if (!isNaN(Date.parse(value)) && value.includes('-')) return FieldType.DATE;
      return FieldType.STRING;
    case 'object':
      if (value instanceof Date) return FieldType.DATE;
      return FieldType.OBJECT;
    default:
      return FieldType.STRING;
  }
}

// Helper to generate realistic IDs
export function generateId(): number {
  return Math.floor(10000 + Math.random() * 90000);
}

// Helper to generate a random date within the last year
export function generateRecentDate(): string {
  const now = new Date();
  const pastDate = new Date();
  pastDate.setFullYear(now.getFullYear() - 1);
  const randomTime = pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime());
  return new Date(randomTime).toISOString().split('T')[0];
}

// Helper to generate a random past to future date range
export function generateDateRange(): [string, string] {
  const now = new Date();
  
  // Past date (0-6 months ago)
  const pastDate = new Date();
  pastDate.setMonth(now.getMonth() - Math.floor(Math.random() * 6));
  
  // Future date (1-12 months in future)
  const futureDate = new Date();
  futureDate.setMonth(now.getMonth() + 1 + Math.floor(Math.random() * 12));
  
  return [
    pastDate.toISOString().split('T')[0],
    futureDate.toISOString().split('T')[0]
  ];
}

// Helper to pick a random item from an array
export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// Helper to generate a random boolean with bias
export function randomBoolean(trueProbability: number = 0.5): boolean {
  return Math.random() < trueProbability;
}
