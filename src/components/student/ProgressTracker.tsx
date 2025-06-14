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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Target,
  Award,
} from "lucide-react";
import { format } from "date-fns";

interface ProgressTrackerProps {
  className?: string;
}

const ProgressTracker = ({ className }: ProgressTrackerProps) => {
  const currentUser = getCurrentUser();
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const result = await db.getStudentProgress(currentUser.id);
        if (result.data) {
          setProgress(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [currentUser]);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading progress...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className={`bg-white rounded-lg ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-10">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Unable to load progress data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-600";
    if (percentage >= 60) return "bg-blue-600";
    if (percentage >= 40) return "bg-yellow-600";
    return "bg-red-600";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`bg-white rounded-lg ${className}`}>
      <Card>
        <CardHeader className="bg-gradient-to-r from-green-600/10 to-green-600/5">
          <CardTitle className="text-2xl text-green-800 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2" />
            OJT Progress Tracker
          </CardTitle>
          <CardDescription className="text-gray-600">
            Track your internship progress and completion status
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Overall Progress */}
            <Card className="bg-gradient-to-r from-blue-50 to-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Overall Progress
                    </h3>
                    <p className="text-gray-600">Your OJT completion status</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      {progress.completionPercentage}%
                    </div>
                    <Badge
                      className={getProgressColor(
                        progress.completionPercentage,
                      )}
                    >
                      {progress.completionPercentage >= 80
                        ? "Excellent"
                        : progress.completionPercentage >= 60
                          ? "Good"
                          : progress.completionPercentage >= 40
                            ? "Fair"
                            : "Needs Improvement"}
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={progress.completionPercentage}
                  className="h-3"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Started</span>
                  <span>In Progress</span>
                  <span>Complete</span>
                </div>
              </CardContent>
            </Card>

            {/* Hours Tracking */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Hours Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-600">
                        {progress.totalHours}
                      </span>
                      <span className="text-gray-600">
                        / {progress.requiredHours} hours
                      </span>
                    </div>
                    <Progress
                      value={
                        (progress.totalHours / progress.requiredHours) * 100
                      }
                      className="h-2"
                    />
                    <div className="text-sm text-gray-600">
                      {progress.requiredHours - progress.totalHours} hours
                      remaining
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <FileText className="h-5 w-5 mr-2 text-green-600" />
                    Logbook Entries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Entries</span>
                      <Badge variant="outline">
                        {progress.logbookEntries.total}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Approved</span>
                      <Badge className="bg-green-100 text-green-800">
                        {progress.logbookEntries.approved}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Pending</span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {progress.logbookEntries.pending}
                      </Badge>
                    </div>
                    {progress.logbookEntries.rejected > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Rejected</span>
                        <Badge className="bg-red-100 text-red-800">
                          {progress.logbookEntries.rejected}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Documents and Evaluations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <FileText className="h-5 w-5 mr-2 text-purple-600" />
                    Required Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Submitted</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {progress.documents.submitted} /{" "}
                        {progress.documents.required}
                      </Badge>
                    </div>
                    <Progress
                      value={
                        (progress.documents.submitted /
                          progress.documents.required) *
                        100
                      }
                      className="h-2"
                    />
                    {progress.documents.pending > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Pending Review
                        </span>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {progress.documents.pending}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Award className="h-5 w-5 mr-2 text-orange-600" />
                    Evaluations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Total Evaluations
                      </span>
                      <Badge variant="outline">
                        {progress.evaluations.total}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Completed</span>
                      <Badge className="bg-green-100 text-green-800">
                        {progress.evaluations.completed}
                      </Badge>
                    </div>
                    {progress.evaluations.total === 0 && (
                      <p className="text-sm text-gray-500">
                        No evaluations yet. Your supervisor will evaluate your
                        performance periodically.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Last Activity */}
            {progress.lastActivity && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="h-5 w-5 mr-2 text-gray-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Last logbook entry submitted:
                    </span>
                    <span className="text-sm font-medium">
                      {format(new Date(progress.lastActivity), "PPP")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  window.location.href = "/logbook";
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Submit New Entry
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  window.location.href = "/documents";
                }}
              >
                <Target className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  window.location.href = "/evaluations";
                }}
              >
                <Award className="h-4 w-4 mr-2" />
                View Evaluations
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressTracker;
