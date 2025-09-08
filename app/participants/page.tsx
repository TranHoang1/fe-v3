'use client';

import EntityListPage from '@/app/components/common/EntityListPage';
import { ObjectType } from '../lib/api/interfaces';
import { ActionDef } from '@/app/components/common/datatable/utils/tableUtils';
import { Download, Upload } from 'lucide-react';

export default function ParticipantsPage() {
  // Define table-level actions for the DataTable
  const tableActions: ActionDef[] = [
    {
      label: "Export",
      onClick: () => {
        console.log("Export functionality to be implemented");
        // Add export implementation here
      },
      color: "blue",
      iconLeft: <Download size={14} />,
      isTableAction: true
    },
    {
      label: "Import",
      onClick: () => {
        console.log("Import functionality to be implemented");
        // Add import implementation here
      },
      color: "green",
      iconLeft: <Upload size={14} />,
      isTableAction: true
    }
  ];

  return (
    <EntityListPage
      title="Participants"
      entityType={ObjectType.Participant}
      breadcrumbPath="participants"
      description="Overview of participation and engagement"
      showSearchBox={true}
      actions={tableActions}
    />
  );
}
