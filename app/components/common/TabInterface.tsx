'use client';

import { useState, ReactNode, useEffect } from 'react';

// Define the tab structure
interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  visible?: boolean;
}

interface TabInterfaceProps {
  tabs: Tab[];
  defaultTabId?: string;
  className?: string;
}

export default function TabInterface({
  tabs,
  defaultTabId,
  className = ''
}: TabInterfaceProps) {
  // Filter out invisible tabs
  const visibleTabs = tabs.filter(tab => tab.visible !== false);
  
  // Set initial active tab (first visible tab if no default provided)
  const [activeTab, setActiveTab] = useState<string>(
    defaultTabId || (visibleTabs.length > 0 ? visibleTabs[0].id : '')
  );

  // If tabs change, reset to the first tab if current active tab no longer exists
  useEffect(() => {
    const tabExists = visibleTabs.some(tab => tab.id === activeTab);
    if (!tabExists && visibleTabs.length > 0) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [tabs, activeTab, visibleTabs]);

  // If no tabs are visible, show a message
  if (visibleTabs.length === 0) {
    return <div className="p-4 text-gray-400">No tabs available to display.</div>;
  }

  // Find the active tab
  const currentTab = visibleTabs.find(tab => tab.id === activeTab);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-[#3c3c3c] overflow-x-auto">
        <div className="flex space-x-2">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 flex items-center whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-[#007acc] border-b-2 border-[#007acc]'
                  : 'text-gray-400 hover:text-white hover:bg-[#2a2d2e]'
              }`}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {currentTab ? currentTab.content : <div>Select a tab</div>}
      </div>
    </div>
  );
}
