'use client';

import { useState } from 'react';
import ShellLayout from '../components/VSCodeLayout/ShellLayout';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, LineChart, PieChart, Calendar, Download } from 'lucide-react';

export default function StatisticsPage() {
  const [timeRange, setTimeRange] = useState('last30days');
  const [eventFilter, setEventFilter] = useState('all');
  
  // Mock events for filter dropdown
  const events = [
    { id: 'all', name: 'All Events' },
    { id: '1', name: 'Summer Giveaway' },
    { id: '2', name: 'Fall Promotion' },
    { id: '3', name: 'Back to School' },
    { id: '4', name: 'Winter Special' }
  ];

  // Mock statistics data
  const overviewStats = {
    totalSpins: 45762,
    totalParticipants: 25642,
    totalWinners: 12348,
    totalRewards: 12950,
    claimedRewards: 10893
  };
  
  return (
    <ShellLayout>
      <main className="container mx-auto py-6 px-4">
        <Breadcrumb className="mb-6">
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Statistics</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Statistics Dashboard</h1>
          
          <div className="flex gap-2 flex-wrap">
            <select
              className="bg-[#3c3c3c] text-white px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#007acc]"
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
            >
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
            
            <select
              className="bg-[#3c3c3c] text-white px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#007acc]"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last90days">Last 90 Days</option>
              <option value="alltime">All Time</option>
              <option value="custom">Custom Range</option>
            </select>
            
            <button className="bg-[#007acc] text-white px-3 py-2 rounded hover:bg-[#0069ac] flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
        
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-[#2d2d2d]">
            <CardContent className="p-4">
              <div className="text-gray-400 text-sm mb-1">Total Spins</div>
              <div className="text-2xl font-bold">{overviewStats.totalSpins.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#2d2d2d]">
            <CardContent className="p-4">
              <div className="text-gray-400 text-sm mb-1">Participants</div>
              <div className="text-2xl font-bold">{overviewStats.totalParticipants.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#2d2d2d]">
            <CardContent className="p-4">
              <div className="text-gray-400 text-sm mb-1">Winners</div>
              <div className="text-2xl font-bold text-green-500">{overviewStats.totalWinners.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#2d2d2d]">
            <CardContent className="p-4">
              <div className="text-gray-400 text-sm mb-1">Total Rewards</div>
              <div className="text-2xl font-bold">{overviewStats.totalRewards.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#2d2d2d]">
            <CardContent className="p-4">
              <div className="text-gray-400 text-sm mb-1">Claimed Rewards</div>
              <div className="text-2xl font-bold text-yellow-500">{overviewStats.claimedRewards.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Daily Participation
                </CardTitle>
              </div>
              <CardDescription>Spins and participation over time</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for Chart - In a real app we'd use a chart library */}
              <div className="h-64 bg-[#252525] rounded-md flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <LineChart className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                  <p>Line chart showing daily spin activity would appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Reward Distribution
                </CardTitle>
              </div>
              <CardDescription>Distribution of rewards by type</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for Chart */}
              <div className="h-64 bg-[#252525] rounded-md flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <PieChart className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                  <p>Pie chart showing reward distribution would appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2" />
                  Region Performance
                </CardTitle>
              </div>
              <CardDescription>Participation by region</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for Chart */}
              <div className="h-64 bg-[#252525] rounded-md flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <BarChart2 className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                  <p>Bar chart showing region performance would appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Golden Hour Impact
                </CardTitle>
              </div>
              <CardDescription>Participation during golden hours vs. regular hours</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for Chart */}
              <div className="h-64 bg-[#252525] rounded-md flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                  <p>Comparison chart showing golden hour impact would appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Top Performers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Highest performing events, regions, and golden hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-md font-medium mb-2">Top Events</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#252525] text-gray-400 text-sm">
                      <th className="text-left p-2">Event</th>
                      <th className="text-right p-2">Participants</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3c3c3c]">
                    <tr>
                      <td className="p-2">Summer Giveaway</td>
                      <td className="p-2 text-right">12,450</td>
                    </tr>
                    <tr>
                      <td className="p-2">Fall Promotion</td>
                      <td className="p-2 text-right">8,720</td>
                    </tr>
                    <tr>
                      <td className="p-2">Back to School</td>
                      <td className="p-2 text-right">6,340</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-2">Top Regions</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#252525] text-gray-400 text-sm">
                      <th className="text-left p-2">Region</th>
                      <th className="text-right p-2">Participants</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3c3c3c]">
                    <tr>
                      <td className="p-2">North Region</td>
                      <td className="p-2 text-right">8,450</td>
                    </tr>
                    <tr>
                      <td className="p-2">South Region</td>
                      <td className="p-2 text-right">7,320</td>
                    </tr>
                    <tr>
                      <td className="p-2">East Region</td>
                      <td className="p-2 text-right">5,680</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-2">Top Golden Hours</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#252525] text-gray-400 text-sm">
                      <th className="text-left p-2">Time Period</th>
                      <th className="text-right p-2">Participation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3c3c3c]">
                    <tr>
                      <td className="p-2">Evening Rush (18:00-19:00)</td>
                      <td className="p-2 text-right">3,250</td>
                    </tr>
                    <tr>
                      <td className="p-2">Lunch Break (12:00-13:00)</td>
                      <td className="p-2 text-right">2,780</td>
                    </tr>
                    <tr>
                      <td className="p-2">Morning Coffee (09:00-10:00)</td>
                      <td className="p-2 text-right">2,150</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </ShellLayout>
  );
}
