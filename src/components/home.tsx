import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { getCurrentUser } from "@/lib/auth";

export interface HomeProps {
  userRole?: "student" | "coordinator" | "supervisor" | "admin";
  userName?: string;
}

const Home: React.FC<HomeProps> = ({ userRole, userName }) => {
  const currentUser = getCurrentUser();

  // Use current user data or fallback to props
  const actualUserRole = userRole || currentUser?.role || "student";
  const actualUserName = userName || currentUser?.name || "John Doe";

  return (
    <DashboardLayout userRole={actualUserRole} userName={actualUserName}>
      <DashboardContent userRole={actualUserRole} userName={actualUserName} />
    </DashboardLayout>
  );
};

export default Home;
