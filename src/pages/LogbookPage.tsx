import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LogbookForm from "@/components/logbook/LogbookForm";
import { getCurrentUser } from "@/lib/auth";

const LogbookPage = () => {
  const currentUser = getCurrentUser();

  return (
    <DashboardLayout userRole={currentUser?.role} userName={currentUser?.name}>
      <div className="p-6">
        <LogbookForm />
      </div>
    </DashboardLayout>
  );
};

export default LogbookPage;
