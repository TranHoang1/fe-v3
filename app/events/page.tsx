'use client';

import EntityListPage from '@/app/components/common/EntityListPage';
import { ObjectType } from '../lib/api/interfaces';

export default function EventsPage() {
  return (
    <EntityListPage
      title="Events"
      entityType={ObjectType.Event}
      breadcrumbPath="events"
      description="Overview of event performance and participation"
      // statsCards={[
      //   { label: 'Total Events', value: 15 },
      //   { label: 'Active Events', value: 3, color: 'green' },
      //   { label: 'Total Participants', value: '25,642', color: 'yellow' },
      //   { label: 'Total Spins', value: '45,762', color: 'blue' }
      // ]}
      // tabs={[
      //   { id: 'all', label: 'All Events' },
      //   { id: 'active', label: 'Active' },
      //   { id: 'upcoming', label: 'Upcoming' },
      //   { id: 'completed', label: 'Completed' }
      // ]}
      // addButtonLabel="Create Event"
      // onAddButtonClick={() => console.log('Create event clicked')}
    />
  );
}