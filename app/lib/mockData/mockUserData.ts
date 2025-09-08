import { TableRow, TableFetchResponse, ObjectType, DataObject } from '../api/interfaces';
import { createMockTableData, generateRecentDate } from './mockDataGenerator';

// Generate mock user data
const firstNames = ['John', 'Jane', 'Robert', 'Sarah', 'Michael', 'Emily', 'David', 'Laura'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson'];
const statuses = ['ACTIVE', 'INACTIVE', 'LOCKED', 'PENDING'];

const userRows: TableRow[] = Array(10).fill(null).map((_, index) => {
    const id = index + 1;
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${id}`;
    const email = `${username}@example.com`;
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    return {
        data: {
            id,
            username,
            firstName,
            lastName,
            email,
            phone: `+84${Math.floor(Math.random() * 1000000000)}`,
            status,
            lastLogin: Math.random() > 0.3 ? generateRecentDate() + 'T' +
                `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}Z` : null,
            createdAt: generateRecentDate(),
            createdBy: 'system',
            updatedAt: generateRecentDate(),
            updatedBy: 'system',
            roleIds: Array.from({ length: Math.floor(Math.random() * 3) + 1 })
                .map(() => Math.floor(Math.random() * 5) + 1)
                .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
        }
    };
});

// Create table response
const mockUserTable: TableFetchResponse = createMockTableData(
    ObjectType.User,
    'users',
    userRows,
    userRows.length
);

// Add related tables info
mockUserTable.relatedLinkedObjects = {
    'roles': {
        id: 1,
        objectType: ObjectType.Role,
        description: "User roles",
        key: { keys: ['id'] }
    } as unknown as DataObject,
    'auditLog': {
        id: 2,
        objectType: ObjectType.AuditLog,
        description: "User audit log",
        key: { keys: ['id'] }
    } as unknown as DataObject
};

// Update rows with related tables information
mockUserTable.rows.forEach(row => {
    if ('data' in row && row.data.id) {
        (row as any).relatedTables = ['roles', 'auditLog'];
    }
});

export { mockUserTable };
