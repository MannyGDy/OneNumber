import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useLoadUserQuery } from "../api/apiSlice";
import { useRouter } from "next/navigation";
import NumbeLogoLoader from "@/components/shared/Loading";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const {
    isFetching,
    error,
    isError,
    refetch: fetchUser
  } = useLoadUserQuery(undefined, {
    skip: !accessToken,
  });

  const router = useRouter();

  // Handle fetching user data when access token changes
  useEffect(() => {
    if (accessToken) {
      fetchUser();
    }
  }, [accessToken, fetchUser]);

  // Enhanced error handling
  useEffect(() => {
    if (isError) {
      console.error('Failed to fetch user:', error);

      // You can check for specific error types
      if ('status' in error && error.status === 401) {
        router.push("/login");
      } else {
        // Handle other types of errors
        router.push("/login");
      }
    }
  }, [isError, error, router]);

  // Loading state
  if (isFetching) {
    return <NumbeLogoLoader />;
  }

  // Show error state if needed
  if (isError) {
    return <p>Error loading user profile</p>;
  }

  return <>{children}</>;
};

export default AuthProvider;