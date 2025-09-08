'use client';

import EntityListPage from '@/app/components/common/EntityListPage';
import { ObjectType } from '../lib/api/interfaces';

export default function ProvincesPage() {
  return (
    <EntityListPage
      title="Provinces"
      entityType={ObjectType.Province} // Use correct ObjectType key
      breadcrumbPath="provinces"
      description="Overview of province distribution and activity"
      // statsCards={[
      //   { label: 'Total Provinces', value: 48 },
      //   { label: 'Active Provinces', value: 42, color: 'green' },
      //   { label: 'Regions', value: 12, color: 'yellow' },
      //   { label: 'Total Participants', value: '25.6k', color: 'blue' }
      // ]}
      // tabs={[
      //   { id: 'all', label: 'All Provinces' },
      //   { id: 'active', label: 'Active' },
      //   { id: 'inactive', label: 'Inactive' }
      // ]}
      // addButtonLabel="Add Province"
      // onAddButtonClick={() => console.log('Add Province clicked')}
    />
  );
}
