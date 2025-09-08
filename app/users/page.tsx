'use client';

import EntityListPage from '@/app/components/common/EntityListPage';
import { ObjectType } from '../lib/api/interfaces';

export default function UsersPage() {
  return (
    <EntityListPage
      title="Users"
      entityType={ObjectType.User} // Use correct ObjectType key
      breadcrumbPath="users"
      description="Manage system users and access control"
      // statsCards={[
      //   { label: 'Total Users', value: 15 },
      //   { label: 'Active Users', value: 12, color: 'green' },
      //   { label: 'Inactive Users', value: 3, color: 'yellow' },
      //   { label: 'Roles', value: 5, color: 'blue' }
      // ]}
      // tabs={[
      //   { id: 'all', label: 'All Users' },
      //   { id: 'active', label: 'Active' },
      //   { id: 'inactive', label: 'Inactive' }
      // ]}
      // addButtonLabel="Add User"
      // onAddButtonClick={() => console.log('Add user clicked')}
    />
  );
}
