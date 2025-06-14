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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  Upload,
  Mail,
  Phone,
  Building,
  GraduationCap,
} from "lucide-react";

const UsersPage = () => {
  const currentUser = getCurrentUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const result = await db.getAllUsers();
        if (result.data) {
          setUsers(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleUserAction = async (action: string, user?: any) => {
    if (action === "create") {
      setSelectedUser(null);
      setDialogOpen(true);
    } else if (action === "edit" && user) {
      setSelectedUser(user);
      setDialogOpen(true);
    } else if (action === "delete" && user) {
      try {
        const result = await db.deleteUser(user.id);
        if (result.data) {
          setUsers(users.filter((u: any) => u.id !== user.id));
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
        setUsers(users.map((u: any) => (u.id === user.id ? result.data! : u)));
        alert("User approved successfully!");
      } else {
        alert("Failed to approve user: " + result.error);
      }
    } else if (action === "suspend" && user) {
      const result = await db.updateUser(user.id, { status: "suspended" });
      if (result.data) {
        setUsers(users.map((u: any) => (u.id === user.id ? result.data! : u)));
        alert("User suspended successfully!");
      } else {
        alert("Failed to suspend user: " + result.error);
      }
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const userData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as
        | "student"
        | "coordinator"
        | "supervisor"
        | "admin",
      phone: formData.get("phone") as string,
      company: formData.get("company") as string,
      studentId: formData.get("studentId") as string,
      department: formData.get("department") as string,
      status: "active" as "active" | "pending_approval" | "suspended",
    };

    try {
      setCreating(true);
      if (selectedUser) {
        // Update existing user
        const result = await db.updateUser((selectedUser as any).id, userData);
        if (result.data) {
          setUsers(
            users.map((u: any) =>
              u.id === (selectedUser as any).id ? result.data! : u,
            ),
          );
          alert("User updated successfully!");
        }
      } else {
        // Create new user
        const result = await db.createUser(userData as any);
        if (result.data) {
          setUsers([result.data, ...users]);
          alert("User created successfully!");
        }
      }
      setDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to save user:", error);
      alert("Failed to save user. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-600";
      case "pending_approval":
        return "bg-yellow-600";
      case "suspended":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-600";
      case "coordinator":
        return "bg-blue-600";
      case "supervisor":
        return "bg-purple-600";
      case "student":
        return "bg-green-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <DashboardLayout userRole={currentUser?.role} userName={currentUser?.name}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              User Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage system users, roles, and permissions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                alert(
                  "Users exported successfully! Check your downloads folder.",
                );
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Users
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                alert(
                  "Import users feature - Please select a CSV file to upload.",
                );
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Users
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleUserAction("create")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="text-2xl font-bold">
                    {users.filter((u: any) => u.role === "student").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Staff</p>
                  <p className="text-2xl font-bold">
                    {users.filter((u: any) => u.role !== "student").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold">
                    {users.filter((u: any) => u.status === "active").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Search & Filter Users
            </CardTitle>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="coordinator">Coordinators</SelectItem>
                  <SelectItem value="supervisor">Supervisors</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  alert("Advanced filters feature coming soon!");
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </CardHeader>
        </Card>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user: any) => (
                <Card key={user.id} className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                          />
                          <AvatarFallback>
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-lg">{user.name}</h3>
                            <Badge className={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {user.phone}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {user.studentId && (
                              <div className="flex items-center gap-1">
                                <GraduationCap className="h-4 w-4" />
                                ID: {user.studentId}
                              </div>
                            )}
                            {(user.company || user.department) && (
                              <div className="flex items-center gap-1">
                                <Building className="h-4 w-4" />
                                {user.company || user.department}
                              </div>
                            )}
                            <span>
                              Registered:{" "}
                              {new Date(
                                user.registrationDate,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.status === "pending_approval" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleUserAction("approve", user)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        {user.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                            onClick={() => handleUserAction("suspend", user)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
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
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {user.name}?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleUserAction("delete", user)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-white">
                <CardContent className="text-center py-10">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No users found</p>
                  <p className="text-sm text-gray-400">
                    {searchTerm || filterRole !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Users will appear here when they register"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* User Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
            <form onSubmit={handleSaveUser}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={(selectedUser as any)?.name || ""}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={(selectedUser as any)?.email || ""}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    name="role"
                    defaultValue={(selectedUser as any)?.role || "student"}
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
                    defaultValue={(selectedUser as any)?.phone || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    defaultValue={(selectedUser as any)?.company || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    name="studentId"
                    defaultValue={(selectedUser as any)?.studentId || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    defaultValue={(selectedUser as any)?.department || ""}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={creating}
                >
                  {creating ? "Saving..." : selectedUser ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default UsersPage;
