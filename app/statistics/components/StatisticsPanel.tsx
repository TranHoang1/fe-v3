'use client';

import { useState, ReactNode } from 'react';

// Add a fallback implementation if recharts is not installed
const FallbackChart = () => (
  <div className="flex items-center justify-center h-full bg-[#2d2d2d] rounded-md p-4">
    <p className="text-gray-400">
      Chart library not available. Install recharts with: npm install recharts
    </p>
  </div>
);

// Explicitly declare types for chart components to prevent "implicit any" errors
let BarChart: any;
let Bar: any;
let XAxis: any;
let YAxis: any;
let CartesianGrid: any;
let Tooltip: any;
let Legend: any;
let ResponsiveContainer: any;
let PieChart: any;
let Pie: any;
let Cell: any;

try {
  const recharts = require('recharts');
  BarChart = recharts.BarChart;
  Bar = recharts.Bar;
  XAxis = recharts.XAxis;
  YAxis = recharts.YAxis;
  CartesianGrid = recharts.CartesianGrid;
  Tooltip = recharts.Tooltip;
  Legend = recharts.Legend;
  ResponsiveContainer = recharts.ResponsiveContainer;
  PieChart = recharts.PieChart;
  Pie = recharts.Pie;
  Cell = recharts.Cell;
} catch (error) {
  // Fallback components if recharts is not available
  BarChart = FallbackChart;
  Bar = () => null;
  XAxis = () => null;
  YAxis = () => null;
  CartesianGrid = () => null;
  Tooltip = () => null;
  Legend = () => null;
  ResponsiveContainer = ({ children }: { children: ReactNode }) => (
    <div style={{ width: '100%', height: '100%' }}>{children}</div>
  );
  PieChart = FallbackChart;
  Pie = () => null;
  Cell = () => null;
}

export interface StatisticCard {
  title: string;
  metrics: {
    label: string;
    value: string;
  }[];
}

export interface StatisticChart {
  title: string;
  type: 'bar' | 'pie' | 'line';
  data: any[];
}

export interface StatisticsPanelProps {
  title?: string;
  entityId?: number;
  entityType?: 'event' | 'location' | 'province' | 'participant' | 'region' | 'reward' | 'goldenHour';
  cards?: StatisticCard[];
  charts?: StatisticChart[];
}

// Default colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9370DB', '#FF6347'];

export default function StatisticsPanel({
  title = 'Statistics',
  entityId,
  entityType,
  cards = [],
  charts = []
}: StatisticsPanelProps) {
  const [timeRange, setTimeRange] = useState('week');

  // Default charts if none provided
  const defaultCharts: StatisticChart[] = [
    {
      title: 'Participation by Location',
      type: 'bar',
      data: [
        { name: 'Downtown', participants: 4000 },
        { name: 'Mall', participants: 3000 },
        { name: 'Shopping Center', participants: 2000 },
        { name: 'Online', participants: 2780 },
      ]
    },
    {
      title: 'Reward Distribution',
      type: 'pie',
      data: [
        { name: 'Gift Card', value: 400 },
        { name: 'Free Product', value: 300 },
        { name: 'Discount', value: 300 },
        { name: 'Premium Pass', value: 200 },
      ]
    }
  ];

  // Default cards if none provided
  const defaultCards: StatisticCard[] = [
    {
      title: 'Overview',
      metrics: [
        { label: 'Total Participants', value: '12,485' },
        { label: 'Total Spins', value: '24,956' },
        { label: 'Win Rate', value: '32%' },
      ]
    },
    {
      title: 'Performance',
      metrics: [
        { label: 'Average Spins', value: '2.1' },
        { label: 'Retention Rate', value: '72%' },
        { label: 'Engagement Score', value: '8.5/10' },
      ]
    },
    {
      title: 'Rewards',
      metrics: [
        { label: 'Total Allocated', value: '3,200' },
        { label: 'Claimed', value: '2,145' },
        { label: 'Distribution Rate', value: '67%' },
      ]
    },
    {
      title: 'Golden Hours',
      metrics: [
        { label: 'Total Sessions', value: '32' },
        { label: 'Average Participation', value: '145' },
        { label: 'Win Rate Boost', value: '+18%' },
      ]
    }
  ];

  const displayCards = cards.length > 0 ? cards : defaultCards;
  const displayCharts = charts.length > 0 ? charts : defaultCharts;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {entityId && entityType && (
            <p className="text-gray-400">
              {entityType.charAt(0).toUpperCase() + entityType.slice(1)} #{entityId}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <select
            className="bg-[#3c3c3c] text-white px-3 py-1 rounded focus:outline-none focus:ring-1 focus:ring-[#007acc]"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
          <button className="bg-[#007acc] text-white px-3 py-1 rounded hover:bg-[#0069ac]">
            Export
          </button>
        </div>
      </div>

      {/* Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {displayCards.map((card, index) => (
          <div key={index} className="bg-[#2d2d2d] p-4 rounded-md">
            <h3 className="text-md font-semibold mb-3 text-[#007acc]">{card.title}</h3>
            <div className="space-y-2">
              {card.metrics.map((metric, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-400">{metric.label}</span>
                  <span className="font-bold">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {displayCharts.map((chart, index) => (
          <div key={index} className="bg-[#2d2d2d] p-4 rounded-md">
            <h3 className="text-md font-semibold mb-3 text-[#007acc]">{chart.title}</h3>
            <div className="h-80">
              {chart.type === 'bar' ? (
                <BarChartComponent data={chart.data} />
              ) : chart.type === 'pie' ? (
                <PieChartComponent data={chart.data} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>Chart type not supported</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChartComponent({ data }: { data: any[] }) {
  if (!BarChart || typeof BarChart === 'function' && !BarChart.render) {
    return <FallbackChart />;
  }
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="name" stroke="#888" />
        <YAxis stroke="#888" />
        <Tooltip contentStyle={{ backgroundColor: '#2d2d2d', border: 'none' }} />
        <Legend />
        {Object.keys(data[0])
          .filter(key => key !== 'name')
          .map((key, i) => (
            <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} />
          ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function PieChartComponent({ data }: { data: any[] }) {
  if (!PieChart || typeof PieChart === 'function' && !PieChart.render) {
    return <FallbackChart />;
  }
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({name, percent}: {name: string; percent: number}) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#2d2d2d', border: 'none' }} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
