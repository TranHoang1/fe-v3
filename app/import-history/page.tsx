'use client';

import EntityListPage from '@/app/components/common/EntityListPage';
import {ObjectType} from '../lib/api/interfaces';

export default function ImportHistoryPage() {

    return (
        <EntityListPage
            title="Import History"
            entityType={ObjectType.JobImportHistory}
            breadcrumbPath="import-history"
            description="Overview of data import activities"
            showSearchBox={true}
        />
    );
}
