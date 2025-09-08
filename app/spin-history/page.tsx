'use client';

import EntityListPage from '@/app/components/common/EntityListPage';
import { ObjectType } from '../lib/api/interfaces';

export default function SpinHistoryPage() {
  return (
    <EntityListPage
      title="Spin History"
      entityType={ObjectType.SpinHistory} // Use correct ObjectType key
      breadcrumbPath="spin-history"
      description="Overview of all customer spins and rewards"
      // statsCards={[
      //   { label: 'Total Spins', value: 45762 },
      //   { label: 'Winning Spins', value: 12348, color: 'green' },
      //   { label: 'Win Rate', value: '27.0%', color: 'yellow' },
      //   { label: 'Claim Rate', value: '84.2%', color: 'blue' }
      // ]}
      // tabs={[
      //   { id: 'all', label: 'All Spins' },
      //   { id: 'winners', label: 'Winners' },
      //   { id: 'claimed', label: 'Claimed' },
      //   { id: 'unclaimed', label: 'Unclaimed' }
      // ]}
      // addButtonLabel="Export History"
      // onAddButtonClick={() => console.log('Exporting spin history...')}
    />
  );
}
