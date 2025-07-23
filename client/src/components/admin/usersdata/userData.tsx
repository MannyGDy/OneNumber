"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetUserByIdQuery,
  useUnassignPhoneNumberMutation,
  useDeleteUserMutation
} from "@/redux/features/auth/userAuthApi";
import Link from "next/link";



const UserDetailPage = () => {
  const params = useParams();
  const router = useRouter();

  const id = params.id;

  const { data, isLoading, error, refetch } = useGetUserByIdQuery(id);
  const [unassignPhoneNumber] = useUnassignPhoneNumberMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: string, title: string, message: string } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const user = data?.user;



  console.log("User ID from URL:", user);


  // Function to handle user deletion
  const handleDeleteUser = async () => {
    try {
      await deleteUser(id).unwrap();
      setSuccessMessage("User deleted successfully");
      setIsSuccess(true);

      // Redirect to user list after short delay
      setTimeout(() => {
        router.push("/admin/dashboard/users");
      }, 2000);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
    setIsConfirmModalOpen(false);
  };

  // Function to handle phone number unassignment
  const handleUnassignNumber = async () => {
    try {
      await unassignPhoneNumber(id).unwrap();
      setSuccessMessage("Phone number unassigned successfully");
      setIsSuccess(true);
      refetch();
    } catch (error) {
      console.error("Error unassigning number:", error);
    }
    setIsConfirmModalOpen(false);
  };

  // Function to handle confirmation dialog
  const confirmDelete = () => {
    setConfirmAction({
      type: "delete",
      title: "Delete User",
      message: "Are you sure you want to delete this user? This action cannot be undone."
    });
    setIsConfirmModalOpen(true);
  };

  const confirmUnassign = () => {
    setConfirmAction({
      type: "unassign",
      title: "Unassign Phone Number",
      message: "Are you sure you want to unassign this phone number from the user?"
    });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (confirmAction?.type === "delete") {
      handleDeleteUser();
    } else if (confirmAction?.type === "unassign") {
      handleUnassignNumber();
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading User</h2>
      <p className="text-gray-600 mb-6">There was a problem loading the user details.</p>
      <Link href="/admin/dashboard/users" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Return to User List
      </Link>
    </div>
  );

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">User Not Found</h2>
      <p className="text-gray-600 mb-6">The requested user could not be found.</p>
      <Link href="/admin/dashboard/users" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Return to User List
      </Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
   

      {/* Success Message */}
      {isSuccess && (
        <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
          <p className="font-bold">Success</p>
          <p>{successMessage}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-6 py-8 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-white text-blue-800 flex items-center justify-center text-2xl font-bold mr-4 shadow-md">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user.firstName} {user.lastName}</h1>
              <p className="text-blue-200">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Delete User
            </button>
            {user.phoneNumber && (
              <button
                onClick={confirmUnassign}
                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition duration-200 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                </svg>
                Unassign Number
              </button>
            )}
          </div>
        </div>

        {/* User Information */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Details Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                User Details
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">First Name</p>
                    <p className="text-base text-gray-900">{user.firstName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Name</p>
                    <p className="text-base text-gray-900">{user.lastName}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base text-gray-900">{user.email}</p>
                </div>
               
                <div>
                  <p className="text-sm font-medium text-gray-500">Email Verification</p>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                </svg>
                Account Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Account Created</p>
                  <p className="text-base text-gray-900">{new Date(user.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-base text-gray-900">{new Date(user.updatedAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="text-base text-gray-900 font-mono">{user._id}</p>
                </div>
              </div>
            </div>

            {/* Phone Number Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                Phone Number
              </h2>

              {user.phoneNumber ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      <p className="text-lg font-medium text-gray-900">{user.phoneNumber.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.phoneNumber.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {user.phoneNumber.status.charAt(0).toUpperCase() + user.phoneNumber.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Type</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.phoneNumber.type.charAt(0).toUpperCase() + user.phoneNumber.type.slice(1)}
                      </span>
                    </div>
                    {user.phoneNumber.reservedUntil && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Reserved Until</p>
                        <p className="text-base text-gray-900">{new Date(user.phoneNumber.reservedUntil).toLocaleString()}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-500">Assigned On</p>
                      <p className="text-base text-gray-900">{new Date(user.phoneNumber.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={confirmUnassign}
                      className="px-4 py-2 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition duration-200 flex items-center text-sm"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                      </svg>
                      Unassign Number
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                  <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No Phone Number Assigned</h3>
                    <p className="mt-1 text-gray-500">This user doesn&apos;t have a phone number assigned yet.</p>
                </div>
              )}
            </div>

           
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {confirmAction.title}
            </h3>
            <p className="text-gray-500 mb-6">
              {confirmAction.message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 text-white rounded-md ${confirmAction.type === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-amber-600 hover:bg-amber-700"
                  }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetailPage;