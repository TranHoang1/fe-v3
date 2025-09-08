'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import ShellLayout from '../VSCodeLayout/ShellLayout';
import DataTable from './DataTable';
import { ActionDef } from './datatable/utils/tableUtils';
import { fetchTableData } from '@/app/lib/api/tableService';
import { ObjectType, TableFetchRequest, TableFetchResponse, SortType, DataObject } from '@/app/lib/api/interfaces';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, Filter, Plus, BarChart2, Users, Gift, Clock, Award } from 'lucide-react';

interface StatsCard {
  label: string;
  value: number | string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  icon?: React.ReactNode;
}

interface EntityListPageProps {
  title: string;
  entityType: ObjectType;
  breadcrumbPath: string;
  description?: string;
  statsCards?: StatsCard[];
  tabs?: { id: string; label: string }[];
  addButtonLabel?: string;
  onAddButtonClick?: () => void;
  actions?: ActionDef[]; // These are row-level actions for the DataTable
  showSearchBox?: boolean; // Add prop to control search box visibility
  actionButtons?: React.ReactNode; // These are page-level actions for the header
}

// Component that uses useSearchParams
function EntityListPageContent({
  title,
  entityType,
  breadcrumbPath,
  description = '',
  statsCards = [],
  tabs = [],
  addButtonLabel,
  onAddButtonClick,
  actions, // Extract actions parameter
  showSearchBox = false,
  actionButtons, // Extract actionButtons parameter
}: EntityListPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<string>(tabs.length > 0 ? tabs[0].id : 'all');
  const [tableData, setTableData] = useState<TableFetchResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load data when component mounts or when tab changes
  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Function to load data based on the current tab
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create a filter based on the active tab if needed
      const filters = [];
      if (activeTab !== 'all' && activeTab !== 'details') {
        // Example of how you might filter based on tabs
        filters.push({
          field: 'status',
          operator: 'eq',
          value: activeTab,
          filterType: 'STRING', // Add the required filterType property
          minValue: null,       // Add required minValue property (null for non-range filters)
          maxValue: null        // Add required maxValue property (null for non-range filters)
        });
      }

      // Create the request object
      const request: TableFetchRequest = {
        page: 0,
        size: 10,
        sorts: [
          {
            field: 'id',
            sortType: SortType.DESCENDING,
          },
        ],
        filters: [],
        search: {

        } as Record<ObjectType, DataObject>,
        objectType: ObjectType[entityType],
        entityName: ObjectType[entityType]
      };

      const response = await fetchTableData(request);
      setTableData(response);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get icon based on color
  const getCardIcon = (color?: string, defaultIcon?: React.ReactNode) => {
    if (defaultIcon) return defaultIcon;

    switch (color) {
      case 'blue':
        return <Users className="h-5 w-5" />;
      case 'green':
        return <Gift className="h-5 w-5" />;
      case 'yellow':
        return <Clock className="h-5 w-5" />;
      default:
        return <BarChart2 className="h-5 w-5" />;
    }
  };

  // Helper function to get card background color
  const getCardColorClass = (color?: string) => {
    switch (color) {
      case 'blue':
        return 'bg-gradient-to-br from-[#2a4365] to-[#2c5282] text-white';
      case 'green':
        return 'bg-gradient-to-br from-[#276749] to-[#2f855a] text-white';
      case 'yellow':
        return 'bg-gradient-to-br from-[#975a16] to-[#b7791f] text-white';
      case 'red':
        return 'bg-gradient-to-br from-[#9b2c2c] to-[#c53030] text-white';
      default:
        return 'bg-[#252526] text-[#cccccc]';
    }
  };

  return (
    <ShellLayout>
      <div className="container mx-auto py-6 px-4 max-w-full">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{title}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && <p className="text-gray-400 mt-1">{description}</p>}
          </div>

          {/* Page-level actions rendered in the header */}
          <div className="flex gap-2">
            {actionButtons}

            {!actionButtons && addButtonLabel && (
              <button
                onClick={onAddButtonClick}
                className="bg-[#007acc] text-white px-3 py-2 rounded flex items-center hover:bg-[#0069ac]"
              >
                <Plus className="h-4 w-4 mr-2" />
                {addButtonLabel}
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {statsCards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {statsCards.map((card, index) => (
              <Card key={index} className={getCardColorClass(card.color)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium opacity-80">{card.label}</h3>
                      <p className="text-2xl font-bold mt-1">{card.value}</p>
                    </div>
                    <div className={`p-2 rounded-full ${card.color ? 'bg-white bg-opacity-20' : 'bg-[#3c3c3c]'}`}>
                      {getCardIcon(card.color, card.icon)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tabs */}
        {tabs.length > 0 && (
          <div className="mb-6">
            <div className="flex space-x-1 rounded-lg bg-[#252525] p-1 w-fit">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${activeTab === tab.id
                      ? 'bg-[#37373d] text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-[#252526] rounded-lg shadow p-4 w-full" style={{ maxWidth: '100%' }}>
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">
                {tabs.find(tab => tab.id === activeTab)?.label || title} List
              </h2>
            </div>
          </div>

          {/* Data Table Component */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin h-8 w-8 border-4 border-[#007acc] border-t-transparent rounded-full mr-3"></div>
              <p className="text-gray-400">Loading {title.toLowerCase()}...</p>
            </div>
          ) : error ? (
            <div className="bg-[#442222] text-red-300 p-4 rounded text-center">
              {error}
            </div>
          ) : (
            <DataTable
              data={tableData}
              entityType={entityType}
              showDetailView={true}
              actions={actions} // Row-level actions passed to DataTable
              showSearchBox={showSearchBox} // Pass showSearchBox prop
            />
          )}
        </div>
      </div>
    </ShellLayout>
  );
}

// Main component wrapped in Suspense
export default function EntityListPage(props: EntityListPageProps) {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin h-8 w-8 border-4 border-[#007acc] border-t-transparent rounded-full mr-3"></div>
        <p className="text-gray-400">Loading...</p>
      </div>
    }>
      <EntityListPageContent {...props} />
    </Suspense>
  );
}
