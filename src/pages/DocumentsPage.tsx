import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DocumentManager from "@/components/documents/DocumentManager";
import { getCurrentUser } from "@/lib/auth";

const DocumentsPage = () => {
  const currentUser = getCurrentUser();

  return (
    <DashboardLayout userRole={currentUser?.role} userName={currentUser?.name}>
      <div className="p-6">
        <DocumentManager userRole={currentUser?.role} />
      </div>
    </DashboardLayout>
  );
};

export default DocumentsPage;
