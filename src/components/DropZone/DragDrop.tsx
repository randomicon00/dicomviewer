import React, { useState } from "react";
import { CloudArrowUpIcon, DocumentIcon } from "@heroicons/react/24/outline";

const DragDrop: React.FC<{ onFileUpload: (file: File) => void }> = ({ onFileUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFiles = (newFiles: File[]) => {
    if (!newFiles.length) {
      setUploadError("Please select a DICOM file (.dcm).");
      return;
    }

    const validFileTypes = ["image/jpeg", "image/jpg", "application/dicom"];
    const newFile = newFiles[0];
    const filename = newFile.name.toLowerCase();

    // for jpeg/jpg files and DICOM files
    if (validFileTypes.includes(newFile.type) || filename.endsWith(".dcm")) {
      setUploadError(null);
      onFileUpload(newFile);
      return;
    }

    setUploadError("Please upload a DICOM file (.dcm).");
  };

  return (
    <div
      className={`w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors duration-200 ${isDragOver
          ? "border-gray-500 bg-gray-50"
          : "border-gray-400 bg-transparent hover:bg-gray-50"
        }`}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFiles(Array.from(e.dataTransfer.files));
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragOver(false);
      }}
    >
      <CloudArrowUpIcon className="h-12 w-12 text-gray-500 mb-4" />

      <div className="text-center">
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drop your DICOM file here
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Supports .dcm files up to 50MB
        </p>

        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 border border-gray-400 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <DocumentIcon className="h-4 w-4 mr-2" />
          Browse Files
        </label>

        <input
          id="file-upload"
          type="file"
          accept=".dcm"
          className="hidden"
          onChange={(e) => handleFiles(Array.from(e.target.files || []))}
        />

        {uploadError && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {uploadError}
          </p>
        )}
      </div>
    </div>
  );
};

export default DragDrop;
