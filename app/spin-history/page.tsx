'use client';

import EntityListPage from '@/app/components/common/EntityListPage';
import {ObjectType} from '../lib/api/interfaces';
import {ActionDef} from "@/app/components/common/datatable/utils/tableUtils";
import {Download} from "lucide-react";

export default function SpinHistoryPage() {

    // Define table-level actions for the DataTable
    const tableActions: ActionDef[] = [
        {
            label: "Export",
            onClick: () => {
                console.log("Export functionality to be implemented");
                // Add export implementation here
            },
            color: "blue",
            iconLeft: <Download size={14}/>,
            isTableAction: true
        }
    ];

    return (
        <EntityListPage
            title="Spin History"
            entityType={ObjectType.SpinHistory} // Use correct ObjectType key
            breadcrumbPath="spin-history"
            description="Overview of all customer spins and rewards"
            showSearchBox={true}
            actions={tableActions}
        />
    );
}
