'use client';
import { useGetAllSubscriptionsQuery } from "@/redux/features/api/apiSlice";
import NotificationPanel from "./NotificationPanel";
import StatCard from "./StatCard";
import TransactionHistory from "./TransactionHistory";
import { Subscription } from "@/types/subsction";
import { useGetAllUsersQuery } from "@/redux/features/auth/userAuthApi";
import UserManagement from "./UserData";

export default function AdminDashboardPage() {
  const { data: subscriptions = [], error, isLoading } = useGetAllSubscriptionsQuery();
  const { data: users = [], error: userError, isLoading: userLoading } = useGetAllUsersQuery({});

  if (isLoading || userLoading) return <p>Loading...</p>;
  if (error || userError) return <p>Error fetching subscriptions</p>;


  // Calculate statistics
  const totalSubscriptions = subscriptions.length;

  const activeSubscriptions = subscriptions.filter((sub: Subscription) => sub?.status === "active").length;

  return (
    <main>
      <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">

        <StatCard
          title="Total Users"
          value={users.users.length.toString()}
        />
        <StatCard
          title="Total Subscriptions"
          value={totalSubscriptions.toString()}
        />
        <StatCard
          title="Active Subscriptions"
          value={activeSubscriptions.toString()}
        />
      
      </div>
      <div className="grid  grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-10">
          <TransactionHistory subscriptions={subscriptions} />
          <UserManagement />
        </div>
        <div>
          <NotificationPanel />
        </div>
      </div>
    </main>
  );
}