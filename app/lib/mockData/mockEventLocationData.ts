import { TableRow, TableFetchResponse, ObjectType, DataObject } from '../api/interfaces';
import { createMockTableData } from './mockDataGenerator';

// Generate mock event location data
const locationTypes = ['STORE', 'MALL', 'OFFICE', 'POPUP', 'OUTDOOR', 'ONLINE'];

const eventLocationRows: TableRow[] = Array(30).fill(null).map((_, index) => {
  const id = index + 1;
  const eventId = Math.floor(Math.random() * 5) + 1;
  const provinceId = Math.floor(Math.random() * 15) + 1;
  const type = locationTypes[Math.floor(Math.random() * locationTypes.length)];
  
  return {
    data: {
      id,
      name: `Location ${id}`,
      address: `${Math.floor(Math.random() * 1000)} Main Street`,
      city: ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Hue', 'Can Tho'][Math.floor(Math.random() * 5)],
      provinceId,
      eventId,
      type,
      capacity: Math.floor(Math.random() * 500) + 50,
      active: Math.random() > 0.2,
      startDate: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString().split('T')[0],
      endDate: new Date(Date.now() + Math.random() * 86400000 * 30).toISOString().split('T')[0],
      latitude: (Math.random() * 10) + 10,
      longitude: (Math.random() * 10) + 105,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
});

// Create table response
const mockEventLocationTable: TableFetchResponse = createMockTableData(
  ObjectType.EventLocation,
  'event_locations',
  eventLocationRows,
  eventLocationRows.length
);

// Add related tables info
mockEventLocationTable.relatedLinkedObjects = {
  'participants': {
    id: 1,
    objectType: ObjectType.Participant,
    description: "Participants at this location",
    key: { keys: ['id'] }
  } as unknown as DataObject
};

// Add event and province relationships
mockEventLocationTable.rows.forEach(row => {
  const eventId = row.data.eventId;
  const provinceId = row.data.provinceId;
  
  // Add event relationship
  mockEventLocationTable.relatedLinkedObjects[`event_${eventId}`] = {
    id: eventId,
    name: `Event ${eventId}`,
    objectType: ObjectType.Event,
    description: "Parent event",
    key: { keys: ['id'] }
  } as unknown as DataObject;
  
  // Add province relationship
  mockEventLocationTable.relatedLinkedObjects[`province_${provinceId}`] = {
    id: provinceId,
    name: `Province ${provinceId}`,
    objectType: ObjectType.Province,
    description: "Location province",
    key: { keys: ['id'] }
  } as unknown as DataObject;
  
  // Add related tables to each row
  if ('data' in row && row.data.id) {
    (row as any).relatedTables = ['participants'];
  }
});

export { mockEventLocationTable };
