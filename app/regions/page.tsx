'use client';

import EntityListPage from '@/app/components/common/EntityListPage';
import { ObjectType } from '../lib/api/interfaces';

export default function RegionsPage() {
  return (
    <EntityListPage
      title="Regions"
      entityType={ObjectType.Region} // Use correct ObjectType key
      breadcrumbPath="regions"
      description="Overview of regions and provinces distribution"
      // statsCards={[
      //   { label: 'Total Regions', value: 12 },
      //   { label: 'Active Regions', value: 10, color: 'green' },
      //   { label: 'Total Provinces', value: 48, color: 'yellow' },
      //   { label: 'Total Participants', value: '25.6k', color: 'blue' }
      // ]}
      // tabs={[
      //   { id: 'all', label: 'All Regions' },
      //   { id: 'active', label: 'Active' },
      //   { id: 'inactive', label: 'Inactive' }
      // ]}
      // addButtonLabel="Add Region"
      // onAddButtonClick={() => console.log('Add Region clicked')}
    />
  );
}
