import {
    ObjectType,
    TableAction,
    TableActionRequest,
    TableActionResponse,
    TableFetchResponse,
    TableRow,
    UploadFile
} from './interfaces';
import {apiConfig, getApiUrl, objectTypeToEndpoint} from './tableService';

/**
 * Service for handling table action operations
 */

// Helper function to get API endpoint for an entity type
function getEntityEndpoint(entityType: ObjectType): string {
    // Get endpoint from mapping
    if (typeof entityType === 'object' && objectTypeToEndpoint[entityType]) {
        return objectTypeToEndpoint[entityType];
    }

    // Last resort: pluralize the entity type
    // Ensure we don't add a trailing slash
    return `${String(entityType).toLowerCase()}s`.replace(/\/+$/, '');
}

/**
 * Core function to perform any table action
 * @param action The action to perform (ADD, UPDATE, DELETE, etc)
 * @param entityType The type of entity
 * @param data The record data
 * @param tableInfo Table information from the response
 * @param uploadFile Optional file for import operations
 * @returns Promise with the response
 */
async function performTableAction(
    action: TableAction,
    entityType: ObjectType,
    data: TableRow,
    tableInfo: TableFetchResponse,
    uploadFile?: UploadFile
): Promise<TableActionResponse> {
    console.log(`Performing ${action} for entity type:`, entityType, 'with data:', data);
    try {
        // Prepare the request object
        const request: TableActionRequest = {
            objectType: entityType,
            action: action,
            entityName: entityType.toString(),
            data: data
        };

        // Add uploadFile if provided
        if (uploadFile) {
            request.uploadFile = uploadFile;
        }

        // Add filters from tableInfo if available
        if (tableInfo && tableInfo.originalRequest && tableInfo.originalRequest.filters) {
            request.filters = tableInfo.originalRequest.filters;
        }

        // Add sorts from tableInfo if available
        if (tableInfo && tableInfo.originalRequest && tableInfo.originalRequest.sorts) {
            request.sorts = tableInfo.originalRequest.sorts;
        }

        // Add search context from tableInfo if available
        if (tableInfo && tableInfo.originalRequest && tableInfo.originalRequest.search) {
            request.search = tableInfo.originalRequest.search;
        }

        const url = getApiUrl(`table-data/action/${getEntityEndpoint(entityType)}`);
        console.log('Making API call to:', url);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                ...apiConfig.headers,
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error performing ${action}:`, errorText);
            return {
                success: false,
                message: `API error: ${response.status} ${errorText || ''}`
            } as TableActionResponse;
        }

        const result = await response.json();
        console.log(`${action} API response:`, result);

        // Handle download for EXPORT action
        if (action === TableAction.EXPORT &&
            result.data && result.data.data && result.data.data.downloadToken) {
            const downloadToken = result.data.data.downloadToken;
            const fileName = result.data.data.fileName || `export.xlsx`;

            // Create the download URL
            const downloadUrl = getApiUrl(`table-data/download/${fileName}?token=${downloadToken}`);

            // Fetch the file with Authorization header
            const downloadResponse = await fetch(downloadUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });

            if (downloadResponse.ok) {
                const blob = await downloadResponse.blob();
                const blobUrl = window.URL.createObjectURL(blob);

                // Create a temporary link and trigger download
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Clean up the blob URL
                window.URL.revokeObjectURL(blobUrl);
            }
        }

        return {
            success: true,
            ...result
        };
    } catch (error) {
        console.error(`Error performing ${action}:`, error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error'
        } as TableActionResponse;
    }
}

/**
 * Add a new record via API
 * @param entityType The type of entity to add
 * @param data The record data to add
 * @param tableInfo Table information for the record
 * @returns Promise with the response
 */
export async function addRecord(entityType: ObjectType, data: TableRow, tableInfo: TableFetchResponse): Promise<TableActionResponse> {
    return performTableAction(TableAction.ADD, entityType, data, tableInfo);
}

/**
 * Update an existing record via API
 * @param entityType The type of entity to update
 * @param data The record data to update
 * @param tableInfo Table information for the record
 * @returns Promise with the response
 */
export async function updateRecord(entityType: ObjectType, data: TableRow, tableInfo: TableFetchResponse): Promise<TableActionResponse> {
    return performTableAction(TableAction.UPDATE, entityType, data, tableInfo);
}

/**
 * Delete a record via API
 * @param entityType The type of entity
 * @param data The record data to delete
 * @param tableInfo Table information for the record
 * @returns Promise with the response
 */
export async function deleteRecord(entityType: ObjectType, data: TableRow, tableInfo: TableFetchResponse): Promise<TableActionResponse> {
    return performTableAction(TableAction.DELETE, entityType, data, tableInfo);
}

/**
 * Simple export table data via API (legacy version)
 * @param entityType The type of entity
 * @param tableInfo Table information containing filters, sorts, etc.
 * @returns Promise with the response
 */
export async function exportTableDataBasic(
    entityType: ObjectType,
    tableInfo: TableFetchResponse
): Promise<void> {
    try {
        // Create an empty TableRow for export operations
        const data: TableRow = {data: {}};

        // Create a modified table info object that won't trigger a reload
        // We make a deep clone to avoid modifying the original object
        const modifiedTableInfo = JSON.parse(JSON.stringify(tableInfo));

        // Set special flags to prevent reload behavior
        modifiedTableInfo.noReload = true;

        await performTableAction(TableAction.EXPORT, entityType, data, modifiedTableInfo);
    } catch (error) {
        console.error('Error exporting table data:', error);
        throw error;
    }
}

/**
 * Export table data to Excel with user feedback and polling
 */
export const exportTableData = async (objectType: ObjectType, data: TableFetchResponse): Promise<boolean> => {
    try {
        // Show user feedback that export has started
        const notification = createNotification('Export started', 'Your export is being prepared...', 'info');

        // Get a proper object type string to use in the URL
        const entityType = typeof objectType === 'string'
            ? objectType.toLowerCase()
            : typeof objectType === 'object' && objectTypeToEndpoint[objectType]
                ? objectTypeToEndpoint[objectType]
                : String(objectType).toLowerCase();

        // Add 's' for pluralization if needed
        const pluralizedType = entityType.endsWith('s') ? entityType : `${entityType}s`;

        // Use the configured baseUrl from apiConfig to ensure request goes to correct server
        const apiUrl = getApiUrl(`table-data/action/${pluralizedType}`);

        console.log('Using final API URL:', apiUrl);

        // Prepare the request payload with filters and sorts from the data
        const payload = {
            action: 'EXPORT',
            objectType,
            filters: data.originalRequest?.filters || [],
            sorts: data.originalRequest?.sorts || [],
            search: data.originalRequest?.search || {},
        };

        console.log('Export request payload:', payload);

        // Use direct fetch with clean URL
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Export failed with status:', response.status);
            console.error('Error response:', errorText);
            updateNotification(notification, 'Export failed', `Server error: ${response.status}`, 'error');
            return false;
        }

        const result = await response.json();

        // Extract download token and filename from the response
        const downloadToken = result.data?.data?.downloadToken;
        const fileName = result.data?.data?.fileName;

        if (downloadToken && fileName) {
            // Create download URL with token using getApiUrl
            const downloadUrl = getApiUrl(`table-data/download/${fileName}?token=${downloadToken}`);

            // Update notification to show progress
            updateNotification(notification, 'Export in progress', 'Your file is being prepared...', 'info');

            // Start polling for file completion
            const downloadSuccess = await pollForFileCompletion(downloadUrl, fileName, notification);
            return downloadSuccess;
        } else {
            console.error('Invalid export response:', result);
            updateNotification(notification, 'Export failed', 'Invalid response from server', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error exporting data:', error);
        return false;
    }
};

/**
 * Poll the server to check if export file is ready
 */
const pollForFileCompletion = async (
    url: string,
    fileName: string,
    notificationId: string,
    maxAttempts = 30,
    initialDelay = 2000
): Promise<boolean> => {
    let attempt = 1;
    // Use while loop instead of for loop to support indefinite polling
    while (maxAttempts === -1 || attempt <= maxAttempts) {
        try {
            updateNotification(
                notificationId,
                'Export in progress',
                maxAttempts === -1
                    ? `Waiting for file to be ready... (attempt ${attempt})`
                    : `Waiting for file to be ready... (attempt ${attempt}/${maxAttempts})`,
                'info'
            );

            // Wait before checking
            await new Promise(resolve => setTimeout(resolve, initialDelay));

            // Check file status with a HEAD request first to avoid partial downloads
            const headResponse = await fetch(url, {
                method: 'HEAD',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log(`HEAD request status: ${headResponse.status}`);

            // Log headers for debugging without using iterator spread
            const headerMap: Record<string, string> = {};
            headResponse.headers.forEach((value, key) => {
                headerMap[key] = value;
            });
            console.log('Response headers:', headerMap);

            // If file is ready (status 200) or we received something other than 202
            if (headResponse.status === 200 || (headResponse.status !== 202 && headResponse.headers.get('Content-Disposition'))) {
                // Make a GET request for the actual file
                const downloadSuccess = await triggerFileDownload(url, fileName);

                if (downloadSuccess) {
                    updateNotification(notificationId, 'Export complete', 'Your file is ready', 'success');
                    return true;
                } else {
                    updateNotification(notificationId, 'Export failed', 'Download could not be started', 'error');
                    return false;
                }
            }

            // If still processing (202 status), continue polling
            if (headResponse.status === 202) {
                // Check for Retry-After header and use it if present
                const retryAfterHeader = headResponse.headers.get('Retry-After');
                let retryDelay: number;

                if (retryAfterHeader) {
                    // The Retry-After header value is in seconds, convert to milliseconds
                    retryDelay = parseInt(retryAfterHeader, 10) * 1000;
                    console.log(`Server requested retry after ${retryDelay}ms`);
                } else {
                    // If no Retry-After header, use exponential backoff
                    retryDelay = Math.min(initialDelay * 1.5, 10000);
                }

                initialDelay = retryDelay;
                attempt++; // Increment attempt counter
                continue;
            }

            // Handle other status codes
            updateNotification(
                notificationId,
                'Export failed',
                `Server returned status ${headResponse.status}`,
                'error'
            );
            return false;
        } catch (error) {
            console.error('Error polling for file:', error);
            attempt++; // Increment attempt counter even on error
        }
    }

    // Only reach here if maxAttempts is not -1 and we've exceeded it
    updateNotification(notificationId, 'Export timed out', 'File took too long to prepare', 'error');
    return false;
};

/**
 * Trigger actual file download
 */
const triggerFileDownload = async (url: string, fileName: string): Promise<boolean> => {
    return new Promise(resolve => {
        try {
            console.log(`Attempting to download file from: ${url}`);

            // Use fetch with GET method and proper headers
            fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then(response => {
                    console.log(`GET request status: ${response.status}`);

                    // Log headers for debugging without using iterator spread
                    const headerMap: Record<string, string> = {};
                    response.headers.forEach((value, key) => {
                        headerMap[key] = value;
                    });
                    console.log('Response headers:', headerMap);

                    // Check if we have a real file response
                    const contentType = response.headers.get('Content-Type');
                    const contentDisposition = response.headers.get('Content-Disposition');
                    const contentLength = response.headers.get('Content-Length');

                    console.log('Content-Type:', contentType);
                    console.log('Content-Disposition:', contentDisposition);
                    console.log('Content-Length:', contentLength);

                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    // If we still got a 202, we're not ready
                    if (response.status === 202) {
                        console.log('File still not ready (202 status)');
                        return null;
                    }

                    // Ensure we have valid content
                    if (contentLength && parseInt(contentLength, 10) <= 0) {
                        console.error('Empty response received');
                        throw new Error('Server returned empty file');
                    }

                    return response.blob();
                })
                .then(blob => {
                    // If polling returned null (still not ready), return false
                    if (!blob) {
                        resolve(false);
                        return;
                    }

                    console.log(`Received blob of type: ${blob.type}, size: ${blob.size} bytes`);

                    // Safety check - don't try to download empty files
                    if (blob.size <= 0) {
                        console.error('Empty blob received');
                        resolve(false);
                        return;
                    }

                    // Create URL for the blob
                    const blobUrl = window.URL.createObjectURL(blob);

                    // Create and trigger download
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = fileName;
                    link.style.display = 'none';
                    document.body.appendChild(link);

                    // Trigger the download
                    link.click();

                    // Clean up
                    setTimeout(() => {
                        window.URL.revokeObjectURL(blobUrl);
                        document.body.removeChild(link);
                        resolve(true);
                    }, 100);
                })
                .catch(error => {
                    console.error('Download error:', error);
                    resolve(false);
                });
        } catch (error) {
            console.error('Error triggering download:', error);
            resolve(false);
        }
    });
};

/**
 * Create a notification element for user feedback
 */
const createNotification = (title: string, message: string, type: 'info' | 'success' | 'error'): string => {
    // This is a simplified implementation - you might want to use a proper notification library
    const id = `notification-${Date.now()}`;

    // Check if we already have a notification container
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }

    // Create the notification element
    const notification = document.createElement('div');
    notification.id = id;
    notification.className = `notification notification-${type}`;
    notification.style.padding = '12px 16px';
    notification.style.margin = '8px 0';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    notification.style.backgroundColor = type === 'info' ? '#007acc' :
        type === 'success' ? '#28a745' :
            '#dc3545';
    notification.style.color = 'white';
    notification.style.position = 'relative'; // For positioning close button

    // Add title and message
    notification.innerHTML = `
        <div style="font-weight: bold;">${title}</div>
        <div style="font-size: 0.875em;">${message}</div>
    `;

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '8px';
    closeButton.style.right = '8px';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '16px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => container!.removeChild(notification);
    notification.appendChild(closeButton);

    // Add to container
    container.appendChild(notification);

    // Auto-remove after 20 seconds unless it's an error
    if (type !== 'error') {
        setTimeout(() => {
            if (document.getElementById(id)) {
                container!.removeChild(notification);
            }
        }, 20000);
    }

    return id;
};

/**
 * Update an existing notification
 */
const updateNotification = (
    id: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'error'
): void => {
    const notification = document.getElementById(id);
    if (!notification) return;

    // Update styles based on type
    notification.style.backgroundColor = type === 'info' ? '#007acc' :
        type === 'success' ? '#28a745' :
            '#dc3545';

    // Update content
    notification.innerHTML = `
        <div style="font-weight: bold;">${title}</div>
        <div style="font-size: 0.875em;">${message}</div>
    `;

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '8px';
    closeButton.style.right = '8px';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '16px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
        const parent = notification.parentElement;
        if (parent) parent.removeChild(notification);
    };
    notification.appendChild(closeButton);

    // Auto-remove successful notifications after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            if (document.getElementById(id)) {
                const parent = notification.parentElement;
                if (parent) parent.removeChild(notification);
            }
        }, 5000);
    }
};

// Proper API request helper
const makeApiRequest = async (url: string, options = {}): Promise<any> => {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Ensure URL doesn't have trailing slashes
    const cleanUrl = url.replace(/\/+$/, '');

    const response = await fetch(cleanUrl, {...defaultOptions, ...options});

    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${await response.text()}`);
    }

    return await response.json();
};

