import { TableRow, TableFetchResponse, ObjectType, DataObject } from '../api/interfaces';
import { createMockTableData } from './mockDataGenerator';

// Generate mock province data
const provinces = [
    { name: 'Hanoi', regionId: 1 },
    { name: 'Hai Phong', regionId: 1 },
    { name: 'Bac Ninh', regionId: 1 },
    { name: 'Ho Chi Minh City', regionId: 2 },
    { name: 'Vung Tau', regionId: 2 },
    { name: 'Can Tho', regionId: 2 },
    { name: 'Hue', regionId: 3 },
    { name: 'Da Nang', regionId: 3 },
    { name: 'Quang Nam', regionId: 3 },
    { name: 'Dien Bien', regionId: 4 },
    { name: 'Son La', regionId: 4 },
    { name: 'Lai Chau', regionId: 4 },
    { name: 'Nghe An', regionId: 5 },
    { name: 'Ha Tinh', regionId: 5 },
    { name: 'Thanh Hoa', regionId: 5 }
];

const provinceRows: TableRow[] = provinces.map((province, index) => {
    const id = index + 1;
    return {
        data: {
            id,
            name: province.name,
            code: province.name.substring(0, 3).toUpperCase(),
            regionId: province.regionId,
            population: Math.floor(Math.random() * 5000000) + 500000,
            area: Math.floor(Math.random() * 5000) + 500,
            active: Math.random() > 0.1,
            createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
        }
    };
});

// Create table response
const mockProvinceTable: TableFetchResponse = createMockTableData(
    ObjectType.Province,
    'provinces',
    provinceRows,
    provinceRows.length
);

// Add related tables info
mockProvinceTable.relatedLinkedObjects = {
    'eventLocations': {
        id: 1,
        objectType: ObjectType.EventLocation,
        description: "Event locations in this province",
        key: { keys: ['id'] }
    } as unknown as DataObject,
    'participants': {
        id: 2,
        objectType: ObjectType.Participant,
        description: "Participants from this province",
        key: { keys: ['id'] }
    } as unknown as DataObject
};

// Add region relationship
mockProvinceTable.rows.forEach((row, index) => {
    const regionId = provinces[index].regionId;
    mockProvinceTable.relatedLinkedObjects[`region_${regionId}`] = {
        id: regionId,
        name: `Region ${regionId}`,
        objectType: ObjectType.Region,
        description: "Parent region",
        key: { keys: ['id'] }
    } as unknown as DataObject;

    // Add related tables to each row
    if ('data' in row && row.data.id) {
        (row as any).relatedTables = ['eventLocations', 'participants'];
    }
});

export { mockProvinceTable };
