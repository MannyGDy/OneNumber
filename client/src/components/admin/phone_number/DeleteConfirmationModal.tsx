import React from 'react';
import { useDeletePhoneNumberMutation } from '@/redux/features/phoneNumber/phone';

interface DeleteConfirmationModalProps {
  onClose: () => void;
  onDelete: () => void;
  phoneNumberId?: string | null;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  onClose,
  onDelete,
  phoneNumberId
}) => {
  const [deletePhoneNumber] = useDeletePhoneNumberMutation();

  const handleDelete = async () => {
    if (!phoneNumberId) return;

    try {
      await deletePhoneNumber(phoneNumberId).unwrap();
      onDelete();
    } catch (err) {
      console.error(err);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
        <p className="text-gray-500 mb-6">
          Are you sure you want to delete this phone number? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={phoneNumberId ? handleDelete : onDelete}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;