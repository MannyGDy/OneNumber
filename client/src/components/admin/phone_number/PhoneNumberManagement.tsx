"use client"
import React, { useState, useRef } from 'react';
import {
  useGetPhoneNumbersQuery,
  useAddPhoneNumberMutation,
  useUploadPhoneNumbersMutation,
  useUpdatePhoneNumberStatusMutation,
  useDeletePhoneNumberMutation
} from '@/redux/features/phoneNumber/phone';
import { PhoneNumber } from '@/types/unified';


const PhoneNumberManagement = () => {
  // RTK Query hooks
  const {
    data: phoneNumbersResponse,
    isLoading: isLoadingPhoneNumbers,
    error: phoneNumbersError
  } = useGetPhoneNumbersQuery();

  // RTK Query mutations
  const [addPhoneNumber] = useAddPhoneNumberMutation();
  const [uploadPhoneNumbers] = useUploadPhoneNumbersMutation();
  const [updatePhoneNumberStatus] = useUpdatePhoneNumberStatusMutation();
  const [deletePhoneNumber] = useDeletePhoneNumberMutation();

  // Extract phone numbers from the response
  const phoneNumbers = Array.isArray(phoneNumbersResponse) ? phoneNumbersResponse : phoneNumbersResponse?.data || [];


  // Calculate stats directly from phoneNumbers
  const stats = {
    total: phoneNumbers.length,
    available: phoneNumbers.filter((pn: PhoneNumber) => pn.status === 'available').length,

    active: phoneNumbers.filter((pn: PhoneNumber) => pn.status === 'active').length,
    reserved: phoneNumbers.filter((pn: PhoneNumber) => pn.status === 'reserved').length
  };

  // States for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // States for filtering
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // States for new phone number
  const [newPhoneNumber, setNewPhoneNumber] = useState<string>('');

  // State for file upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // State for modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [phoneNumberToDelete, setPhoneNumberToDelete] = useState<string | null>(null);

  // States for notifications
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Handle adding a new phone number
  const handleAddPhoneNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoneNumber) return;

    try {
      await addPhoneNumber({ phoneNumber: newPhoneNumber }).unwrap();
      setNewPhoneNumber('');
      showNotification('Phone number added successfully', 'success');
    } catch (err: unknown) {
      let errorMessage = 'An unknown error occurred';

      // Check various possible error formats
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        // RTK Query often wraps errors in a data property
        if ('data' in err && typeof err.data === 'object' && err.data !== null) {
          if ('message' in err.data) {
            errorMessage = String(err.data.message);
          } else if ('error' in err.data) {
            errorMessage = String(err.data.error);
          }
        } else if ('message' in err) {
          errorMessage = String((err as { message: unknown }).message);
        } else if ('error' in err) {
          errorMessage = String((err as { error: unknown }).error);
        }
      }

      showNotification(`Failed to add phone number: ${errorMessage}`, 'error');
      console.error('Error object:', err); // Log the full error object to help debugging
    }
  };

  // Handle CSV file upload
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
    } catch (err: unknown) {
      let errorMessage = 'An unknown error occurred';

      // Check various possible error formats
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        // RTK Query often wraps errors in a data property
        if ('data' in err && typeof err.data === 'object' && err.data !== null) {
          if ('message' in err.data) {
            errorMessage = String(err.data.message);
          } else if ('error' in err.data) {
            errorMessage = String(err.data.error);
          }
        } else if ('message' in err) {
          errorMessage = String((err as { message: unknown }).message);
        } else if ('error' in err) {
          errorMessage = String((err as { error: unknown }).error);
        }
      }

      showNotification(`Failed to upload phone numbers: ${errorMessage}`, 'error');
      console.error('Upload error:', err);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updatePhoneNumberStatus({ id, status }).unwrap();
      showNotification('Status updated successfully', 'success');
    } catch (err) {
      showNotification('Failed to update status', 'error');
      console.error(err);
    }
  };

  // Handle delete
  const confirmDelete = (id: string) => {
    setPhoneNumberToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!phoneNumberToDelete) return;

    try {
      await deletePhoneNumber(phoneNumberToDelete).unwrap();
      setShowDeleteModal(false);
      setPhoneNumberToDelete(null);
      showNotification('Phone number deleted successfully', 'success');
    } catch (err) {
      showNotification('Failed to delete phone number', 'error');
      console.error(err);
    }
  };

  // Show notification
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Filter phone numbers based on search term and status
  const filteredPhoneNumbers = phoneNumbers.filter((phoneNumber: PhoneNumber) => {
    const matchesSearch = phoneNumber.phoneNumber.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || phoneNumber.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPhoneNumbers.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredPhoneNumbers.length / itemsPerPage);

  // Check if there's an error from any of the queries
  const error = phoneNumbersError ? 'Failed to fetch phone numbers data' : null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Phone Number Management</h1>
        <p className="text-gray-600">Manage your organization&apos;s phone numbers</p>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`mb-4 p-4 rounded-md ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
        >
          {notification.message}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 rounded-md bg-red-50 text-red-800">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-gray-500 text-sm">Total Numbers</p>
              <p className="text-lg font-semibold">{stats.total || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-gray-500 text-sm">Available</p>
              <p className="text-lg font-semibold">{stats.available || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-gray-500 text-sm">Active</p>
              <p className="text-lg font-semibold">{stats.active || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-gray-500 text-sm">Reserved</p>
              <p className="text-lg font-semibold">{stats.reserved || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Management Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Add Phone Number */}
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

        {/* Upload CSV */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Upload Phone Numbers</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                className="flex-1 w-[30%]"
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
              Upload a CSV file with phone numbers. The file should have a &apos;phoneNumber&apos; column.
            </p>
          </div>
        </div>
      </div>

      {/* Phone Number List */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 border-b border-[#F2F4F8]">
          <h2 className="text-lg font-semibold">Phone Numbers</h2>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-[#F2F4F8] flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search phone numbers..."
              className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="active">Active</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoadingPhoneNumbers ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    <div className="flex justify-center">
                      <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No phone numbers found
                  </td>
                </tr>
              ) : (
                currentItems.map((phoneNumber: PhoneNumber) => (
                  <tr key={phoneNumber._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{phoneNumber.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${phoneNumber.status === 'available' ? 'bg-green-100 text-green-800' :
                        phoneNumber.status === 'active' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {phoneNumber.status.charAt(0).toUpperCase() + phoneNumber.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(phoneNumber.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {phoneNumber.user?.email || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <select
                          value={phoneNumber.status}
                          onChange={(e) => handleStatusUpdate(phoneNumber._id, e.target.value)}
                          className="text-xs border border-gray-300 rounded p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="available">Available</option>
                          <option value="active">Active</option>
                          <option value="reserved">Reserved</option>
                        </select>
                        <button
                          onClick={() => confirmDelete(phoneNumber._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-[#F2F4F8] sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">
                    {indexOfLastItem > filteredPhoneNumbers.length
                      ? filteredPhoneNumbers.length
                      : indexOfLastItem}
                  </span>{' '}
                  of <span className="font-medium">{filteredPhoneNumbers.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === index + 1
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this phone number? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneNumberManagement;