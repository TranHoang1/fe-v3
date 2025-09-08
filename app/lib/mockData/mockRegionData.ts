import { TableRow, TableFetchResponse, ObjectType, DataObject } from '../api/interfaces';
import { createMockTableData, generateId } from './mockDataGenerator';

// Generate mock region data
const regionNames = [
  'North', 'South', 'East', 'West', 'Central', 
  'Northeast', 'Northwest', 'Southeast', 'Southwest',
  'Highlands', 'Coastal', 'Delta'
];

const regionRows: TableRow[] = regionNames.map((name, index) => {
  const id = index + 1;
  return {
    data: {
      id,
      name,
      code: name.substring(0, 3).toUpperCase(),
      description: `${name} region of the country`,
      active: Math.random() > 0.2,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
    }
  };
});

// Create table response
const mockRegionTable: TableFetchResponse = createMockTableData(
  ObjectType.Region,
  'regions',
  regionRows,
  regionRows.length
);

// Add related tables info
mockRegionTable.relatedLinkedObjects = {
  'provinces': {
    id: 1,
    objectType: ObjectType.Province,
    description: "Provinces in this region",
    key: { keys: ['id'] }
  } as unknown as DataObject
};

// Update rows with related tables information
mockRegionTable.rows.forEach(row => {
  if ('data' in row && row.data.id) {
    (row as any).relatedTables = ['provinces'];
  }
});

export { mockRegionTable };
