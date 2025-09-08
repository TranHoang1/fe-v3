import {
    TableFetchRequest,
    TableFetchResponse,
    ObjectType,
    FetchStatus,
    SortType,
    FilterType,
    DataObject,
    ColumnInfo,
    FieldType
} from './interfaces';

/**
 * Generate random mock data for entities
 * @param entityType Type of entity to generate
 * @param count Number of entities to generate
 */
function generateMockData(entityType: ObjectType, count: number): any[] {
    const data = [];
    const now = new Date();
    const statuses = ['ACTIVE', 'INACTIVE', 'PENDING', 'COMPLETED'];

    for (let i = 1; i <= count; i++) {
        const createdDate = new Date(now);
        createdDate.setDate(now.getDate() - Math.floor(Math.random() * 30));

        // Base object properties that all entities have
        const baseEntity = {
            id: i,
            version: 0,
            createdBy: `user${Math.floor(Math.random() * 5) + 1}`,
            createdDate: createdDate.toISOString(),
            lastModifiedBy: `user${Math.floor(Math.random() * 5) + 1}`,
            lastModifiedDate: new Date().toISOString(),
            status: statuses[Math.floor(Math.random() * statuses.length)],
        };

        // Add entity-specific properties based on entity type
        switch (entityType) {
            case ObjectType.Event:
                data.push({
                    ...baseEntity,
                    name: `Event ${i}`,
                    description: `Description for Event ${i}`,
                    startDate: new Date(now.getTime() + 86400000 * i).toISOString(),
                    endDate: new Date(now.getTime() + 86400000 * (i + 7)).toISOString(),
                    location: `Location ${i}`,
                    maxParticipants: 100 + i * 10,
                    currentParticipants: Math.floor(Math.random() * (100 + i * 10))
                });
                break;

            case ObjectType.Participant:
                data.push({
                    ...baseEntity,
                    name: `Participant ${i}`,
                    email: `participant${i}@example.com`,
                    phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                    joinDate: createdDate.toISOString(),
                    points: Math.floor(Math.random() * 1000),
                    eventId: Math.floor(Math.random() * 5) + 1
                });
                break;

            case ObjectType.Reward:
                data.push({
                    ...baseEntity,
                    name: `Reward ${i}`,
                    description: `Description for Reward ${i}`,
                    points: Math.floor(Math.random() * 500) + 50,
                    quantity: Math.floor(Math.random() * 100),
                    eventId: Math.floor(Math.random() * 5) + 1,
                    redeemCount: Math.floor(Math.random() * 50)
                });
                break;

            case ObjectType.Region:
                data.push({
                    ...baseEntity,
                    name: `Region ${i}`,
                    code: `R${i}`,
                    description: `Description for Region ${i}`
                });
                break;

            case ObjectType.Province:
                data.push({
                    ...baseEntity,
                    name: `Province ${i}`,
                    code: `P${i}`,
                    regionId: Math.floor(Math.random() * 5) + 1
                });
                break;

            case ObjectType.GoldenHour:
                data.push({
                    ...baseEntity,
                    name: `Golden Hour ${i}`,
                    startTime: `${Math.floor(Math.random() * 24)}:00`,
                    endTime: `${Math.floor(Math.random() * 24)}:00`,
                    multiplier: Math.random() * 3 + 1,
                    eventId: Math.floor(Math.random() * 5) + 1
                });
                break;

            case ObjectType.User:
                data.push({
                    ...baseEntity,
                    username: `user${i}`,
                    email: `user${i}@example.com`,
                    fullName: `User ${i}`,
                    roleId: Math.floor(Math.random() * 3) + 1,
                    lastLogin: new Date(now.getTime() - Math.floor(Math.random() * 86400000 * 7)).toISOString()
                });
                break;

            case ObjectType.Role:
                data.push({
                    ...baseEntity,
                    name: `Role ${i}`,
                    description: `Description for Role ${i}`,
                    permissions: ['READ', 'WRITE', 'DELETE'].slice(0, Math.floor(Math.random() * 3) + 1).join(',')
                });
                break;

            case ObjectType.AuditLog:
                data.push({
                    ...baseEntity,
                    action: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'][Math.floor(Math.random() * 5)],
                    entityType: Object.values(ObjectType)[Math.floor(Math.random() * Object.values(ObjectType).length)],
                    entityId: Math.floor(Math.random() * 100) + 1,
                    userId: Math.floor(Math.random() * 5) + 1,
                    details: `User performed action on ${new Date(now.getTime() - Math.floor(Math.random() * 86400000 * 30)).toISOString()}`
                });
                break;

            case ObjectType.SpinHistory:
                data.push({
                    ...baseEntity,
                    participantId: Math.floor(Math.random() * 100) + 1,
                    eventId: Math.floor(Math.random() * 5) + 1,
                    rewardId: Math.floor(Math.random() * 20) + 1,
                    spinDate: new Date(now.getTime() - Math.floor(Math.random() * 86400000 * 30)).toISOString(),
                    pointsUsed: Math.floor(Math.random() * 100) + 10,
                    result: Math.random() > 0.3 ? 'WIN' : 'LOSE'
                });
                break;

            default:
                data.push({
                    ...baseEntity,
                    name: `Item ${i}`,
                    description: `Generic item ${i} description`
                });
        }
    }

    return data;
}

