'use client';

import EntityListPage from '@/app/components/common/EntityListPage';
import {ObjectType} from '../lib/api/interfaces';
import {Play} from 'lucide-react'; // Import Play icon
import {useState} from 'react';
import {toast} from '@/app/components/ui/use-toast'; // Import toast
import {apiConfig} from '@/app/lib/api/tableService'; // Import API config

export default function CalculatorDistributionPage() {
    const [isRunning, setIsRunning] = useState(false);

    // Function to handle the run distribute action
    const handleRunDistribute = async () => {
        setIsRunning(true);
        try {
            // Call the distribute API endpoint
            const response = await fetch(`${apiConfig.baseUrl}/admin/reward/distribute`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error('Failed to run distribution');
            }

            // Show success toast
            toast({
                title: 'Distribution process started',
                description: 'The reward distribution process has been initiated successfully.',
                variant: 'success',
                duration: 3000
            });
            window.location.reload();
        } catch (error) {
            console.error('Error running distribution:', error);

            // Show error toast
            toast({
                title: 'Distribution failed',
                description: 'Failed to start the reward distribution process. Please try again.',
                variant: 'destructive',
                duration: 4000
            });
        } finally {
            setIsRunning(false);
        }
    };

    // Custom action button for the header
    const actionButtons = (
        <button
            onClick={handleRunDistribute}
            disabled={isRunning}
            className="bg-green-700 hover:bg-green-800 text-white px-3 py-2 rounded flex items-center transition-colors"
        >
            {isRunning ? (
                <>
                    <div
                        className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Running...
                </>
            ) : (
                <>
                    <Play className="h-4 w-4 mr-2"/>
                    Run Distribute
                </>
            )}
        </button>
    );

    return (
        <EntityListPage
            title="Calculator Distribution"
            entityType={ObjectType.RewardDistribute}
            breadcrumbPath="calculator-distribution"
            description="Overview of reward distribution calculations"
            showSearchBox={true}
            actionButtons={actionButtons}
        />
    );
}
