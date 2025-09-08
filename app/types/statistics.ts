/**
 * Basic chart data point interface
 */
export interface ChartData {
    name: string;
    value: number;
}

/**
 * Extended chart data with optional properties
 */
export interface ExtendedChartData extends ChartData {
    color?: string;
    extraValue?: number;
    percentage?: number;
}

/**
 * Chart series for multi-line or stacked charts
 */
export interface ChartSeries {
    name: string;
    data: ChartData[];
}

/**
 * Statistics summary format
 */
export interface StatisticsSummary {
    totalItems: number;
    activeItems: number;
    completedItems?: number;
    pendingItems?: number;
    averageValue?: number;
    maxValue?: number;
    minValue?: number;
    recentActivity?: {
        date: string;
        action: string;
        count: number;
    }[];
}

/**
 * Time-based statistics data point
 */
export interface TimeSeriesData {
    timestamp: string;
    value: number;
    category?: string;
}

/**
 * Common chart configuration options
 */
export interface ChartOptions {
    title?: string;
    height?: number;
    width?: number;
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
    showTooltip?: boolean;
    animate?: boolean;
}
