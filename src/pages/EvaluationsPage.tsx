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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Award, Plus, Star, User, Calendar } from "lucide-react";

const EvaluationsPage = () => {
  const currentUser = getCurrentUser();
  const [evaluations, setEvaluations] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (currentUser?.role === "student") {
          // Fetch student's own evaluations
          const result = await db.getStudentEvaluations(currentUser.id);
          if (result.data) {
            setEvaluations(result.data);
          }
        } else if (currentUser?.role === "supervisor") {
          // Fetch evaluations created by supervisor
          const evalResult = await db.getSupervisorEvaluations(currentUser.id);
          if (evalResult.data) {
            setEvaluations(evalResult.data);
          }

          // Fetch assigned students
          const studentsResult = await db.getAssignedStudents(currentUser.id);
          if (studentsResult.data) {
            setStudents(studentsResult.data);
          }
        } else {
          // Fetch all evaluations for coordinator/admin
          const allUsers = await db.getAllUsers();
          if (allUsers.data) {
            const allEvaluations = [];
            for (const user of allUsers.data) {
              if (user.role === "student") {
                const evalResult = await db.getStudentEvaluations(user.id);
                if (evalResult.data) {
                  allEvaluations.push(...evalResult.data);
                }
              }
            }
            setEvaluations(allEvaluations);
            setStudents(allUsers.data.filter((u: any) => u.role === "student"));
          }
        }
      } catch (error) {
        console.error("Failed to fetch evaluations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleCreateEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    try {
      setCreating(true);
      const result = await db.createEvaluation({
        studentId: formData.get("studentId") as string,
        evaluatorId: currentUser?.id || "",
        evaluatorRole: currentUser?.role as "coordinator" | "supervisor",
        type: formData.get("type") as "midterm" | "final" | "monthly",
        scores: {
          technical: parseInt(formData.get("technical") as string),
          communication: parseInt(formData.get("communication") as string),
          teamwork: parseInt(formData.get("teamwork") as string),
          initiative: parseInt(formData.get("initiative") as string),
          punctuality: parseInt(formData.get("punctuality") as string),
          overall: Math.round(
            (parseInt(formData.get("technical") as string) +
              parseInt(formData.get("communication") as string) +
              parseInt(formData.get("teamwork") as string) +
              parseInt(formData.get("initiative") as string) +
              parseInt(formData.get("punctuality") as string)) /
              5,
          ),
        },
        comments: formData.get("comments") as string,
        recommendations: formData.get("recommendations") as string,
        status: "submitted",
      });

      if (result.data) {
        setEvaluations([result.data, ...evaluations]);
        setDialogOpen(false);
        alert("Evaluation created successfully!");
      }
    } catch (error) {
      console.error("Failed to create evaluation:", error);
      alert("Failed to create evaluation. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "bg-green-600";
    if (score >= 80) return "bg-blue-600";
    if (score >= 70) return "bg-yellow-600";
    return "bg-red-600";
  };

  const EvaluationCard = ({ evaluation }: { evaluation: any }) => {
    const [studentName, setStudentName] = useState("Loading...");

    useEffect(() => {
      const fetchStudentName = async () => {
        try {
          const result = await db.getUserById(evaluation.studentId);
          if (result.data) {
            setStudentName(result.data.name);
          }
        } catch (error) {
          setStudentName("Unknown Student");
        }
      };

      fetchStudentName();
    }, [evaluation.studentId]);

    return (
      <Card className="bg-white">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-green-600" />
                {evaluation.type.charAt(0).toUpperCase() +
                  evaluation.type.slice(1)}{" "}
                Evaluation
              </CardTitle>
              <CardDescription className="flex items-center mt-1">
                <User className="h-4 w-4 mr-1" />
                {studentName}
                <span className="mx-2">•</span>
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(evaluation.dateEvaluated).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge className={getScoreBadge(evaluation.scores.overall)}>
              {evaluation.scores.overall}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${getScoreColor(evaluation.scores.technical)}`}
                >
                  {evaluation.scores.technical}
                </div>
                <div className="text-xs text-gray-500">Technical</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${getScoreColor(evaluation.scores.communication)}`}
                >
                  {evaluation.scores.communication}
                </div>
                <div className="text-xs text-gray-500">Communication</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${getScoreColor(evaluation.scores.teamwork)}`}
                >
                  {evaluation.scores.teamwork}
                </div>
                <div className="text-xs text-gray-500">Teamwork</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${getScoreColor(evaluation.scores.initiative)}`}
                >
                  {evaluation.scores.initiative}
                </div>
                <div className="text-xs text-gray-500">Initiative</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${getScoreColor(evaluation.scores.punctuality)}`}
                >
                  {evaluation.scores.punctuality}
                </div>
                <div className="text-xs text-gray-500">Punctuality</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Score</span>
                <span
                  className={`text-sm font-bold ${getScoreColor(evaluation.scores.overall)}`}
                >
                  {evaluation.scores.overall}%
                </span>
              </div>
              <Progress value={evaluation.scores.overall} className="h-2" />
            </div>

            {evaluation.comments && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  Comments:
                </h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {evaluation.comments}
                </p>
              </div>
            )}

            {evaluation.recommendations && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  Recommendations:
                </h4>
                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                  {evaluation.recommendations}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <Badge
                variant={
                  evaluation.status === "approved" ? "default" : "secondary"
                }
              >
                {evaluation.status}
              </Badge>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                  Close
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  Download
                </Button>
                {(actualUserRole === "coordinator" ||
                  actualUserRole === "admin") &&
                  selectedUser.status === "Pending" && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="border-green-500 text-green-600 hover:bg-green-50"
                        onClick={() =>
                          handleDocumentAction(selectedDocument.id, "approve")
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-500 text-red-600 hover:bg-red-50"
                        onClick={() =>
                          handleDocumentAction(selectedDocument.id, "reject")
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  )}
              </div>
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
              {currentUser?.role === "student"
                ? "My Evaluations"
                : "Evaluations"}
            </h1>
            <p className="text-gray-600 mt-1">
              {currentUser?.role === "student"
                ? "View your performance evaluations"
                : "Manage and create student evaluations"}
            </p>
          </div>
          {(currentUser?.role === "supervisor" ||
            currentUser?.role === "coordinator") && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Evaluation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Evaluation</DialogTitle>
                  <DialogDescription>
                    Evaluate student performance across different criteria
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateEvaluation}>
                  <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="studentId">Student</Label>
                        <Select name="studentId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select student" />
                          </SelectTrigger>
                          <SelectContent>
                            {students.map((student: any) => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.name} ({student.studentId})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="type">Evaluation Type</Label>
                        <Select name="type" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="midterm">Midterm</SelectItem>
                            <SelectItem value="final">Final</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="technical">
                          Technical Skills (0-100)
                        </Label>
                        <Input
                          id="technical"
                          name="technical"
                          type="number"
                          min="0"
                          max="100"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="communication">
                          Communication (0-100)
                        </Label>
                        <Input
                          id="communication"
                          name="communication"
                          type="number"
                          min="0"
                          max="100"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="teamwork">Teamwork (0-100)</Label>
                        <Input
                          id="teamwork"
                          name="teamwork"
                          type="number"
                          min="0"
                          max="100"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="initiative">Initiative (0-100)</Label>
                        <Input
                          id="initiative"
                          name="initiative"
                          type="number"
                          min="0"
                          max="100"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="punctuality">Punctuality (0-100)</Label>
                      <Input
                        id="punctuality"
                        name="punctuality"
                        type="number"
                        min="0"
                        max="100"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="comments">Comments</Label>
                      <Textarea
                        id="comments"
                        name="comments"
                        placeholder="Provide detailed feedback on the student's performance..."
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="recommendations">Recommendations</Label>
                      <Textarea
                        id="recommendations"
                        name="recommendations"
                        placeholder="Provide recommendations for improvement or future development..."
                        required
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
                      {creating ? "Creating..." : "Create Evaluation"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading evaluations...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {evaluations.length > 0 ? (
              evaluations.map((evaluation: any) => (
                <EvaluationCard key={evaluation.id} evaluation={evaluation} />
              ))
            ) : (
              <Card className="bg-white">
                <CardContent className="text-center py-10">
                  <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No evaluations found</p>
                  <p className="text-sm text-gray-400">
                    {currentUser?.role === "student"
                      ? "Evaluations will appear here when completed by your supervisor"
                      : "Create your first evaluation to get started"}
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

export default EvaluationsPage;
