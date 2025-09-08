'use client';

import EntityListPage from '@/app/components/common/EntityListPage';
import {ObjectType} from '../lib/api/interfaces';

export default function CalculatorDistributionPage() {
    return (
        <EntityListPage
            title="Calculator Distribution"
            entityType={ObjectType.RewardDistribute}
            breadcrumbPath="calculator-distribution"
            description="Overview of reward distribution calculations"
            showSearchBox={true}
        />
    );
}
