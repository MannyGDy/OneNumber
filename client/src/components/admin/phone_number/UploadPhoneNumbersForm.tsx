import React, { useState, useRef } from 'react';
import { useUploadPhoneNumbersMutation } from '@/redux/features/phoneNumber/phone';

interface UploadPhoneNumbersFormProps {
  showNotification: (message: string, type: 'success' | 'error') => void;
}

const UploadPhoneNumbersForm: React.FC<UploadPhoneNumbersFormProps> = ({ showNotification }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadPhoneNumbers] = useUploadPhoneNumbersMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('csv', selectedFile);
    setUploadProgress(0);

    try {
      await uploadPhoneNumbers(formData).unwrap();
      setSelectedFile(null);
      setUploadProgress(100);
      if (fileInputRef.current) fileInputRef.current.value = '';
      showNotification('Phone numbers uploaded successfully', 'success');
    } catch (err) {
      showNotification('Failed to upload phone numbers', 'error');
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Upload Phone Numbers</h2>
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileChange}
            className="flex-1"
          />
          <button
            onClick={handleFileUpload}
            disabled={!selectedFile}
            className={`px-4 py-2 rounded-md text-white focus:outline-none ${selectedFile ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
              }`}
          >
            Upload
          </button>
        </div>
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
        <p className="text-gray-500 text-sm">
          Upload a CSV file with phone numbers. The file should have a number column.
        </p>
      </div>
    </div>
  );
};

export default UploadPhoneNumbersForm;