import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  BookOpen,
  FileText,
  Shield,
  Database,
  CheckCircle,
  AlertCircle,
  Info,
  Play,
  Users,
  Settings,
} from "lucide-react";

const DemoInstructions = () => {
  const [activeDemo, setActiveDemo] = useState("overview");

  const demoAccounts = [
    {
      role: "Admin",
      email: "admin@minsu.edu.ph",
      password: "any password",
      description: "Full system access, user management, reports",
      icon: <Shield className="h-5 w-5" />,
      color: "bg-red-500",
    },
    {
      role: "Student",
      email: "john.doe@student.minsu.edu.ph",
      password: "any password",
      description: "Logbook entries, document uploads, view progress",
      icon: <User className="h-5 w-5" />,
      color: "bg-blue-500",
    },
    {
      role: "Coordinator",
      email: "jane.smith@minsu.edu.ph",
      password: "any password",
      description: "Review submissions, manage students, announcements",
      icon: <Users className="h-5 w-5" />,
      color: "bg-green-500",
    },
    {
      role: "Supervisor",
      email: "bob.wilson@company.com",
      password: "any password",
      description: "Evaluate students, review logbooks, provide feedback",
      icon: <Settings className="h-5 w-5" />,
      color: "bg-yellow-500",
    },
  ];

  const features = [
    {
      title: "Authentication System",
      description: "Role-based login with demo accounts",
      status: "✅ Fully Functional",
      details: [
        "Login/Register forms with validation",
        "Role-based dashboard routing",
        "Session management",
        "Demo accounts for testing",
      ],
    },
    {
      title: "Database Integration",
      description: "LocalStorage-based database simulation",
      status: "✅ Fully Functional",
      details: [
        "User management (CRUD operations)",
        "Logbook entries storage",
        "Document management",
        "Announcements system",
        "Evaluation records",
        "System statistics",
      ],
    },
    {
      title: "Student Features",
      description: "Complete OJT tracking for students",
      status: "✅ Fully Functional",
      details: [
        "Digital logbook with rich text editor",
        "File upload for attachments",
        "Document submission (MOA, Waiver, etc.)",
        "Progress tracking",
        "View announcements",
        "Evaluation history",
      ],
    },
    {
      title: "Coordinator Features",
      description: "Student management and oversight",
      status: "✅ Fully Functional",
      details: [
        "Review and approve logbook entries",
        "Document approval workflow",
        "Student progress monitoring",
        "Announcement management",
        "System statistics dashboard",
      ],
    },
    {
      title: "Supervisor Features",
      description: "Company supervisor tools",
      status: "✅ Fully Functional",
      details: [
        "View assigned students",
        "Review student logbooks",
        "Provide feedback and evaluations",
        "Track student progress",
      ],
    },
    {
      title: "Admin Features",
      description: "System administration tools",
      status: "✅ Fully Functional",
      details: [
        "User management dashboard",
        "System statistics and analytics",
        "Activity monitoring",
        "Role-based access control",
      ],
    },
  ];

  const demoSteps = [
    {
      step: 1,
      title: "Login as Student",
      description: "Use john.doe@student.minsu.edu.ph to see student features",
      actions: [
        "View dashboard with OJT progress",
        "Submit new logbook entries",
        "Upload documents (MOA, Waiver)",
        "Check announcements",
      ],
    },
    {
      step: 2,
      title: "Login as Coordinator",
      description: "Use jane.smith@minsu.edu.ph to see coordinator features",
      actions: [
        "Review pending logbook entries",
        "Approve/reject documents",
        "View student progress",
        "Manage announcements",
      ],
    },
    {
      step: 3,
      title: "Login as Supervisor",
      description: "Use bob.wilson@company.com to see supervisor features",
      actions: [
        "View assigned students",
        "Review student work",
        "Provide evaluations",
        "Give feedback",
      ],
    },
    {
      step: 4,
      title: "Login as Admin",
      description: "Use admin@minsu.edu.ph to see admin features",
      actions: [
        "View system statistics",
        "Manage all users",
        "Monitor system activity",
        "Generate reports",
      ],
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white">
      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <CardTitle className="text-2xl flex items-center">
            <Play className="mr-3 h-6 w-6" />
            OJT Management System - Live Demo
          </CardTitle>
          <CardDescription className="text-green-100">
            Complete backend integration with database functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-800">Backend Ready</h3>
              <p className="text-sm text-green-600">All features connected</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-800">Database Active</h3>
              <p className="text-sm text-blue-600">Sample data loaded</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-800">Multi-Role</h3>
              <p className="text-sm text-purple-600">4 user types ready</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeDemo} onValueChange={setActiveDemo}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accounts">Demo Accounts</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="demo">Demo Steps</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>
                Complete OJT management system with full backend integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-green-800">
                      All Features Implemented
                    </h4>
                  </div>
                  <p className="text-green-700 text-sm">
                    Every button, form, and feature is connected to the backend
                    database with full CRUD operations.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Database className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-blue-800">
                      Database Integration
                    </h4>
                  </div>
                  <p className="text-blue-700 text-sm">
                    LocalStorage-based database simulation with realistic data
                    operations, error handling, and data persistence.
                  </p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-purple-600 mr-2" />
                    <h4 className="font-semibold text-purple-800">
                      Role-Based Access
                    </h4>
                  </div>
                  <p className="text-purple-700 text-sm">
                    Different dashboards and features for Students,
                    Coordinators, Supervisors, and Administrators.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">6</div>
                    <div className="text-sm text-gray-600">Sample Users</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">3</div>
                    <div className="text-sm text-gray-600">Logbook Entries</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">3</div>
                    <div className="text-sm text-gray-600">Documents</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">3</div>
                    <div className="text-sm text-gray-600">Announcements</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demoAccounts.map((account, index) => (
              <Card key={index} className="border-l-4 border-l-gray-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-full ${account.color} text-white mr-3`}
                      >
                        {account.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {account.role}
                        </CardTitle>
                        <Badge variant="outline" className="mt-1">
                          Demo Account
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-sm text-gray-600">
                        Email:
                      </span>
                      <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                        {account.email}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-gray-600">
                        Password:
                      </span>
                      <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                        {account.password}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-gray-600">
                        Features:
                      </span>
                      <p className="text-sm text-gray-700">
                        {account.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {features.map((feature, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <Badge className="bg-green-500">{feature.status}</Badge>
                    </div>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="demo" className="mt-6">
          <div className="space-y-6">
            {demoSteps.map((step, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">
                      {step.step}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="ml-11">
                    <h4 className="font-medium mb-2">Try these actions:</h4>
                    <ul className="space-y-1">
                      {step.actions.map((action, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <Play className="h-3 w-3 text-blue-500 mr-2 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mt-6 border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">
                How to Test the System
              </h4>
              <p className="text-sm text-yellow-700">
                1. Use any of the demo accounts above to login
                <br />
                2. Explore the role-specific dashboard and features
                <br />
                3. Try submitting forms, uploading files, and interacting with
                all buttons
                <br />
                4. Switch between different user roles to see the complete
                workflow
                <br />
                5. All data is stored in the browser's localStorage and persists
                between sessions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoInstructions;
