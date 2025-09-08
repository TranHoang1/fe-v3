import React from 'react';

interface ImportDialogProps {
  open: boolean;
  handleActionImportTable: (field: boolean, file: File) => void;
  handleImportTable: (field: boolean) => void; 
}


const ImportDialog: React.FC<ImportDialogProps> = ({ open, handleActionImportTable, handleImportTable }) => {

  var tempFile = new File([], "tempFile");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.error("No file selected.");
      return;
    }
    tempFile = files[0];
    // Proceed with further actions (e.g., uploading the file)
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-lg p-6 min-w-[350px]">
        <h2 className="text-lg font-bold mb-4">Import Data</h2>
        <div className="grid grid-cols-1 space-y-2">
          <label className="text-sm font-bold text-gray-500 tracking-wide">Attach file</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col rounded-lg border-4 border-dashed w-full h-60 p-10 group text-center">
              <div className="h-full w-full text-center flex flex-col items-center justify-center items-center  ">
                <div className="flex flex-auto max-h-48 w-2/5 mx-auto -mt-10">
                  <img className="has-mask h-36 object-center" src="https://img.freepik.com/free-vector/image-upload-concept-landing-page_52683-27130.jpg?size=338&ext=jpg" alt="freepik image"/>
                </div>
                <p className="pointer-none text-gray-500 "><span className="text-sm">Click here to upload</span></p>
              </div>
              <input type="file"
                    className="hidden"
                    id="importFile"
                    multiple
                    onChange={handleFileUpload}
               />
            </label>
          </div>
        </div>
        <p className="text-sm text-gray-300">
          <span>File type: doc,pdf,types of images</span>
        </p>
        {/* Add your import form or file upload here */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={() => handleImportTable(false)} // false = cancel
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => handleActionImportTable(true, tempFile)} // true = import
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportDialog;

