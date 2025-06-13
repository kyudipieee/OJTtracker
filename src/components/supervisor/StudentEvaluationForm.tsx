import React, { useState, useEffect } from "react";
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
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, User, Star, TrendingUp, CheckCircle, Save } from "lucide-react";

interface StudentEvaluationFormProps {
  studentId?: string;
  onEvaluationComplete?: () => void;
  className?: string;
}

const StudentEvaluationForm = ({
  studentId,
  onEvaluationComplete,
  className,
}: StudentEvaluationFormProps) => {
  const currentUser = getCurrentUser();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(studentId || "");
  const [evaluationType, setEvaluationType] = useState("monthly");
  const [scores, setScores] = useState({
    technical: 80,
    communication: 80,
    teamwork: 80,
    initiative: 80,
    punctuality: 80,
  });
  const [comments, setComments] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const result = await db.getAssignedStudents(currentUser?.id || "");
        if (result.data) {
          setStudents(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [currentUser]);

  const handleScoreChange = (category: string, value: number[]) => {
    setScores((prev) => ({ ...prev, [category]: value[0] }));
  };

  const calculateOverallScore = () => {
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    return Math.round(total / Object.keys(scores).length);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Satisfactory";
    return "Needs Improvement";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) {
      alert("Please select a student to evaluate.");
      return;
    }

    try {
      setSubmitting(true);
      const overallScore = calculateOverallScore();

      const result = await db.createEvaluation({
        studentId: selectedStudent,
        evaluatorId: currentUser?.id || "",
        evaluatorRole: "supervisor",
        type: evaluationType as "midterm" | "final" | "monthly",
        scores: {
          ...scores,
          overall: overallScore,
        },
        comments,
        recommendations,
        status: "submitted",
      });

      if (result.data) {
        alert("Evaluation submitted successfully!");
        // Reset form
        setScores({
          technical: 80,
          communication: 80,
          teamwork: 80,
          initiative: 80,
          punctuality: 80,
        });
        setComments("");
        setRecommendations("");
        setSelectedStudent("");

        if (onEvaluationComplete) {
          onEvaluationComplete();
        }
      }
    } catch (error) {
      console.error("Failed to submit evaluation:", error);
      alert("Failed to submit evaluation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const overallScore = calculateOverallScore();

  return (
    <div className={`bg-white rounded-lg ${className}`}>
      <Card>
        <CardHeader className="bg-gradient-to-r from-green-600/10 to-green-600/5">
          <CardTitle className="text-2xl text-green-800 flex items-center">
            <Award className="h-6 w-6 mr-2" />
            Student Performance Evaluation
          </CardTitle>
          <CardDescription className="text-gray-600">
            Evaluate student performance across key competency areas
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading students...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student and Evaluation Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="student">Select Student</Label>
                  <Select
                    value={selectedStudent}
                    onValueChange={setSelectedStudent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student to evaluate" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student: any) => (
                        <SelectItem key={student.id} value={student.id}>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            {student.name} ({student.studentId})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Evaluation Type</Label>
                  <Select
                    value={evaluationType}
                    onValueChange={setEvaluationType}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly Review</SelectItem>
                      <SelectItem value="midterm">
                        Midterm Evaluation
                      </SelectItem>
                      <SelectItem value="final">Final Evaluation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Overall Score Display */}
              <Card className="bg-gradient-to-r from-blue-50 to-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Overall Score</h3>
                      <p className="text-sm text-gray-600">
                        Average across all categories
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-3xl font-bold ${getScoreColor(overallScore)}`}
                      >
                        {overallScore}%
                      </div>
                      <Badge
                        className={getScoreColor(overallScore)
                          .replace("text-", "bg-")
                          .replace("-600", "-100")}
                      >
                        {getScoreLabel(overallScore)}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={overallScore} className="mt-3 h-2" />
                </CardContent>
              </Card>

              {/* Scoring Categories */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Performance Categories
                </h3>

                {Object.entries(scores).map(([category, score]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-medium capitalize">
                        {category === "technical"
                          ? "Technical Skills"
                          : category === "communication"
                            ? "Communication Skills"
                            : category === "teamwork"
                              ? "Teamwork & Collaboration"
                              : category === "initiative"
                                ? "Initiative & Problem Solving"
                                : "Punctuality & Reliability"}
                      </Label>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-lg font-bold ${getScoreColor(score)}`}
                        >
                          {score}%
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {getScoreLabel(score)}
                        </Badge>
                      </div>
                    </div>
                    <Slider
                      value={[score]}
                      onValueChange={(value) =>
                        handleScoreChange(category, value)
                      }
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comments and Recommendations */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="comments">Performance Comments</Label>
                  <Textarea
                    id="comments"
                    placeholder="Provide detailed feedback on the student's performance, strengths, and areas for improvement..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="min-h-[120px]"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="recommendations">Recommendations</Label>
                  <Textarea
                    id="recommendations"
                    placeholder="Provide specific recommendations for the student's continued development and improvement..."
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    className="min-h-[100px]"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setScores({
                      technical: 80,
                      communication: 80,
                      teamwork: 80,
                      initiative: 80,
                      punctuality: 80,
                    });
                    setComments("");
                    setRecommendations("");
                  }}
                >
                  Reset Form
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={submitting || !selectedStudent}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Submit Evaluation
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentEvaluationForm;
