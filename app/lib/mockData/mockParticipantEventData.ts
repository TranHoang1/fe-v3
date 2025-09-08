import { TableRow, TableFetchResponse, ObjectType, DataObject } from '../api/interfaces';
import { createMockTableData, generateRecentDate } from './mockDataGenerator';

// Generate mock participant event data (join table between participants and events)
const participantEventRows: TableRow[] = Array(100).fill(null).map((_, index) => {
  const id = index + 1;
  const participantId = Math.floor(Math.random() * 50) + 1;
  const eventId = Math.floor(Math.random() * 5) + 1;
  const locationId = Math.floor(Math.random() * 30) + 1;
  
  return {
    data: {
      id,
      participantId,
      eventId,
      joinDate: generateRecentDate(),
      locationId: Math.random() > 0.3 ? locationId : null,
      status: ['ACTIVE', 'INACTIVE', 'BANNED', 'COMPLETED'][Math.floor(Math.random() * 4)],
      totalSpins: Math.floor(Math.random() * 20),
      lastSpinDate: Math.random() > 0.6 ? generateRecentDate() : null,
      notes: Math.random() > 0.8 ? `Note for participant ${participantId} in event ${eventId}` : null,
      createdAt: generateRecentDate()
    }
  };
});

// Create table response
const mockParticipantEventTable: TableFetchResponse = createMockTableData(
  ObjectType.ParticipantEvent,
  'participant_events',
  participantEventRows,
  200 // Total records
);

// Add participant and event relationships
const uniqueIds = new Set();
mockParticipantEventTable.rows.forEach(row => {
  const participantId = row.data.participantId;
  const eventId = row.data.eventId;
  const locationId = row.data.locationId;
  
  // Add participant relationship if not already added
  if (participantId && !uniqueIds.has(`participant_${participantId}`)) {
    mockParticipantEventTable.relatedLinkedObjects[`participant_${participantId}`] = {
      id: participantId,
      name: `Participant ${participantId}`,
      objectType: ObjectType.Participant,
      description: "Participant",
      key: { keys: ['id'] }
    } as unknown as DataObject;
    uniqueIds.add(`participant_${participantId}`);
  }
  
  // Add event relationship if not already added
  if (eventId && !uniqueIds.has(`event_${eventId}`)) {
    mockParticipantEventTable.relatedLinkedObjects[`event_${eventId}`] = {
      id: eventId,
      name: `Event ${eventId}`,
      objectType: ObjectType.Event,
      description: "Event",
      key: { keys: ['id'] }
    } as unknown as DataObject;
    uniqueIds.add(`event_${eventId}`);
  }
  
  // Add location relationship if applicable and not already added
  if (locationId && !uniqueIds.has(`location_${locationId}`)) {
    mockParticipantEventTable.relatedLinkedObjects[`location_${locationId}`] = {
      id: locationId,
      name: `Location ${locationId}`,
      objectType: ObjectType.EventLocation,
      description: "Event location where participant joined",
      key: { keys: ['id'] }
    } as unknown as DataObject;
    uniqueIds.add(`location_${locationId}`);
  }
});

// Add related tables info - this is a join table, so it relates to spin history
mockParticipantEventTable.relatedLinkedObjects['spinHistory'] = {
  id: 1,
  objectType: ObjectType.SpinHistory,
  description: "Spin history for this participation",
  key: { keys: ['id'] }
} as unknown as DataObject;

// Update rows with related tables information
mockParticipantEventTable.rows.forEach(row => {
  if ('data' in row && row.data.id) {
    (row as any).relatedTables = ['spinHistory'];
  }
});

export { mockParticipantEventTable };
