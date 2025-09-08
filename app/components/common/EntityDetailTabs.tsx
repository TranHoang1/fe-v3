'use client';

import { ReactNode, useState } from 'react';
import {useEffect, useMemo} from 'react';
import {
    DataObject,
    FilterType,
    ObjectType,
    TableFetchRequest,
    TableFetchResponse,
    TableRow,
    TabTableRow,
} from '@/app/lib/api/interfaces';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import DataTable from './DataTable';
import {ColumnDef} from './datatable/utils/tableUtils';
import {apiConfig, fetchTableData} from '@/app/lib/api/tableService';
import {AlertCircle, Loader, Save, Trash2, X} from 'lucide-react';
import {entityRelations} from '@/app/lib/api/entityRelations';
import {ImageDetailField} from './DetailFields/ImageDetailField';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';

export interface EntityDetailTabsProps {
    tableRow: TabTableRow;
    entityType: ObjectType;
    tableInfo?: TableFetchResponse;
    search?: Record<ObjectType, DataObject>;
    isEditing?: boolean;
    isNewRow?: boolean;
    onCancelEdit?: () => void;
    onSaveEdit?: (editedData: any) => void;
    columns?: ColumnDef[]; // Add columns property
    excludedStatusOptions?: string[]; // Add excludedStatusOptions property
}

