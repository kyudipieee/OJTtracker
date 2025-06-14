import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  FileTextIcon,
  GraduationCapIcon,
  MailIcon,
  UserIcon,
  Users2Icon,
  TrendingUp,
  AlertTriangle,
  Activity,
  Database,
  Settings,
  BarChart3,
} from "lucide-react";
import { db } from "@/lib/database";
import { getCurrentUser } from "@/lib/auth";
import ProgressTracker from "@/components/student/ProgressTracker";
import LogbookReview from "@/components/coordinator/LogbookReview";
import StudentEvaluationForm from "@/components/supervisor/StudentEvaluationForm";

interface DashboardContentProps {
  userRole?: "student" | "coordinator" | "supervisor" | "admin";
  userName?: string;
  announcements?: Array<{
    id: string;
    title: string;
    content: string;
    date: string;
    isNew?: boolean;
  }>;
  pendingTasks?: Array<{
    id: string;
    title: string;
    dueDate: string;
    status: "pending" | "completed" | "overdue";
  }>;
  metrics?: {
    completedHours?: number;
    totalRequiredHours?: number;
    pendingLogs?: number;
    approvedLogs?: number;
    rejectedLogs?: number;
    totalStudents?: number;
    activeStudents?: number;
    pendingReviews?: number;
    assignedStudents?: number;
    pendingEvaluations?: number;
  };
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  userRole,
  userName,
  announcements: propAnnouncements,
  pendingTasks: propPendingTasks,
  metrics: propMetrics,
}) => {
  const currentUser = getCurrentUser();
  const actualUserRole = userRole || currentUser?.role || "student";
  const actualUserName = userName || currentUser?.name || "John Doe";

  const [announcements, setAnnouncements] = useState(propAnnouncements || []);
  const [pendingTasks, setPendingTasks] = useState(propPendingTasks || []);
  const [metrics, setMetrics] = useState(propMetrics || {});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch announcements
        const announcementsResult = await db.getAnnouncements(actualUserRole);
        if (announcementsResult.data) {
          const formattedAnnouncements = announcementsResult.data.map((a) => ({
            id: a.id,
            title: a.title,
            content: a.content,
            date: new Date(a.createdAt).toISOString().split("T")[0],
            isNew:
              new Date(a.createdAt) >
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          }));
          setAnnouncements(formattedAnnouncements);
        }

        // Fetch system stats
        const statsResult = await db.getSystemStats();
        if (statsResult.data) {
          const stats = statsResult.data;

          // Generate role-specific metrics
          let roleMetrics = {};

          if (actualUserRole === "student" && currentUser) {
            // Fetch student-specific data
            const logbookResult = await db.getLogbookEntries(currentUser.id);
            const documentsResult = await db.getUserDocuments(currentUser.id);
            const evaluationsResult = await db.getStudentEvaluations(
              currentUser.id,
            );

            const logEntries = logbookResult.data || [];
            const documents = documentsResult.data || [];
            const evaluations = evaluationsResult.data || [];

            const totalHours = logEntries
              .filter((entry) => entry.status === "approved")
              .reduce((sum, entry) => sum + entry.hoursWorked, 0);

            roleMetrics = {
              completedHours: totalHours,
              totalRequiredHours: 486,
              pendingLogs: logEntries.filter((e) => e.status === "submitted")
                .length,
              approvedLogs: logEntries.filter((e) => e.status === "approved")
                .length,
              rejectedLogs: logEntries.filter((e) => e.status === "rejected")
                .length,
            };

            // Generate student-specific tasks
            const tasks = [];
            if (
              documents.filter(
                (d) => d.type === "moa" && d.status === "pending",
              ).length === 0
            ) {
              tasks.push({
                id: "moa",
                title: "Upload signed MOA",
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0],
                status: "pending",
              });
            }
            if (
              logEntries.filter(
                (e) =>
                  new Date(e.date) > new Date(Date.now() - 24 * 60 * 60 * 1000),
              ).length === 0
            ) {
              tasks.push({
                id: "daily-log",
                title: "Submit daily log",
                dueDate: new Date().toISOString().split("T")[0],
                status: "urgent",
              });
            }
            setPendingTasks(tasks);
          } else if (actualUserRole === "coordinator") {
            roleMetrics = {
              totalStudents: stats.totalUsers,
              activeStudents: stats.activeStudents,
              pendingReviews: stats.pendingDocuments,
              completedEvaluations: stats.completedEvaluations,
            };

            // Generate coordinator tasks
            // Generate coordinator tasks
            const coordinatorTasks = [];
            if (stats.pendingDocuments > 0) {
              coordinatorTasks.push({
                id: "review-docs",
                title: `Review ${stats.pendingDocuments} pending documents`,
                dueDate: new Date().toISOString().split("T")[0],
                status: stats.pendingDocuments > 5 ? "urgent" : "pending",
              });
            }

            // Fetch pending logbook entries for coordinator review
            const allLogbookResult = await db.getAllLogbookEntries();
            if (allLogbookResult.data) {
              const pendingLogs = allLogbookResult.data.filter(
                (log) => log.status === "submitted",
              );
              if (pendingLogs.length > 0) {
                coordinatorTasks.push({
                  id: "review-logs",
                  title: `Review ${pendingLogs.length} pending logbook entries`,
                  dueDate: new Date().toISOString().split("T")[0],
                  status: pendingLogs.length > 10 ? "urgent" : "pending",
                });
              }
            }

            coordinatorTasks.push({
              id: "student-progress",
              title: "Review student progress reports",
              dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              status: "pending",
            });

            setPendingTasks(coordinatorTasks);
          } else if (actualUserRole === "supervisor") {
            // Fetch supervisor-specific data
            const assignedStudentsResult = await db.getAssignedStudents(
              currentUser.id,
            );
            const supervisorEvaluationsResult =
              await db.getSupervisorEvaluations(currentUser.id);

            const assignedStudents = assignedStudentsResult.data || [];
            const supervisorEvaluations =
              supervisorEvaluationsResult.data || [];

            roleMetrics = {
              assignedStudents: assignedStudents.length,
              pendingEvaluations:
                assignedStudents.length - supervisorEvaluations.length,
              completedEvaluations: supervisorEvaluations.length,
            };

            const supervisorTasks = [];
            if (assignedStudents.length - supervisorEvaluations.length > 0) {
              supervisorTasks.push({
                id: "evaluate-students",
                title: `Complete ${assignedStudents.length - supervisorEvaluations.length} student evaluations`,
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0],
                status: "pending",
              });
            }

            supervisorTasks.push({
              id: "review-logbooks",
              title: "Review student logbook entries",
              dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              status: "pending",
            });

            setPendingTasks(supervisorTasks);
          } else if (actualUserRole === "admin") {
            roleMetrics = {
              totalUsers: stats.totalUsers,
              activeStudents: stats.activeStudents,
              totalCoordinators: stats.totalCoordinators,
              totalSupervisors: stats.totalSupervisors,
              pendingDocuments: stats.pendingDocuments,
              registrationsThisMonth: stats.registrationsThisMonth,
            };

            setPendingTasks([
              {
                id: "user-approvals",
                title: "Review new user registrations",
                dueDate: new Date().toISOString().split("T")[0],
                status: "pending",
              },
              {
                id: "system-maintenance",
                title: "System maintenance check",
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0],
                status: "pending",
              },
            ]);
          }

          setMetrics({ ...stats, ...roleMetrics });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Fallback to default data
        setAnnouncements([
          {
            id: "1",
            title: "Welcome to OJT Tracker",
            content: "Get started by exploring the features available to you.",
            date: new Date().toISOString().split("T")[0],
            isNew: true,
          },
        ]);
        setPendingTasks([
          {
            id: "1",
            title: "Complete your profile",
            dueDate: new Date().toISOString().split("T")[0],
            status: "pending",
          },
        ]);
        setMetrics({
          completedHours: 0,
          totalRequiredHours: 486,
          pendingLogs: 0,
          approvedLogs: 0,
          rejectedLogs: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [actualUserRole, currentUser]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  // Calculate progress percentage for student hours
  const hoursProgressPercentage =
    metrics.completedHours && metrics.totalRequiredHours
      ? Math.round((metrics.completedHours / metrics.totalRequiredHours) * 100)
      : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {actualUserName}!
        </h1>
        <p className="text-gray-600 mt-1">
          {actualUserRole === "student" &&
            "Track your OJT progress and submissions"}
          {actualUserRole === "coordinator" &&
            "Manage student OJT records and evaluations"}
          {actualUserRole === "supervisor" &&
            "Review and evaluate assigned students"}
          {actualUserRole === "admin" &&
            "System administration and user management"}
        </p>
      </div>

      {/* Role-specific Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {actualUserRole === "student" && (
          <>
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <ClipboardListIcon className="mr-2 h-5 w-5 text-green-600" />
                  OJT Hours
                </CardTitle>
                <CardDescription>
                  Your progress towards required hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      {metrics.completedHours} / {metrics.totalRequiredHours}{" "}
                      hours
                    </span>
                    <span className="text-sm font-medium">
                      {hoursProgressPercentage}%
                    </span>
                  </div>
                  <Progress value={hoursProgressPercentage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileTextIcon className="mr-2 h-5 w-5 text-green-600" />
                  Logbook Status
                </CardTitle>
                <CardDescription>
                  Summary of your log submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-md bg-yellow-50">
                    <p className="text-2xl font-bold text-yellow-600">
                      {metrics.pendingLogs}
                    </p>
                    <p className="text-xs text-gray-600">Pending</p>
                  </div>
                  <div className="p-2 rounded-md bg-green-50">
                    <p className="text-2xl font-bold text-green-600">
                      {metrics.approvedLogs}
                    </p>
                    <p className="text-xs text-gray-600">Approved</p>
                  </div>
                  <div className="p-2 rounded-md bg-red-50">
                    <p className="text-2xl font-bold text-red-600">
                      {metrics.rejectedLogs}
                    </p>
                    <p className="text-xs text-gray-600">Rejected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {actualUserRole === "coordinator" && (
          <>
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users2Icon className="mr-2 h-5 w-5 text-green-600" />
                  Student Overview
                </CardTitle>
                <CardDescription>Current student statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-md bg-green-50">
                    <p className="text-2xl font-bold text-green-600">
                      {metrics.activeStudents}
                    </p>
                    <p className="text-xs text-gray-600">Active</p>
                  </div>
                  <div className="p-2 rounded-md bg-blue-50">
                    <p className="text-2xl font-bold text-blue-600">
                      {metrics.totalStudents}
                    </p>
                    <p className="text-xs text-gray-600">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <ClipboardListIcon className="mr-2 h-5 w-5 text-green-600" />
                  Pending Reviews
                </CardTitle>
                <CardDescription>
                  Items requiring your attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-2 rounded-md bg-yellow-50 text-center">
                  <p className="text-3xl font-bold text-yellow-600">
                    {metrics.pendingReviews}
                  </p>
                  <p className="text-sm text-gray-600">
                    Submissions awaiting review
                  </p>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  View All Pending Items
                </Button>
              </CardFooter>
            </Card>
          </>
        )}

        {actualUserRole === "supervisor" && (
          <>
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users2Icon className="mr-2 h-5 w-5 text-green-600" />
                  Assigned Students
                </CardTitle>
                <CardDescription>
                  Students under your supervision
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-2 rounded-md bg-blue-50 text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {metrics.assignedStudents}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total assigned students
                  </p>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  View Student List
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <ClipboardListIcon className="mr-2 h-5 w-5 text-green-600" />
                  Pending Evaluations
                </CardTitle>
                <CardDescription>
                  Evaluations requiring your input
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-2 rounded-md bg-yellow-50 text-center">
                  <p className="text-3xl font-bold text-yellow-600">
                    {metrics.pendingEvaluations}
                  </p>
                  <p className="text-sm text-gray-600">
                    Evaluations to complete
                  </p>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  Complete Evaluations
                </Button>
              </CardFooter>
            </Card>
          </>
        )}

        {actualUserRole === "admin" && (
          <>
            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users2Icon className="mr-2 h-5 w-5 text-green-600" />
                  System Users
                </CardTitle>
                <CardDescription>
                  User account statistics and growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 rounded-md bg-blue-50 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {metrics.totalStudents || 0}
                    </p>
                    <p className="text-xs text-gray-600">Students</p>
                  </div>
                  <div className="p-2 rounded-md bg-purple-50 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {(metrics.totalCoordinators || 0) +
                        (metrics.totalSupervisors || 0) +
                        1}
                    </p>
                    <p className="text-xs text-gray-600">Staff</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+12% this month</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  Manage Users
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Database className="mr-2 h-5 w-5 text-green-600" />
                  System Health
                </CardTitle>
                <CardDescription>
                  Performance and status monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uptime</span>
                    <span className="text-sm font-medium text-green-600">
                      99.9%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Response Time</span>
                    <span className="text-sm font-medium">120ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Storage Used</span>
                    <span className="text-sm font-medium">2.4MB</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  <Activity className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-green-600" />
                  Analytics Overview
                </CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 rounded-md bg-green-50 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {metrics.completedEvaluations || 0}
                    </p>
                    <p className="text-xs text-gray-600">Evaluations</p>
                  </div>
                  <div className="p-2 rounded-md bg-amber-50 text-center">
                    <p className="text-2xl font-bold text-amber-600">
                      {metrics.pendingDocuments || 0}
                    </p>
                    <p className="text-xs text-gray-600">Pending</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-blue-600">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  <span>View full analytics</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="h-4 w-4 mr-1" />
                  System Settings
                </Button>
              </CardFooter>
            </Card>
          </>
        )}

        {/* Common Card for All Roles */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <MailIcon className="mr-2 h-5 w-5 text-green-600" />
                Announcements
              </CardTitle>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 hover:bg-green-100"
              >
                {announcements.filter((a) => a.isNew).length} New
              </Badge>
            </div>
            <CardDescription>Latest updates and notices</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[180px] overflow-y-auto">
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-3 rounded-md bg-gray-50 border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">
                      {announcement.title}
                    </h4>
                    {announcement.isNew && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(announcement.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" size="sm" className="w-full">
              View All Announcements
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Pending Tasks Section */}
      <div className="mb-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <CheckCircle2Icon className="mr-2 h-5 w-5 text-green-600" />
              Pending Tasks
            </CardTitle>
            <CardDescription>Tasks requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="pending">
                <div className="space-y-4">
                  {pendingTasks
                    .filter(
                      (task) =>
                        task.status === "pending" || task.status === "overdue",
                    )
                    .map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 rounded-md border border-gray-100"
                      >
                        <div className="flex items-center">
                          <div
                            className={`h-3 w-3 rounded-full mr-3 ${task.status === "overdue" ? "bg-red-500" : "bg-yellow-500"}`}
                          ></div>
                          <div>
                            <p className="font-medium text-sm">{task.title}</p>
                            <p className="text-xs text-gray-500">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={
                            task.status === "overdue"
                              ? "bg-red-100 text-red-800 hover:bg-red-200"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          }
                        >
                          {task.status === "overdue" ? "Overdue" : "Pending"}
                        </Badge>
                      </div>
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="upcoming">
                <div className="p-4 text-center text-gray-500">
                  <p>No upcoming tasks scheduled.</p>
                </div>
              </TabsContent>
              <TabsContent value="completed">
                <div className="p-4 text-center text-gray-500">
                  <p>No completed tasks yet.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button
              variant="default"
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {actualUserRole === "student" && "Go to Logbook"}
              {actualUserRole === "coordinator" && "Review Submissions"}
              {actualUserRole === "supervisor" && "Complete Evaluations"}
              {actualUserRole === "admin" && "View All Tasks"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Role-specific Components */}
      {actualUserRole === "student" && (
        <div className="mb-6">
          <ProgressTracker />
        </div>
      )}

      {actualUserRole === "coordinator" && (
        <div className="mb-6">
          <LogbookReview className="" />
        </div>
      )}

      {actualUserRole === "supervisor" && (
        <div className="mb-6">
          <StudentEvaluationForm className="" />
        </div>
      )}

      {/* Quick Links Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actualUserRole === "student" && (
            <>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <FileTextIcon className="h-6 w-6 text-green-600" />
                <span>Submit Logbook</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <ClipboardListIcon className="h-6 w-6 text-green-600" />
                <span>Upload Documents</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <CalendarIcon className="h-6 w-6 text-green-600" />
                <span>View Schedule</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <UserIcon className="h-6 w-6 text-green-600" />
                <span>My Profile</span>
              </Button>
            </>
          )}

          {actualUserRole === "coordinator" && (
            <>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <Users2Icon className="h-6 w-6 text-green-600" />
                <span>Student List</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <ClipboardListIcon className="h-6 w-6 text-green-600" />
                <span>Review Logs</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <MailIcon className="h-6 w-6 text-green-600" />
                <span>Post Announcement</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <FileTextIcon className="h-6 w-6 text-green-600" />
                <span>Generate Reports</span>
              </Button>
            </>
          )}

          {actualUserRole === "supervisor" && (
            <>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <Users2Icon className="h-6 w-6 text-green-600" />
                <span>My Students</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <ClipboardListIcon className="h-6 w-6 text-green-600" />
                <span>Evaluate Students</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <FileTextIcon className="h-6 w-6 text-green-600" />
                <span>View Logbooks</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <UserIcon className="h-6 w-6 text-green-600" />
                <span>My Profile</span>
              </Button>
            </>
          )}

          {actualUserRole === "admin" && (
            <>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <Users2Icon className="h-6 w-6 text-green-600" />
                <span>Manage Users</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <GraduationCapIcon className="h-6 w-6 text-green-600" />
                <span>OJT Programs</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <FileTextIcon className="h-6 w-6 text-green-600" />
                <span>System Reports</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <MailIcon className="h-6 w-6 text-green-600" />
                <span>Announcements</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
