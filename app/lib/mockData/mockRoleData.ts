import { TableRow, TableFetchResponse, ObjectType, DataObject } from '../api/interfaces';
import { createMockTableData } from './mockDataGenerator';

// Generate mock role data
const roleDefinitions = [
  { name: 'ADMIN', description: 'Administrator with full access' },
  { name: 'EVENT_MANAGER', description: 'Can manage events and rewards' },
  { name: 'PARTICIPANT_MANAGER', description: 'Can manage participants' },
  { name: 'REPORT_VIEWER', description: 'Can view reports and statistics' },
  { name: 'USER', description: 'Regular user with limited access' }
];

const roleRows: TableRow[] = roleDefinitions.map((role, index) => {
  const id = index + 1;
  return {
    data: {
      id,
      name: role.name,
      description: role.description,
      active: true,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      createdBy: 'system',
      updatedAt: new Date().toISOString(),
      updatedBy: 'system'
    }
  };
});

// Create table response
const mockRoleTable: TableFetchResponse = createMockTableData(
  ObjectType.Role,
  'roles',
  roleRows,
  roleRows.length
);

// Add related tables info
mockRoleTable.relatedLinkedObjects = {
  'users': {
    id: 1,
    objectType: ObjectType.User,
    description: "Users with this role",
    key: { keys: ['id'] }
  } as unknown as DataObject,
  'permissions': {
    id: 2,
    objectType: ObjectType.Permission,
    description: "Permissions for this role",
    key: { keys: ['id'] }
  } as unknown as DataObject
};

// Update rows with related tables information
mockRoleTable.rows.forEach(row => {
  if ('data' in row && row.data.id) {
    (row as any).relatedTables = ['users', 'permissions'];
  }
});

export { mockRoleTable };