export const EntityDetailTabs: React.FC<EntityDetailTabsProps> = ({
                                                                      tableRow,
                                                                      entityType,
                                                                      tableInfo,
                                                                      search,
                                                                      isEditing = false,
                                                                      isNewRow = false,
                                                                      onCancelEdit,
                                                                      onSaveEdit,
                                                                      columns, // Add columns parameter
                                                                      excludedStatusOptions = [] // Add excludedStatusOptions with empty array default
                                                                  }) => {
    // State for tab management and data loading
    const [activeTab, setActiveTab] = useState<string>('details');
    const [loadedTabs, setLoadedTabs] = useState<Record<string, boolean>>({details: true});
    const [relatedTableData, setRelatedTableData] = useState<Record<string, TableFetchResponse | null>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<Record<string, string | null>>({});

    // State for editing
    const [editedData, setEditedData] = useState<Record<string, any>>({});

    // State for related data for dropdowns (regions, etc.)
    const [relatedDropdownData, setRelatedDropdownData] = useState<Record<string, any[]>>({});

    // State for delete confirmation modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [mediaToDelete, setMediaToDelete] = useState<number | null>(null);

    // Auto-determine related tables based on entity type (for real backend data)
    const getAutoRelatedTables = (entityType: ObjectType): string[] => {
        const relatedTablesMappings: Record<ObjectType, string[]> = {
            [ObjectType.Event]: ['eventLocations', 'rewards'],
            [ObjectType.Participant]: ['participantEvents', 'spinHistory', 'province'],
            [ObjectType.Reward]: [],
            [ObjectType.EventLocation]: ['participants'],
            [ObjectType.GoldenHour]: ['spinHistory', 'event'],
            [ObjectType.SpinHistory]: ['participant', 'reward', 'goldenHour'],
            [ObjectType.Province]: ['participants', 'eventLocations'],
            [ObjectType.Region]: ['provinces', 'eventLocations'],
            [ObjectType.User]: ['participants', 'auditLogs', 'role'],
            [ObjectType.Role]: ['users', 'permissions'],
            [ObjectType.Permission]: ['roles'],
            [ObjectType.AuditLog]: ['user'],
            [ObjectType.ParticipantEvent]: ['participant', 'event'],
            [ObjectType.RewardEvent]: ['reward', 'event'],
            [ObjectType.Statistics]: [],
            [ObjectType.Configuration]: [],
            [ObjectType.BlacklistedToken]: ['user'],
            [ObjectType.JobImportHistory]: ['jobImportHistoryDetail'],
            [ObjectType.JobImportHistoryDetail]: [], // <-- Add this line
            [ObjectType.RewardDistribute]: ['dailyRewardDistribution'], // Example related tables,
            [ObjectType.DailyRewardDistribution]: [] // Example related tables,
        };

        const relatedTables = relatedTablesMappings[entityType] || [];

        // Filter out self-references - an entity should not show a tab for its own type
        const entityTypeName = ObjectType[entityType].toLowerCase();
        const pluralEntityTypeName = entityTypeName + 's'; // e.g., eventLocation -> eventLocations

        return relatedTables.filter(tableName =>
            tableName !== entityTypeName &&
            tableName !== pluralEntityTypeName &&
            tableName !== ObjectType[entityType] // Also filter out exact ObjectType name
        );
    };

    // Add the missing getStatusOptions function
    const getStatusOptions = () => {
        // Default status options available in the system
        const defaultOptions = ['ACTIVE', 'INACTIVE', 'DELETE'];

        // Filter out any excluded options (like 'DELETE')
        return defaultOptions.filter(option =>
            !excludedStatusOptions.includes(option)
        );
    };

    // Extract the actual data object, handling both TabTableRow format and direct data objects
    const rowData = useMemo(() => {
        console.log("🔍 DEBUG: Normalizing tableRow data structure:", tableRow);
        console.log("🔍 DEBUG: tableRow type:", typeof tableRow);
        console.log("🔍 DEBUG: tableRow keys:", tableRow ? Object.keys(tableRow) : 'no tableRow');

        // Case 1: TableRow has proper data property (expected structure)
        if (tableRow?.data) {
            console.log("🔍 DEBUG: Found tableRow.data:", tableRow.data);
            console.log("🔍 DEBUG: Row data keys:", Object.keys(tableRow.data));
            console.log("🔍 DEBUG: locations field:", tableRow.data.locations);
            return tableRow.data;
        }

        // Case 2: TableRow is itself the data object (direct data object)
        // Check if it has typical data fields but not TabTableRow structure
        if (tableRow && typeof tableRow === 'object' &&
            !('relatedTables' in tableRow) && !('tableInfo' in tableRow)) {
            console.log("🔍 DEBUG: TableRow appears to be direct data object, using as row data");
            console.log("🔍 DEBUG: Direct object keys:", Object.keys(tableRow));
            return tableRow;
        }

        // Case 3: No valid data found
        console.warn("🔍 DEBUG: No valid data found in tableRow");
        return null;
    }, [tableRow]);

    // Load dropdown data for related entities when creating a new entity or editing
    useEffect(() => {
        const loadRelatedDropdownData = async () => {
            // Only load related dropdown data when editing or adding new
            if (!isEditing) return;

            const entityConfig = entityRelations[entityType];
            if (!entityConfig) return;

            // Load all related dropdowns for this entity type
            for (const [relationKey, relation] of Object.entries(entityConfig)) {
                // Check if we already have related entity data in rowData
                const relationFieldName = relation.idField.replace('Id', '');
                const hasRelationDataInRowData = rowData?.[relationFieldName] &&
                    typeof rowData[relationFieldName] === 'object';

                // Set the related dropdown data if it's already available in rowData
                if (hasRelationDataInRowData && rowData[relationFieldName].id) {
                    console.log(`Using existing data for ${relation.dropdownKey} from rowData:`, rowData[relationFieldName]);
                    setRelatedDropdownData(prev => ({
                        ...prev,
                        [relation.dropdownKey]: [rowData[relationFieldName]]
                    }));

                    // Set the ID for the related entity in editedData
                    if (!isNewRow && rowData[relationFieldName].id) {
                        setEditedData(prev => ({
                            ...prev,
                            [relation.idField]: rowData[relationFieldName].id
                        }));
                    }
                    continue; // Skip API call since we already have the data
                }

                setLoading(prev => ({...prev, [`${relation.dropdownKey}Dropdown`]: true}));

                try {
                    const request: TableFetchRequest = {
                        page: 0,
                        size: 100,
                        sorts: [],
                        filters: [],
                        search: {} as Record<ObjectType, DataObject>,
                        objectType: relation.relatedEntity,
                        entityName: relation.relatedEntity
                    };

                    // If we have an ID for the related entity, add it to the request
                    if (rowData?.[relation.idField]) {
                        request.filters = [
                            {
                                field: 'id',
                                filterType: FilterType.EQUALS,
                                minValue: String(rowData[relation.idField]),
                                maxValue: String(rowData[relation.idField])
                            }
                        ];
                    }

                    const response = await fetchTableData(request);
                    console.log(`Loaded ${relation.dropdownKey} for dropdown:`, response);

                    if (response.rows?.length > 0) {
                        const items = response.rows.map(row => row.data);
                        setRelatedDropdownData(prev => ({...prev, [relation.dropdownKey]: items}));

                        // For new entities, set first item as default if not set
                        if (isNewRow && items.length > 0 && !editedData[relation.idField] && !relation.isMultiple) {
                            // Store this to prevent infinite loop with editedData dependency
                            const itemId = items[0].id;
                            setEditedData(prev => {
                                // Only update if needed to prevent unnecessary re-renders
                                if (prev[relation.idField] !== itemId) {
                                    return {...prev, [relation.idField]: itemId};
                                }
                                return prev;
                            });
                        }
                        // For existing entities, ensure the related entity is in the dropdown data
                        else if (!isNewRow && rowData?.[relation.idField]) {
                            const existingId = rowData[relation.idField];
                            const existingItem = items.find(item => item.id === existingId);

                            // If the related item isn't in our initial results, fetch it specifically
                            if (!existingItem) {
                                const specificRequest: TableFetchRequest = {
                                    page: 0,
                                    size: 1,
                                    sorts: [],
                                    filters: [
                                        {
                                            field: 'id',
                                            filterType: FilterType.EQUALS,
                                            minValue: String(existingId),
                                            maxValue: String(existingId)
                                        }
                                    ],
                                    search: {} as Record<ObjectType, DataObject>,
                                    objectType: relation.relatedEntity,
                                    entityName: relation.relatedEntity
                                };

                                const specificResponse = await fetchTableData(specificRequest);
                                if (specificResponse.rows?.length > 0) {
                                    const specificItem = specificResponse.rows[0].data;
                                    setRelatedDropdownData(prev => ({
                                        ...prev,
                                        [relation.dropdownKey]: [...items, specificItem]
                                    }));
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error(`Failed to load ${relation.dropdownKey} for dropdown:`, err);
                } finally {
                    setLoading(prev => ({...prev, [`${relation.dropdownKey}Dropdown`]: false}));
                }
            }
        };

        loadRelatedDropdownData();
    }, [entityType, rowData, isEditing, isNewRow]); // Removed editedData from dependencies

    // Extract relationship data from nested objects in rowData
    useEffect(() => {
        // Only run when not in edit mode (for details view) and when rowData is available
        if (isEditing || !rowData) return;

        const entityConfig = entityRelations[entityType];
        if (!entityConfig) return;

        // Process each configured relationship
        for (const [relationKey, relation] of Object.entries(entityConfig)) {
            // Check if we have a nested object with the relationship data
            const relationFieldName = relation.idField.replace('Id', '');
            const hasNestedRelation = rowData[relationFieldName] &&
                typeof rowData[relationFieldName] === 'object' &&
                rowData[relationFieldName].id !== undefined;

            if (hasNestedRelation) {
                console.log(`Found nested relationship data for ${relation.dropdownKey}:`, rowData[relationFieldName]);
                // Store the nested object as a dropdown item
                setRelatedDropdownData(prev => ({
                    ...prev,
                    [relation.dropdownKey]: [rowData[relationFieldName]]
                }));
            }
        }
    }, [entityType, rowData, isEditing]);

    // Initialize editedData from rowData when entering edit mode
    useEffect(() => {
        if (isEditing && rowData) {
            setEditedData({...rowData});
        }
    }, [isEditing, rowData]);

    // Get related tables - from tableRow.relatedTables OR auto-determine based on entity type
    const relatedTables = useMemo(() => {
        console.log("🔍 DEBUG: Getting related tables from tableRow.relatedTables");
        console.log("🔍 DEBUG: tableRow?.relatedTables:", tableRow?.relatedTables);
        console.log("🔍 DEBUG: Is array?", Array.isArray(tableRow?.relatedTables));
        console.log("🔍 DEBUG: Is string?", typeof tableRow?.relatedTables === 'string');

        // First try to use tableRow.relatedTables if available (for both mock data and real backend)
        if (tableRow?.relatedTables) {
            let relatedTablesArray: string[];

            // Handle both array format (mock data) and string format (real backend)
            if (Array.isArray(tableRow.relatedTables)) {
                relatedTablesArray = tableRow.relatedTables;
                console.log("🔍 DEBUG: Found related tables array from tableRow:", relatedTablesArray);
            } else if (typeof tableRow.relatedTables === 'string') {
                // Split space-separated string from real backend
                relatedTablesArray = (tableRow.relatedTables as string).trim().split(/\s+/).filter(Boolean);
                console.log("🔍 DEBUG: Parsed related tables string from tableRow:", relatedTablesArray);
            } else {
                relatedTablesArray = [];
            }

            // Filter out self-references - an entity should not show a tab for its own type
            const entityTypeName = ObjectType[entityType].toLowerCase();
            const pluralEntityTypeName = entityTypeName + 's'; // e.g., eventLocation -> eventLocations

            const filteredTables = relatedTablesArray.filter(tableName =>
                tableName !== entityTypeName &&
                tableName !== pluralEntityTypeName &&
                tableName !== ObjectType[entityType] // Also filter out exact ObjectType name
            );

            console.log("🔍 DEBUG: Filtered related tables:", filteredTables);
            return filteredTables;
        }

        // Auto-determine related tables based on entity type (fallback)
        const autoRelatedTables = getAutoRelatedTables(entityType);
        console.log("🔍 DEBUG: Auto-determined related tables for", entityType, ":", autoRelatedTables);
        return autoRelatedTables;
    }, [tableRow, entityType]);

    // Get tabs from search parameter
    const searchTabs = useMemo(() => {
        if (!search) return [];
        return Object.keys(search)
            .filter(key => {
                // Get the enum value for current entity type
                const currentEntityTypeEnum = ObjectType[entityType.toUpperCase() as keyof typeof ObjectType];
                // Compare the string key with the current entity type value
                return key !== String(currentEntityTypeEnum);
            });
    }, [search, entityType]);

    // Combine all tabs
    const allTabs = useMemo(() => {
        console.log("🔍 DEBUG: Building allTabs");
        console.log("  searchTabs:", searchTabs);
        console.log("  relatedTables:", relatedTables);
        const tabs = ['details', ...searchTabs, ...relatedTables];
        console.log("  final tabs array:", tabs);
        const uniqueTabs = Array.from(new Set(tabs));
        console.log("  unique tabs:", uniqueTabs);
        return uniqueTabs; // Remove duplicates
    }, [searchTabs, relatedTables]);

    // Set active tab to details when entering edit mode
    useEffect(() => {
        if (isEditing) {
            setActiveTab('details');
        }
    }, [isEditing]);

    // Handle field change in edit mode
    const handleFieldChange = (key: string, value: any) => {
        setEditedData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Helper to get ObjectType from tab name
    const getObjectTypeForTab = (tabName: string): ObjectType => {
        // Check if tabName is an ObjectType key
        if (tabName in ObjectType) {
            return ObjectType[tabName as keyof typeof ObjectType];
        }

        // Check in numeric keys (from search tabs)
        if (search && tabName in search) {
            return ObjectType[tabName as keyof typeof ObjectType];
        }
        // Common mappings for related table names
        const mappings: Record<string, ObjectType> = {
            // Standard ObjectType names (uppercase)
            'PARTICIPANT': ObjectType.Participant,
            'EVENT': ObjectType.Event,
            'REWARD': ObjectType.Reward,
            'SPIN_HISTORY': ObjectType.SpinHistory,
            'USER': ObjectType.User,
            'BLACKLISTED_TOKEN': ObjectType.BlacklistedToken,
            'EVENT_LOCATION': ObjectType.EventLocation,
            'PROVINCE': ObjectType.Province,
            'REGION': ObjectType.Region,
            'ROLE': ObjectType.Role,
            'PERMISSION': ObjectType.Permission,
            'GOLDEN_HOUR': ObjectType.GoldenHour,
            'AUDIT_LOG': ObjectType.AuditLog,
            'PARTICIPANT_EVENT': ObjectType.ParticipantEvent,

            // Related table names (lowercase/camelCase from mock data)
            'participants': ObjectType.Participant,
            'events': ObjectType.Event,
            'rewards': ObjectType.Reward,
            'spinHistory': ObjectType.SpinHistory,
            'users': ObjectType.User,
            'eventLocations': ObjectType.EventLocation,
            'provinces': ObjectType.Province,
            'province': ObjectType.Province, // Single province (many-to-one relationship)
            'regions': ObjectType.Region,
            'region': ObjectType.Region, // Single region (many-to-one relationship)
            'roles': ObjectType.Role,
            'role': ObjectType.Role, // Single role (many-to-one relationship)
            'permissions': ObjectType.Permission,
            'permission': ObjectType.Permission, // Single permission (many-to-one relationship)
            'goldenHours': ObjectType.GoldenHour,
            'goldenHour': ObjectType.GoldenHour, // Single golden hour (many-to-one relationship)
            'auditLog': ObjectType.AuditLog,
            'auditLogs': ObjectType.AuditLog,
            'participantEvents': ObjectType.ParticipantEvent,
            'event': ObjectType.Event, // Single event (many-to-one relationship)
            'participant': ObjectType.Participant, // Single participant (many-to-one relationship)
            'reward': ObjectType.Reward, // Single reward (many-to-one relationship)
            'user': ObjectType.User, // Single user (many-to-one relationship)
            'jobImportHistoryDetail': ObjectType.JobImportHistoryDetail,
            'dailyRewardDistribution': ObjectType.DailyRewardDistribution
        };

        return mappings[tabName.toUpperCase()] || mappings[tabName];
    };

    // Load data when tab changes
    useEffect(() => {
        loadRelatedTableData(activeTab, loadedTabs, relatedTables);
    }, [activeTab, loadedTabs, relatedTables]);

    const loadRelatedTableData = async (activeTab: string, loadedTabs: Record<string, boolean>, relatedTables: string[]) => {
        console.log("🔍 DEBUG: loadRelatedTableData called for tab:", activeTab);
        console.log("🔍 DEBUG: relatedTables:", relatedTables);
        console.log("🔍 DEBUG: loadedTabs:", loadedTabs);

        if (activeTab === 'details' || loadedTabs[activeTab]) return;

        // Mark this tab as loaded
        setLoadedTabs(prev => ({...prev, [activeTab]: true}));

        // Load data if it's a related table
        if (relatedTables.includes(activeTab)) {
            const objectType = getObjectTypeForTab(activeTab);
            console.log("🔍 DEBUG: objectType for tab", activeTab, ":", objectType);

            if (objectType !== undefined) {
                const searchContext: Record<ObjectType, DataObject> = search || {} as Record<ObjectType, DataObject>;
                searchContext[entityType] = {
                    objectType: entityType,
                    key: tableInfo?.key || '',
                    fieldNameMap: tableInfo?.fieldNameMap || {},
                    description: '',
                    data: tableRow as TableRow
                } as DataObject;

                console.log("🔍 DEBUG: searchContext:", searchContext);

                const tabId = String(objectType);

                if (loading[tabId]) return;

                setLoading(prev => ({...prev, [tabId]: true}));
                setError(prev => ({...prev, [tabId]: null}));
                try {
                    // For one-to-many relationships (like Event -> EventLocations), use filters instead of search context
                    const isOneToManyRelationship = isOneToMany(entityType, activeTab);
                    let request: TableFetchRequest;
                    if (isOneToManyRelationship && rowData?.id) {
                        // Use filter to find related entities
                        const relationshipField = getOneToManyRelationshipField(entityType, activeTab);
                        console.log("🔍 DEBUG: Using filter for one-to-many relationship. Field:", relationshipField, "Value:", rowData.id);

                        request = {
                            page: 0,
                            size: 20,
                            sorts: [],
                            filters: relationshipField ? [
                                {
                                    field: relationshipField,
                                    filterType: FilterType.EQUALS,
                                    minValue: String(rowData.id),
                                    maxValue: String(rowData.id)
                                }
                            ] : [],
                            search: {} as Record<ObjectType, DataObject>,
                            objectType: objectType,
                            entityName: objectType
                        };
                    } else {
                        // Use search context for other relationships
                        request = {
                            page: 0,
                            size: 20,
                            sorts: [],
                            filters: [],
                            search: searchContext,
                            objectType: objectType,
                            entityName: objectType
                        };
                    }

                    console.log("🔍 DEBUG: Making request for", activeTab, ":", request);

                    const response = await fetchTableData(request);
                    console.log("🔍 DEBUG: Got response for", activeTab, ":", response);
                    setRelatedTableData(prev => ({...prev, [tabId]: response}));
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Failed to load data';
                    console.error("🔍 DEBUG: Error loading", activeTab, ":", err);
                    setError(prev => ({...prev, [tabId]: message}));
                } finally {
                    setLoading(prev => ({...prev, [tabId]: false}));
                }
            } else {
                console.error("🔍 DEBUG: Unknown object type for tab:", activeTab);
                setError(prev => ({...prev, [activeTab]: `Unknown object type for tab: ${activeTab}`}));
            }
        }
    }

    // Load single object data for many-to-one relationships
    const loadSingleObjectData = async (tabName: string, objectType: ObjectType) => {
        const relationshipValue = getRelationshipValue(tabName, entityType, rowData);
        const tabId = `${objectType}-single`;

        console.log("🔍 DEBUG: loadSingleObjectData called");
        console.log("🔍 DEBUG: tabName:", tabName, "objectType:", objectType);
        console.log("🔍 DEBUG: relationshipValue:", relationshipValue);

        if (!relationshipValue) {
            setError(prev => ({...prev, [tabId]: 'No relationship data available'}));
            return;
        }

        const relatedObjectId = relationshipValue;

        // Mark this tab as loaded and start loading
        setLoadedTabs(prev => ({...prev, [tabId]: true}));
        setLoading(prev => ({...prev, [tabId]: true}));
        setError(prev => ({...prev, [tabId]: null}));

        try {
            // Create a request to fetch the single object by ID
            const request: TableFetchRequest = {
                page: 0,
                size: 1,
                sorts: [],
                filters: [
                    {
                        field: 'id',
                        filterType: FilterType.EQUALS,
                        minValue: String(relatedObjectId),
                        maxValue: String(relatedObjectId)
                    }
                ],
                search: {} as Record<ObjectType, DataObject>,
                objectType: objectType,
                entityName: objectType
            };

            const response = await fetchTableData(request);
            setRelatedTableData(prev => ({...prev, [tabId]: response}));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load data';
            setError(prev => ({...prev, [tabId]: message}));
        } finally {
            setLoading(prev => ({...prev, [tabId]: false}));
        }
    };

    // Format entity field names for display
    const formatFieldName = (key: string): string => {
        return key.charAt(0).toUpperCase() +
            key.slice(1).replace(/([A-Z])/g, ' $1').trim();
    };

    // Format tab labels
    const formatTabLabel = (tabName: string): string => {
        return tabName
            .split('_')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
    };

    // Format field values for display
    const formatFieldValue = (value: any): string => {
        if (value === null || value === undefined) return '-';

        if (value instanceof Date) {
            return value.toLocaleString();
        }

        if (typeof value === 'string') {
            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                try {
                    return new Date(value).toLocaleString();
                } catch (e) {
                    return value;
                }
            }
            return value;
        }

        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }

        if (typeof value === 'object') {
            if (value.name) return value.name;
            if (value.id) return `ID: ${value.id}`;
            return JSON.stringify(value);
        }

        return String(value);
    };

    // Render editable field based on field type
    const renderEditableField = (key: string, value: any, type: string) => {
        // Add 'version' to the list of non-editable fields
        if (key === 'id' || key === 'version' || key.includes('createdBy') || key.includes('updatedBy') ||
            key.includes('createdDate') || key.includes('lastModifiedDate')) {
            return formatFieldValue(value);
        }

        if (type === 'boolean' || value === true || value === false) {
            return (
                <select>
                    <option value="">Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
            );
        }

        if (type === 'date') {
            const dateValue = value ? new Date(value).toISOString().split('T')[0] : '';
            return (
                <input
                    type="date"
                    className="w-full bg-[#2d2d2d] text-white p-2 rounded border border-[#3c3c3c]"
                    value={editedData[key] ? new Date(editedData[key]).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                />
            );
        }

        if (type === 'datetime') {
            const datetimeValue = value ? new Date(value).toISOString().slice(0, 16) : '';
            return (
                <input
                    type="datetime-local"
                    className="w-full bg-[#2d2d2d] text-white p-2 rounded border border-[#3c3c3c]"
                    value={editedData[key] ? new Date(editedData[key]).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                />
            );
        }

        if (typeof value === 'number') {
            return (
                <input
                    type="number"
                    className="w-full bg-[#2d2d2d] text-white p-2 rounded border border-[#3c3c3c]"
                    value={editedData[key] || ''}
                    onChange={(e) => handleFieldChange(key, e.target.value ? Number(e.target.value) : null)}
                />
            );
        }

        return (
            <input
                type="text"
                className="w-full bg-[#2d2d2d] text-white p-2 rounded border border-[#3c3c3c]"
                value={editedData[key] || ''}
                onChange={(e) => handleFieldChange(key, e.target.value)}
            />
        );
    };

    // Render the detailed information about an entity in a card format
    const renderEntityDetails = (data: any, title: string = 'Details') => {
        console.log("renderEntityDetails called with data:", data);

        if (!data || Object.keys(data).length === 0) {
            const emptyData = {
                status: 'ACTIVE', // Default status for new entities
                // Add any other default values needed for new entities
            };

            if (isEditing) {
                // If we're creating a new entity, show empty form fields
                return (
                    <div className="space-y-6 p-4 bg-[#1e1e1e] rounded border border-[#3c3c3c]">
                        <h2 className="text-lg font-medium text-white border-b border-[#3c3c3c] pb-2">
                            Create New {entityType} <span className="text-[#007acc] ml-2">(Edit Mode)</span>
                        </h2>

                        {/* Render edit form with empty data */}
                        {renderEntityDetails(emptyData, `New ${entityType}`)}
                    </div>
                );
            }

            console.warn("No data available for entity details");
            return <div className="p-4 text-center text-gray-400">No data available for {title}</div>;
        }

        const excludedFields = ['relatedTables'];
        // Exclude id field from details view and currentServerTime field by default
        excludedFields.push('currentServerTime', 'id');

        // When adding a new entity, also exclude all audit fields as they don't exist yet
        if (isEditing && isNewRow) {
            excludedFields.push(
                'createdBy', 'updatedBy', 'lastUpdatedBy',
                'createdDate', 'lastModifiedDate', 'updatedDate',
                'createdAt', 'updatedAt', 'created', 'updated' // Add additional date field variations
            );
        }

        // Replace idField with viewIdField
        const viewIdField = data.viewId !== undefined ? {viewId: data.viewId} : {};
        const statusField = data.status !== undefined ? {status: data.status} : {};
        const dateFields: Record<string, any> = {};
        const simpleFields: Record<string, any> = {};
        const auditFields: Record<string, any> = {}; // New separate category for audit fields

        // Add custom dropdown fields based on entity relationships
        const customRelationshipFields: Record<string, {
            label: string,
            fieldName: string,
            relationType: ObjectType,
            relationData: any[],
            isMultiple: boolean
        }> = {};

        // Get entity relationships from configuration - now for both editing and detail view
        if (entityType) {
            const entityConfig = entityRelations[entityType];
            if (entityConfig) {
                Object.entries(entityConfig).forEach(([key, relation]) => {
                    // Check if relation data is already available in rowData (to avoid API calls)
                    const relationFieldName = relation.dropdownKey;

                    // Handle both single object and array of objects in relation data
                    const hasRelationDataInRowData = rowData?.[relationFieldName] &&
                        (typeof rowData[relationFieldName] === 'object');

                    let relationData: any[] = [];
                    // If we have the relation data in rowData
                    if (isEditing) {
                        // Use both data from API and any existing relation data from rowData
                        relationData = relatedDropdownData[relation.dropdownKey] || [];

                        // If we have relation data in the rowData and it's not already in relationData
                        if (hasRelationDataInRowData) {
                            if (Array.isArray(rowData[relationFieldName])) {
                                // For array relations, add any items not already in relationData
                                const existingIds = relationData.map(item => item.id);
                                const newItems = rowData[relationFieldName]
                                    .filter(item => item && item.id && !existingIds.includes(item.id));

                                if (newItems.length > 0) {
                                    relationData = [...relationData, ...newItems];
                                }
                            } else if (rowData[relationFieldName].id) {
                                // For single object relation, check if it's already in relationData
                                const existingItem = relationData.find(item =>
                                    item.id === rowData[relationFieldName].id);

                                if (!existingItem) {
                                    // Add the single related object if not already present
                                    relationData = [...relationData, rowData[relationFieldName]];
                                }
                            }
                        }
                    }

                    customRelationshipFields[key] = {
                        label: relation.labelField || formatFieldName(key),
                        fieldName: relation.idField,
                        relationType: relation.relatedEntity,
                        relationData: relationData,
                        isMultiple: relation.isMultiple || Array.isArray(rowData?.[relationFieldName])
                    };
                });
            }
        }

        // Use columns metadata if available
        const columnDefs = columns ?
            columns.reduce((acc, col) => ({...acc, [col.key]: col}), {} as Record<string, ColumnDef>) :
            null;

        Object.entries(data).forEach(([key, value]) => {
            // Skip excluded fields and fields marked as hidden in columns definition
            if (excludedFields.includes(key) ||
                key === 'id' ||
                key === 'status' ||
                (columnDefs && columnDefs[key]?.hidden) ||
                // Also exclude fields that match any of the audit field patterns in new mode
                (isNewRow && excludedFields.some(pattern => key.toLowerCase().includes(pattern.toLowerCase()))) ||
                // Skip fields that will be handled by custom relationship dropdowns
                (Object.values(customRelationshipFields).some(field => field.fieldName === key))) {
                return;
            }

            // Separate audit fields into their own category but don't exclude them when NOT in new mode
            if (!isNewRow && (
                key === 'createdBy' || key === 'updatedBy' || key === 'lastUpdatedBy' ||
                key === 'createdDate' || key === 'lastModifiedDate' || key === 'updatedDate' ||
                key === 'createdAt' || key === 'updatedAt' || // Add explicit checks for these fields
                key.toLowerCase().includes('created') || key.toLowerCase().includes('updated') ||
                key.toLowerCase().includes('modified'))) {

                // For date values
                if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                    auditFields[key] = value;
                } else {
                    auditFields[key] = value;
                }
                return;
            }

            if (value !== null && typeof value === 'object') {
                if (value instanceof Date) {
                    dateFields[key] = value;
                } else {
                    // Skip complex fields (related objects) - they should only appear in dedicated tabs
                    return;
                }
            } else if (
                typeof value === 'string' &&
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
            ) {
                dateFields[key] = value;
            } else {
                simpleFields[key] = value;
            }
        });

        // Special handling for Rewards - Add image section before other fields
        const imageSection = entityType === ObjectType.Reward ? (
            <div>
                <h3 className="text-md font-medium text-gray-300 mb-3 border-b border-[#3c3c3c] pb-1">
                    Image
                </h3>
                <div className="mb-6">
                    <ImageDetailField
                        label="Reward Image"
                        value={(data.media?.id ? `${apiConfig.baseUrl}/public/media/file/${data.media.id}` : undefined)}
                        isEditing={isEditing}
                        onChange={async (file) => {
                            if (file) {
                                try {
                                    const formData = new FormData();
                                    formData.append('file', file);

                                    const response = await fetch(`${apiConfig.baseUrl}/upload/media`, {
                                        method: 'POST',
                                        headers: {
                                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                                        },
                                        body: formData,
                                    });

                                    if (!response.ok) {
                                        throw new Error('Failed to upload image');
                                    }

                                    const result = await response.json();
                                    handleFieldChange('mediaId', result.data?.id);
                                } catch (error) {
                                    console.error('Error uploading image:', error);
                                }
                            } else {
                                handleFieldChange('mediaId', null);
                            }
                        }}
                        onDelete={() => {
                            if (data.media?.id && !isEditing) {
                                // Open the modal and set the media ID to delete
                                setMediaToDelete(data.media.id);
                                setIsDeleteModalOpen(true);
                            }
                        }}
                    />
                </div>
            </div>
        ) : null;

        // Handler for the actual delete operation
        const handleDeleteImage = async () => {
            if (!mediaToDelete) return;

            try {
                const response = await fetch(`${apiConfig.baseUrl}/media/${mediaToDelete}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete image');
                }

                // After successful deletion, refresh the page
                window.location.reload();
            } catch (error) {
                console.error('Error deleting image:', error);
                alert('Failed to delete image. Please try again.');
            } finally {
                // Close the modal
                setIsDeleteModalOpen(false);
                setMediaToDelete(null);
            }
        };

        return (
            <div className="space-y-6 p-4 bg-[#1e1e1e] rounded border border-[#3c3c3c]">
                <h2 className="text-lg font-medium text-white border-b border-[#3c3c3c] pb-2">
                    {title} {isEditing && <span className="text-[#007acc] ml-2">(Edit Mode)</span>}
                </h2>

                {/* Add Image Section for Rewards */}
                {imageSection}

                {(viewIdField.viewId || statusField.status) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {viewIdField.viewId && (
                            <div className="bg-[#252525] p-3 rounded">
                                <div className="text-sm text-gray-400 mb-1">ID</div>
                                <div className="font-medium">{viewIdField.viewId}</div>
                            </div>
                        )}

                        {statusField.status && (
                            <div className="bg-[#252525] p-3 rounded">
                                <div className="text-sm text-gray-400 mb-1">Status</div>
                                <div>
                                    {isEditing ? (
                                        <select
                                            className="w-full bg-[#2d2d2d] text-white p-2 rounded border border-[#3c3c3c]"
                                            value={editedData.status || ''}
                                            onChange={(e) => handleFieldChange('status', e.target.value)}
                                        >
                                            {getStatusOptions().map(option => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${statusField.status === 'ACTIVE' ? 'bg-green-800 text-green-200' :
                                                statusField.status === 'INACTIVE' ? 'bg-red-800 text-red-200' :
                                                    'bg-gray-800 text-gray-200'
                                            }`}>
                      {statusField.status}
                    </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Add custom relationship fields (like region dropdown for provinces) */}
                {Object.keys(customRelationshipFields).length > 0 && (
                    <div>
                        <h3 className="text-md font-medium text-gray-300 mb-3 border-b border-[#3c3c3c] pb-1">
                            Relationship Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(customRelationshipFields).map(([key, fieldInfo]) => (
                                <div key={key} className="bg-[#252525] p-3 rounded">
                                    <div className="text-sm text-gray-400 mb-1">{fieldInfo.label}</div>
                                    <div className="font-medium">
                                        {isEditing ? (
                                            loading?.regionsDropdown ? (
                                                <div className="flex items-center">
                                                    <Loader className="h-4 w-4 text-[#007acc] animate-spin mr-2"/>
                                                    <span>Loading...</span>
                                                </div>
                                            ) : (
                                                <select
                                                    className="w-full bg-[#2d2d2d] text-white p-2 rounded border border-[#3c3c3c]"
                                                    value={editedData[fieldInfo.fieldName] || ''}
                                                    onChange={(e) => handleFieldChange(fieldInfo.fieldName, e.target.value ? Number(e.target.value) : null)}
                                                >
                                                    <option value="">Select {fieldInfo.label}</option>
                                                    {fieldInfo.relationData.map(item => (
                                                        <option key={item.id} value={item.id}>
                                                            {item.name || item.code || `ID: ${item.id}`}
                                                        </option>
                                                    ))}
                                                </select>
                                            )
                                        ) : (
                                            (() => {
                                                console.log("check load details");
                                                // 1. First, check if there's a nested object in the data
                                                const relationFieldName = fieldInfo.fieldName.replace('Id', '');

                                                // Handle array of related objects
                                                if (data[relationFieldName] && Array.isArray(data[relationFieldName])) {
                                                    const relatedObjects = data[relationFieldName];
                                                    if (relatedObjects.length > 0) {
                                                        // Format and join multiple related objects
                                                        return relatedObjects
                                                            .map(obj => obj.name || obj.code || `ID: ${obj.id}`)
                                                            .join(', ');
                                                    }
                                                }

                                                // Handle single related object
                                                if (data[relationFieldName] && typeof data[relationFieldName] === 'object') {
                                                    const relatedObject = data[relationFieldName];
                                                    if (relatedObject && relatedObject.id) {
                                                        return relatedObject.name || relatedObject.code || `ID: ${relatedObject.id}`;
                                                    }
                                                }

                                                // 2. Check the relation key directly in dropdownKey format
                                                if (data[fieldInfo.relationType.toLowerCase() + 's'] && Array.isArray(data[fieldInfo.relationType.toLowerCase() + 's'])) {
                                                    const relatedArray = data[fieldInfo.relationType.toLowerCase() + 's'];
                                                    if (relatedArray.length > 0) {
                                                        return relatedArray
                                                            .map((obj: any) => obj.name || obj.code || `ID: ${obj.id}`)
                                                            .join(', ');
                                                    }
                                                }

                                                // 3. Next, check for the ID field directly
                                                const relatedId = data[fieldInfo.fieldName];
                                                if (relatedId !== undefined && relatedId !== null) {
                                                    // 4. Try to find from already loaded relation data without API call
                                                    if (fieldInfo.relationData && fieldInfo.relationData.length > 0) {
                                                        // Handle case when ID is an array
                                                        if (Array.isArray(relatedId)) {
                                                            const matchedItems = fieldInfo.relationData.filter(item =>
                                                                relatedId.includes(item.id)
                                                            );
                                                            if (matchedItems.length > 0) {
                                                                return matchedItems
                                                                    .map(item => item.name || item.code || `ID: ${item.id}`)
                                                                    .join(', ');
                                                            }
                                                        } else {
                                                            // Handle single ID case
                                                            const relatedItem = fieldInfo.relationData.find(item => item.id === relatedId);
                                                            if (relatedItem) {
                                                                return relatedItem.name || relatedItem.code || `ID: ${relatedItem.id}`;
                                                            }
                                                        }
                                                    }

                                                    // 5. If we can't find it in relationData, just return the ID(s)
                                                    if (Array.isArray(relatedId)) {
                                                        return relatedId.map(id => `ID: ${id}`).join(', ');
                                                    }
                                                    return `ID: ${relatedId}`;
                                                }

                                                // 6. If no relation data found
                                                return '-';
                                            })()
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {Object.keys(simpleFields).length > 0 && (
                    <div>
                        <h3 className="text-md font-medium text-gray-300 mb-3 border-b border-[#3c3c3c] pb-1">
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(simpleFields)
                                .filter(([key]) => {
                                    // Additional check for hidden fields based on columns definition
                                    if (columnDefs && columnDefs[key]) {
                                        return isEditing ? columnDefs[key].editable !== false : true;
                                    }
                                    return true;
                                })
                                .map(([key, value]) => (
                                    <div key={key} className="bg-[#252525] p-3 rounded">
                                        <div className="text-sm text-gray-400 mb-1">{formatFieldName(key)}</div>
                                        <div className="font-medium overflow-hidden text-ellipsis">
                                            {isEditing
                                                ? renderEditableField(key, value, columnDefs?.[key]?.fieldType === 'BOOLEAN' ? 'boolean' : typeof value)
                                                : columnDefs?.[key]?.fieldType === 'BOOLEAN'
                                                    ? <input type="checkbox" disabled checked={!!value}/>
                                                    : formatFieldValue(value)
                                            }
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {Object.keys(dateFields).length > 0 && (
                    <div>
                        <h3 className="text-md font-medium text-gray-300 mb-3 border-b border-[#3c3c3c] pb-1">
                            Date & Time Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(dateFields)
                                .filter(([key]) => {
                                    // Only filter out currentServerTime in edit mode, not audit fields
                                    if (isEditing && key === 'currentServerTime') {
                                        return false;
                                    }

                                    // Filter out created/updated fields in new mode
                                    if (isNewRow && (
                                        key === 'createdAt' || key === 'updatedAt' ||
                                        key.toLowerCase().includes('created') ||
                                        key.toLowerCase().includes('updated')
                                    )) {
                                        return false;
                                    }

                                    // Additional check for hidden fields based on columns definition
                                    if (columnDefs && columnDefs[key]) {
                                        return isEditing ? columnDefs[key].editable !== false : true;
                                    }

                                    return true;
                                })
                                .map(([key, value]) => (
                                    <div key={key} className="bg-[#252525] p-3 rounded">
                                        <div className="text-sm text-gray-400 mb-1">{formatFieldName(key)}</div>
                                        <div className="font-medium">
                                            {isEditing && !key.includes('created') && !key.includes('updated') && !key.includes('modified')
                                                ? renderEditableField(key, value, 'datetime')
                                                : formatFieldValue(value)
                                            }
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}


                {/* Only show Audit Information section if we have audit fields AND we're not adding a new entity */}
                {Object.keys(auditFields).length > 0 && !isNewRow && (
                    <div>
                        <h3 className="text-md font-medium text-gray-300 mb-3 border-b border-[#3c3c3c] pb-1">
                            Audit Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(auditFields).map(([key, value]) => (
                                <div key={key} className="bg-[#252525] p-3 rounded">
                                    <div className="text-sm text-gray-400 mb-1">{formatFieldName(key)}</div>
                                    <div className="font-medium">{formatFieldValue(value)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {isEditing && (
                    <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-[#3c3c3c]">
                        <button
                            className="flex items-center px-4 py-2 bg-[#3c3c3c] text-white rounded hover:bg-[#4c4c4c]"
                            onClick={onCancelEdit}
                            type="button"
                        >
                            <X size={16} className="mr-2"/> {isNewRow ? "Cancel Add" : "Cancel Edit"}
                        </button>
                        <button
                            className="flex items-center px-4 py-2 bg-[#007acc] text-white rounded hover:bg-[#0069ac]"
                            onClick={() => onSaveEdit && onSaveEdit(editedData)}
                            type="button"
                        >
                            <Save size={16} className="mr-2"/> {isNewRow ? "Create" : "Save Changes"}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // Render search item details tab
    const renderSearchItemTab = (tabKey: string) => {
        console.log(`Rendering search tab for key: ${tabKey}, search:`, search);

        if (!search || !search[tabKey as unknown as ObjectType]) {
            return <div className="p-4 text-center text-gray-400">No search data available for {tabKey}</div>;
        }

        const searchItem = search[tabKey as unknown as ObjectType];
        console.log(`Search item for ${tabKey}:`, searchItem);

        if (searchItem?.data?.data) {
            return renderEntityDetails(
                searchItem.data.data,
                `${formatTabLabel(tabKey)} Information`
            );
        }

        return <div className="p-4 text-center text-gray-400">No details available for {formatTabLabel(tabKey)}</div>;
    };

    // Helper function to determine if a tab represents a single object vs a table
    const isSingleObjectRelationship = (tabName: string): boolean => {
        // Single object relationships (many-to-one) - these show as detail forms
        const singleObjectTabs = [
            // Geographic relationships
            'province', 'region',
            // User/Role relationships
            'user', 'role', 'permission',
            // Event relationships (when referencing a single event)
            'event',
            // Participant relationships (when referencing a single participant)
            'participant',
            // Reward relationships (when referencing a single reward)
            'reward',
            // Golden Hour relationships
            'goldenHour',
            // Audit relationships
            'auditLog'
        ];
        return singleObjectTabs.includes(tabName);
    };

    // Helper function to determine if a single object relationship should show complex entity tabs
    const shouldShowComplexEntityTabs = (tabName: string): boolean => {
        // These entity types should show their own related tabs when displayed as single objects
        const complexEntityTabs = [
            'region',     // Region should show provinces and eventLocations tabs
            'province',   // Province should show participants and eventLocations tabs
            'event',      // Event should show eventLocations, rewards, participants, goldenHours tabs
            'user',       // User should show participants, auditLogs, role tabs
            'role'        // Role should show users, permissions tabs
        ];

        // Don't show complex tabs if we're already in the context of that entity type
        const currentEntityTypeName = ObjectType[entityType].toLowerCase();
        const currentEntityPluralName = currentEntityTypeName + 's'; // eventLocation -> eventLocations

        // If the complex entity would show a tab for the current entity type, simplify it
        if (complexEntityTabs.includes(tabName)) {
            const relatedTabsForEntity = getAutoRelatedTables(getObjectTypeForTab(tabName));
            const wouldShowCurrentEntity = relatedTabsForEntity.some(relatedTab =>
                relatedTab === currentEntityTypeName ||
                relatedTab === currentEntityPluralName ||
                relatedTab === ObjectType[entityType]
            );

            // If it would create a circular reference, don't show complex tabs
            if (wouldShowCurrentEntity) {
                return false;
            }
        }

        return complexEntityTabs.includes(tabName);
    };

    // Render single object tab (for many-to-one relationships)
    const renderSingleObjectTab = (tabName: string, objectType: ObjectType) => {
        const relationshipField = getRelationshipField(tabName, entityType);
        const relationshipValue = getRelationshipValue(tabName, entityType, rowData);
        const tabId = `${objectType}-single`;

        console.log("🔍 DEBUG: renderSingleObjectTab called");
        console.log("🔍 DEBUG: tabName:", tabName);
        console.log("🔍 DEBUG: objectType:", objectType);
        console.log("🔍 DEBUG: entityType:", entityType);
        console.log("🔍 DEBUG: relationshipField:", relationshipField);
        console.log("🔍 DEBUG: relationshipValue:", relationshipValue);
        console.log("🔍 DEBUG: rowData:", rowData);
        console.log("🔍 DEBUG: rowData keys:", rowData ? Object.keys(rowData) : 'no rowData');

        if (!relationshipField) {
            console.log("��� DEBUG: No relationship field configured");
            return (
                <div className="p-4 text-center text-gray-400">
                    <p>No relationship field configured for {formatTabLabel(tabName)} in {entityType.toLowerCase()}</p>
                    <p className="text-xs mt-2">Debug: relationshipField = {relationshipField}</p>
                </div>
            );
        }

        if (!relationshipValue) {
            console.log("🔍 DEBUG: No relationship data found");
            return (
                <div className="p-4 text-center text-gray-400">
                    <p>No {formatTabLabel(tabName)} associated with this {entityType.toLowerCase()}</p>
                    <p className="text-xs mt-2">Debug: looking for field '{relationshipField}' in rowData</p>
                    <p className="text-xs">Available fields: {rowData ? Object.keys(rowData).join(', ') : 'none'}</p>
                </div>
            );
        }

        // Check if we're loading this single object
        if (loading[tabId]) {
            return (
                <div className="p-8 flex flex-col items-center justify-center">
                    <Loader className="h-8 w-8 text-[#007acc] animate-spin mb-2"/>
                    <p className="text-gray-400">Loading {formatTabLabel(tabName)} details...</p>
                </div>
            );
        }

        // Check for errors
        if (error[tabId]) {
            return (
                <div className="p-6 text-center">
                    <div className="bg-red-900/20 p-4 rounded-md mb-3">
                        <p className="text-red-400 mb-2">{error[tabId]}</p>
                        <button
                            onClick={() => loadSingleObjectData(tabName, objectType)}
                            className="bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white px-3 py-1 rounded"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            );
        }

        // Check if we have the related object data
        const relatedObjectData = relatedTableData[tabId];
        if (relatedObjectData?.rows?.[0]?.data) {
            // Check if this entity should show complex tabs with related entities
            if (shouldShowComplexEntityTabs(tabName)) {
                // Create a table row for the complex entity
                const complexEntityTableRow: TabTableRow = {
                    data: relatedObjectData.rows[0].data,
                    relatedTables: getAutoRelatedTables(objectType)
                };

                // Render a full EntityDetailTabs component for complex entities
                return (
                    <EntityDetailTabs
                        tableRow={complexEntityTableRow}
                        entityType={objectType}
                        tableInfo={relatedObjectData}
                        search={search}
                        columns={columns}
                        excludedStatusOptions={excludedStatusOptions}
                    />
                );
            } else {
                // Render simple entity details for basic relationships
                return renderEntityDetails(relatedObjectData.rows[0].data, `${formatTabLabel(tabName)} Details`);
            }
        }

        // If no data yet, load it
        if (!loadedTabs[tabId]) {
            loadSingleObjectData(tabName, objectType);
            return (
                <div className="p-8 flex flex-col items-center justify-center">
                    <Loader className="h-8 w-8 text-[#007acc] animate-spin mb-2"/>
                    <p className="text-gray-400">Loading {formatTabLabel(tabName)} details...</p>
                </div>
            );
        }

        return (
            <div className="p-4 text-center text-gray-400">
                <p>No {formatTabLabel(tabName)} data available</p>
            </div>
        );
    };

    // Render related table tab (for one-to-many relationships)
    const renderRelatedTableTab = (tabName: string) => {
        console.log("🔍 DEBUG: renderRelatedTableTab called for:", tabName);
        console.log("🔍 DEBUG: entityType:", entityType);

        const objectType = getObjectTypeForTab(tabName);
        if (!objectType) {
            return <div>Unknown object type for {tabName}</div>;
        }

        const tabId = String(objectType);
        // Check if this is a single object relationship (many-to-one)
        const isSingleObject = !isOneToMany(entityType, tabName);
        console.log("🔍 DEBUG: isOneToMany(", entityType, ",", tabName, ") =", isOneToMany(entityType, tabName));
        console.log("🔍 DEBUG: isSingleObject:", isSingleObject);

        if (isSingleObject) {
            console.log("🔍 DEBUG: Rendering single object tab for:", tabName);
            return renderSingleObjectTab(tabName, objectType);
        }

        // Handle table relationships (one-to-many)
        console.log("🔍 DEBUG: Rendering table tab for:", tabName);
        console.log("🔍 DEBUG: relatedTableData for", tabId, ":", relatedTableData[tabId]);

        if (loading[tabId]) {
            return (
                <div className="flex items-center justify-center py-8">
                    <Loader className="h-6 w-6 animate-spin text-blue-500"/>
                    <span className="ml-2 text-gray-400">Loading {formatTabLabel(tabName)}...</span>
                </div>
            );
        }

        if (error[tabId]) {
            return (
                <div className="flex items-center justify-center py-8 text-red-400">
                    <AlertCircle className="h-6 w-6 mr-2"/>
                    <span>Error loading {formatTabLabel(tabName)}: {error[tabId]}</span>
                </div>
            );
        }

        const tableData = relatedTableData[tabId];
        if (!tableData) {
            return (
                <div className="text-gray-400 py-4">
                    No {formatTabLabel(tabName)} data available
                </div>
            );
        }

        console.log("🔍 DEBUG: Table data for", tabName, ":", tableData);
        console.log("🔍 DEBUG: Number of rows:", tableData.rows?.length || 0);

        if (!tableData.rows || tableData.rows.length === 0) {
            return (
                <div className="text-gray-400 py-4">
                    No {formatTabLabel(tabName)} found
                </div>
            );
        }

        // Convert fieldNameMap to proper ColumnDef format for DataTable
        const relatedEntityColumns = tableData.fieldNameMap ?
            Object.entries(tableData.fieldNameMap).map(([key, colInfo]) => ({
                key,
                header: formatFieldName(key), // Changed from label to header
                fieldType: colInfo.fieldType || 'TEXT',
                editable: true,
                hidden: false,
                sortable: true,
                filterable: true,
                render: undefined
            } as ColumnDef)) : [];
        console.log("🔍 DEBUG: Using columns from related entity:", relatedEntityColumns);

        // Render the data table with entity-specific columns
        return (
            <div className="mt-4">
                <DataTable
                    data={tableData}
                    columns={relatedEntityColumns}
                    entityType={objectType}
                    search={search}
                    showDetailView={true}
                    showSearchBox={false}
                />
            </div>
        );
    };

    // Helper to get the foreign key field name for a relationship
    const getRelationshipField = (tabName: string, currentEntityType: ObjectType): string | null => {
        const relationshipMappings: Record<string, Partial<Record<ObjectType, string>>> = {
            // Geographic relationships
            'province': {
                [ObjectType.Participant]: 'provinceId'
            },
            'region': {
                [ObjectType.Province]: 'regionId',
                [ObjectType.EventLocation]: 'regionId'
            },

            // User/Role/Permission relationships
            'user': {
                [ObjectType.AuditLog]: 'userId'
                // Removed Participant mapping as participants don't have userId field
            },
            'role': {
                [ObjectType.User]: 'roleId'
            },
            'permission': {
                [ObjectType.Role]: 'permissionId' // if roles have specific permissions
            },

            // Event relationships (many-to-one)
            'event': {
                [ObjectType.ParticipantEvent]: 'eventId',
                [ObjectType.Reward]: 'eventId',
                [ObjectType.EventLocation]: 'eventId',
                [ObjectType.GoldenHour]: 'eventId'
            },

            // Participant relationships (many-to-one)
            'participant': {
                [ObjectType.ParticipantEvent]: 'participantId',
                [ObjectType.SpinHistory]: 'participantId'
            },

            // Reward relationships (many-to-one)
            'reward': {
                [ObjectType.SpinHistory]: 'rewardId'
            },

            // Golden Hour relationships (many-to-one)
            'goldenHour': {
                [ObjectType.SpinHistory]: 'goldenHourId'
            },

            // Audit relationships (many-to-one)
            'auditLog': {
                // AuditLog might reference other entities
            }
        };

        return relationshipMappings[tabName]?.[currentEntityType] || null;
    };

    // Helper to create mock related object data
    const createMockRelatedObject = (objectType: ObjectType, id: any) => {
        // Create basic mock object based on type
        const baseObject = {
            id: id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        switch (objectType) {
            case ObjectType.Province:
                return {
                    ...baseObject,
                    name: `Province ${id}`,
                    code: `P${String(id).padStart(3, '0')}`,
                    regionId: Math.floor(Math.random() * 5) + 1,
                    population: Math.floor(Math.random() * 10000000) + 500000,
                    area: Math.floor(Math.random() * 50000) + 5000,
                    active: true
                };
            case ObjectType.Region:
                return {
                    ...baseObject,
                    name: `Region ${id}`,
                    code: `R${String(id).padStart(2, '0')}`,
                    description: `Description for Region ${id}`,
                    active: true
                };
            case ObjectType.User:
                return {
                    ...baseObject,
                    username: `user${id}`,
                    email: `user${id}@example.com`,
                    fullName: `User ${id}`,
                    roleId: Math.floor(Math.random() * 3) + 1,
                    active: true
                };
            case ObjectType.Role:
                return {
                    ...baseObject,
                    name: `Role ${id}`,
                    description: `Description for Role ${id}`,
                    active: true
                };
            case ObjectType.Event:
                return {
                    ...baseObject,
                    name: `Event ${id}`,
                    description: `Description for Event ${id}`,
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days later
                    status: 'ACTIVE',
                    active: true
                };
            case ObjectType.Reward:
                return {
                    ...baseObject,
                    name: `Reward ${id}`,
                    description: `Description for Reward ${id}`,
                    type: 'CASH',
                    value: Math.floor(Math.random() * 1000000) + 10000,
                    quantity: Math.floor(Math.random() * 100) + 1,
                    active: true
                };
            case ObjectType.GoldenHour:
                return {
                    ...baseObject,
                    name: `Golden Hour ${id}`,
                    startTime: '18:00:00',
                    endTime: '20:00:00',
                    multiplier: Math.floor(Math.random() * 5) + 2,
                    active: true
                };
            case ObjectType.Participant:
                return {
                    ...baseObject,
                    firstName: `First${id}`,
                    lastName: `Last${id}`,
                    email: `participant${id}@example.com`,
                    phone: `+84${Math.floor(Math.random() * 1000000000)}`,
                    active: true
                };
            default:
                return baseObject;
        }
    };

    // Helper to determine if a relationship is one-to-many
    const isOneToMany = (parentEntityType: ObjectType, relatedTabName: string): boolean => {
        const oneToManyMappings: Partial<Record<ObjectType, string[]>> = {
            // One-to-many relationships (parent has many children)
            [ObjectType.Event]: ['eventLocations', 'rewards', 'participants', 'goldenHours'],
            [ObjectType.Participant]: ['participantEvents', 'spinHistory'],
            [ObjectType.Province]: ['participants', 'eventLocations'],
            [ObjectType.Region]: ['provinces', 'eventLocations'],
            [ObjectType.User]: ['participants', 'auditLogs'],
            [ObjectType.Role]: ['users'],
            [ObjectType.Permission]: ['roles'],

            // For child entities, they typically have many-to-one relationships (not one-to-many)
            // EventLocation has: event (many-to-one), region (many-to-one), but participants (one-to-many)
            [ObjectType.EventLocation]: ['participants'], // EventLocation can have many participants
            [ObjectType.Reward]: [], // Reward doesn't have one-to-many relationships
            [ObjectType.GoldenHour]: [], // GoldenHour doesn't have one-to-many relationships
            [ObjectType.SpinHistory]: [], // SpinHistory doesn't have one-to-many relationships
            [ObjectType.ParticipantEvent]: [], // ParticipantEvent doesn't have one-to-many relationships
            [ObjectType.AuditLog]: [], // AuditLog doesn't have one-to-many relationships
            [ObjectType.JobImportHistory]: ['jobImportHistoryDetail'],
            [ObjectType.RewardDistribute]: ['dailyRewardDistribution']
        };

        return oneToManyMappings[parentEntityType]?.includes(relatedTabName) || false;
    };

    // Helper to get the field name in the child entity that references the parent
    const getOneToManyRelationshipField = (parentEntityType: ObjectType, relatedTabName: string): string | null => {
        const fieldMappings: Record<string, Partial<Record<ObjectType, string>>> = {
            // For EventLocation entities, find by eventId or regionId
            'eventLocations': {
                [ObjectType.Event]: 'event.id',
                [ObjectType.Reward]: 'region.id',
                [ObjectType.Region]: 'region.id',
                [ObjectType.Province]: 'region.provinces.id'

            },
            // For Reward entities, find by eventId
            'rewards': {
                [ObjectType.Event]: 'rewardEvents.eventLocation.event.id'
            },
            // For Participant entities, find by provinceId, eventId (through EventLocation), etc.
            'participants': {
                [ObjectType.EventLocation]: 'eventId', // Participants in specific EventLocation
                [ObjectType.Province]: 'province.id',
                [ObjectType.Event]: 'participantEvents.eventLocation.event.id' // through ParticipantEvent
            },
            // For SpinHistory entities, find by participantId, rewardId, etc.
            'spinHistory': {
                [ObjectType.Participant]: 'participantEvent.participant.id', // SpinHistory for specific Participant
                [ObjectType.Reward]: 'reward.d',
                [ObjectType.GoldenHour]: 'goldenHour.id'
            },
            // For Province entities, find by regionId
            'provinces': {
                [ObjectType.Region]: 'regions.id', // Provinces in specific Region
            },
            // For AuditLog entities, find by userId
            'auditLogs': {
                [ObjectType.User]: 'user.id'
            },
            // For User entities, find by roleId
            'users': {
                [ObjectType.Role]: 'role.id'
            },
            // For ParticipantEvent entities, find by participant
            'participantEvents': {
                [ObjectType.Participant]: 'participant.id', // Participants in specific EventLocation
            },
            'jobImportHistoryDetail': {
                [ObjectType.JobImportHistory]: 'jobImportHistory.id', // Participants in specific EventLocation
            },
            'goldenHours': {
                [ObjectType.Event]: 'eventLocation.event.id' // Golden Hours for specific Event
            },
            'event': {
                [ObjectType.Reward]: 'locations.rewardEvents.reward.id' // Event Locations for specific Event
            },
            'dailyRewardDistribution': {
                [ObjectType.RewardDistribute]: 'rewardDistribute.id' // Event Locations for specific Event
            }
        };
        return fieldMappings[relatedTabName]?.[parentEntityType] || null;
    };

    // Helper to get the actual relationship value, handling both ID fields and nested objects
    const getRelationshipValue = (tabName: string, entityType: ObjectType, rowData: any): any => {
        const relationshipField = getRelationshipField(tabName, entityType);
        console.log("🔍 DEBUG: getRelationshipValue - tabName:", tabName);
        console.log("🔍 DEBUG: getRelationshipValue - entityType:", entityType);
        console.log("🔍 DEBUG: getRelationshipValue - relationshipField:", relationshipField);

        if (!relationshipField || !rowData) {
            return null;
        }

        // Debug: Show what's actually in the rowData
        console.log("🔍 DEBUG: Full rowData:", rowData);

        // First, try the direct field (e.g., eventId, provinceId)
        if (rowData[relationshipField] !== undefined && rowData[relationshipField] !== null) {
            console.log("🔍 DEBUG: Found direct field value:", rowData[relationshipField]);
            return rowData[relationshipField];
        }

        // If not found, try the nested object approach (e.g., event.id, province.id)
        const objectFieldName = relationshipField.replace('Id', ''); // eventId -> event, provinceId -> province
        console.log("��� DEBUG: Trying object field name:", objectFieldName);

        if (rowData[objectFieldName] !== undefined && rowData[objectFieldName] !== null) {
            const nestedObject = rowData[objectFieldName];
            console.log("🔍 DEBUG: Found nested object:", nestedObject);
            console.log("🔍 DEBUG: Nested object type:", typeof nestedObject);
            console.log("🔍 DEBUG: Nested object keys:", typeof nestedObject === 'object' ? Object.keys(nestedObject) : 'not an object');

            if (typeof nestedObject === 'object' && nestedObject.id !== undefined) {
                console.log("🔍 DEBUG: Found nested object ID:", nestedObject.id);
                return nestedObject.id;
            }
            // If the nested object itself is a primitive (though unlikely), use it directly
            if (typeof nestedObject !== 'object') {
                console.log("🔍 DEBUG: Found primitive nested value:", nestedObject);
                return nestedObject;
            }
        }

        // Try some common field variations
        const commonFieldNames = [
            relationshipField,
            relationshipField.toLowerCase(),
            relationshipField.replace('Id', '_id'),
            objectFieldName + '_id',
            objectFieldName,
            // Additional variations for composite keys
            relationshipField.replace('Id', ''),
            tabName + 'Id',
            tabName.toLowerCase() + 'Id',
            tabName + '_id',
        ];

        console.log("🔍 DEBUG: Trying common field names:", commonFieldNames);

        for (const fieldName of commonFieldNames) {
            if (rowData[fieldName] !== undefined && rowData[fieldName] !== null) {
                const fieldValue = rowData[fieldName];
                console.log("🔍 DEBUG: Found field", fieldName, "with value:", fieldValue, "type:", typeof fieldValue);

                // If it's an object, try to get the ID
                if (typeof fieldValue === 'object' && fieldValue.id !== undefined) {
                    console.log("🔍 DEBUG: Found object with ID in field", fieldName, ":", fieldValue.id);
                    return fieldValue.id;
                }
                // If it's a primitive value
                if (typeof fieldValue !== 'object') {
                    console.log("🔍 DEBUG: Found primitive value in field", fieldName, ":", fieldValue);
                    return fieldValue;
                }
            }
        }

        console.log("🔍 DEBUG: No relationship value found, tried fields:", commonFieldNames);
        console.log("🔍 DEBUG: Available rowData keys:", Object.keys(rowData));

        // Final attempt: Look for any field that contains an object with an ID
        for (const [key, value] of Object.entries(rowData)) {
            if (key.toLowerCase().includes(tabName.toLowerCase()) && typeof value === 'object' && value && (value as any).id) {
                console.log("🔍 DEBUG: Found potential match by name similarity:", key, "with ID:", (value as any).id);
                return (value as any).id;
            }
        }

        return null;
    };

    // Load data when entityType or tableRow changes
    useEffect(() => {
        // Reset loaded tabs when entityType or tableRow changes
        setLoadedTabs({details: true});
        setActiveTab('details');
    }, [entityType, tableRow]);

    if (!rowData || Object.keys(rowData).length === 0) {
        const emptyData = {
            status: 'ACTIVE', // Default status for new entities
            // Add any other default values needed for new entities
        };

        if (isEditing) {
            // When creating a new entity, show only the edit form
            return (
                <div className="space-y-6 p-4 bg-[#1e1e1e] rounded border border-[#3c3c3c]">
                    <h2 className="text-lg font-medium text-white border-b border-[#3c3c3c] pb-2">
                        Create New {entityType} <span className="text-[#007acc] ml-2">(Edit Mode)</span>
                    </h2>

                    {/* Render edit form with empty data */}
                    {renderEntityDetails(emptyData, `New ${entityType}`)}
                </div>
            );
        }

        console.warn("EntityDetailTabs: No rowData available");
        return <div className="p-4 text-center text-gray-400">No entity data available</div>;
    }

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-[#252525] border-b border-[#3c3c3c] w-full flex overflow-x-auto">
                {allTabs.map(tab => (
                    <TabsTrigger
                        key={tab}
                        value={tab}
                        className="data-[state=active]:bg-[#2a2d2e] data-[state=active]:shadow-none"
                        disabled={isEditing && tab !== 'details'}
                    >
                        {formatTabLabel(tab)}
                    </TabsTrigger>
                ))}
            </TabsList>

            <TabsContent value="details" className="pt-4">
                {renderEntityDetails(rowData, `${entityType} Details`)}
            </TabsContent>

            {searchTabs.map((tab: string) => (
                <TabsContent key={tab} value={tab} className="pt-4">
                    {activeTab === tab && renderSearchItemTab(tab)}
                </TabsContent>
            ))}

            {relatedTables.map((tab: string) => (
                <TabsContent key={tab} value={tab} className="pt-4">
                    {activeTab === tab && renderRelatedTableTab(tab)}
                </TabsContent>
            ))}
        </Tabs>
    );
};

