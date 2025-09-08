interface ConfirmationDialogProps {
    isEditConfirmOpen: boolean;
    isSaveConfirmOpen: boolean;
    isDeleteConfirmOpen: boolean;
    handleConfirmation: (confirmed: boolean) => void;
    editAction: 'save' | 'cancel' | 'delete' | null;
  }
  
  export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    isEditConfirmOpen,
    isSaveConfirmOpen,
    isDeleteConfirmOpen,
    handleConfirmation,
    editAction,
  }) => {
    if (!isEditConfirmOpen && !isSaveConfirmOpen && !isDeleteConfirmOpen) return null;
  
    const isOpen = isEditConfirmOpen || isSaveConfirmOpen || isDeleteConfirmOpen;
    const title = editAction === 'cancel' ? 'Confirm Cancel' : editAction === 'save' ? 'Confirm Save' : 'Confirm Delete';
    const message = editAction === 'cancel' ? 'Are you sure you want to cancel? All unsaved changes will be lost.' :
      editAction === 'save' ? 'Are you sure you want to save these changes?' :
      'Are you sure you want to delete this record? This action cannot be undone.';
    const confirmLabel = editAction === 'cancel' ? 'Yes, discard changes' : editAction === 'save' ? 'Yes, save changes' : 'Yes, delete';
    const cancelLabel = editAction === 'cancel' ? 'No, continue editing' : editAction === 'save' ? 'No, continue editing' : 'No, cancel';
    const confirmColor = editAction === 'cancel' ? 'bg-red-700 hover:bg-red-800' : editAction === 'save' ? 'bg-green-700 hover:bg-green-800' : 'bg-red-700 hover:bg-red-800';
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[300] flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby={`${editAction}-confirm-title`}>
        <div className="bg-[#2d2d2d] p-6 rounded-lg shadow-lg max-w-md w-full">
          <h3 id={`${editAction}-confirm-title`} className="text-lg font-medium mb-4">{title}</h3>
          <p className="mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button
              className="px-4 py-2 bg-[#3c3c3c] text-white rounded hover:bg-[#4c4c4c]"
              onClick={() => handleConfirmation(false)}
              aria-label={cancelLabel}
            >
              {cancelLabel}
            </button>
            <button
              className={`px-4 py-2 ${confirmColor} text-white rounded`}
              onClick={() => handleConfirmation(true)}
              aria-label={confirmLabel}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    );
  };