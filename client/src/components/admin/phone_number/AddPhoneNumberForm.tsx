import React, { useState } from 'react';
import { useAddPhoneNumberMutation } from '@/redux/features/phoneNumber/phone';

interface AddPhoneNumberFormProps {
  showNotification: (message: string, type: 'success' | 'error') => void;
}

const AddPhoneNumberForm: React.FC<AddPhoneNumberFormProps> = ({ showNotification }) => {
  const [newPhoneNumber, setNewPhoneNumber] = useState<string>('');
  const [addPhoneNumber] = useAddPhoneNumberMutation();

  

  const handleAddPhoneNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoneNumber) return;
   
    
    try {
      await addPhoneNumber( { phoneNumber: newPhoneNumber } ).unwrap();
      setNewPhoneNumber('');
      showNotification('Phone number added successfully', 'success');
    } catch (err: unknown) {
      // Use unknown instead of any, then narrow the type
      let errorMessage = 'An unknown error occurred';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = String((err as { message: unknown }).message);
      }

      showNotification(`Failed to add phone number: ${errorMessage}`, 'error');
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Add Phone Number</h2>
      <form onSubmit={handleAddPhoneNumber} className="flex items-center gap-4">
        <input
          type="text"
          value={newPhoneNumber}
          onChange={(e) => setNewPhoneNumber(e.target.value)}
          placeholder="Enter phone number"
          className="px-4 py-2 border border-gray-300 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
        >
          Add Number
        </button>
      </form>
    </div>
  );
};

export default AddPhoneNumberForm;