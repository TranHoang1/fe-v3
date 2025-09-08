import { TableRow, TableFetchResponse, ObjectType, DataObject } from '../api/interfaces';
import { createMockTableData } from './mockDataGenerator';

// Generate mock permission data
const permissionDefinitions = [
  { name: 'VIEW_EVENTS', description: 'View events' },
  { name: 'CREATE_EVENT', description: 'Create a new event' },
  { name: 'EDIT_EVENT', description: 'Edit existing events' },
  { name: 'DELETE_EVENT', description: 'Delete events' },
  { name: 'VIEW_PARTICIPANTS', description: 'View participants' },
  { name: 'CREATE_PARTICIPANT', description: 'Create participants' },
  { name: 'EDIT_PARTICIPANT', description: 'Edit participants' },
  { name: 'DELETE_PARTICIPANT', description: 'Delete participants' },
  { name: 'VIEW_REWARDS', description: 'View rewards' },
  { name: 'CREATE_REWARD', description: 'Create rewards' },
  { name: 'EDIT_REWARD', description: 'Edit rewards' },
  { name: 'DELETE_REWARD', description: 'Delete rewards' },
  { name: 'VIEW_REPORTS', description: 'View reports' },
  { name: 'EXPORT_DATA', description: 'Export data' },
  { name: 'MANAGE_USERS', description: 'Manage users' },
  { name: 'MANAGE_ROLES', description: 'Manage roles' },
  { name: 'ACCESS_ADMIN', description: 'Access admin area' },
  { name: 'ACCESS_API', description: 'Access API' }
];

const permissionRows: TableRow[] = permissionDefinitions.map((permission, index) => {
  const id = index + 1;
  return {
    data: {
      id,
      name: permission.name,
      description: permission.description,
      active: true,
      category: permission.name.split('_')[0],
      action: permission.name.split('_')[1],
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
    }
  };
});

// Create table response
const mockPermissionTable: TableFetchResponse = createMockTableData(
  ObjectType.Permission,
  'permissions',
  permissionRows,
  permissionRows.length
);

// Add related tables info - permissions relate to roles
mockPermissionTable.relatedLinkedObjects = {
  'roles': {
    id: 1,
    objectType: ObjectType.Role,
    description: "Roles with this permission",
    key: { keys: ['id'] }
  } as unknown as DataObject
};

// Update rows with related tables information
mockPermissionTable.rows.forEach(row => {
  if ('data' in row && row.data.id) {
    (row as any).relatedTables = ['roles'];
  }
});

export { mockPermissionTable };