/**
 * Import data into table via API
 * @param entityType The type of entity
 * @param file The file to import
 * @param tableInfo Table information for the import
 * @returns Promise with the response
 */
export const importTableData = async function importTableData(
    objectType: ObjectType,
    file: File,
): Promise<boolean> {
    try {
        // First create FormData to upload the file
        // const formData = new FormData();
        // formData.append('file', file);
        // Convert the file to a base64 string for `fileContent`
        // Show user feedback that export has started
        const notification = createNotification('Import started', 'Your import result is being prepared...', 'info');

        const fileContent = await file.arrayBuffer();
        const uint8Array = new Uint8Array(fileContent);
        let base64String = '';
        for (let i = 0; i < uint8Array.length; i++) {
            base64String += String.fromCharCode(uint8Array[i]);
        }
        const base64FileContent = btoa(base64String);
        //const base64FileContent = btoa(String.fromCharCode(...new Uint8Array(fileContent)));
        // Create the payload in the required format
        // Get a proper object type string to use in the URL
        const entityType = String(objectType).toLowerCase();

        const payload = {
            action: "IMPORT",
            objectType: objectType,
            filters: [],
            sorts: [],
            search: {},
            uploadFile: {
                fileName: file.name,
                fileContent: base64FileContent
            }
        };

        // Send the payload to the backend
        const apiUrl = getApiUrl(`/table-data/action/${entityType}`);
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                ...apiConfig.headers,
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Import failed with status:', response.status);
            console.error('Error response:', errorText);
            updateNotification(notification, 'Import failed', `Server error: ${response.status}`, 'error');
            return false;
        }

        const result = await response.json();

        // Extract download token and filename from the response
        const jobId = result.jobId;

        if (jobId) {
            const fetchSatusUrl = getApiUrl(`table-data/import-status/${jobId}`);
            updateNotification(notification, 'Import in progress', 'Import file is processing...', 'info');
            const isSuccessImport = await pollForImportCompletion(fetchSatusUrl, notification);
            return isSuccessImport;
        } else {
            console.error('Invalid import response:', result);
            updateNotification(notification, 'Import failed', 'Invalid response from server', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error importing table data:', error);
        return false
    }
}
/**
 * Poll the server to check if import success
 */
const pollForImportCompletion = async (
    url: string,
    notificationId: string,
    maxAttempts = 30,
    initialDelay = 2000
): Promise<boolean> => {
    let attempt = 1;
    // Use while loop instead of for loop to support indefinite polling
    while (maxAttempts === -1 || attempt <= maxAttempts) {
        try {
            updateNotification(
                notificationId,
                'Import in progress',
                maxAttempts === -1
                    ? `Waiting for process complete... (attempt ${attempt})`
                    : `Waiting for process complate... (attempt ${attempt}/${maxAttempts})`,
                'info'
            );

            // Wait before checking
            await new Promise(resolve => setTimeout(resolve, initialDelay));

            // Check file status with a HEAD request first to avoid partial downloads

            const response = await fetch(url, {method: 'GET'});
            const result = await response.json();

            // If file is ready (status 200) or we received something other than 202
            if (response.status === 200) {
                if (result.status === 'PROGRESS') {
                    const retryAfterHeader = '2';
                    let retryDelay: number;

                    if (retryAfterHeader) {
                        // The Retry-After header value is in seconds, convert to milliseconds
                        retryDelay = parseInt(retryAfterHeader, 10) * 1000;
                        console.log(`Server requested retry after ${retryDelay}ms`);
                    } else {
                        // If no Retry-After header, use exponential backoff
                        retryDelay = Math.min(initialDelay * 1.5, 10000);
                    }

                    initialDelay = retryDelay;
                    attempt++; // Increment attempt counter
                    continue;
                } else {
                    updateNotification(notificationId, 'Import complete', 'Check in import history is ready', 'success');
                    return true;
                }
            } else {
                updateNotification(notificationId, 'Export failed', 'Import could not be started', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error polling for file:', error);
            attempt++; // Increment attempt counter even on error
        }
    }

    // Only reach here if maxAttempts is not -1 and we've exceeded it
    updateNotification(notificationId, 'Import timed out', 'File took too long to prepare', 'error');
    return false;
};