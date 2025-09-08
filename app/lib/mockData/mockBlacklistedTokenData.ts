import { TableRow, TableFetchResponse, ObjectType } from '../api/interfaces';
import { createMockTableData, generateRecentDate } from './mockDataGenerator';

// Generate mock blacklisted token data
const blacklistedTokenRows: TableRow[] = Array(20).fill(null).map((_, index) => {
  const id = index + 1;
  const userId = Math.floor(Math.random() * 10) + 1;
  const blacklistedDate = generateRecentDate();
  return {
    data: {
      id,
      token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(JSON.stringify({
        userId,
        exp: Date.now() + 3600000
      })).toString('base64')}.signature${id}`,
      userId,
      username: `user${userId}`,
      blacklistedAt: `${blacklistedDate}T${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}Z`,
      reason: ['LOGOUT', 'PASSWORD_CHANGE', 'ADMIN_ACTION', 'SUSPICIOUS_ACTIVITY'][Math.floor(Math.random() * 4)],
      expirationDate: new Date(Date.now() + Math.random() * 86400000 * 30).toISOString()
    }
  };
});

// Create table response
const mockBlacklistedTokenTable: TableFetchResponse = createMockTableData(
  ObjectType.BlacklistedToken,
  'blacklisted_tokens',
  blacklistedTokenRows,
  blacklistedTokenRows.length
);

// Blacklisted tokens don't usually have related tables
export { mockBlacklistedTokenTable };
