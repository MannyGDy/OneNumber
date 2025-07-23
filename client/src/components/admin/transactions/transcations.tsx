"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetAllSubscriptionsQuery } from "@/redux/features/api/apiSlice";
import { Subscription } from "@/types/subsction";

type Transaction = {
  id: string;
  name: string;
  date: string;
  amount: string;
  phoneNumber: string;
  status: "Completed" | "Processing" | "Declined";
};


const TransactionHistory = () => {
  const router = useRouter();
  const { data: subscriptionData, error, isLoading } = useGetAllSubscriptionsQuery();

  // Replace the subscriptions declaration with useMemo
  const subscriptions = useMemo(
    () => subscriptionData || [],
    [subscriptionData]
  );
  const [transactionList, setTransactionList] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateSort, setDateSort] = useState<"asc" | "desc" | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showOptionsOverlay, setShowOptionsOverlay] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const itemsPerPage = 10;

  useEffect(() => {
    if (subscriptions && subscriptions.length > 0) {
      const formattedTransactions: Transaction[] = subscriptions.map((sub: Subscription) => ({
        id: sub._id,
        name: sub.user ? `${sub.user.firstName} ${sub.user.lastName}` : "Jane Joe",
        date: new Date(sub.createdAt).toLocaleString(),
        amount: sub.price ? `$${sub.price}` : "",
        phoneNumber: sub.number?.phoneNumber || "0700 021 1666",
        status: sub.status === "active"
          ? "Completed"
          : sub.status === "expired"
            ? "Declined"
            : "Processing", // ✅ Ensure status matches Transaction type
      }));

      setTransactionList(formattedTransactions);
    } else {
      setTransactionList([]);
    }
  }, [subscriptions]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching subscriptions</p>;

  // Apply filters and sorting
  const filteredTransactions = transactionList.filter(transaction => {
    // Apply text filter
    const matchesFilter = !filterValue ||
      transaction.name.toLowerCase().includes(filterValue.toLowerCase()) ||
      transaction.phoneNumber.includes(filterValue);

    // Apply status filter
    const matchesStatus = !statusFilter || transaction.status === statusFilter;

    // Apply date range filter if both start and end dates are set
    let matchesDateRange = true;
    if (dateRange.start && dateRange.end) {
      const transactionDate = new Date(transaction.date).getTime();
      const startDate = new Date(dateRange.start).getTime();
      const endDate = new Date(dateRange.end).getTime();
      matchesDateRange = transactionDate >= startDate && transactionDate <= endDate;
    }

    return matchesFilter && matchesStatus && matchesDateRange;
  });

  // Apply sorting
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (dateSort === "asc") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (dateSort === "desc") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const currentTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRowClick = (transactionId: string) => {
    router.push(`/admin/dashboard/transactions/${transactionId}`);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status);
    setShowStatusDropdown(false);
    setCurrentPage(1);
  };
  // TODO: fix this
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
      router.push(`/admin/dashboard/transactions/${id}`);
    } else if (action === "delete") {
      // Implement delete functionality
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F4F8]">
        <h2 className="text-lg font-semibold text-gray-800">Transaction History</h2>

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
            placeholder="Filter"
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
                      onClick={() => {
                        setDateSort("asc");
                        setShowDateDropdown(false);
                        handleDateSort("asc");
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Oldest first
                    </button>
                    <button
                      onClick={() => {
                        setDateSort("desc");
                        setShowDateDropdown(false);
                        handleDateSort("desc");
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Newest first
                    </button>
                  </div>
                  {!dateSort && (
                    <button
                      onClick={() => handleDateSort(null)}
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
              }}
              className={`flex items-center px-3 py-2 border ${statusFilter ? 'border-blue-500 text-blue-500' : 'border-gray-300'} rounded-md`}
            >
              Status ▾
            </button>
            {showStatusDropdown && (
              <div className="absolute z-10 mt-1 w-40 bg-white rounded-md shadow-lg overflow-hidden right-0">
                <div className="py-1">
                  {["Processing", "Completed", "Declined"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusFilter(status)}
                      className={`block w-full text-left px-4 py-2 text-sm ${statusFilter === status
                        ? status === "Completed"
                          ? "text-green-700 bg-green-50"
                          : status === "Processing"
                            ? "text-purple-700 bg-purple-50"
                            : "text-red-700 bg-red-50"
                        : "hover:bg-gray-100"
                        }`}
                    >
                      {status}
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

          <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md">
            Sort
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Date & Time</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentTransactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(transaction.id)}
              >
                <td className="px-6 py-4 text-sm text-gray-700">{transaction.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{transaction.date}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {transaction.amount || transaction.phoneNumber}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${transaction.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : transaction.status === "Processing"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-red-100 text-red-700"
                      }`}
                  >
                    {transaction.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 relative">
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={(e) => handleOptionsClick(transaction.id, e)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  {showOptionsOverlay === transaction.id && (
                    <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden">
                      <button
                        className="flex items-center w-full px-4 py-3 text-sm text-left hover:bg-gray-50"
                        onClick={(e) => handleActionClick("view", transaction.id, e)}
                      >
                        <svg className="h-5 w-5 mr-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                   
                    </div>
                  )}
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

export default TransactionHistory;