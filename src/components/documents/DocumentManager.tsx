import React, { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  FileIcon,
  UploadIcon,
  FileTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon,
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: "MOA" | "Waiver" | "Evaluation";
  status: "Pending" | "Approved" | "Rejected";
  uploadDate: string;
  fileUrl: string;
  comments?: string;
}

const DocumentManager = ({
  userRole,
}: {
  userRole?: "student" | "coordinator" | "supervisor" | "admin";
}) => {
  const currentUser = getCurrentUser();
  const actualUserRole = userRole || currentUser?.role || "student";

  const [activeTab, setActiveTab] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const result = await db.getUserDocuments(currentUser.id);

        if (result.data) {
          const formattedDocs = result.data.map((doc) => ({
            id: doc.id,
            name: doc.fileName,
            type: doc.type.toUpperCase() as "MOA" | "Waiver" | "Evaluation",
            status:
              doc.status === "approved"
                ? "Approved"
                : doc.status === "rejected"
                  ? "Rejected"
                  : "Pending",
            uploadDate: new Date(doc.uploadDate).toISOString().split("T")[0],
            fileUrl: doc.fileUrl,
            comments: doc.comments,
          }));
          setDocuments(formattedDocs);
        }
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [currentUser]);

  const handleDocumentAction = async (
    documentId: string,
    action: "approve" | "reject",
  ) => {
    if (!currentUser) return;

    try {
      const comments =
        action === "reject"
          ? prompt("Please provide feedback for rejection:")
          : action === "approve"
            ? prompt("Optional approval comments:")
            : undefined;
      if (action === "reject" && !comments) return;

      const result =
        action === "approve"
          ? await db.approveDocument(documentId, currentUser.id, comments)
          : await db.rejectDocument(documentId, currentUser.id, comments);

      if (result.data) {
        const updatedDoc: Document = {
          id: result.data.id,
          name: result.data.fileName,
          type: result.data.type.toUpperCase() as
            | "MOA"
            | "Waiver"
            | "Evaluation",
          status: result.data.status === "approved" ? "Approved" : "Rejected",
          uploadDate: new Date(result.data.uploadDate)
            .toISOString()
            .split("T")[0],
          fileUrl: result.data.fileUrl,
          comments: result.data.comments,
        };

        setDocuments(
          documents.map((doc) => (doc.id === documentId ? updatedDoc : doc)),
        );
        setPreviewOpen(false);
        alert(`Document ${action}d successfully!`);
      }
    } catch (error) {
      console.error(`Failed to ${action} document:`, error);
      alert(`Failed to ${action} document. Please try again.`);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!currentUser) return;

    if (
      !confirm(
        "Are you sure you want to delete this document? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const result = await db.deleteDocument(documentId);
      if (result.data) {
        setDocuments(documents.filter((doc) => doc.id !== documentId));
        alert("Document deleted successfully!");
      } else {
        alert("Failed to delete document: " + result.error);
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Failed to delete document. Please try again.");
    }
  };

  const handleUpload = async (
    docType: string,
    file: File,
    description: string,
  ) => {
    if (!currentUser) return;

    try {
      setUploading(true);

      // Simulate file upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = await db.uploadDocument({
        userId: currentUser.id,
        type: docType as "moa" | "waiver" | "evaluation",
        title: description || file.name,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file), // In real app, this would be uploaded to cloud storage
        status: "pending",
      });

      if (result.data) {
        const newDoc: Document = {
          id: result.data.id,
          name: result.data.fileName,
          type: result.data.type.toUpperCase() as
            | "MOA"
            | "Waiver"
            | "Evaluation",
          status: "Pending",
          uploadDate: new Date(result.data.uploadDate)
            .toISOString()
            .split("T")[0],
          fileUrl: result.data.fileUrl,
        };
        setDocuments([newDoc, ...documents]);
        alert(
          `${docType.toUpperCase()} document uploaded successfully! It will be reviewed by your coordinator.`,
        );
      } else {
        alert("Failed to upload document. Please try again.");
      }
    } catch (error) {
      console.error("Failed to upload document:", error);
      alert("An error occurred during upload. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const filteredDocuments =
    activeTab === "all"
      ? documents
      : documents.filter((doc) => doc.type.toLowerCase() === activeTab);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "Rejected":
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <Badge variant="default" className="bg-green-500">
            Approved
          </Badge>
        );
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return (
          <Badge
            variant="outline"
            className="text-yellow-500 border-yellow-500"
          >
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-700">
            Document Management
          </CardTitle>
          <CardDescription>
            Upload, view, and manage your OJT documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="all">All Documents</TabsTrigger>
                <TabsTrigger value="moa">MOA</TabsTrigger>
                <TabsTrigger value="waiver">Waivers</TabsTrigger>
                <TabsTrigger value="evaluation">Evaluations</TabsTrigger>
              </TabsList>

              {/* Only show upload button for students and coordinators */}
              {(actualUserRole === "student" ||
                actualUserRole === "coordinator") && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      disabled={uploading}
                    >
                      <UploadIcon className="mr-2 h-4 w-4" />
                      {uploading ? "Uploading..." : "Upload Document"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload New Document</DialogTitle>
                      <DialogDescription>
                        Upload your OJT-related documents here. Supported
                        formats: PDF, DOC, DOCX.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="docType" className="text-right">
                          Document Type
                        </Label>
                        <select
                          id="docType"
                          className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                        >
                          <option value="moa">
                            Memorandum of Agreement (MOA)
                          </option>
                          <option value="waiver">Waiver Form</option>
                          <option value="evaluation">Evaluation Form</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="docFile" className="text-right">
                          File
                        </Label>
                        <Input
                          id="docFile"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="docDescription" className="text-right">
                          Description
                        </Label>
                        <Input
                          id="docDescription"
                          className="col-span-3"
                          placeholder="Brief description of the document"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={uploading}
                        onClick={(e) => {
                          e.preventDefault();
                          const dialog =
                            e.currentTarget.closest('[role="dialog"]');
                          if (dialog) {
                            const docType = (
                              dialog.querySelector(
                                "#docType",
                              ) as HTMLSelectElement
                            )?.value;
                            const file = (
                              dialog.querySelector(
                                "#docFile",
                              ) as HTMLInputElement
                            )?.files?.[0];
                            const description = (
                              dialog.querySelector(
                                "#docDescription",
                              ) as HTMLInputElement
                            )?.value;

                            if (!docType) {
                              alert("Please select a document type.");
                              return;
                            }

                            if (!file) {
                              alert("Please select a file to upload.");
                              return;
                            }

                            // Validate file type
                            const allowedTypes = [
                              "application/pdf",
                              "application/msword",
                              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            ];
                            if (!allowedTypes.includes(file.type)) {
                              alert("Please upload a PDF, DOC, or DOCX file.");
                              return;
                            }

                            // Validate file size (max 10MB)
                            if (file.size > 10 * 1024 * 1024) {
                              alert("File size must be less than 10MB.");
                              return;
                            }

                            handleUpload(docType, file, description || "");
                          }
                        }}
                      >
                        {uploading ? "Uploading..." : "Upload"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <TabsContent value="all" className="mt-0">
              {loading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading documents...</p>
                </div>
              ) : (
                <DocumentList
                  documents={filteredDocuments}
                  getStatusIcon={getStatusIcon}
                  getStatusBadge={getStatusBadge}
                  setSelectedDocument={setSelectedDocument}
                  setPreviewOpen={setPreviewOpen}
                  userRole={actualUserRole}
                />
              )}
            </TabsContent>
            <TabsContent value="moa" className="mt-0">
              <DocumentList
                documents={filteredDocuments}
                getStatusIcon={getStatusIcon}
                getStatusBadge={getStatusBadge}
                setSelectedDocument={setSelectedDocument}
                setPreviewOpen={setPreviewOpen}
                userRole={userRole}
              />
            </TabsContent>
            <TabsContent value="waiver" className="mt-0">
              <DocumentList
                documents={filteredDocuments}
                getStatusIcon={getStatusIcon}
                getStatusBadge={getStatusBadge}
                setSelectedDocument={setSelectedDocument}
                setPreviewOpen={setPreviewOpen}
                userRole={userRole}
              />
            </TabsContent>
            <TabsContent value="evaluation" className="mt-0">
              <DocumentList
                documents={filteredDocuments}
                getStatusIcon={getStatusIcon}
                getStatusBadge={getStatusBadge}
                setSelectedDocument={setSelectedDocument}
                setPreviewOpen={setPreviewOpen}
                userRole={userRole}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Document Preview Dialog */}
      {selectedDocument && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <FileTextIcon className="mr-2 h-5 w-5" />
                {selectedDocument.name}
              </DialogTitle>
              <DialogDescription>
                Uploaded on {selectedDocument.uploadDate} •{" "}
                {selectedDocument.type} • {selectedDocument.status}
              </DialogDescription>
            </DialogHeader>
            <div className="bg-gray-100 rounded-md p-4 min-h-[400px] flex items-center justify-center">
              {/* This would be replaced with an actual document preview component */}
              <div className="text-center">
                <FileIcon className="h-16 w-16 mx-auto text-gray-400" />
                <p className="mt-4 text-gray-600">
                  Document preview would appear here
                </p>
                <p className="text-sm text-gray-500">
                  Filename: {selectedDocument.name}
                </p>
              </div>
            </div>
            {selectedDocument.comments && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm font-medium text-red-800">Feedback:</p>
                <p className="text-sm text-red-700">
                  {selectedDocument.comments}
                </p>
              </div>
            )}
            <DialogFooter className="flex justify-between items-center">
              <div>{getStatusBadge(selectedDocument.status)}</div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                  Close
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    alert("Document downloaded successfully!");
                  }}
                >
                  Download
                </Button>
                {(actualUserRole === "coordinator" ||
                  actualUserRole === "admin") &&
                  selectedDocument.status === "Pending" && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="border-green-500 text-green-600 hover:bg-green-50"
                        onClick={() =>
                          handleDocumentAction(selectedDocument.id, "approve")
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-500 text-red-600 hover:bg-red-50"
                        onClick={() =>
                          handleDocumentAction(selectedDocument.id, "reject")
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

interface DocumentListProps {
  documents: Document[];
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
  setSelectedDocument: (doc: Document) => void;
  setPreviewOpen: (open: boolean) => void;
  userRole: string;
}

const DocumentList = ({
  documents,
  getStatusIcon,
  getStatusBadge,
  setSelectedDocument,
  setPreviewOpen,
  userRole,
}: DocumentListProps) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md bg-gray-50">
        <FileIcon className="h-10 w-10 mx-auto text-gray-400" />
        <p className="mt-2 text-gray-500">No documents found</p>
        <p className="text-sm text-gray-400">
          Upload a document to get started
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="mr-3">
                <FileIcon className="h-8 w-8 text-gray-500" />
              </div>
              <div>
                <p className="font-medium">{doc.name}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>Uploaded: {doc.uploadDate}</span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    {getStatusIcon(doc.status)}
                    <span className="ml-1">{doc.status}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(doc.status)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDocument(doc);
                  setPreviewOpen(true);
                }}
              >
                <EyeIcon className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>

              {/* Only show delete option for appropriate roles */}
              {(userRole === "student" ||
                userRole === "coordinator" ||
                userRole === "admin") && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the document "{doc.name}".
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default DocumentManager;
