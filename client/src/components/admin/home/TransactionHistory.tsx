"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Subscription } from "@/types/subsction";

type Transaction = {
  id: string;
  name: string;
  date: string;
  amount: string;
  status: "Completed" | "Processing" | "Declined";
};

type TransactionHistoryProps = {
  subscriptions: Subscription[];
};

const TransactionHistory = ({ subscriptions }: TransactionHistoryProps) => {
  const router = useRouter();
  const [transactionList, setTransactionList] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (subscriptions && subscriptions.length > 0) {
      const formattedTransactions: Transaction[] = subscriptions.map((sub: Subscription) => ({
        id: sub._id,
        name: sub.user ? `${sub.user.firstName} ${sub.user.lastName}` : "Unknown User",
        date: new Date(sub.createdAt).toLocaleString(),
        amount: `$${sub.price}`,
        status: sub.status === "active"
          ? "Completed"
          : sub.status === "expired"
            ? "Declined"
            : "Processing",
      }));
      setTransactionList(formattedTransactions);
    }
  }, [subscriptions]);

  const totalPages = Math.ceil(transactionList.length / itemsPerPage);
  const currentTransactions = transactionList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRowClick = (transactionId: string) => {
    router.push(`/admin/dashboard/transactions/${transactionId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F4F8]">
        <h2 className="text-lg font-semibold text-gray-800">Transaction History</h2>
        <button className="flex items-center text-sm text-primary font-medium">
          {/* Add Transaction button remains same */}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary text-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Date & Time</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
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
                <td className="px-6 py-4 text-sm text-gray-700">{transaction.amount}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${transaction.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : transaction.status === "Processing"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                      }`}
                  >
                    {transaction.status}
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
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 text-sm font-medium ${currentPage === totalPages
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

export default TransactionHistory;