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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Save,
  RefreshCw,
} from "lucide-react";

const SettingsPage = () => {
  const currentUser = getCurrentUser();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    profile: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      department: currentUser?.department || "",
      company: currentUser?.company || "",
      studentId: currentUser?.studentId || "",
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      announcementAlerts: true,
      logbookReminders: true,
      evaluationAlerts: true,
    },
    preferences: {
      theme: "light",
      language: "en",
      timezone: "Asia/Manila",
      dateFormat: "MM/DD/YYYY",
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
    },
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    try {
      setLoading(true);
      const profileData = {
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        department: formData.get("department") as string,
        company: formData.get("company") as string,
        studentId: formData.get("studentId") as string,
      };

      if (currentUser?.id) {
        const result = await db.updateUser(currentUser.id, profileData);
        if (result.data) {
          setSettings({
            ...settings,
            profile: { ...settings.profile, ...profileData },
          });
          alert("Profile updated successfully!");
        } else {
          alert("Failed to update profile: " + result.error);
        }
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("An error occurred while updating your profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    });
  };

  const handlePreferenceChange = (key: string, value: string) => {
    setSettings({
      ...settings,
      preferences: {
        ...settings.preferences,
        [key]: value,
      },
    });
  };

  const handleSecurityChange = (key: string, value: boolean | number) => {
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        [key]: value,
      },
    });
  };

  const saveSettings = () => {
    // In a real app, this would save to the backend
    localStorage.setItem("userSettings", JSON.stringify(settings));
    alert("Settings saved successfully!");
  };

  return (
    <DashboardLayout userRole={currentUser?.role} userName={currentUser?.name}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {currentUser?.role === "admin"
                ? "System Settings & Configuration"
                : "Settings"}
            </h1>
            <p className="text-gray-600 mt-1">
              {currentUser?.role === "admin"
                ? "Manage system-wide settings, configurations, and user preferences"
                : "Manage your account settings and preferences"}
            </p>
          </div>
          <div className="flex gap-2">
            {currentUser?.role === "admin" && (
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            )}
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={saveSettings}
            >
              <Save className="h-4 w-4 mr-2" />
              Save All Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList
            className={`grid w-full ${currentUser?.role === "admin" ? "grid-cols-6" : "grid-cols-4"}`}
          >
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="flex items-center gap-2"
            >
              <Palette className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            {currentUser?.role === "admin" && (
              <>
                <TabsTrigger value="system" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  System
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className="flex items-center gap-2"
                >
                  <Database className="h-4 w-4" />
                  Advanced
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={settings.profile.name}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={settings.profile.email}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed. Contact admin if needed.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        defaultValue={settings.profile.phone}
                      />
                    </div>
                    {currentUser?.role === "student" && (
                      <div>
                        <Label htmlFor="studentId">Student ID</Label>
                        <Input
                          id="studentId"
                          name="studentId"
                          defaultValue={settings.profile.studentId}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        name="department"
                        defaultValue={settings.profile.department}
                      />
                    </div>
                    {(currentUser?.role === "supervisor" ||
                      currentUser?.role === "student") && (
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          name="company"
                          defaultValue={settings.profile.company}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {loading ? "Updating..." : "Update Profile"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("emailNotifications", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-gray-600">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("pushNotifications", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Announcement Alerts</h4>
                    <p className="text-sm text-gray-600">
                      Get notified about new announcements
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.announcementAlerts}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("announcementAlerts", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Logbook Reminders</h4>
                    <p className="text-sm text-gray-600">
                      Remind me to submit logbook entries
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.logbookReminders}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("logbookReminders", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Evaluation Alerts</h4>
                    <p className="text-sm text-gray-600">
                      Get notified about new evaluations
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.evaluationAlerts}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("evaluationAlerts", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Application Preferences</CardTitle>
                <CardDescription>
                  Customize your application experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={settings.preferences.theme}
                      onValueChange={(value) =>
                        handlePreferenceChange("theme", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={settings.preferences.language}
                      onValueChange={(value) =>
                        handlePreferenceChange("language", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fil">Filipino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={settings.preferences.timezone}
                      onValueChange={(value) =>
                        handlePreferenceChange("timezone", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Manila">Asia/Manila</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select
                      value={settings.preferences.dateFormat}
                      onValueChange={(value) =>
                        handlePreferenceChange("dateFormat", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      handleSecurityChange("twoFactorAuth", checked)
                    }
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="sessionTimeout">
                    Session Timeout (minutes)
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="120"
                    value={settings.security.sessionTimeout}
                    onChange={(e) =>
                      handleSecurityChange(
                        "sessionTimeout",
                        parseInt(e.target.value),
                      )
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically log out after this period of inactivity
                  </p>
                </div>

                <div>
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    min="30"
                    max="365"
                    value={settings.security.passwordExpiry}
                    onChange={(e) =>
                      handleSecurityChange(
                        "passwordExpiry",
                        parseInt(e.target.value),
                      )
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Require password change after this many days
                  </p>
                </div>

                <Separator />

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">
                    Change Password
                  </h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    For security reasons, password changes must be done through
                    the admin panel or by contacting your coordinator.
                  </p>
                  <Button
                    variant="outline"
                    className="text-yellow-700 border-yellow-300"
                  >
                    Request Password Change
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {currentUser?.role === "admin" && (
            <>
              <TabsContent value="system">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>System Configuration</CardTitle>
                      <CardDescription>
                        Configure system-wide settings and parameters
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="systemName">System Name</Label>
                          <Input
                            id="systemName"
                            defaultValue="MinSU CCS OJT Tracker"
                          />
                        </div>
                        <div>
                          <Label htmlFor="adminEmail">Admin Email</Label>
                          <Input
                            id="adminEmail"
                            type="email"
                            defaultValue="admin@minsu.edu.ph"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="maxFileSize">
                            Max File Size (MB)
                          </Label>
                          <Input
                            id="maxFileSize"
                            type="number"
                            defaultValue="10"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sessionTimeout">
                            Session Timeout (minutes)
                          </Label>
                          <Input
                            id="sessionTimeout"
                            type="number"
                            defaultValue="30"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="allowedFileTypes">
                          Allowed File Types
                        </Label>
                        <Input
                          id="allowedFileTypes"
                          defaultValue="pdf,doc,docx,jpg,png"
                          placeholder="Comma-separated file extensions"
                        />
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Feature Toggles</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>User Registration</Label>
                              <p className="text-sm text-gray-600">
                                Allow new user registration
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Email Notifications</Label>
                              <p className="text-sm text-gray-600">
                                Enable system email notifications
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>File Upload</Label>
                              <p className="text-sm text-gray-600">
                                Allow document uploads
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Maintenance Mode</Label>
                              <p className="text-sm text-gray-600">
                                Enable maintenance mode
                              </p>
                            </div>
                            <Switch />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Email Configuration</CardTitle>
                      <CardDescription>
                        Configure SMTP settings for email notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="smtpHost">SMTP Host</Label>
                          <Input id="smtpHost" placeholder="smtp.gmail.com" />
                        </div>
                        <div>
                          <Label htmlFor="smtpPort">SMTP Port</Label>
                          <Input
                            id="smtpPort"
                            type="number"
                            placeholder="587"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="smtpUser">SMTP Username</Label>
                          <Input id="smtpUser" type="email" />
                        </div>
                        <div>
                          <Label htmlFor="smtpPass">SMTP Password</Label>
                          <Input id="smtpPass" type="password" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="smtpTls" defaultChecked />
                        <Label htmlFor="smtpTls">Use TLS/SSL</Label>
                      </div>
                      <Button variant="outline">
                        Test Email Configuration
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="advanced">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Database Management</CardTitle>
                      <CardDescription>
                        Advanced database operations and maintenance
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button variant="outline" className="w-full">
                          <Database className="h-4 w-4 mr-2" />
                          Backup Database
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Upload className="h-4 w-4 mr-2" />
                          Restore Database
                        </Button>
                        <Button variant="outline" className="w-full">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Optimize Database
                        </Button>
                      </div>
                      <Separator />
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-medium text-yellow-800 mb-2">
                          Danger Zone
                        </h4>
                        <p className="text-sm text-yellow-700 mb-3">
                          These actions are irreversible. Please proceed with
                          caution.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-300"
                          >
                            Clear All Logs
                          </Button>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-300"
                          >
                            Reset System Data
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>System Logs</CardTitle>
                      <CardDescription>
                        View and manage system logs and audit trails
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">Application Logs</h4>
                            <p className="text-sm text-gray-600">
                              Last updated: 2 minutes ago
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">Error Logs</h4>
                            <p className="text-sm text-gray-600">
                              Last updated: 1 hour ago
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">Audit Trail</h4>
                            <p className="text-sm text-gray-600">
                              Last updated: 5 minutes ago
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>API Configuration</CardTitle>
                      <CardDescription>
                        Manage API keys and external integrations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="apiKey">System API Key</Label>
                        <div className="flex gap-2">
                          <Input
                            id="apiKey"
                            type="password"
                            defaultValue="sk_live_xxxxxxxxxxxxxxxx"
                            readOnly
                          />
                          <Button variant="outline">Regenerate</Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="webhookUrl">Webhook URL</Label>
                        <Input
                          id="webhookUrl"
                          placeholder="https://your-domain.com/webhook"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="apiEnabled" defaultChecked />
                        <Label htmlFor="apiEnabled">Enable API Access</Label>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
