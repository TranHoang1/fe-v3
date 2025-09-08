import { TableRow, TableFetchResponse, ObjectType, DataObject } from '../api/interfaces';
import { createMockTableData, generateId, generateDateRange, pickRandom, randomBoolean } from './mockDataGenerator';

// Generate mock event data
const eventNames = [
  'Summer Giveaway', 'Winter Promo', 'Back to School Special', 
  'New Year Celebration', 'Holiday Bonanza', 'Spring Festival',
  'Lunar New Year', 'Anniversary Event', 'Grand Opening', 
  'Black Friday Special', 'Customer Appreciation', 'VIP Member Event'
];

const eventStatuses = ['ACTIVE', 'SCHEDULED', 'COMPLETED', 'CANCELLED'];

const eventRows: TableRow[] = Array(15).fill(null).map((_, index) => {
  const id = index + 1; // Use sequential IDs for easier reference
  const [startDate, endDate] = generateDateRange();
  const active = randomBoolean(0.7);
  const status = pickRandom(eventStatuses);
  const name = `${pickRandom(eventNames)} ${new Date().getFullYear()}`;
  
  return {
    data: {
      id,
      name,
      description: `Description for ${name}`,
      startDate,
      endDate,
      status,
      active,
      participantCount: Math.floor(Math.random() * 10000),
      winnerCount: Math.floor(Math.random() * 1000),
      spinCount: Math.floor(Math.random() * 15000),
      rewardCount: Math.floor(Math.random() * 500),
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
});

// Create table response
const mockEventTable: TableFetchResponse = createMockTableData(
  ObjectType.Event,
  'events',
  eventRows,
  eventRows.length
);

// Add related tables info
mockEventTable.relatedLinkedObjects = {
  'rewards': {
    id: 1,
    objectType: ObjectType.Reward,
    description: "Rewards for this event",
    key: { keys: ['id'] }
  } as unknown as DataObject,
  'participants': {
    id: 2,
    objectType: ObjectType.Participant,
    description: "Participants in this event",
    key: { keys: ['id'] }
  } as unknown as DataObject,
  'eventLocations': {
    id: 3,
    objectType: ObjectType.EventLocation,
    description: "Locations for this event",
    key: { keys: ['id'] }
  } as unknown as DataObject
};

// Update rows with related tables information
mockEventTable.rows.forEach(row => {
  if ('data' in row && row.data.id) {
    (row as any).relatedTables = ['rewards', 'participants', 'eventLocations'];
  }
});

export { mockEventTable };
