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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Search,
  Mail,
  Phone,
  Building,
  GraduationCap,
} from "lucide-react";

const StudentsPage = () => {
  const currentUser = getCurrentUser();
  const [students, setStudents] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);

        if (currentUser?.role === "supervisor") {
          // Fetch assigned students for supervisor
          const result = await db.getAssignedStudents(currentUser.id);
          if (result.data) {
            setAssignedStudents(result.data);
          }
        } else {
          // Fetch all students for coordinator/admin
          const result = await db.getAllUsers("student");
          if (result.data) {
            setStudents(result.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [currentUser]);

  const filteredStudents = students.filter(
    (student: any) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.studentId &&
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const filteredAssignedStudents = assignedStudents.filter(
    (student: any) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.studentId &&
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase())),
  );

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

  const StudentCard = ({ student }: { student: any }) => {
    const [studentProgress, setStudentProgress] = useState({
      hours: 0,
      totalHours: 486,
    });

    useEffect(() => {
      const fetchProgress = async () => {
        try {
          const result = await db.getLogbookEntries(student.id);
          if (result.data) {
            const approvedEntries = result.data.filter(
              (entry: any) => entry.status === "approved",
            );
            const totalHours = approvedEntries.reduce(
              (sum: number, entry: any) => sum + entry.hoursWorked,
              0,
            );
            setStudentProgress({ hours: totalHours, totalHours: 486 });
          }
        } catch (error) {
          console.error("Failed to fetch student progress:", error);
        }
      };

      fetchProgress();
    }, [student.id]);

    const progressPercentage = Math.round(
      (studentProgress.hours / studentProgress.totalHours) * 100,
    );

    return (
      <Card key={student.id} className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
                />
                <AvatarFallback>
                  {student.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{student.name}</CardTitle>
                <CardDescription className="flex items-center">
                  <GraduationCap className="h-4 w-4 mr-1" />
                  {student.studentId || "N/A"}
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(student.status)}>
              {student.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <span>{student.email}</span>
              </div>
              {student.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{student.phone}</span>
                </div>
              )}
              {student.department && (
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{student.department}</span>
                </div>
              )}
              {student.company && (
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{student.company}</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">OJT Progress</span>
                <span className="text-sm text-gray-600">
                  {studentProgress.hours} / {studentProgress.totalHours} hours (
                  {progressPercentage}%)
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() =>
                  window.open(`/logbook?student=${student.id}`, "_blank")
                }
              >
                View Logbook
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() =>
                  window.open(`/documents?student=${student.id}`, "_blank")
                }
              >
                View Documents
              </Button>
              {currentUser?.role === "supervisor" && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() =>
                    window.open(`/evaluations?student=${student.id}`, "_blank")
                  }
                >
                  Evaluate
                </Button>
              )}
            </div>
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
              {currentUser?.role === "supervisor" ? "My Students" : "Students"}
            </h1>
            <p className="text-gray-600 mt-1">
              {currentUser?.role === "supervisor"
                ? "Students under your supervision"
                : "Manage and monitor student progress"}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search students by name, email, or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading students...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentUser?.role === "supervisor" ? (
              filteredAssignedStudents.length > 0 ? (
                filteredAssignedStudents.map((student: any) => (
                  <StudentCard key={student.id} student={student} />
                ))
              ) : (
                <Card className="bg-white">
                  <CardContent className="text-center py-10">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No assigned students found</p>
                    <p className="text-sm text-gray-400">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "Students will appear here when assigned"}
                    </p>
                  </CardContent>
                </Card>
              )
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student: any) => (
                <StudentCard key={student.id} student={student} />
              ))
            ) : (
              <Card className="bg-white">
                <CardContent className="text-center py-10">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No students found</p>
                  <p className="text-sm text-gray-400">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "Students will appear here when they register"}
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

export default StudentsPage;
