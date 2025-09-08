import { TableRow, TableFetchResponse, ObjectType } from '../api/interfaces';
import { createMockTableData } from './mockDataGenerator';

// Generate mock configuration data
const configDefinitions = [
  { name: 'DEFAULT_EVENT_DURATION_DAYS', value: '30', description: 'Default event duration in days' },
  { name: 'MAX_DAILY_SPINS', value: '3', description: 'Maximum spins allowed per day per participant' },
  { name: 'LOGIN_ATTEMPTS_BEFORE_LOCKOUT', value: '5', description: 'Number of failed login attempts before account is locked' },
  { name: 'PASSWORD_EXPIRY_DAYS', value: '90', description: 'Number of days before password expires' },
  { name: 'SESSION_TIMEOUT_MINUTES', value: '30', description: 'User session timeout in minutes' },
  { name: 'EMAIL_NOTIFICATION_ENABLED', value: 'true', description: 'Enable email notifications' },
  { name: 'SMS_NOTIFICATION_ENABLED', value: 'false', description: 'Enable SMS notifications' },
  { name: 'MAINTENANCE_MODE', value: 'false', description: 'Enable maintenance mode' },
  { name: 'DEFAULT_LANGUAGE', value: 'en', description: 'Default application language' },
  { name: 'MAX_FILE_UPLOAD_SIZE', value: '5242880', description: 'Maximum file upload size in bytes' },
  { name: 'ALLOWED_FILE_TYPES', value: 'jpg,jpeg,png,pdf', description: 'Allowed file types for upload' },
  { name: 'SYSTEM_EMAIL', value: 'system@example.com', description: 'System email address' }
];

const configRows: TableRow[] = configDefinitions.map((config, index) => {
  const id = index + 1;
  return {
    data: {
      id,
      name: config.name,
      value: config.value,
      description: config.description,
      dataType: typeof config.value === 'number' ? 'NUMBER' : 
                (config.value === 'true' || config.value === 'false') ? 'BOOLEAN' : 'STRING',
      editable: true,
      category: config.name.split('_')[0],
      lastModified: new Date().toISOString(),
      modifiedBy: 'system'
    }
  };
});

// Create table response
const mockConfigurationTable: TableFetchResponse = createMockTableData(
  ObjectType.Configuration,
  'configurations',
  configRows,
  configRows.length
);

// Configurations usually don't have related tables
export { mockConfigurationTable };
