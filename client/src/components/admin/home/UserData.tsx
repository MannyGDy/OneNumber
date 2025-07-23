"use client";
import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
import { useGetAllUsersQuery } from "@/redux/features/auth/userAuthApi"; // Assuming this is where your API is defined

type User = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  phoneNumber?: {
    _id: string;
    phoneNumber: string;
    status: string;
    type: string;
  };
};

const UserManagement = () => {
  // const router = useRouter();
  const { data, isLoading, error } = useGetAllUsersQuery({});
  const [userList, setUserList] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    if (data && data.success && data.users) {
      setUserList(data.users);
    }
  }, [data]);

  const totalPages = Math.ceil(userList.length / itemsPerPage);
  const currentUsers = userList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

 

  if (isLoading) {
    return <div className="text-center py-8">Loading user data...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error loading user data. Please try again.</div>;
  }


  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F4F8]">
        <h2 className="text-lg font-semibold text-gray-800">User Management</h2>
        <div className="text-sm text-gray-500">
          {userList.length} total users
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary text-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Registration Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Phone Number</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Subscription Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentUsers.map((user) => (
              <tr
                key={user._id}
                className="hover:bg-gray-50 cursor-pointer"
                // onClick={() => handleRowClick(user._id)}
              >
                <td className="px-6 py-4 text-sm text-gray-700">
                  {`${user.firstName} ${user.lastName}`}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {user.email}
                  {user.isEmailVerified && (
                    <span className="ml-2 px-1 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                      Verified
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {user.phoneNumber ? user.phoneNumber.phoneNumber : "-"}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${user.phoneNumber
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {user.phoneNumber ? "Subscribed" : "No Subscription"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-[#F2F4F8]">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 text-sm font-medium ${currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-primary hover:bg-gray-100"
            }`}
        >
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-4 py-2 text-sm font-medium ${currentPage === totalPages || totalPages === 0
              ? "text-gray-400 cursor-not-allowed"
              : "text-primary hover:bg-gray-100"
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UserManagement;