import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";

const ReportsPage = () => {
  const currentUser = getCurrentUser();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("overview");
  const [timeRange, setTimeRange] = useState("month");

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const systemStats = await db.getSystemStats();

        if (systemStats.data) {
          setStats(systemStats.data);
        }
      } catch (error) {
        console.error("Failed to fetch report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const generateReport = (type: string) => {
    // Simulate report generation
    alert(
      `Generating ${type} report... This would download a PDF/Excel file in a real application.`,
    );
  };

  const MetricCard = ({ title, value, icon, color, description }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );

  const ProgressCard = ({ title, current, total, color }: any) => {
    const percentage = Math.round((current / total) * 100);
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{title}</h3>
              <span className="text-sm text-gray-600">
                {current}/{total} ({percentage}%)
              </span>
            </div>
            <Progress value={percentage} className={`h-2 ${color}`} />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout userRole={currentUser?.role} userName={currentUser?.name}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Reports & Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Generate comprehensive reports, view analytics, and export data
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Export All Reports
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading report data...</p>
          </div>
        ) : (
          <Tabs value={reportType} onValueChange={setReportType}>
            <TabsList className="mb-6 grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="logbooks">Logbooks</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <MetricCard
                    title="Total Users"
                    value={stats.totalUsers || 0}
                    icon={<Users className="h-6 w-6 text-white" />}
                    color="bg-blue-600"
                    description="All registered users"
                  />
                  <MetricCard
                    title="Active Students"
                    value={stats.activeStudents || 0}
                    icon={<Users className="h-6 w-6 text-white" />}
                    color="bg-green-600"
                    description="Currently enrolled"
                  />
                  <MetricCard
                    title="Logbook Entries"
                    value={stats.totalLogbookEntries || 0}
                    icon={<FileText className="h-6 w-6 text-white" />}
                    color="bg-purple-600"
                    description="Total submissions"
                  />
                  <MetricCard
                    title="Pending Reviews"
                    value={stats.pendingDocuments || 0}
                    icon={<Clock className="h-6 w-6 text-white" />}
                    color="bg-yellow-600"
                    description="Awaiting approval"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Distribution</CardTitle>
                      <CardDescription>Breakdown by role</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <ProgressCard
                          title="Students"
                          current={stats.activeStudents || 0}
                          total={stats.totalUsers || 1}
                          color="bg-green-600"
                        />
                        <ProgressCard
                          title="Coordinators"
                          current={stats.totalCoordinators || 0}
                          total={stats.totalUsers || 1}
                          color="bg-blue-600"
                        />
                        <ProgressCard
                          title="Supervisors"
                          current={stats.totalSupervisors || 0}
                          total={stats.totalUsers || 1}
                          color="bg-purple-600"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>System Activity</CardTitle>
                      <CardDescription>Recent activity metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium">
                              Completed Evaluations
                            </span>
                          </div>
                          <Badge className="bg-green-600">
                            {stats.completedEvaluations || 0}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium">
                              New Registrations
                            </span>
                          </div>
                          <Badge className="bg-blue-600">
                            {stats.registrationsThisMonth || 0}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                            <span className="text-sm font-medium">
                              Pending Documents
                            </span>
                          </div>
                          <Badge className="bg-yellow-600">
                            {stats.pendingDocuments || 0}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="students">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                      Student Progress Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Detailed analysis of student OJT progress and completion
                      rates.
                    </p>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => generateReport("Student Progress")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChart className="h-5 w-5 mr-2 text-green-600" />
                      Completion Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Overview of OJT completion rates and time-to-completion
                      metrics.
                    </p>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => generateReport("Completion Statistics")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                      Performance Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Analysis of student performance trends over time.
                    </p>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => generateReport("Performance Trends")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="logbooks">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-green-600" />
                      Logbook Submission Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Analysis of logbook submission patterns and compliance
                      rates.
                    </p>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => generateReport("Logbook Submissions")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-green-600" />
                      Hours Tracking Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Detailed breakdown of OJT hours logged by students.
                    </p>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => generateReport("Hours Tracking")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      Approval Status Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Status of logbook entry approvals and pending reviews.
                    </p>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => generateReport("Approval Status")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="documents">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-green-600" />
                      Document Compliance Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Analysis of document submission compliance and approval
                      rates.
                    </p>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => generateReport("Document Compliance")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-green-600" />
                      Pending Approvals Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      List of documents awaiting approval and review timelines.
                    </p>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => generateReport("Pending Approvals")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="evaluations">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                      Evaluation Summary Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Comprehensive analysis of student evaluation scores and
                      trends.
                    </p>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => generateReport("Evaluation Summary")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                      Performance Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Detailed performance analytics and improvement
                      recommendations.
                    </p>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => generateReport("Performance Analytics")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                        Advanced Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Deep dive analytics with predictive insights and trend
                        analysis.
                      </p>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => generateReport("Advanced Analytics")}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <PieChart className="h-5 w-5 mr-2 text-green-600" />
                        Custom Dashboard
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Create custom dashboards with specific metrics and KPIs.
                      </p>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => generateReport("Custom Dashboard")}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Create Dashboard
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-green-600" />
                        Scheduled Reports
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Set up automated report generation and email delivery.
                      </p>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() =>
                          alert("Scheduled reports feature coming soon!")
                        }
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Reports
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
