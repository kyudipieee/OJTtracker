import React, { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";

interface LogbookReviewProps {
  className?: string;
}

const LogbookReview = ({ className }: LogbookReviewProps) => {
  const currentUser = getCurrentUser();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [feedback, setFeedback] = useState("");
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        const result = await db.getLogbookEntriesForReview(
          currentUser?.id || "",
        );
        if (result.data) {
          setEntries(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch logbook entries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [currentUser]);

  const handleReviewEntry = async (
    entryId: string,
    action: "approve" | "reject",
  ) => {
    try {
      setReviewing(true);
      const result = await db.reviewLogbookEntry(entryId, action, feedback);
      if (result.data) {
        setEntries(entries.filter((e: any) => e.id !== entryId));
        setReviewDialogOpen(false);
        setFeedback("");
        alert(`Entry ${action}d successfully!`);
      }
    } catch (error) {
      console.error(`Failed to ${action} entry:`, error);
      alert(`Failed to ${action} entry. Please try again.`);
    } finally {
      setReviewing(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedEntries.length === 0) {
      alert("Please select entries to approve.");
      return;
    }

    try {
      const result = await db.bulkApproveLogbookEntries(
        selectedEntries,
        currentUser?.id || "",
      );
      if (result.data) {
        setEntries(entries.filter((e: any) => !selectedEntries.includes(e.id)));
        setSelectedEntries([]);
        alert(`${selectedEntries.length} entries approved successfully!`);
      }
    } catch (error) {
      console.error("Failed to bulk approve entries:", error);
      alert("Failed to approve entries. Please try again.");
    }
  };

  const toggleEntrySelection = (entryId: string) => {
    setSelectedEntries((prev) =>
      prev.includes(entryId)
        ? prev.filter((id) => id !== entryId)
        : [...prev, entryId],
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className={`bg-white rounded-lg ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-green-700">
                Logbook Review Center
              </CardTitle>
              <CardDescription>
                Review and approve student logbook submissions
              </CardDescription>
            </div>
            {selectedEntries.length > 0 && (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleBulkApprove}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Selected ({selectedEntries.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading entries...</p>
            </div>
          ) : entries.length > 0 ? (
            <div className="space-y-4">
              {entries.map((entry: any) => {
                return (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onReview={(entryId, action) =>
                      handleReviewEntry(entryId, action)
                    }
                    selectedEntries={selectedEntries}
                    onToggleSelection={toggleEntrySelection}
                    feedback={feedback}
                    setFeedback={setFeedback}
                    reviewing={reviewing}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No entries pending review</p>
              <p className="text-sm text-gray-400">
                All logbook entries have been reviewed
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Separate component for individual entry cards to fix the hooks issue
const EntryCard = ({
  entry,
  onReview,
  selectedEntries,
  onToggleSelection,
  feedback,
  setFeedback,
  reviewing,
}: any) => {
  const [studentName, setStudentName] = useState("Loading...");

  useEffect(() => {
    const fetchStudentName = async () => {
      try {
        const result = await db.getUserById(entry.userId);
        if (result.data) {
          setStudentName(result.data.name);
        }
      } catch (error) {
        setStudentName("Unknown Student");
      }
    };
    fetchStudentName();
  }, [entry.userId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Checkbox
              checked={selectedEntries.includes(entry.id)}
              onCheckedChange={() => onToggleSelection(entry.id)}
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-medium text-lg">{entry.title}</h3>
                {getStatusIcon(entry.status)}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {studentName}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(entry.date), "PPP")}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {entry.hoursWorked} hours
                </div>
              </div>
              <p className="text-gray-700 text-sm line-clamp-2">
                {entry.description}
              </p>
              {entry.activities && entry.activities.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {entry.activities
                      .slice(0, 3)
                      .map((activity: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {activity}
                        </Badge>
                      ))}
                    {entry.activities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{entry.activities.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Review
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Review Logbook Entry</DialogTitle>
                  <DialogDescription>
                    {entry.title} - {studentName}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Entry Details</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Date:
                          </span>
                          <p className="text-sm">
                            {format(new Date(entry.date), "PPP")}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Hours:
                          </span>
                          <p className="text-sm">{entry.hoursWorked} hours</p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-500">
                          Description:
                        </span>
                        <p className="text-sm mt-1 whitespace-pre-wrap">
                          {entry.description}
                        </p>
                      </div>
                      {entry.activities && entry.activities.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Activities:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.activities.map(
                              (activity: string, index: number) => (
                                <Badge key={index} variant="outline">
                                  {activity}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Feedback (Optional)
                    </label>
                    <Textarea
                      placeholder="Provide feedback for the student..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    onClick={() => onReview(entry.id, "reject")}
                    disabled={reviewing}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => onReview(entry.id, "approve")}
                    disabled={reviewing}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {reviewing ? "Processing..." : "Approve"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogbookReview;
