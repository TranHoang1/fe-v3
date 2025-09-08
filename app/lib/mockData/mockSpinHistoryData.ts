import { TableRow, TableFetchResponse, ObjectType, DataObject } from '../api/interfaces';
import { createMockTableData, generateRecentDate } from './mockDataGenerator';

// Generate mock spin history data
const spinOutcomes = ['WIN', 'LOSE', 'INVALID', 'ERROR'];
const deviceTypes = ['MOBILE', 'DESKTOP', 'TABLET', 'KIOSK'];

const spinHistoryRows: TableRow[] = Array(50).fill(null).map((_, index) => {
  const id = index + 1;
  const participantId = Math.floor(Math.random() * 20) + 1;
  const eventId = Math.floor(Math.random() * 5) + 1;
  const rewardId = Math.random() > 0.3 ? Math.floor(Math.random() * 25) + 1 : null;
  const outcome = rewardId ? 'WIN' : spinOutcomes[Math.floor(Math.random() * spinOutcomes.length)];
  const spinDate = generateRecentDate();
  const spinTime = `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
  
  return {
    data: {
      id,
      participantId,
      eventId,
      rewardId,
      outcome,
      spinDate,
      spinTime,
      deviceType: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
      ipAddress: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
      claimed: outcome === 'WIN' ? Math.random() > 0.5 : false,
      claimedDate: outcome === 'WIN' && Math.random() > 0.5 ? generateRecentDate() : null,
      goldenHourId: Math.random() > 0.7 ? Math.floor(Math.random() * 15) + 1 : null,
      createdAt: spinDate + 'T' + spinTime
    }
  };
});

// Create table response
const mockSpinHistoryTable: TableFetchResponse = createMockTableData(
  ObjectType.SpinHistory,
  'spin_history',
  spinHistoryRows,
  100 // Total records
);

// Add related tables info - there are no child tables for spin history

// Add parent relationships
const uniqueIds = new Set();
mockSpinHistoryTable.rows.forEach(row => {
  const eventId = row.data.eventId;
  const participantId = row.data.participantId;
  const rewardId = row.data.rewardId;
  const goldenHourId = row.data.goldenHourId;
  
  // Add event relationship if not already added
  if (eventId && !uniqueIds.has(`event_${eventId}`)) {
    mockSpinHistoryTable.relatedLinkedObjects[`event_${eventId}`] = {
      id: eventId,
      name: `Event ${eventId}`,
      objectType: ObjectType.Event,
      description: "Parent event",
      key: { keys: ['id'] }
    } as unknown as DataObject;
    uniqueIds.add(`event_${eventId}`);
  }
  
  // Add participant relationship if not already added
  if (participantId && !uniqueIds.has(`participant_${participantId}`)) {
    mockSpinHistoryTable.relatedLinkedObjects[`participant_${participantId}`] = {
      id: participantId,
      name: `Participant ${participantId}`,
      objectType: ObjectType.Participant,
      description: "Participant who spun",
      key: { keys: ['id'] }
    } as unknown as DataObject;
    uniqueIds.add(`participant_${participantId}`);
  }
  
  // Add reward relationship if applicable and not already added
  if (rewardId && !uniqueIds.has(`reward_${rewardId}`)) {
    mockSpinHistoryTable.relatedLinkedObjects[`reward_${rewardId}`] = {
      id: rewardId,
      name: `Reward ${rewardId}`,
      objectType: ObjectType.Reward,
      description: "Won reward",
      key: { keys: ['id'] }
    } as unknown as DataObject;
    uniqueIds.add(`reward_${rewardId}`);
  }
  
  // Add golden hour relationship if applicable and not already added
  if (goldenHourId && !uniqueIds.has(`goldenHour_${goldenHourId}`)) {
    mockSpinHistoryTable.relatedLinkedObjects[`goldenHour_${goldenHourId}`] = {
      id: goldenHourId,
      name: `Golden Hour ${goldenHourId}`,
      objectType: ObjectType.GoldenHour,
      description: "Golden hour when spin occurred",
      key: { keys: ['id'] }
    } as unknown as DataObject;
    uniqueIds.add(`goldenHour_${goldenHourId}`);
  }
});

export { mockSpinHistoryTable };
