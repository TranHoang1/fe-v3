'use client';

import EntityListPage from '@/app/components/common/EntityListPage';
import { ObjectType } from '../lib/api/interfaces';

export default function GoldenHoursPage() {
  return (
    <EntityListPage
      title="Golden Hours"
      entityType={ObjectType.GoldenHour} // Use correct ObjectType key
      breadcrumbPath="golden-hours"
      description="Overview of golden hour performance and impact"
      // statsCards={[
      //   { label: 'Total Golden Hours', value: 124 },
      //   { label: 'Active Hours', value: 8, color: 'green' },
      //   { label: 'Scheduled Hours', value: 12, color: 'yellow' },
      //   { label: 'Avg. Multiplier', value: '2.5x', color: 'blue' }
      // ]}
      // tabs={[
      //   { id: 'all', label: 'All Hours' },
      //   { id: 'active', label: 'Active' },
      //   { id: 'scheduled', label: 'Scheduled' },
      //   { id: 'completed', label: 'Completed' }
      // ]}
      // addButtonLabel="Add Golden Hour"
      // onAddButtonClick={() => console.log('Add golden hour clicked')}
    />
  );
}