/**
 * Get field type mapping for an entity
 */
function getFieldTypeMap(entityType: ObjectType): Record<string, ColumnInfo> {
    const commonFields = {
        id: { objectType: entityType, fieldName: 'ID', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
        version: { objectType: entityType, fieldName: 'Version', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
        createdBy: { objectType: entityType, fieldName: 'Created By', fieldType: FieldType.STRING, sortType: SortType.NONE },
        createdDate: { objectType: entityType, fieldName: 'Created Date', fieldType: FieldType.DATETIME, sortType: SortType.NONE },
        lastModifiedBy: { objectType: entityType, fieldName: 'Last Modified By', fieldType: FieldType.STRING, sortType: SortType.NONE },
        lastModifiedDate: { objectType: entityType, fieldName: 'Last Modified Date', fieldType: FieldType.DATETIME, sortType: SortType.NONE },
        status: { objectType: entityType, fieldName: 'Status', fieldType: FieldType.STRING, sortType: SortType.NONE },
    };

    const entityFields: Record<ObjectType, Record<string, { objectType: ObjectType; fieldName: string; fieldType: FieldType; sortType: SortType }>> = {
        [ObjectType.JobImportHistory]: {
            ...commonFields,
            name: { objectType: ObjectType.JobImportHistoryDetail, fieldName: 'Name', fieldType: FieldType.STRING, sortType: SortType.NONE },
            description: { objectType: ObjectType.JobImportHistoryDetail, fieldName: 'Description', fieldType: FieldType.STRING, sortType: SortType.NONE },
            startDate: { objectType: ObjectType.JobImportHistoryDetail, fieldName: 'Start Date', fieldType: FieldType.DATETIME, sortType: SortType.NONE },
            endDate: { objectType: ObjectType.JobImportHistoryDetail, fieldName: 'End Date', fieldType: FieldType.DATETIME, sortType: SortType.NONE },
            location: { objectType: ObjectType.JobImportHistoryDetail, fieldName: 'Location', fieldType: FieldType.STRING, sortType: SortType.NONE },
            maxParticipants: { objectType: ObjectType.JobImportHistoryDetail, fieldName: 'Max Participants', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            currentParticipants: { objectType: ObjectType.JobImportHistoryDetail, fieldName: 'Current Participants', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
        },
        [ObjectType.JobImportHistoryDetail]: {
            ...commonFields,
            importFile: { objectType: ObjectType.JobImportHistoryDetail, fieldName: 'Import File', fieldType: FieldType.STRING, sortType: SortType.NONE },
            importStatus: { objectType: ObjectType.JobImportHistoryDetail, fieldName: 'Import Status', fieldType: FieldType.STRING, sortType: SortType.NONE },
            totalRecords: { objectType: ObjectType.JobImportHistoryDetail, fieldName: 'Total Records', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            successRecords: { objectType: ObjectType.JobImportHistoryDetail, fieldName: 'Success Records', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            failedRecords: { objectType: ObjectType.JobImportHistoryDetail, fieldName: 'Failed Records', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            jobImportHistoryId: { objectType: ObjectType.JobImportHistoryDetail, fieldName: 'Job Import History ID', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
        },
        [ObjectType.Event]: {
            ...commonFields,
            name: { objectType: ObjectType.Event, fieldName: 'Name', fieldType: FieldType.STRING, sortType: SortType.NONE },
            description: { objectType: ObjectType.Event, fieldName: 'Description', fieldType: FieldType.STRING, sortType: SortType.NONE },
            startDate: { objectType: ObjectType.Event, fieldName: 'Start Date', fieldType: FieldType.DATETIME, sortType: SortType.NONE },
            endDate: { objectType: ObjectType.Event, fieldName: 'End Date', fieldType: FieldType.DATETIME, sortType: SortType.NONE },
            location: { objectType: ObjectType.Event, fieldName: 'Location', fieldType: FieldType.STRING, sortType: SortType.NONE },
            maxParticipants: { objectType: ObjectType.Event, fieldName: 'Max Participants', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            currentParticipants: { objectType: ObjectType.Event, fieldName: 'Current Participants', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
        },
        [ObjectType.Participant]: {
            ...commonFields,
            name: { objectType: ObjectType.Participant, fieldName: 'Name', fieldType: FieldType.STRING, sortType: SortType.NONE },
            email: { objectType: ObjectType.Participant, fieldName: 'Email', fieldType: FieldType.STRING, sortType: SortType.NONE },
            phone: { objectType: ObjectType.Participant, fieldName: 'Phone', fieldType: FieldType.STRING, sortType: SortType.NONE },
            joinDate: { objectType: ObjectType.Participant, fieldName: 'Join Date', fieldType: FieldType.DATETIME, sortType: SortType.NONE },
            points: { objectType: ObjectType.Participant, fieldName: 'Points', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            eventId: { objectType: ObjectType.Participant, fieldName: 'Event ID', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
        },
        [ObjectType.Reward]: {
            ...commonFields,
            name: { objectType: ObjectType.Reward, fieldName: 'Name', fieldType: FieldType.STRING, sortType: SortType.NONE },
            description: { objectType: ObjectType.Reward, fieldName: 'Description', fieldType: FieldType.STRING, sortType: SortType.NONE },
            points: { objectType: ObjectType.Reward, fieldName: 'Points', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            quantity: { objectType: ObjectType.Reward, fieldName: 'Quantity', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            eventId: { objectType: ObjectType.Reward, fieldName: 'Event ID', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            redeemCount: { objectType: ObjectType.Reward, fieldName: 'Redeem Count', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
        },
        [ObjectType.RewardEvent]: {
            ...commonFields,
            rewardId: { objectType: ObjectType.RewardEvent, fieldName: 'Reward ID', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            eventId: { objectType: ObjectType.RewardEvent, fieldName: 'Event ID', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            quantity: { objectType: ObjectType.RewardEvent, fieldName: 'Quantity', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            status: { objectType: ObjectType.RewardEvent, fieldName: 'Status', fieldType: FieldType.STRING, sortType: SortType.NONE },
        },
        [ObjectType.Region]: {
            ...commonFields,
            name: { objectType: ObjectType.Region, fieldName: 'Name', fieldType: FieldType.STRING, sortType: SortType.NONE },
            code: { objectType: ObjectType.Region, fieldName: 'Code', fieldType: FieldType.STRING, sortType: SortType.NONE },
            description: { objectType: ObjectType.Region, fieldName: 'Description', fieldType: FieldType.STRING, sortType: SortType.NONE },
        },
        [ObjectType.Province]: {
            ...commonFields,
            name: { objectType: ObjectType.Province, fieldName: 'Name', fieldType: FieldType.STRING, sortType: SortType.NONE },
            code: { objectType: ObjectType.Province, fieldName: 'Code', fieldType: FieldType.STRING, sortType: SortType.NONE },
            regionId: { objectType: ObjectType.Province, fieldName: 'Region ID', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
        },
        [ObjectType.GoldenHour]: {
            ...commonFields,
            name: { objectType: ObjectType.GoldenHour, fieldName: 'Name', fieldType: FieldType.STRING, sortType: SortType.NONE },
            startTime: { objectType: ObjectType.GoldenHour, fieldName: 'Start Time', fieldType: FieldType.STRING, sortType: SortType.NONE },
            endTime: { objectType: ObjectType.GoldenHour, fieldName: 'End Time', fieldType: FieldType.STRING, sortType: SortType.NONE },
            multiplier: { objectType: ObjectType.GoldenHour, fieldName: 'Multiplier', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            eventId: { objectType: ObjectType.GoldenHour, fieldName: 'Event ID', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
        },
        [ObjectType.User]: {
            ...commonFields,
            username: { objectType: ObjectType.User, fieldName: 'Username', fieldType: FieldType.STRING, sortType: SortType.NONE },
            email: { objectType: ObjectType.User, fieldName: 'Email', fieldType: FieldType.STRING, sortType: SortType.NONE },
            fullName: { objectType: ObjectType.User, fieldName: 'Full Name', fieldType: FieldType.STRING, sortType: SortType.NONE },
            roleId: { objectType: ObjectType.User, fieldName: 'Role ID', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            lastLogin: { objectType: ObjectType.User, fieldName: 'Last Login', fieldType: FieldType.DATETIME, sortType: SortType.NONE },
        },
        [ObjectType.Role]: {
            ...commonFields,
            name: { objectType: ObjectType.Role, fieldName: 'Name', fieldType: FieldType.STRING, sortType: SortType.NONE },
            description: { objectType: ObjectType.Role, fieldName: 'Description', fieldType: FieldType.STRING, sortType: SortType.NONE },
            permissions: { objectType: ObjectType.Role, fieldName: 'Permissions', fieldType: FieldType.STRING, sortType: SortType.NONE },
        },
        [ObjectType.AuditLog]: {
            ...commonFields,
            action: { objectType: ObjectType.AuditLog, fieldName: 'Action', fieldType: FieldType.STRING, sortType: SortType.NONE },
            entityType: { objectType: ObjectType.AuditLog, fieldName: 'Entity Type', fieldType: FieldType.STRING, sortType: SortType.NONE },
            entityId: { objectType: ObjectType.AuditLog, fieldName: 'Entity ID', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            userId: { objectType: ObjectType.AuditLog, fieldName: 'User ID', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            details: { objectType: ObjectType.AuditLog, fieldName: 'Details', fieldType: FieldType.STRING, sortType: SortType.NONE },
        },
        [ObjectType.SpinHistory]: {
            ...commonFields,
            participantId: { objectType: ObjectType.SpinHistory, fieldName: 'Participant ID', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            eventId: { objectType: ObjectType.SpinHistory, fieldName: 'Event ID', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            rewardId: { objectType: ObjectType.SpinHistory, fieldName: 'Reward ID', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            spinDate: { objectType: ObjectType.SpinHistory, fieldName: 'Spin Date', fieldType: FieldType.DATETIME, sortType: SortType.NONE },
            pointsUsed: { objectType: ObjectType.SpinHistory, fieldName: 'Points Used', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            result: { objectType: ObjectType.SpinHistory, fieldName: 'Result', fieldType: FieldType.STRING, sortType: SortType.NONE },
        },
        [ObjectType.Statistics]: {
            ...commonFields,
            name: { objectType: ObjectType.Statistics, fieldName: 'Name', fieldType: FieldType.STRING, sortType: SortType.NONE },
            category: { objectType: ObjectType.Statistics, fieldName: 'Category', fieldType: FieldType.STRING, sortType: SortType.NONE },
            value: { objectType: ObjectType.Statistics, fieldName: 'Value', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            period: { objectType: ObjectType.Statistics, fieldName: 'Period', fieldType: FieldType.STRING, sortType: SortType.NONE },
            date: { objectType: ObjectType.Statistics, fieldName: 'Date', fieldType: FieldType.DATETIME, sortType: SortType.NONE },
        },
        [ObjectType.Permission]: {
            ...commonFields,
            name: { objectType: ObjectType.Permission, fieldName: 'Name', fieldType: FieldType.STRING, sortType: SortType.NONE },
            code: { objectType: ObjectType.Permission, fieldName: 'Code', fieldType: FieldType.STRING, sortType: SortType.NONE },
            description: { objectType: ObjectType.Permission, fieldName: 'Description', fieldType: FieldType.STRING, sortType: SortType.NONE },
            roleId: { objectType: ObjectType.Permission, fieldName: 'Role ID', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
        },
        [ObjectType.Configuration]: {
            ...commonFields,
            key: { objectType: ObjectType.Configuration, fieldName: 'Key', fieldType: FieldType.STRING, sortType: SortType.NONE },
            value: { objectType: ObjectType.Configuration, fieldName: 'Value', fieldType: FieldType.STRING, sortType: SortType.NONE },
            description: { objectType: ObjectType.Configuration, fieldName: 'Description', fieldType: FieldType.STRING, sortType: SortType.NONE },
            type: { objectType: ObjectType.Configuration, fieldName: 'Type', fieldType: FieldType.STRING, sortType: SortType.NONE },
        },
        [ObjectType.BlacklistedToken]: {
            ...commonFields,
            token: { objectType: ObjectType.BlacklistedToken, fieldName: 'Token', fieldType: FieldType.STRING, sortType: SortType.NONE },
            expiryDate: { objectType: ObjectType.BlacklistedToken, fieldName: 'Expiry Date', fieldType: FieldType.DATETIME, sortType: SortType.NONE },
            reason: { objectType: ObjectType.BlacklistedToken, fieldName: 'Reason', fieldType: FieldType.STRING, sortType: SortType.NONE },
            userId: { objectType: ObjectType.BlacklistedToken, fieldName: 'User ID', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
        },
        [ObjectType.EventLocation]: {
            ...commonFields,
            name: { objectType: ObjectType.EventLocation, fieldName: 'Name', fieldType: FieldType.STRING, sortType: SortType.NONE },
            address: { objectType: ObjectType.EventLocation, fieldName: 'Address', fieldType: FieldType.STRING, sortType: SortType.NONE },
            city: { objectType: ObjectType.EventLocation, fieldName: 'City', fieldType: FieldType.STRING, sortType: SortType.NONE },
            state: { objectType: ObjectType.EventLocation, fieldName: 'State', fieldType: FieldType.STRING, sortType: SortType.NONE },
            country: { objectType: ObjectType.EventLocation, fieldName: 'Country', fieldType: FieldType.STRING, sortType: SortType.NONE },
            zipCode: { objectType: ObjectType.EventLocation, fieldName: 'Zip Code', fieldType: FieldType.STRING, sortType: SortType.NONE },
            capacity: { objectType: ObjectType.EventLocation, fieldName: 'Capacity', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            eventId: { objectType: ObjectType.EventLocation, fieldName: 'Event ID', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
        },
        [ObjectType.ParticipantEvent]: {
            ...commonFields,
            participantId: { objectType: ObjectType.ParticipantEvent, fieldName: 'Participant ID', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            eventId: { objectType: ObjectType.ParticipantEvent, fieldName: 'Event ID', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            joinDate: { objectType: ObjectType.ParticipantEvent, fieldName: 'Join Date', fieldType: FieldType.DATETIME, sortType: SortType.NONE },
            checkInDate: { objectType: ObjectType.ParticipantEvent, fieldName: 'Check-in Date', fieldType: FieldType.DATETIME, sortType: SortType.NONE },
            attendance: { objectType: ObjectType.ParticipantEvent, fieldName: 'Attendance', fieldType: FieldType.BOOLEAN, sortType: SortType.NONE },
            notes: { objectType: ObjectType.ParticipantEvent, fieldName: 'Notes', fieldType: FieldType.STRING, sortType: SortType.NONE },
        },
        [ObjectType.RewardDistribute]: {
            ...commonFields,
            name: { objectType: ObjectType.RewardDistribute, fieldName: 'Name', fieldType: FieldType.STRING, sortType: SortType.NONE },
            description: { objectType: ObjectType.RewardDistribute, fieldName: 'Description', fieldType: FieldType.STRING, sortType: SortType.NONE },
            startDate: { objectType: ObjectType.RewardDistribute, fieldName: 'Start Date', fieldType: FieldType.DATETIME, sortType: SortType.NONE },
            endDate: { objectType: ObjectType.RewardDistribute, fieldName: 'End Date', fieldType: FieldType.DATETIME, sortType: SortType.NONE },
            totalRewards: { objectType: ObjectType.RewardDistribute, fieldName: 'Total Rewards', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            distributedRewards: { objectType: ObjectType.RewardDistribute, fieldName: 'Distributed Rewards', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            participantId: { objectType: ObjectType.RewardDistribute, fieldName: 'Participant ID', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
        },
        [ObjectType.DailyRewardDistribution]: {
            ...commonFields,
            date: { objectType: ObjectType.DailyRewardDistribution, fieldName: 'Date', fieldType: FieldType.DATE, sortType: SortType.NONE },
            amount: { objectType: ObjectType.DailyRewardDistribution, fieldName: 'Amount', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
            status: { objectType: ObjectType.DailyRewardDistribution, fieldName: 'Status', fieldType: FieldType.STRING, sortType: SortType.NONE },
            rewardDistributeId: { objectType: ObjectType.DailyRewardDistribution, fieldName: 'Reward Distribute ID', fieldType: FieldType.NUMBER, sortType: SortType.NONE },
        },
    };

    return entityFields[entityType] || commonFields;
}

/**
 * Apply sorting to data
 */
function applySorting(data: any[], sorts: { field: string; sortType: SortType }[]): any[] {
    if (!sorts || sorts.length === 0) return data;

    return [...data].sort((a, b) => {
        for (const sort of sorts) {
            const { field, sortType } = sort;

            if (a[field] === undefined || b[field] === undefined) continue;

            if (a[field] < b[field]) {
                return sortType === SortType.ASCENDING ? -1 : 1;
            }
            if (a[field] > b[field]) {
                return sortType === SortType.ASCENDING ? 1 : -1;
            }
        }
        return 0;
    });
}

/**
 * Apply filtering to data
 */
function applyFiltering(data: any[], filters: { field: string; filterType: FilterType; minValue: string; maxValue: string }[]): any[] {
    if (!filters || filters.length === 0) return data;

    return data.filter(item => {
        return filters.every(filter => {
            const { field, filterType, minValue, maxValue } = filter;
            const value = item[field];

            if (value === undefined) return true;

            switch (filterType) {
                case FilterType.EQUALS:
                    if (typeof value === 'number') {
                        return value === Number(minValue);
                    }
                    return value === minValue;

                case FilterType.CONTAINS:
                    return typeof value === 'string' && value.toLowerCase().includes(minValue.toLowerCase());

                case FilterType.STARTS_WITH:
                    return typeof value === 'string' && value.toLowerCase().startsWith(minValue.toLowerCase());

                case FilterType.ENDS_WITH:
                    return typeof value === 'string' && value.toLowerCase().endsWith(minValue.toLowerCase());

                case FilterType.BETWEEN:
                    if (typeof value === 'number') {
                        const min = minValue !== '' ? Number(minValue) : null;
                        const max = maxValue !== '' ? Number(maxValue) : null;
                        return (min === null || value >= min) && (max === null || value <= max);
                    }
                    if (value instanceof Date || typeof value === 'string' && !isNaN(Date.parse(value))) {
                        const dateValue = new Date(value).getTime();
                        const min = minValue !== '' ? new Date(minValue).getTime() : null;
                        const max = maxValue !== '' ? new Date(maxValue).getTime() : null;
                        return (min === null || dateValue >= min) && (max === null || dateValue <= max);
                    }
                    return true;

                default:
                    return true;
            }
        });
    });
}

/**
 * Apply search to data
 */
function applySearch(data: any[], search: Record<ObjectType, DataObject>, objectType: ObjectType): any[] {
    if (!search || Object.keys(search).length === 0) return data;

    const entitySearch = search[objectType];
    if (!entitySearch?.data?.data?._search) return data;

    const searchTerm = entitySearch.data.data._search.toLowerCase();

    return data.filter(item => {
        return Object.values(item).some(value => {
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(searchTerm);
        });
    });
}

/**
 * Apply pagination to data
 */
function applyPagination(data: any[], page: number, size: number): { items: any[]; totalItems: number; totalPages: number } {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / size);

    const start = page * size;
    const end = start + size;
    const items = data.slice(start, end);

    return {
        items,
        totalItems,
        totalPages
    };
}

/**
 * Mock function to fetch table data
 */
export function mockFetchTableData(request: TableFetchRequest): TableFetchResponse {
    const { objectType, page, size, sorts, filters, search } = request;
    const entityType = objectType;

    try {
        // Generate mock data
        const allData = generateMockData(entityType, 100);

        // Apply search
        const searchedData = applySearch(allData, search, entityType);

        // Apply filtering
        const filteredData = applyFiltering(searchedData, filters);

        // Apply sorting
        const sortedData = applySorting(filteredData, sorts);

        // Apply pagination
        const { items, totalItems, totalPages } = applyPagination(sortedData, page, size);

        // Format rows for response
        const rows = items.map(item => ({
            data: item,
            tableInfo: {
                key: { keys: [] }, // Add missing key property
                status: FetchStatus.SUCCESS,
                message: '',
                totalPage: totalPages,
                currentPage: page,
                pageSize: size,
                totalElements: totalItems,
                tableName: entityType,
                fieldNameMap: getFieldTypeMap(entityType),
                rows: [],
                relatedLinkedObjects: {} as Record<ObjectType, DataObject>
            }
        }));

        // Create response
        const response: TableFetchResponse = {
            key: { keys: [] }, // Add missing key property here too
            status: FetchStatus.SUCCESS,
            message: '',
            totalPage: totalPages,
            currentPage: page,
            pageSize: size,
            totalElements: totalItems,
            tableName: entityType,
            rows: rows,
            fieldNameMap: getFieldTypeMap(entityType),
            originalRequest: request,
            statistics: {
                charts: {
                    statusDistribution: [{
                        chartName: 'Status Distribution',
                        chartType: 'pie',
                        chartData: {
                            'ACTIVE': [Math.floor(Math.random() * 30) + 20 + ''],
                            'INACTIVE': [Math.floor(Math.random() * 20) + 10 + ''],
                            'PENDING': [Math.floor(Math.random() * 15) + 5 + ''],
                            'COMPLETED': [Math.floor(Math.random() * 10) + 2 + '']
                        }
                    }]
                }
            },
            relatedLinkedObjects: {} as Record<ObjectType, DataObject>,
            first: page === 0,
            last: page === totalPages - 1,
            empty: rows.length === 0,
            numberOfElements: rows.length
        };

        return response;

    } catch (error) {
        console.error('Error generating mock data:', error);
        return {
            key: { keys: [] }, // Add missing key property
            status: FetchStatus.ERROR,
            message: `Error generating mock data: ${(error as Error).message}`,
            totalPage: 0,
            currentPage: 0,
            pageSize: 0,
            totalElements: 0,
            tableName: entityType,
            rows: [],
            fieldNameMap: {},
            originalRequest: request,
            statistics: { charts: {} },
            relatedLinkedObjects: {} as Record<ObjectType, DataObject>,
            first: true,
            last: true,
            empty: true,
            numberOfElements: 0
        };
    }
}

/**
 * Mock function to create an entity
 */
export function mockCreateEntity(entityType: ObjectType, data: any): any {
    const id = Math.floor(Math.random() * 10000) + 1000;
    return {
        ...data,
        id,
        createdDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString(),
        createdBy: 'mock-user',
        lastModifiedBy: 'mock-user',
        version: 0
    };
}

/**
 * Mock function to update an entity
 */
export function mockUpdateEntity(entityType: ObjectType, id: string | number, data: any): any {
    return {
        ...data,
        id,
        lastModifiedDate: new Date().toISOString(),
        lastModifiedBy: 'mock-user',
        version: (data.version || 0) + 1
    };
}

/**
 * Mock function to delete an entity
 */
export function mockDeleteEntity(entityType: ObjectType, id: string | number): void {
    // In a real implementation, this would remove the entity from a mock store
    console.log(`Deleted entity ${entityType} with ID ${id}`);
}

/**
 * Mock function to get entity by ID
 */
export function mockGetEntityById(entityType: ObjectType, id: string | number): any {
    const mockData = generateMockData(entityType, 1)[0];
    return {
        ...mockData,
        id: Number(id)
    };
}
