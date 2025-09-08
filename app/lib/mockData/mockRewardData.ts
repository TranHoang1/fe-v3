import { TableRow, TableFetchResponse, ObjectType, DataObject } from '../api/interfaces';
import { createMockTableData, generateRecentDate, pickRandom } from './mockDataGenerator';

// Generate mock reward data
const rewardTypes = ['CASH', 'VOUCHER', 'PRODUCT', 'SERVICE', 'DISCOUNT'];
const rewardNames = [
    'Cash Prize', 'Gift Card', 'Shopping Voucher', 'Free Product',
    'Discount Coupon', 'Free Subscription', 'Movie Tickets',
    'Restaurant Voucher', 'Travel Package', 'Electronics'
];

const rewardRows: TableRow[] = Array(25).fill(null).map((_, index) => {
    const id = index + 1;
    const type = pickRandom(rewardTypes);
    const name = `${pickRandom(rewardNames)} - ${type}`;
    const value = Math.floor(Math.random() * 500) * 10;
    const quantity = Math.floor(Math.random() * 100) + 1;
    const eventId = Math.floor(Math.random() * 5) + 1; // Link to a random event

    return {
        data: {
            id,
            name,
            type,
            description: `${name} - ${value} value`,
            value,
            quantity,
            quantityRemaining: Math.floor(Math.random() * quantity),
            imageUrl: `/assets/images/rewards/${type.toLowerCase()}_${Math.floor(Math.random() * 5) + 1}.jpg`,
            active: Math.random() > 0.2,
            createdAt: generateRecentDate(),
            eventId
        }
    };
});

// Create table response
const mockRewardTable: TableFetchResponse = createMockTableData(
    ObjectType.Reward,
    'rewards',
    rewardRows,
    rewardRows.length
);

// Add related tables info
mockRewardTable.relatedLinkedObjects = {
    'spinHistory': {
        id: 1,
        objectType: ObjectType.SpinHistory,
        description: "Spin history for this reward",
        key: { keys: ['id'] }
    } as unknown as DataObject
};

// Add event relationship
mockRewardTable.rows.forEach(row => {
    const eventId = row.data.eventId;
    mockRewardTable.relatedLinkedObjects[`event_${eventId}`] = {
        id: eventId,
        name: `Event ${eventId}`,
        objectType: ObjectType.Event,
        description: "Parent event",
        key: { keys: ['id'] }
    } as unknown as DataObject;

    // Add related tables to each row
    if ('data' in row && row.data.id) {
        (row as any).relatedTables = ['spinHistory'];
    }
});

export { mockRewardTable };
