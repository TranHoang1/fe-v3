import { ReactNode } from 'react';
import { ColumnInfo, TableRow, SortType } from '@/app/lib/api/interfaces';

export interface ColumnDef {
  key: string;
  header: string;
  fieldType: string;
  sortable: boolean;
  filterable: boolean;
  render?: (value: any, row: TableRow) => ReactNode;
  editable?: boolean;
  hidden?: boolean;
}

export interface ActionDef {
  label: string;
  onClick: (row: TableRow | null) => void;
  color?: 'blue' | 'red' | 'green' | 'yellow' | 'gray';
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  showCondition?: (row: TableRow) => boolean;
  showDetail?: boolean;
  isTableAction?: boolean;
}

export const safeRenderValue = (value: any): ReactNode => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') {
    if (value instanceof Date) return value.toLocaleString();
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) return new Date(value).toLocaleString();
    if (value?.id && value?.name) return value.name;
    if (value?.token && value?.tokenType) return `${value.tokenType}: ${value.token.substring(0, 10)}...`;
    return '{Object}';
  }
  if (typeof value === 'boolean') return value ? '✓' : '✗';
  return String(value);
};

export const generateColumnsFromFieldMap = (fieldNameMap: Record<string, ColumnInfo>): ColumnDef[] => {
  if (!fieldNameMap) return [];
  return Object.entries(fieldNameMap).map(([key, columnInfo]) => {
    let renderer: ((value: any, row: TableRow) => ReactNode) | undefined;
    const headerText = columnInfo.fieldName.charAt(0).toUpperCase() + columnInfo.fieldName.slice(1).replace(/([A-Z])/g, ' $1');
    if (columnInfo.fieldType === 'BOOLEAN') renderer = (value) => value === true ? '✓' : value === false ? '✗' : '-';
    if (['DATETIME', 'DATE'].includes(columnInfo.fieldType)) renderer = (value) => value ? new Date(value).toLocaleString() : '-';
    if (key === 'status') renderer = (value) => (
      <span className={`px-2 py-1 rounded-full text-xs ${value === 'ACTIVE' ? 'bg-green-800 text-green-200' : value === 'INACTIVE' ? 'bg-red-800 text-red-200' : 'bg-gray-800 text-gray-200'}`}>
        {value}
      </span>
    );
    const isIdField = key === 'id';
    const isViewIdField = key === 'viewId';
    const isUnsortable = columnInfo.sortType === SortType.UNSORTABLE && !isViewIdField;
    const shouldHide = isIdField || key === 'currentServerTime';
    const isEditable = !['id', 'viewId', 'version', 'createdBy', 'updatedBy', 'createdDate', 'lastModifiedDate'].includes(key);
    return {
      key,
      header: key === 'viewId' ? 'ID' : headerText,
      fieldType: columnInfo.fieldType,
      sortable: isViewIdField ? true : !isUnsortable,
      filterable: true,
      render: renderer,
      editable: isEditable && (columnInfo.editable !== false),
      hidden: shouldHide,
    };
  }).sort((a, b) => {
    if (a.key === 'viewId') return -1;
    if (b.key === 'viewId') return 1;
    if (a.key === 'status') return -1;
    if (b.key === 'status') return 1;
    return a.key.localeCompare(b.key);
  });
};