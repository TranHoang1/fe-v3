// Export mock data objects that are available
import { mockEventTable } from './mockEventData';
import { mockRegionTable } from './mockRegionData';
import { mockProvinceTable } from './mockProvinceData';
import { mockRewardTable } from './mockRewardData';
import { mockGoldenHourTable } from './mockGoldenHourData';
import { mockSpinHistoryTable } from './mockSpinHistoryData';
import { mockAuditLogTable } from './mockAuditLogData';
import { mockStatisticsTable } from './mockStatisticsData';
import { mockUserTable } from './mockUserData';
import { mockRoleTable } from './mockRoleData';
import { mockPermissionTable } from './mockPermissionData';
import { mockConfigurationTable } from './mockConfigurationData';
import { mockBlacklistedTokenTable } from './mockBlacklistedTokenData';
import { mockEventLocationTable } from './mockEventLocationData';
import { mockParticipantTable } from './mockParticipantData';
import { mockParticipantEventTable } from './mockParticipantEventData';

// Function to convert string entity names to ObjectType
import { stringToObjectType } from './utils';

// Export all mock data
export {
  mockEventTable,
  mockRegionTable,
  mockProvinceTable,
  mockRewardTable,
  mockGoldenHourTable,
  mockSpinHistoryTable,
  mockAuditLogTable,
  mockStatisticsTable,
  mockUserTable,
  mockRoleTable,
  mockPermissionTable,
  mockConfigurationTable,
  mockBlacklistedTokenTable,
  mockEventLocationTable,
  mockParticipantTable,
  mockParticipantEventTable,
  stringToObjectType
};
