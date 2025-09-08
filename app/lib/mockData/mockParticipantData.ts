import { TableRow, TableFetchResponse, ObjectType, DataObject } from '../api/interfaces';
import { createMockTableData, generateRecentDate } from './mockDataGenerator';

// Generate mock participant data
const firstNames = ['John', 'Mary', 'Robert', 'Lisa', 'James', 'Jennifer', 'David', 'Sarah', 'Michael', 'Emily'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];

const participantRows: TableRow[] = Array(50).fill(null).map((_, index) => {
  const id = index + 1;
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@example.com`;
  const provinceId = Math.floor(Math.random() * 15) + 1;
  
  return {
    data: {
      id,
      firstName,
      lastName,
      email,
      phone: `+84${Math.floor(Math.random() * 1000000000)}`,
      gender: ['MALE', 'FEMALE', 'OTHER'][Math.floor(Math.random() * 3)],
      age: Math.floor(Math.random() * 60) + 18,
      address: `${Math.floor(Math.random() * 1000)} ${['Main St', 'Oak Ave', 'Maple Rd', 'Pine Blvd'][Math.floor(Math.random() * 4)]}`,
      city: ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Hue', 'Can Tho'][Math.floor(Math.random() * 5)],
      provinceId,
      registrationDate: generateRecentDate(),
      totalSpins: Math.floor(Math.random() * 50),
      winCount: Math.floor(Math.random() * 10),
      active: Math.random() > 0.1
    }
  };
});

// Create table response
const mockParticipantTable: TableFetchResponse = createMockTableData(
  ObjectType.Participant,
  'participants',
  participantRows,
  100 // Total of 100 participants, but we only show 50 per page
);

// Add related tables info
mockParticipantTable.relatedLinkedObjects = {
  'participantEvents': {
    id: 1,
    objectType: ObjectType.ParticipantEvent,
    description: "Events this participant joined",
    key: { keys: ['id'] }
  } as unknown as DataObject,
  'spinHistory': {
    id: 2,
    objectType: ObjectType.SpinHistory,
    description: "Spin history for this participant",
    key: { keys: ['id'] }
  } as unknown as DataObject
};

// Add province relationships
mockParticipantTable.rows.forEach(row => {
  const provinceId = row.data.provinceId;
  
  // Add province relationship
  mockParticipantTable.relatedLinkedObjects[`province_${provinceId}`] = {
    id: provinceId,
    name: `Province ${provinceId}`,
    objectType: ObjectType.Province,
    description: "Participant's province",
    key: { keys: ['id'] }
  } as unknown as DataObject;
  
  // Add related tables to each row
  if ('data' in row && row.data.id) {
    (row as any).relatedTables = ['participantEvents', 'spinHistory'];
  }
});

export { mockParticipantTable };
