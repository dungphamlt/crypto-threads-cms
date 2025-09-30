"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService, Admin, AdminRole } from "@/services/adminService";

export function useAuth() {
  const {
    data: profileData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: () => adminService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const profile = profileData?.data as Admin;
  const isAuthenticated = !!profile && !error;
  const isAdmin = profile?.role === AdminRole.ADMIN;
  const isWriter = profile?.role === AdminRole.WRITER;

  return {
    profile,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    isWriter,
    refetch,
  };
}
