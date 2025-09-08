import {ObjectType} from './interfaces';

export interface EntityRelation {
    relatedEntity: ObjectType;
    dropdownKey: string;
    idField: string;
    displayField?: string;
    labelField?: string;
    filterField?: string;
    isMultiple?: boolean;
}

export interface EntityRelationConfig {
    [key: string]: EntityRelation;
}

export const entityRelations: Record<ObjectType, EntityRelationConfig> = {
    [ObjectType.Province]: {
        region: {
            relatedEntity: ObjectType.Region,
            dropdownKey: 'regions',
            idField: 'regionId',
            displayField: 'name',
            labelField: 'Region'
        }
    },
    [ObjectType.EventLocation]: {
        region: {
            relatedEntity: ObjectType.Region,
            dropdownKey: 'regions',
            idField: 'regionId',
            displayField: 'name',
            labelField: 'Region'
        },
        event: {
            relatedEntity: ObjectType.Event,
            dropdownKey: 'events',
            idField: 'eventId',
            displayField: 'name',
            labelField: 'Event'
        }
    },
    [ObjectType.Participant]: {
        province: {
            relatedEntity: ObjectType.Province,
            dropdownKey: 'provinces',
            idField: 'provinceId',
            displayField: 'name',
            labelField: 'Province'
        }
    },
    [ObjectType.User]: {
        role: {
            relatedEntity: ObjectType.Role,
            dropdownKey: 'roles',
            idField: 'roleId',
            displayField: 'name',
            labelField: 'Role'
        }
    },
    [ObjectType.Reward]: {},
    [ObjectType.GoldenHour]: {},
    [ObjectType.Event]: {},
    [ObjectType.Region]: {},
    [ObjectType.RewardEvent]: {
        reward: {
            relatedEntity: ObjectType.Reward,
            dropdownKey: 'rewards',
            idField: 'rewardId',
            displayField: 'name',
            labelField: 'Reward'
        },
        event: {
            relatedEntity: ObjectType.Event,
            dropdownKey: 'events',
            idField: 'eventId',
            displayField: 'name',
            labelField: 'Event'
        }
    },
    [ObjectType.SpinHistory]: {
        participant: {
            relatedEntity: ObjectType.Participant,
            dropdownKey: 'participants',
            idField: 'participantId',
            displayField: 'name',
            labelField: 'Participant'
        },
        reward: {
            relatedEntity: ObjectType.Reward,
            dropdownKey: 'rewards',
            idField: 'rewardId',
            displayField: 'name',
            labelField: 'Reward'
        }
    },
    [ObjectType.ParticipantEvent]: {
        participant: {
            relatedEntity: ObjectType.Participant,
            dropdownKey: 'participants',
            idField: 'participantId',
            displayField: 'name',
            labelField: 'Participant'
        },
        eventLocation: {
            relatedEntity: ObjectType.EventLocation,
            dropdownKey: 'eventLocations',
            idField: 'eventLocationId',
            displayField: 'description',
            labelField: 'Event Location'
        }
    },
    [ObjectType.Role]: {},
    [ObjectType.Permission]: {},
    [ObjectType.AuditLog]: {},
    [ObjectType.BlacklistedToken]: {},
    [ObjectType.Configuration]: {},
    [ObjectType.Statistics]: {},
    [ObjectType.JobImportHistory]: {},
    [ObjectType.JobImportHistoryDetail]: {
        jobImportHistory: {
            relatedEntity: ObjectType.JobImportHistory,
            dropdownKey: 'jobImportHistories',
            idField: 'jobImportHistoryId',
            displayField: 'id',
            labelField: 'Job Import History'
        }
    },
    [ObjectType.RewardDistribute]: {},
    [ObjectType.DailyRewardDistribution]: {}
}
