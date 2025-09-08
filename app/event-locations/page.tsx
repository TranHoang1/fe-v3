'use client';

import EntityListPage from '@/app/components/common/EntityListPage';
import {ObjectType} from '../lib/api/interfaces';

export default function EventLocationsPage() {
    return (
        <EntityListPage
            title="Events"
            entityType={ObjectType.EventLocation}
            breadcrumbPath="events"
            description="Overview of event performance and participation"
        />
    );
}