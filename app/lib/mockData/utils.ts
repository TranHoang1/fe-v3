import { ObjectType } from '../api/interfaces';

/**
 * Converts a string entity name (like "event" or "EVENT") to the corresponding ObjectType enum value
 */
export function stringToObjectType(entityName: string): ObjectType {
  // Normalize to uppercase
  const uppercaseEntityName = entityName.toUpperCase();
  
  // Handle special cases with underscores
  let normalizedName = uppercaseEntityName;
  if (uppercaseEntityName === 'GOLDEN_HOUR') normalizedName = 'GOLDEN_HOUR';
  else if (uppercaseEntityName === 'SPIN_HISTORY') normalizedName = 'SPIN_HISTORY';
  else if (uppercaseEntityName === 'AUDIT_LOG') normalizedName = 'AUDIT_LOG';
  else if (uppercaseEntityName === 'BLACKLISTED_TOKEN') normalizedName = 'BLACKLISTED_TOKEN';
  else if (uppercaseEntityName === 'EVENT_LOCATION') normalizedName = 'EVENT_LOCATION';
  else if (uppercaseEntityName === 'PARTICIPANT_EVENT') normalizedName = 'PARTICIPANT_EVENT';
  
  // Look up in ObjectType enum
  const objectType = ObjectType[normalizedName as keyof typeof ObjectType];
  
  if (!objectType) {
    throw new Error(`Unknown entity type: ${entityName}`);
  }
  
  return objectType;
}
