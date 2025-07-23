"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useUnassignPhoneNumberMutation,
  useActivateUserAccountMutation
} from "@/redux/features/auth/userAuthApi";

type User = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  accountStatus?: string;
  activatedAt?: string;
  phoneNumber?: {
    _id: string;
    phoneNumber: string;
    status: string;
    type: string;
  };
};

const UserManagement = () => {
  const router = useRouter();
  const { data: userData, error, isLoading, refetch } = useGetAllUsersQuery({});
  const [deleteUser] = useDeleteUserMutation();
  const [unassignPhoneNumber] = useUnassignPhoneNumberMutation();
  const [activateUserAccount] = useActivateUserAccountMutation();

  // Use useMemo to create a derived users list
  const users = useMemo(() =>
    userData?.users || [],
    [userData]
  );

  const [userList, setUserList] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValue, setFilterValue] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateSort, setDateSort] = useState<"asc" | "desc" | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showOptionsOverlay, setShowOptionsOverlay] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [confirmAction, setConfirmAction] = useState<{ type: string, id: string } | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    if (users && users.length > 0) {
      setUserList(users);
    } else {
      setUserList([]);
    }
  }, [users]);

  if (isLoading) return <p>Loading users...</p>;
  if (error) return <p>Error fetching users</p>;

  // Apply filters and sorting
  const filteredUsers = userList.filter(user => {
    // Apply text filter
    const matchesFilter = !filterValue ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(filterValue.toLowerCase()) ||
      user.email.toLowerCase().includes(filterValue.toLowerCase()) ||
      (user.phoneNumber?.phoneNumber && user.phoneNumber.phoneNumber.includes(filterValue));

    // Apply role filter
    const matchesRole = !roleFilter || user.role === roleFilter;

    // Apply status filter
    const matchesStatus = !statusFilter || user.accountStatus === statusFilter;

    // Apply date range filter if both start and end dates are set
    let matchesDateRange = true;
    if (dateRange.start && dateRange.end) {
      const userDate = new Date(user.createdAt).getTime();
      const startDate = new Date(dateRange.start).getTime();
      const endDate = new Date(dateRange.end).getTime();
      matchesDateRange = userDate >= startDate && userDate <= endDate;
    }

    return matchesFilter && matchesRole && matchesStatus && matchesDateRange;
  });

  // Apply sorting
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (dateSort === "asc") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (dateSort === "desc") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const currentUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewUser = (userId: string) => {
    router.push(`/admin/dashboard/users/${userId}`);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleRoleFilter = (role: string | null) => {
    setRoleFilter(role);
    setShowRoleDropdown(false);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status);
    setShowStatusDropdown(false);
    setCurrentPage(1);
  };

  const handleDateSort = (sortType: "asc" | "desc" | null) => {
    setDateSort(sortType);
    setShowDateDropdown(false);
    setCurrentPage(1);
  };

  const handleOptionsClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptionsOverlay(showOptionsOverlay === id ? null : id);
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleActionClick = (action: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptionsOverlay(null);

    if (action === "view") {
      handleViewUser(id);
    } else if (action === "delete" || action === "unassign" || action === "activate" || action === "deactivate") {
      setConfirmAction({ type: action, id });
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      if (confirmAction.type === "delete") {
        await deleteUser(confirmAction.id).unwrap();
      } else if (confirmAction.type === "unassign") {
        await unassignPhoneNumber(confirmAction.id).unwrap();
      } else if (confirmAction.type === "activate" || confirmAction.type === "deactivate") {
        await activateUserAccount(
           confirmAction.id,
        ).unwrap();
      }

      // Refresh user data
      refetch();

      // Show success toast/notification here
    } catch (error) {
      console.error(`Error during ${confirmAction.type} operation:`, error);
      // Show error toast/notification here
    }

    setConfirmAction(null);
  };

  const handleCancelAction = () => {
    setConfirmAction(null);
  };

  const getAccountStatusBadge = (user: User) => {
    if (!user.accountStatus || user.accountStatus === 'pending') {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
          Pending Activation
        </span>
      );
    } else if (user.accountStatus === 'active') {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
          Active
        </span>
      );
    } else if (user.accountStatus === 'suspended') {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
          Suspended
        </span>
      );
    }

    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
        {user.accountStatus || 'Unknown'}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F4F8]">
        <h2 className="text-lg font-semibold text-gray-800">User Management</h2>
      </div>

      <div className="p-4 flex justify-end flex-wrap gap-2">
        <div className="flex flex-grow max-w-md border border-gray-300 rounded-md">
          <div className="flex items-center ml-2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, email or phone"
            value={filterValue}
            onChange={handleFilterChange}
            className="w-full pl-10 pr-4 py-2 !border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => {
                setShowDateDropdown(!showDateDropdown);
                setShowRoleDropdown(false);
                setShowStatusDropdown(false);
              }}
              className={`flex items-center px-3 py-2 border ${dateSort || (dateRange.start && dateRange.end) ? 'border-blue-500 text-blue-500' : 'border-gray-300'} rounded-md`}
            >
              Date {dateSort === "asc" ? "↑" : dateSort === "desc" ? "↓" : ""} ▾
            </button>
            {showDateDropdown && (
              <div className="absolute z-10 mt-1 w-64 bg-white rounded-md shadow-lg py-1 right-0">
                <div className="p-3">
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => handleDateRangeChange('start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => handleDateRangeChange('end', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex justify-between mt-3">
                    <button
                      onClick={() => handleDateSort("asc")}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Oldest first
                    </button>
                    <button
                      onClick={() => handleDateSort("desc")}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Newest first
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setDateSort(null);
                      setDateRange({ start: "", end: "" });
                      setShowDateDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 border-t mt-2"
                  >
                    Clear filter
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowRoleDropdown(!showRoleDropdown);
                setShowDateDropdown(false);
                setShowStatusDropdown(false);
              }}
              className={`flex items-center px-3 py-2 border ${roleFilter ? 'border-blue-500 text-blue-500' : 'border-gray-300'} rounded-md`}
            >
              Role {roleFilter ? `: ${roleFilter}` : ""} ▾
            </button>
            {showRoleDropdown && (
              <div className="absolute z-10 mt-1 w-40 bg-white rounded-md shadow-lg overflow-hidden right-0">
                <div className="py-1">
                  {["user", "admin"].map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleFilter(role)}
                      className={`block w-full text-left px-4 py-2 text-sm ${roleFilter === role
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-100"
                        }`}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                  {roleFilter && (
                    <button
                      onClick={() => handleRoleFilter(null)}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 border-t"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowDateDropdown(false);
                setShowRoleDropdown(false);
              }}
              className={`flex items-center px-3 py-2 border ${statusFilter ? 'border-blue-500 text-blue-500' : 'border-gray-300'} rounded-md`}
            >
              Status {statusFilter ? `: ${statusFilter}` : ""} ▾
            </button>
            {showStatusDropdown && (
              <div className="absolute z-10 mt-1 w-40 bg-white rounded-md shadow-lg overflow-hidden right-0">
                <div className="py-1">
                  {["active", "pending", "suspended"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusFilter(status)}
                      className={`block w-full text-left px-4 py-2 text-sm ${statusFilter === status
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-100"
                        }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                  {statusFilter && (
                    <button
                      onClick={() => handleStatusFilter(null)}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 border-t"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Phone Number</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Email Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Account Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Created At</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Activated At</th>
              <th className="px-6 py-3 text-left text-sm font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentUsers.map((user) => (
              <tr
                key={user._id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewUser(user._id)}
              >
                <td className="px-6 py-4 text-sm text-gray-700">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {user.phoneNumber ? user.phoneNumber.phoneNumber : "-"}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${user.isEmailVerified
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {user.isEmailVerified ? "Verified" : "Pending Verification"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {getAccountStatusBadge(user)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {user.activatedAt ? new Date(user.activatedAt).toLocaleDateString() : "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 relative">
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={(e) => handleOptionsClick(user._id, e)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  {showOptionsOverlay === user._id && (
                    <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden">
                      <button
                        className="flex items-center w-full px-4 py-3 text-sm text-left hover:bg-gray-50"
                        onClick={(e) => handleActionClick("view", user._id, e)}
                      >
                        <svg className="h-5 w-5 mr-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </button>

                      {user.accountStatus !== 'suspended' && (
                        <button
                          className="flex items-center w-full px-4 py-3 text-sm text-left hover:bg-gray-50 border-t border-gray-100"
                          onClick={(e) => handleActionClick(
                            user.accountStatus === 'active' ? "deactivate" : "activate",
                            user._id,
                            e
                          )}
                        >
                          <svg className={`h-5 w-5 mr-3 ${user.accountStatus === 'active' ? 'text-red-500' : 'text-green-500'}`} 
                               fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {user.accountStatus === 'active' ? 'Deactivate Account' : 'Activate Account'}
                        </button>
                      )}

                      {user.phoneNumber && (
                        <button
                          className="flex items-center w-full px-4 py-3 text-sm text-left hover:bg-gray-50 border-t border-gray-100"
                          onClick={(e) => handleActionClick("unassign", user._id, e)}
                        >
                          <svg className="h-5 w-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                          Unassign Number
                        </button>
                      )}

                      <button
                        className="flex items-center w-full px-4 py-3 text-sm text-left text-red-500 hover:bg-red-50 border-t border-gray-100"
                        onClick={(e) => handleActionClick("delete", user._id, e)}
                      >
                        <svg className="h-5 w-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete User
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {confirmAction.type === "delete"
                ? "Delete User"
                : confirmAction.type === "unassign"
                  ? "Unassign Phone Number"
                  : confirmAction.type === "activate"
                    ? "Activate User Account"
                    : "Deactivate User Account"}
            </h3>
            <p className="text-gray-500 mb-6">
              {confirmAction.type === "delete"
                ? "Are you sure you want to delete this user? This action cannot be undone."
                : confirmAction.type === "unassign"
                  ? "Are you sure you want to unassign the phone number from this user?"
                  : confirmAction.type === "activate"
                    ? "Are you sure you want to activate this user's account?"
                    : "Are you sure you want to deactivate this user's account?"}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelAction}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 text-white rounded-md ${confirmAction.type === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : confirmAction.type === "activate"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-[#F2F4F8]">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 text-sm font-medium ${currentPage === 1
            ? "text-gray-400 cursor-not-allowed"
            : "text-blue-600 hover:bg-gray-100"
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
            : "text-blue-600 hover:bg-gray-100"
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UserManagement;