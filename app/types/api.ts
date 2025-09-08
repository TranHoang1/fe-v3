// Define or update the TableFetchResponse interface
export interface TableFetchResponse {
  id?: string;
  name: string;
  displayName: string;
  description?: string;
  tableName: string;
  fields: {
    [fieldName: string]: {
      type: string;
      displayName: string;
      required: boolean;
      // Add any other field properties
    }
  };
  relatedTables?: {
    [relationType: string]: {
      [tableName: string]: {
        displayName: string;
        relationField: string;
        rows?: any[];
        // Add any other relation properties
      }
    }
  };
  // These are required by EntityTabContent
  originalRequest: any;
  statistics: any;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  totalElements: number;
  rows: any[];
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
}

// Add other types as needed
export interface EntityData {
  [key: string]: any;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
