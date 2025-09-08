'use client';

import EntityListPage from '@/app/components/common/EntityListPage';
import { ObjectType } from '../lib/api/interfaces';

export default function RewardsPage() {
  return (
    <EntityListPage
      title="Rewards"
      entityType={ObjectType.Reward} // Use correct ObjectType key
      breadcrumbPath="rewards"
      description="Overview of rewards distribution and claims"
      // statsCards={[
      //   { label: 'Total Rewards', value: 12 },
      //   { label: 'Available Rewards', value: 10, color: 'green' },
      //   { label: 'Depleted Rewards', value: 2, color: 'yellow' },
      //   { label: 'Total Claims', value: 285, color: 'blue' }
      // ]}
      // tabs={[
      //   { id: 'all', label: 'All Rewards' },
      //   { id: 'available', label: 'Available' },
      //   { id: 'depleted', label: 'Depleted' }
      // ]}
      // addButtonLabel="Add Reward"
      // onAddButtonClick={() => console.log('Add reward clicked')}
    />
  );
}
