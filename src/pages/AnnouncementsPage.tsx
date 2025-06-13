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
import { Bell, Plus, Calendar, AlertCircle, CheckCircle } from "lucide-react";

const AnnouncementsPage = () => {
  const currentUser = getCurrentUser();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const result = await db.getAnnouncements(currentUser?.role);
        if (result.data) {
          setAnnouncements(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [currentUser]);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    try {
      setCreating(true);
      const result = await db.createAnnouncement({
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        priority: formData.get("priority") as string,
        targetRoles: [formData.get("targetRoles") as string],
        authorId: currentUser?.id || "",
        authorName: currentUser?.name || "",
        isActive: true,
      });

      if (result.data) {
        setAnnouncements([result.data, ...announcements]);
        setDialogOpen(false);
        alert("Announcement created successfully!");
      }
    } catch (error) {
      console.error("Failed to create announcement:", error);
      alert("Failed to create announcement. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-600";
      case "high":
        return "bg-orange-600";
      case "medium":
        return "bg-yellow-600";
      default:
        return "bg-green-600";
    }
  };

  return (
    <DashboardLayout userRole={currentUser?.role} userName={currentUser?.name}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Announcements Management
            </h1>
            <p className="text-gray-600 mt-1">
              Create, manage, and distribute announcements to users
            </p>
          </div>
          <div className="flex gap-2">
            {(currentUser?.role === "coordinator" ||
              currentUser?.role === "admin") && (
              <>
                <Button variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      New Announcement
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Announcement</DialogTitle>
                      <DialogDescription>
                        Share important information with users
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateAnnouncement}>
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
                              <SelectItem value="coordinator">
                                Coordinators
                              </SelectItem>
                              <SelectItem value="supervisor">
                                Supervisors
                              </SelectItem>
                            </SelectContent>
                          </Select>
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
                          {creating ? "Creating..." : "Create"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        {(currentUser?.role === "coordinator" ||
          currentUser?.role === "admin") && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Bell className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Announcements</p>
                    <p className="text-2xl font-bold">{announcements.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">This Month</p>
                    <p className="text-2xl font-bold">
                      {
                        announcements.filter((a: any) => {
                          const date = new Date(a.createdAt);
                          const now = new Date();
                          return (
                            date.getMonth() === now.getMonth() &&
                            date.getFullYear() === now.getFullYear()
                          );
                        }).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Urgent</p>
                    <p className="text-2xl font-bold">
                      {
                        announcements.filter(
                          (a: any) => a.priority === "urgent",
                        ).length
                      }
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
                      {announcements.filter((a: any) => a.isActive).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading announcements...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.length > 0 ? (
              announcements.map((announcement: any) => (
                <Card key={announcement.id} className="bg-white">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <Bell className="h-5 w-5 mr-2 text-green-600" />
                          {announcement.title}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(
                            announcement.createdAt,
                          ).toLocaleDateString()}
                          <span className="mx-2">•</span>
                          By {announcement.authorName}
                        </CardDescription>
                      </div>
                      <Badge
                        className={getPriorityColor(announcement.priority)}
                      >
                        {announcement.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <Badge variant="outline">
                        Target: {announcement.targetRoles.join(", ")}
                      </Badge>
                      <Badge
                        variant={
                          announcement.isActive ? "default" : "secondary"
                        }
                      >
                        {announcement.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-white">
                <CardContent className="text-center py-10">
                  <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No announcements available</p>
                  <p className="text-sm text-gray-400">
                    Check back later for updates
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnnouncementsPage;
