'use client';

import { useState } from 'react';
import { ReactNode } from 'react';

// Define better types that work with JSX
type ReactComponentType = React.ComponentType<any> | React.FC<any> | keyof JSX.IntrinsicElements;

// Add a fallback implementation if recharts is not installed
const FallbackChart = () => (
  <div className="flex items-center justify-center h-full bg-[#2d2d2d] rounded-md p-4">
    <p className="text-gray-400">
      Chart library not available. Install recharts with: npm install recharts
    </p>
  </div>
);

// Declare chart component variables with proper types that work with JSX
let BarChart: any = FallbackChart;
let Bar: any;
let XAxis: any;
let YAxis: any;
let CartesianGrid: any;
let Tooltip: any;
let Legend: any;
let ResponsiveContainer: any;
let PieChart: any = FallbackChart;
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
  // Fallbacks are already set as default values
}

// Default colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9370DB', '#FF6347'];

export interface ChartData {
  name: string;
  [key: string]: any;
}

export interface ChartPanelProps {
  title: string;
  type: 'bar' | 'pie';
  data: ChartData[];
  className?: string;
}

export default function ChartPanel({ title, type, data, className = '' }: ChartPanelProps) {
  const [timeRange, setTimeRange] = useState('week');

  return (
    <div className={`bg-[#2d2d2d] p-4 rounded-md ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-semibold text-[#007acc]">{title}</h3>
        <select
          className="bg-[#3c3c3c] text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#007acc]"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="day">24h</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </div>
      <div className="h-64">
        {type === 'bar' ? (
          <BarChartComponent data={data} />
        ) : type === 'pie' ? (
          <PieChartComponent data={data} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Chart type not supported</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BarChartComponent({ data }: { data: ChartData[] }) {
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

function PieChartComponent({ data }: { data: ChartData[] }) {
  if (!PieChart || typeof PieChart === 'function') {
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
          label={({name, percent}: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
