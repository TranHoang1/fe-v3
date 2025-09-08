'use client';

import { useState, useEffect } from 'react';
import { BarChart, LineChart, PieChart, Calendar } from 'lucide-react';

interface StatisticsTabProps {
  id: number; // Entity ID
  entityType?: 'event' | 'participant' | 'reward' | 'goldenHour' | 'region' | 'province';
}

export default function StatisticsTab({ id, entityType = 'event' }: StatisticsTabProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [id, entityType]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-[#007acc] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{entityType.charAt(0).toUpperCase() + entityType.slice(1)} Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#2d2d2d] p-4 rounded-md">
          <h3 className="text-md font-semibold mb-2 text-[#007acc] flex items-center">
            <LineChart className="h-4 w-4 mr-2" />
            Participation Over Time
          </h3>
          <div className="h-64 bg-[#252525] rounded-md flex items-center justify-center">
            <div className="text-center text-gray-400">
              <LineChart className="h-10 w-10 mx-auto mb-2 text-gray-500" />
              <p>Line chart showing daily activity would appear here</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#2d2d2d] p-4 rounded-md">
          <h3 className="text-md font-semibold mb-2 text-[#007acc] flex items-center">
            <PieChart className="h-4 w-4 mr-2" />
            Reward Distribution
          </h3>
          <div className="h-64 bg-[#252525] rounded-md flex items-center justify-center">
            <div className="text-center text-gray-400">
              <PieChart className="h-10 w-10 mx-auto mb-2 text-gray-500" />
              <p>Pie chart showing reward distribution would appear here</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#2d2d2d] p-4 rounded-md">
          <h3 className="text-md font-semibold mb-2 text-[#007acc] flex items-center">
            <BarChart className="h-4 w-4 mr-2" />
            Performance by Region
          </h3>
          <div className="h-64 bg-[#252525] rounded-md flex items-center justify-center">
            <div className="text-center text-gray-400">
              <BarChart className="h-10 w-10 mx-auto mb-2 text-gray-500" />
              <p>Bar chart showing regional performance would appear here</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#2d2d2d] p-4 rounded-md">
          <h3 className="text-md font-semibold mb-2 text-[#007acc] flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Golden Hour Impact
          </h3>
          <div className="h-64 bg-[#252525] rounded-md flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-500" />
              <p>Chart showing golden hour comparison would appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
