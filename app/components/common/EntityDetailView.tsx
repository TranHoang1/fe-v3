'use client';

import { ReactNode } from 'react';
import DetailView, { DetailField, DetailSection } from './DetailView';
import { entityApiEndpoints } from '@/app/lib/api/tableService';

interface EntityDetailViewProps {
  entityId: number;
  entityType: string;
  entityData: any;
  children?: ReactNode;
}

// Default field renderers for common entity types
const fieldRenderers: Record<string, Record<string, (value: any) => ReactNode>> = {
  event: {
    status: (value) => (
      <span className={`px-2 py-1 rounded text-xs ${
        value === 'Active' ? 'bg-green-800 text-green-100' :
        value === 'Upcoming' ? 'bg-blue-800 text-blue-100' :
        value === 'Completed' ? 'bg-gray-800 text-gray-100' :
        'bg-yellow-800 text-yellow-100'
      }`}>
        {value}
      </span>
    )
  },
  participant: {
    status: (value) => (
      <span className={`px-2 py-1 rounded text-xs ${
        value === 'Active' ? 'bg-green-800 text-green-100' : 'bg-gray-800 text-gray-100'
      }`}>
        {value}
      </span>
    )
  },
  goldenHour: {
    multiplier: (value) => `${value}x`
  },
  reward: {
    value: (value) => `$${value}`
  }
};

export default function EntityDetailView({
  entityId,
  entityType,
  entityData,
  children
}: EntityDetailViewProps) {
  // Get the appropriate field renderer for this entity type
  const renderers = fieldRenderers[entityType] || {};
  
  // Generic field renderer function
  const renderField = (key: string, value: any) => {
    if (renderers[key]) {
      return renderers[key](value);
    }
    
    // Default rendering based on types
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (value === null || value === undefined) {
      return '-';
    }
    
    return value;
  };
  
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4">{entityType.charAt(0).toUpperCase() + entityType.slice(1)} Details</h2>
      
      {entityData ? (
        <>
          <DetailView>
            <DetailSection title="Basic Information">
              {Object.entries(entityData)
                .filter(([key]) => !key.includes('Count') && !Array.isArray(entityData[key]))
                .map(([key, value]) => (
                  <DetailField 
                    key={key} 
                    label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} 
                    value={renderField(key, value)} 
                  />
                ))}
            </DetailSection>
            
            {/* Custom children for extended details */}
            {children}
          </DetailView>
        </>
      ) : (
        <div className="bg-[#2d2d2d] p-4 rounded-md text-center">
          <p>Loading {entityType} details...</p>
        </div>
      )}
    </div>
  );
}
