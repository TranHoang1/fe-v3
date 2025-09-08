import { TableRow, TableFetchResponse, ObjectType } from '../api/interfaces';
import { createMockTableData, generateRecentDate } from './mockDataGenerator';

// Generate mock audit log data
const actionTypes = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ACCESS', 'EXPORT', 'IMPORT'];
const entityTypes = ['Event', 'Participant', 'Reward', 'User', 'Role', 'Configuration', 'SpinHistory'];
const statuses = ['SUCCESS', 'FAILURE', 'WARNING', 'ERROR'];

const auditLogRows: TableRow[] = Array(100).fill(null).map((_, index) => {
  const id = index + 1;
  const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
  const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
  const entityId = Math.floor(Math.random() * 100) + 1;
  const userId = Math.floor(Math.random() * 10) + 1;
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const logDate = generateRecentDate();
  const logTime = `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
  
  return {
    data: {
      id,
      timestamp: `${logDate}T${logTime}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}.${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}Z`,
      actionType,
      entityType,
      entityId,
      userId,
      username: `user${userId}`,
      ipAddress: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
      details: `${actionType} operation on ${entityType} with ID ${entityId}`,
      status,
      requestData: actionType !== 'ACCESS' ? JSON.stringify({ id: entityId, someField: 'someValue' }) : null,
      responseData: status !== 'SUCCESS' ? JSON.stringify({ error: 'Some error message' }) : null
    }
  };
});

// Create table response
const mockAuditLogTable: TableFetchResponse = createMockTableData(
  ObjectType.AuditLog,
  'audit_log',
  auditLogRows,
  200 // Total records
);

// Audit logs don't have related tables or parent relationships
export { mockAuditLogTable };
