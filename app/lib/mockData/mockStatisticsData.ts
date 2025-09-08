import { TableRow, TableFetchResponse, ObjectType, StatisticsInfo, ChartInfo } from '../api/interfaces';
import { createMockTableData } from './mockDataGenerator';

// Generate mock statistics data - this is usually an empty table with charts data
const statisticsRows: TableRow[] = [
    {
        data: {
            id: 1,
            name: 'Overall Statistics',
            description: 'System-wide statistics overview',
            lastUpdated: new Date().toISOString()
        }
    }
];

// Create table response
const mockStatisticsTable: TableFetchResponse = createMockTableData(
    ObjectType.Statistics,
    'statistics',
    statisticsRows,
    statisticsRows.length
);

// Generate mock chart data
const charts: Record<string, ChartInfo[]> = {
    'participation': [
        {
            chartName: 'Daily Participation',
            chartType: 'line',
            chartData: {
                labels: Array.from({ length: 30 }).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - 29 + i);
                    return date.toISOString().split('T')[0];
                }),
                values: Array.from({ length: 30 }).map(() =>
                    String(Math.floor(Math.random() * 1000) + 100)
                )
            }
        },
        {
            chartName: 'Participation by Region',
            chartType: 'pie',
            chartData: {
                labels: ['North', 'South', 'East', 'West', 'Central'],
                values: Array.from({ length: 5 }).map(() =>
                    String(Math.floor(Math.random() * 10000) + 1000)
                )
            }
        }
    ],
    'rewards': [
        {
            chartName: 'Reward Distribution',
            chartType: 'pie',
            chartData: {
                labels: ['Cash', 'Voucher', 'Product', 'Service', 'Discount'],
                values: Array.from({ length: 5 }).map(() =>
                    String(Math.floor(Math.random() * 500) + 50)
                )
            }
        },
        {
            chartName: 'Claims Over Time',
            chartType: 'bar',
            chartData: {
                labels: Array.from({ length: 12 }).map((_, i) => {
                    const date = new Date();
                    date.setMonth(date.getMonth() - 11 + i);
                    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                }),
                values: Array.from({ length: 12 }).map(() =>
                    String(Math.floor(Math.random() * 200) + 20)
                )
            }
        }
    ],
    'events': [
        {
            chartName: 'Event Performance',
            chartType: 'bar',
            chartData: {
                labels: ['Summer Giveaway', 'Winter Promo', 'Back to School', 'New Year'],
                values: Array.from({ length: 4 }).map(() =>
                    String(Math.floor(Math.random() * 5000) + 1000)
                )
            }
        }
    ]
};

// Add statistics data
const statsInfo: StatisticsInfo = {
    charts
};

mockStatisticsTable.statistics = statsInfo;

export { mockStatisticsTable };
