import React, { useState, useEffect } from "react";
import { db, type DatabaseUser } from "@/lib/database";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Bell,
  FileText,
  Home as HomeIcon,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
  Shield,
  Database,
  Activity,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Mail,
  MessageSquare,
} from "lucide-react";
import { getCurrentUser, logout } from "@/lib/auth";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [systemMetrics, setSystemMetrics] = useState([
    {
      label: "Total Users",
      value: 0,
      icon: <Users className="h-6 w-6" />,
      trend: "+12%",
      color: "bg-blue-600",
    },
    {
      label: "Active Students",
      value: 0,
      icon: <Activity className="h-6 w-6" />,
      trend: "+8%",
      color: "bg-green-600",
    },
    {
      label: "Pending Documents",
      value: 0,
      icon: <Database className="h-6 w-6" />,
      trend: "-5%",
      color: "bg-yellow-600",
    },
    {
      label: "Logbook Entries",
      value: 0,
      icon: <CheckCircle className="h-6 w-6" />,
      trend: "+15%",
      color: "bg-purple-600",
    },
  ]);

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      action: "System initialized",
      user: "System",
      timestamp: "Just now",
      type: "system",
    },
  ]);

  const [userStats, setUserStats] = useState({
    students: 0,
    coordinators: 0,
    supervisors: 0,
    admins: 0,
  });

  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedUser, setSelectedUser] = useState<DatabaseUser | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);

        // Fetch system statistics
        const statsResult = await db.getSystemStats();
        if (statsResult.data) {
          const stats = statsResult.data;

          setSystemMetrics([
            {
              label: "Total Users",
              value: stats.totalUsers,
              icon: <Users className="h-6 w-6" />,
              trend: "+12%",
              color: "bg-blue-600",
            },
            {
              label: "Active Students",
              value: stats.activeStudents,
              icon: <Activity className="h-6 w-6" />,
              trend: "+8%",
              color: "bg-green-600",
            },
            {
              label: "Pending Documents",
              value: stats.pendingDocuments,
              icon: <Database className="h-6 w-6" />,
              trend: "-5%",
              color: "bg-yellow-600",
            },
            {
              label: "Logbook Entries",
              value: stats.totalLogbookEntries,
              icon: <CheckCircle className="h-6 w-6" />,
              trend: "+15%",
              color: "bg-purple-600",
            },
          ]);

          setUserStats({
            students: stats.activeStudents,
            coordinators: stats.totalCoordinators,
            supervisors: stats.totalSupervisors,
            admins: 1, // Based on default data
          });

          // Generate recent activities based on data
          const activities = [
            {
              id: 1,
              action: `${stats.registrationsThisMonth} new registrations this month`,
              user: "System",
              timestamp: "This month",
              type: "user",
            },
            {
              id: 2,
              action: `${stats.pendingDocuments} documents pending review`,
              user: "System",
              timestamp: "Current",
              type: "document",
            },
            {
              id: 3,
              action: `${stats.completedEvaluations} evaluations completed`,
              user: "System",
              timestamp: "Total",
              type: "evaluation",
            },
          ];
          setRecentActivities(activities);
        }

        // Fetch all users
        const usersResult = await db.getAllUsers();
        if (usersResult.data) {
          setUsers(usersResult.data);
        }

        // Fetch announcements
        const announcementsResult = await db.getAnnouncements();
        if (announcementsResult.data) {
          setAnnouncements(announcementsResult.data);
        }
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleUserAction = async (action: string, user?: DatabaseUser) => {
    if (action === "create") {
      setSelectedUser(null);
      setUserDialogOpen(true);
    } else if (action === "edit" && user) {
      setSelectedUser(user);
      setUserDialogOpen(true);
    } else if (action === "delete" && user) {
      try {
        const result = await db.deleteUser(user.id);
        if (result.data) {
          setUsers(users.filter((u) => u.id !== user.id));
          alert("User deleted successfully!");
        } else {
          alert("Failed to delete user: " + result.error);
        }
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert("An error occurred while deleting the user.");
      }
    } else if (action === "approve" && user) {
      const result = await db.updateUser(user.id, { status: "active" });
      if (result.data) {
        setUsers(users.map((u) => (u.id === user.id ? result.data! : u)));
        alert("User approved successfully!");
      } else {
        alert("Failed to approve user: " + result.error);
      }
    } else if (action === "suspend" && user) {
      const result = await db.updateUser(user.id, { status: "suspended" });
      if (result.data) {
        setUsers(users.map((u) => (u.id === user.id ? result.data! : u)));
        alert("User suspended successfully!");
      } else {
        alert("Failed to suspend user: " + result.error);
      }
    }
  };

  const handleSaveUser = async (userData: Partial<DatabaseUser>) => {
    try {
      if (selectedUser) {
        // Update existing user
        const result = await db.updateUser(selectedUser.id, userData);
        if (result.data) {
          setUsers(
            users.map((u) => (u.id === selectedUser.id ? result.data! : u)),
          );
        }
      } else {
        // Create new user
        const result = await db.createUser(
          userData as Omit<DatabaseUser, "id" | "registrationDate">,
        );
        if (result.data) {
          setUsers([result.data, ...users]);
        }
      }
      setUserDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  const handleCreateAnnouncement = async (announcementData: any) => {
    try {
      const result = await db.createAnnouncement({
        ...announcementData,
        authorId: currentUser?.id || "admin",
        authorName: currentUser?.name || "Administrator",
        isActive: true,
      });
      if (result.data) {
        setAnnouncements([result.data, ...announcements]);
        setAnnouncementDialogOpen(false);
        alert("Announcement created successfully!");
      } else {
        alert("Failed to create announcement: " + result.error);
      }
    } catch (error) {
      console.error("Failed to create announcement:", error);
      alert("An error occurred while creating the announcement.");
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      const result = await db.deleteAnnouncement(announcementId);
      if (result.data) {
        setAnnouncements(announcements.filter((a) => a.id !== announcementId));
        alert("Announcement deleted successfully!");
      } else {
        alert("Failed to delete announcement: " + result.error);
      }
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      alert("An error occurred while deleting the announcement.");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const navigationItems = [
    {
      icon: <HomeIcon className="h-5 w-5" />,
      label: "Dashboard",
      key: "dashboard",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "User Management",
      key: "users",
    },
    {
      icon: <Database className="h-5 w-5" />,
      label: "System Data",
      key: "data",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Reports",
      key: "reports",
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: "Announcements",
      key: "announcements",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      key: "settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-green-800 text-white flex flex-col">
        <div className="p-4 flex items-center justify-center border-b border-green-700">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8" />
            <div>
              <h2 className="font-bold text-lg">Admin Panel</h2>
              <p className="text-xs text-green-200">System Administration</p>
            </div>
          </div>
        </div>

        <div className="space-y-1 flex-1 p-4">
          {navigationItems.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                activeTab === item.key ? "bg-green-700" : "hover:bg-green-700"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="border-t border-green-700 p-4">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`}
              />
              <AvatarFallback>
                {currentUser?.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{currentUser?.name}</p>
              <p className="text-xs text-green-200">Administrator</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-green-700 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">System Administration</h1>
            <div className="flex items-center gap-4">
              <Badge className="bg-green-600">Admin Access</Badge>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading admin dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    {systemMetrics.map((metric, index) => (
                      <Card
                        key={index}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                {metric.label}
                              </p>
                              <p className="text-2xl font-bold">
                                {metric.value}
                              </p>
                              <p
                                className={`text-xs font-medium ${
                                  metric.trend?.startsWith("+")
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {metric.trend} from last month
                              </p>
                            </div>
                            <div
                              className={`p-3 rounded-full ${metric.color} text-white`}
                            >
                              {metric.icon}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Management */}
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>
                          Overview of system users by role
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="overview">
                          <TabsList className="mb-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="students">Students</TabsTrigger>
                            <TabsTrigger value="staff">Staff</TabsTrigger>
                          </TabsList>

                          <TabsContent value="overview">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                  <span className="text-sm">Students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {userStats.students}
                                  </span>
                                  <Progress value={75} className="w-20 h-2" />
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <span className="text-sm">Coordinators</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {userStats.coordinators}
                                  </span>
                                  <Progress value={40} className="w-20 h-2" />
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                  <span className="text-sm">Supervisors</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {userStats.supervisors}
                                  </span>
                                  <Progress value={60} className="w-20 h-2" />
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                  <span className="text-sm">Admins</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {userStats.admins}
                                  </span>
                                  <Progress value={15} className="w-20 h-2" />
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="students">
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">
                                Student management interface
                              </p>
                              <Button
                                className="mt-4 bg-green-600 hover:bg-green-700"
                                onClick={() => setActiveTab("users")}
                              >
                                Manage Students
                              </Button>
                            </div>
                          </TabsContent>

                          <TabsContent value="staff">
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">
                                Staff management interface
                              </p>
                              <Button
                                className="mt-4 bg-green-600 hover:bg-green-700"
                                onClick={() => setActiveTab("users")}
                              >
                                Manage Staff
                              </Button>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>

                    {/* Recent Activities */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activities</CardTitle>
                        <CardDescription>
                          Latest system activities and events
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[400px]">
                          <div className="space-y-4">
                            {recentActivities.map((activity) => (
                              <div
                                key={activity.id}
                                className="flex items-start gap-3"
                              >
                                <div className="rounded-full bg-green-100 p-2">
                                  {activity.type === "user" && (
                                    <Users className="h-3 w-3 text-green-600" />
                                  )}
                                  {activity.type === "document" && (
                                    <FileText className="h-3 w-3 text-green-600" />
                                  )}
                                  {activity.type === "company" && (
                                    <Database className="h-3 w-3 text-green-600" />
                                  )}
                                  {activity.type === "evaluation" && (
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {activity.action}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {activity.user}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {activity.timestamp}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              {activeTab === "users" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">User Management</h2>
                      <p className="text-muted-foreground">
                        Manage system users and their roles
                      </p>
                    </div>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleUserAction("create")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>

                  <Card>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search users..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <Select
                          value={filterRole}
                          onValueChange={setFilterRole}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="student">Students</SelectItem>
                            <SelectItem value="coordinator">
                              Coordinators
                            </SelectItem>
                            <SelectItem value="supervisor">
                              Supervisors
                            </SelectItem>
                            <SelectItem value="admin">Admins</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {filteredUsers.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <Avatar>
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                                />
                                <AvatarFallback>
                                  {user.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">{user.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {user.email}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant={
                                      user.role === "admin"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                  >
                                    {user.role}
                                  </Badge>
                                  <Badge
                                    variant={
                                      user.status === "active"
                                        ? "default"
                                        : "outline"
                                    }
                                  >
                                    {user.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {user.status === "pending_approval" && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() =>
                                    handleUserAction("approve", user)
                                  }
                                >
                                  Approve
                                </Button>
                              )}
                              {user.status === "active" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                                  onClick={() =>
                                    handleUserAction("suspend", user)
                                  }
                                >
                                  Suspend
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction("edit", user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete User
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete{" "}
                                      {user.name}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() =>
                                        handleUserAction("delete", user)
                                      }
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "data" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">
                        System Data Management
                      </h2>
                      <p className="text-muted-foreground">
                        Monitor and manage system data, backups, and performance
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Download className="h-4 w-4 mr-2" />
                        Backup System
                      </Button>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Data
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Database className="h-5 w-5 mr-2 text-green-600" />
                          Database Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span>Storage Used:</span>
                            <span className="font-medium">2.4 MB</span>
                          </div>
                          <Progress value={15} className="h-2" />
                          <div className="flex justify-between">
                            <span>Total Records:</span>
                            <span className="font-medium">
                              {users.length + announcements.length + 150}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Backup:</span>
                            <span className="font-medium text-green-600">
                              2 hours ago
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge className="bg-green-600">Healthy</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Activity className="h-5 w-5 mr-2 text-green-600" />
                          System Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Uptime:</span>
                            <span className="font-medium text-green-600">
                              99.9%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Response Time:</span>
                            <span className="font-medium">120ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Memory Usage:</span>
                            <span className="font-medium">45%</span>
                          </div>
                          <Progress value={45} className="h-2" />
                          <div className="flex justify-between">
                            <span>CPU Usage:</span>
                            <span className="font-medium">23%</span>
                          </div>
                          <Progress value={23} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Shield className="h-5 w-5 mr-2 text-green-600" />
                          Security & Logs
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Failed Logins:</span>
                            <span className="font-medium text-red-600">3</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Active Sessions:</span>
                            <span className="font-medium">
                              {
                                users.filter((u) => u.status === "active")
                                  .length
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Security Level:</span>
                            <Badge className="bg-green-600">High</Badge>
                          </div>
                          <Button variant="outline" className="w-full mt-2">
                            View Security Logs
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Export & Import</CardTitle>
                        <CardDescription>
                          Export system data for backup or analysis
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          <Button variant="outline" className="w-full">
                            <Download className="h-4 w-4 mr-2" />
                            Export Users
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Download className="h-4 w-4 mr-2" />
                            Export Logbooks
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Download className="h-4 w-4 mr-2" />
                            Export Documents
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Download className="h-4 w-4 mr-2" />
                            Export Evaluations
                          </Button>
                          <Button className="w-full col-span-2 bg-green-600 hover:bg-green-700">
                            <Download className="h-4 w-4 mr-2" />
                            Export Complete Backup
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>System Maintenance</CardTitle>
                        <CardDescription>
                          Perform system maintenance and optimization tasks
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Button variant="outline" className="w-full">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Clear Cache
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Database className="h-4 w-4 mr-2" />
                            Optimize Database
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Shield className="h-4 w-4 mr-2" />
                            Run Security Scan
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full text-red-600 hover:text-red-700"
                          >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            System Diagnostics
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "reports" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">Reports & Analytics</h2>
                    <p className="text-muted-foreground">
                      Generate and view system reports
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                          User Activity Report
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Detailed analysis of user engagement and activity
                          patterns.
                        </p>
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          Generate Report
                        </Button>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <PieChart className="h-5 w-5 mr-2 text-green-600" />
                          OJT Progress Report
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Overview of student progress and completion rates.
                        </p>
                        <Button className="w-full bg-green-600 hover:bg-green-700">
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
                        <p className="text-sm text-muted-foreground mb-4">
                          System performance metrics and optimization insights.
                        </p>
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          Generate Report
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "announcements" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">Announcements</h2>
                      <p className="text-muted-foreground">
                        Manage system-wide announcements
                      </p>
                    </div>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => setAnnouncementDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Announcement
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {announcements.map((announcement: any) => (
                      <Card key={announcement.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{announcement.title}</CardTitle>
                              <CardDescription>
                                By {announcement.authorName} •{" "}
                                {new Date(
                                  announcement.createdAt,
                                ).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <Badge
                              className={`${
                                announcement.priority === "urgent"
                                  ? "bg-red-600"
                                  : announcement.priority === "high"
                                    ? "bg-orange-600"
                                    : announcement.priority === "medium"
                                      ? "bg-yellow-600"
                                      : "bg-green-600"
                              }`}
                            >
                              {announcement.priority}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{announcement.content}</p>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                Target: {announcement.targetRoles.join(", ")}
                              </Badge>
                              <Badge
                                variant={
                                  announcement.isActive
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {announcement.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Announcement
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this
                                    announcement? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() =>
                                      handleDeleteAnnouncement(announcement.id)
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">System Settings</h2>
                    <p className="text-muted-foreground">
                      Configure system preferences and settings
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>System Name</Label>
                          <Input defaultValue="MinSU CCS OJT Tracker" />
                        </div>
                        <div>
                          <Label>Admin Email</Label>
                          <Input defaultValue="admin@minsu.edu.ph" />
                        </div>
                        <div>
                          <Label>Timezone</Label>
                          <Select defaultValue="asia/manila">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="asia/manila">
                                Asia/Manila
                              </SelectItem>
                              <SelectItem value="utc">UTC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Session Timeout (minutes)</Label>
                          <Input type="number" defaultValue="30" />
                        </div>
                        <div>
                          <Label>Password Policy</Label>
                          <Select defaultValue="medium">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low Security</SelectItem>
                              <SelectItem value="medium">
                                Medium Security
                              </SelectItem>
                              <SelectItem value="high">
                                High Security
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Two-Factor Authentication</Label>
                          <Select defaultValue="optional">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="disabled">Disabled</SelectItem>
                              <SelectItem value="optional">Optional</SelectItem>
                              <SelectItem value="required">Required</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="flex justify-end">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Save Settings
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Edit User" : "Create User"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser
                ? "Update user information"
                : "Add a new user to the system"}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const userData = {
                name: formData.get("name") as string,
                email: formData.get("email") as string,
                role: formData.get("role") as string,
                phone: formData.get("phone") as string,
                company: formData.get("company") as string,
                studentId: formData.get("studentId") as string,
                department: formData.get("department") as string,
              };
              handleSaveUser(userData);
            }}
          >
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={selectedUser?.name || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={selectedUser?.email || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  name="role"
                  defaultValue={selectedUser?.role || "student"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="coordinator">Coordinator</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={selectedUser?.phone || ""}
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  defaultValue={selectedUser?.company || ""}
                />
              </div>
              <div>
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  name="studentId"
                  defaultValue={selectedUser?.studentId || ""}
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  defaultValue={selectedUser?.department || ""}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setUserDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {selectedUser ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Announcement Dialog */}
      <Dialog
        open={announcementDialogOpen}
        onOpenChange={setAnnouncementDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
            <DialogDescription>
              Create a new system-wide announcement
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const announcementData = {
                title: formData.get("title") as string,
                content: formData.get("content") as string,
                priority: formData.get("priority") as string,
                targetRoles: [formData.get("targetRoles") as string],
              };
              handleCreateAnnouncement(announcementData);
            }}
          >
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" name="content" required />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="targetRoles">Target Audience</Label>
                <Select name="targetRoles" defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="coordinator">Coordinators</SelectItem>
                    <SelectItem value="supervisor">Supervisors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAnnouncementDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Create Announcement
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
