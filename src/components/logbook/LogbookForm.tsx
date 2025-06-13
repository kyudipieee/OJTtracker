import React, { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  CalendarIcon,
  FileIcon,
  Loader2,
  PaperclipIcon,
  SendIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  date: Date;
  title: string;
  description: string;
  hours: number;
  status: "pending" | "approved" | "rejected";
  feedback?: string;
  attachments?: string[];
}

interface LogbookFormProps {
  studentId?: string;
  companyName?: string;
  supervisorName?: string;
}

const LogbookForm = ({
  studentId,
  companyName,
  supervisorName,
}: LogbookFormProps) => {
  const currentUser = getCurrentUser();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("8");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("new");
  const [previousEntries, setPreviousEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Get user info from current user or props
  const actualStudentId = studentId || currentUser?.studentId || "N/A";
  const actualCompanyName =
    companyName || currentUser?.company || "Not Assigned";
  const actualSupervisorName = supervisorName || "Not Assigned";

  useEffect(() => {
    const fetchLogbookEntries = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const result = await db.getLogbookEntries(currentUser.id);

        if (result.data) {
          const formattedEntries = result.data.map((entry) => ({
            id: entry.id,
            date: new Date(entry.date),
            title: entry.title,
            description: entry.description,
            hours: entry.hoursWorked,
            status: entry.status as "pending" | "approved" | "rejected",
            feedback: entry.feedback,
            attachments: entry.attachments,
          }));
          setPreviousEntries(formattedEntries);
        }
      } catch (error) {
        console.error("Failed to fetch logbook entries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogbookEntries();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !title || !description || !hours || !currentUser) return;

    setIsSubmitting(true);

    try {
      // Simulate network delay for realistic experience
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const result = await db.createLogbookEntry({
        userId: currentUser.id,
        date: date.toISOString(),
        title,
        description,
        activities: [description], // Split description into activities if needed
        hoursWorked: parseInt(hours),
        attachments: files
          ? Array.from(files).map((file) => file.name)
          : undefined,
        status: "submitted",
      });

      if (result.data) {
        const newEntry: LogEntry = {
          id: result.data.id,
          date: new Date(result.data.date),
          title: result.data.title,
          description: result.data.description,
          hours: result.data.hoursWorked,
          status: result.data.status as "pending" | "approved" | "rejected",
          attachments: result.data.attachments,
        };

        setPreviousEntries([newEntry, ...previousEntries]);
        setTitle("");
        setDescription("");
        setHours("8");
        setFiles(null);
        setDate(new Date());

        // Reset file input
        const fileInput = document.getElementById(
          "attachments",
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        setActiveTab("history");

        // Show success message
        alert(
          "Logbook entry submitted successfully! It will be reviewed by your coordinator.",
        );
      } else {
        console.error("Failed to create logbook entry:", result.error);
        alert("Failed to submit logbook entry. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting logbook entry:", error);
      alert("An error occurred while submitting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-4 rounded-lg">
      <Card className="border-green-600/20 shadow-md">
        <CardHeader className="bg-gradient-to-r from-green-600/10 to-green-600/5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-green-800">
                OJT Activity Logbook
              </CardTitle>
              <CardDescription className="text-gray-600">
                Record your daily activities and tasks performed during your
                on-the-job training
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="CCS Logo" className="h-12 w-12" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">Student ID:</span>
                <span className="ml-2 text-gray-700">{actualStudentId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Company:</span>
                <span className="ml-2 text-gray-700">{actualCompanyName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Supervisor:</span>
                <span className="ml-2 text-gray-700">
                  {actualSupervisorName}
                </span>
              </div>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new">New Entry</TabsTrigger>
              <TabsTrigger value="history">Entry History</TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="mt-4">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            id="date"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? (
                              format(date, "PPP")
                            ) : (
                              <span>Select a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hours">Hours Worked</Label>
                      <Select value={hours} onValueChange={setHours}>
                        <SelectTrigger id="hours">
                          <SelectValue placeholder="Select hours" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                            <SelectItem key={h} value={h.toString()}>
                              {h} hour{h > 1 ? "s" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Activity Title</Label>
                    <Input
                      id="title"
                      placeholder="Brief title of your activity"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Activity Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the tasks you performed, skills applied, and outcomes achieved"
                      className="min-h-[150px]"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attachments">Attachments (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="attachments"
                        type="file"
                        multiple
                        className="flex-1"
                        onChange={(e) => setFiles(e.target.files)}
                      />
                      <Button type="button" variant="outline" size="icon">
                        <PaperclipIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    {files && files.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {files.length} file(s) selected
                        </p>
                        <ul className="mt-1 text-xs text-gray-500">
                          {Array.from(files).map((file, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <FileIcon className="h-3 w-3" />
                              {file.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <CardFooter className="pt-6">
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isSubmitting || !date || !title || !description}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <SendIcon className="mr-2 h-4 w-4" />
                        Submit Log Entry
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading entries...</p>
                  </div>
                ) : previousEntries.length > 0 ? (
                  previousEntries.map((entry) => (
                    <Card key={entry.id} className="overflow-hidden">
                      <CardHeader className="p-4 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-lg">
                              {entry.title}
                            </CardTitle>
                            <CardDescription>
                              {format(entry.date, "PPP")} • {entry.hours} hour
                              {entry.hours > 1 ? "s" : ""}
                            </CardDescription>
                          </div>
                          <div>{getStatusBadge(entry.status)}</div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {entry.description}
                        </p>

                        {entry.attachments && entry.attachments.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-500">
                              Attachments:
                            </h4>
                            <ul className="mt-1">
                              {entry.attachments.map((file, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-blue-600 flex items-center gap-1"
                                >
                                  <FileIcon className="h-3 w-3" />
                                  <a href="#" className="hover:underline">
                                    {file}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {entry.feedback && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700">
                              Feedback:
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {entry.feedback}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No entries yet. Create your first log entry!
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogbookForm;
