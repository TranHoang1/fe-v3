import { TableRow, TableFetchResponse, ObjectType, DataObject } from '../api/interfaces';
import { createMockTableData, pickRandom } from './mockDataGenerator';

// Generate mock golden hour data
const timeSlots = [
  '08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', 
  '16:00-18:00', '18:00-20:00', '20:00-22:00', '22:00-00:00'
];

const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const goldenHourRows: TableRow[] = Array(15).fill(null).map((_, index) => {
  const id = index + 1;
  const eventId = Math.floor(Math.random() * 5) + 1;
  const timeSlot = pickRandom(timeSlots);
  const multiplier = Math.floor(Math.random() * 3) + 2; // 2x, 3x, 4x
  const applicableDays = Array.from({ length: Math.floor(Math.random() * 7) + 1 })
    .map(() => pickRandom(daysOfWeek))
    .filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
  
  return {
    data: {
      id,
      name: `${multiplier}X Rewards - ${timeSlot}`,
      eventId,
      startTime: timeSlot.split('-')[0],
      endTime: timeSlot.split('-')[1],
      multiplier,
      applicableDays: applicableDays.join(','),
      active: Math.random() > 0.3,
      description: `${multiplier}X reward multiplier during ${timeSlot} on ${applicableDays.join(', ')}`,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
    }
  };
});

// Create table response
const mockGoldenHourTable: TableFetchResponse = createMockTableData(
  ObjectType.GoldenHour,
  'golden_hours',
  goldenHourRows,
  goldenHourRows.length
);

// Add related tables info
mockGoldenHourTable.relatedLinkedObjects = {
  'spinHistory': {
    id: 1,
    objectType: ObjectType.SpinHistory,
    description: "Spin history during this golden hour",
    key: { keys: ['id'] }
  } as unknown as DataObject
};

// Add event relationship
mockGoldenHourTable.rows.forEach(row => {
  const eventId = row.data.eventId;
  mockGoldenHourTable.relatedLinkedObjects[`event_${eventId}`] = {
    id: eventId,
    name: `Event ${eventId}`,
    objectType: ObjectType.Event,
    description: "Parent event",
    key: { keys: ['id'] }
  } as unknown as DataObject;
  
  // Add related tables to each row
  if ('data' in row && row.data.id) {
    (row as any).relatedTables = ['spinHistory'];
  }
});

export { mockGoldenHourTable };
