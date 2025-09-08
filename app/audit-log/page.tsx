'use client';

import EntityListPage from '@/app/components/common/EntityListPage';
import { Download } from 'lucide-react';
import { ObjectType } from '../lib/api/interfaces';

export default function AuditLogPage() {
  return (
    <EntityListPage
      title="Audit Log"
      entityType={ObjectType.AuditLog} // Use correct ObjectType key
      breadcrumbPath="audit-log"
      description="System activity tracking and audit trail"
      // statsCards={[
      //   { label: 'Total Entries', value: 1248 },
      //   { label: 'User Actions', value: 845, color: 'blue' },
      //   { label: 'System Events', value: 403, color: 'yellow' },
      //   { label: 'Last 24 Hours', value: 57, color: 'green' }
      // ]}
      // tabs={[
      //   { id: 'all', label: 'All Actions' },
      //   { id: 'update', label: 'Updates' },
      //   { id: 'add', label: 'Additions' },
      //   { id: 'delete', label: 'Deletions' }
      // ]}
    />
  );
}
