import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "@/lib/auth";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Award,
  Bell,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole?: "student" | "coordinator" | "supervisor" | "admin";
  userName?: string;
}

const DashboardLayout = ({
  children,
  userRole,
  userName,
}: DashboardLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  // Use current user data or fallback to props
  const actualUserRole = userRole || currentUser?.role || "student";
  const actualUserName = userName || currentUser?.name || "John Doe";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Navigation items based on user role
  const navigationItems = {
    student: [
      {
        name: "Dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
        path: "/dashboard",
      },
      {
        name: "Logbook",
        icon: <BookOpen className="h-5 w-5" />,
        path: "/logbook",
      },
      {
        name: "Documents",
        icon: <FileText className="h-5 w-5" />,
        path: "/documents",
      },
      {
        name: "Evaluation",
        icon: <Award className="h-5 w-5" />,
        path: "/evaluation",
      },
      {
        name: "Announcements",
        icon: <Bell className="h-5 w-5" />,
        path: "/announcements",
      },
    ],
    coordinator: [
      {
        name: "Dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
        path: "/dashboard",
      },
      {
        name: "Students",
        icon: <Users className="h-5 w-5" />,
        path: "/students",
      },
      {
        name: "Evaluations",
        icon: <Award className="h-5 w-5" />,
        path: "/evaluations",
      },
      {
        name: "Documents",
        icon: <FileText className="h-5 w-5" />,
        path: "/documents",
      },
      {
        name: "Announcements",
        icon: <Bell className="h-5 w-5" />,
        path: "/announcements",
      },
    ],
    supervisor: [
      {
        name: "Dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
        path: "/dashboard",
      },
      {
        name: "Students",
        icon: <Users className="h-5 w-5" />,
        path: "/students",
      },
      {
        name: "Evaluations",
        icon: <Award className="h-5 w-5" />,
        path: "/evaluations",
      },
    ],
    admin: [
      {
        name: "Dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
        path: "/dashboard",
      },
      { name: "Users", icon: <Users className="h-5 w-5" />, path: "/users" },
      {
        name: "Reports",
        icon: <FileText className="h-5 w-5" />,
        path: "/reports",
      },
      {
        name: "Settings",
        icon: <Settings className="h-5 w-5" />,
        path: "/settings",
      },
    ],
  };

  const currentNavItems = navigationItems[actualUserRole] || [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-green-800 text-white">
        <div className="p-4 flex items-center justify-center border-b border-green-700">
          <img
            src="https://storage.googleapis.com/tempo-public-images/user_2yAjVzLg0r41N3IxzzIm7ttGg1t-1749284332996-image.png"
            alt="MinSU CCS Logo"
            className="h-16 w-16"
          />
        </div>
        <div className="p-4 border-b border-green-700">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${actualUserName}`}
              />
              <AvatarFallback>
                {actualUserName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{actualUserName}</p>
              <p className="text-sm text-green-300 capitalize">
                {actualUserRole}
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {currentNavItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-green-700">
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

      {/* Mobile menu */}
      <Sheet>
        <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <img
              src="https://storage.googleapis.com/tempo-public-images/user_2yAjVzLg0r41N3IxzzIm7ttGg1t-1749284332996-image.png"
              alt="MinSU CCS Logo"
              className="h-10 w-10 ml-2"
            />
          </div>
          <Avatar>
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${actualUserName}`}
            />
            <AvatarFallback>
              {actualUserName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>
        <SheetContent side="left" className="bg-green-800 text-white p-0 w-64">
          <div className="p-4 flex items-center justify-center border-b border-green-700">
            <img
              src="https://storage.googleapis.com/tempo-public-images/user_2yAjVzLg0r41N3IxzzIm7ttGg1t-1749284332996-image.png"
              alt="MinSU CCS Logo"
              className="h-16 w-16"
            />
          </div>
          <div className="p-4 border-b border-green-700">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${actualUserName}`}
                />
                <AvatarFallback>
                  {actualUserName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{actualUserName}</p>
                <p className="text-sm text-green-300 capitalize">
                  {actualUserRole}
                </p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {currentNavItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t border-green-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-green-700 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header spacer */}
        <div className="md:hidden h-16"></div>

        {/* Main content area */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
