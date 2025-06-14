// Database simulation layer for OJT Management System
// This provides a comprehensive backend simulation with error handling

export interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "coordinator" | "supervisor" | "admin";
  phone?: string;
  company?: string;
  studentId?: string;
  department?: string;
  message?: string;
  registrationDate: string;
  status: "active" | "pending_approval" | "suspended";
  lastLogin?: string;
  profileImage?: string;
}

export interface LogbookEntry {
  id: string;
  userId: string;
  date: string;
  title: string;
  description: string;
  activities: string[];
  hoursWorked: number;
  attachments?: string[];
  status: "draft" | "submitted" | "approved" | "rejected";
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  userId: string;
  type: "moa" | "waiver" | "evaluation" | "certificate" | "other";
  title: string;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvalDate?: string;
  comments?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  targetRoles: string[];
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  attachments?: string[];
}

export interface Evaluation {
  id: string;
  studentId: string;
  evaluatorId: string;
  evaluatorRole: "coordinator" | "supervisor";
  type: "midterm" | "final" | "monthly";
  scores: {
    technical: number;
    communication: number;
    teamwork: number;
    initiative: number;
    punctuality: number;
    overall: number;
  };
  comments: string;
  recommendations: string;
  dateEvaluated: string;
  status: "draft" | "submitted" | "approved";
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  status: "new" | "read" | "responded" | "closed";
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
}

// Database keys for localStorage
const DB_KEYS = {
  USERS: "ojt_db_users",
  LOGBOOK_ENTRIES: "ojt_db_logbook_entries",
  DOCUMENTS: "ojt_db_documents",
  ANNOUNCEMENTS: "ojt_db_announcements",
  EVALUATIONS: "ojt_db_evaluations",
  CONTACT_SUBMISSIONS: "ojt_db_contact_submissions",
  SYSTEM_STATS: "ojt_db_system_stats",
};

// Error handling wrapper
const withErrorHandling = async <T>(
  operation: () => Promise<T> | T,
): Promise<{ data?: T; error?: string }> => {
  try {
    const result = await operation();
    return { data: result };
  } catch (error) {
    console.error("Database operation failed:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
};

// Simulate network delay
const simulateDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Generic database operations
class DatabaseService {
  private getFromStorage<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Failed to read from storage key: ${key}`, error);
      return [];
    }
  }

  private saveToStorage<T>(key: string, data: T[]): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Failed to save to storage key: ${key}`, error);
      return false;
    }
  }

  // User operations
  async createUser(
    userData: Omit<DatabaseUser, "id" | "registrationDate">,
  ): Promise<{ data?: DatabaseUser; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay();

      const users = this.getFromStorage<DatabaseUser>(DB_KEYS.USERS);

      // Check if user already exists
      if (users.find((u) => u.email === userData.email)) {
        throw new Error("User with this email already exists");
      }

      const newUser: DatabaseUser = {
        ...userData,
        id: Date.now().toString(),
        registrationDate: new Date().toISOString(),
        status: "active", // Set to active by default for immediate access
      };

      users.push(newUser);

      if (!this.saveToStorage(DB_KEYS.USERS, users)) {
        throw new Error("Failed to save user data");
      }

      return newUser;
    });
  }

  async getUserById(
    id: string,
  ): Promise<{ data?: DatabaseUser; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay(200);

      const users = this.getFromStorage<DatabaseUser>(DB_KEYS.USERS);
      const user = users.find((u) => u.id === id);

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    });
  }

  async updateUser(
    id: string,
    updates: Partial<DatabaseUser>,
  ): Promise<{ data?: DatabaseUser; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay();

      const users = this.getFromStorage<DatabaseUser>(DB_KEYS.USERS);
      const userIndex = users.findIndex((u) => u.id === id);

      if (userIndex === -1) {
        throw new Error("User not found");
      }

      users[userIndex] = { ...users[userIndex], ...updates };

      if (!this.saveToStorage(DB_KEYS.USERS, users)) {
        throw new Error("Failed to update user data");
      }

      return users[userIndex];
    });
  }

  async getAllUsers(
    role?: string,
  ): Promise<{ data?: DatabaseUser[]; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay(300);

      const users = this.getFromStorage<DatabaseUser>(DB_KEYS.USERS);

      if (role) {
        return users.filter((u) => u.role === role);
      }

      return users;
    });
  }

  // Logbook operations
  async createLogbookEntry(
    entryData: Omit<LogbookEntry, "id" | "createdAt" | "updatedAt">,
  ): Promise<{ data?: LogbookEntry; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay();

      const entries = this.getFromStorage<LogbookEntry>(
        DB_KEYS.LOGBOOK_ENTRIES,
      );

      const newEntry: LogbookEntry = {
        ...entryData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      entries.push(newEntry);

      if (!this.saveToStorage(DB_KEYS.LOGBOOK_ENTRIES, entries)) {
        throw new Error("Failed to save logbook entry");
      }

      return newEntry;
    });
  }

  async getLogbookEntries(
    userId: string,
  ): Promise<{ data?: LogbookEntry[]; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay(300);

      const entries = this.getFromStorage<LogbookEntry>(
        DB_KEYS.LOGBOOK_ENTRIES,
      );
      return entries
        .filter((e) => e.userId === userId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    });
  }

  async updateLogbookEntry(
    id: string,
    updates: Partial<LogbookEntry>,
  ): Promise<{ data?: LogbookEntry; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay();

      const entries = this.getFromStorage<LogbookEntry>(
        DB_KEYS.LOGBOOK_ENTRIES,
      );
      const entryIndex = entries.findIndex((e) => e.id === id);

      if (entryIndex === -1) {
        throw new Error("Logbook entry not found");
      }

      entries[entryIndex] = {
        ...entries[entryIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      if (!this.saveToStorage(DB_KEYS.LOGBOOK_ENTRIES, entries)) {
        throw new Error("Failed to update logbook entry");
      }

      return entries[entryIndex];
    });
  }

  // Document operations
  async uploadDocument(
    documentData: Omit<Document, "id" | "uploadDate">,
  ): Promise<{ data?: Document; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay(1000); // Simulate file upload delay

      const documents = this.getFromStorage<Document>(DB_KEYS.DOCUMENTS);

      const newDocument: Document = {
        ...documentData,
        id: Date.now().toString(),
        uploadDate: new Date().toISOString(),
      };

      documents.push(newDocument);

      if (!this.saveToStorage(DB_KEYS.DOCUMENTS, documents)) {
        throw new Error("Failed to save document");
      }

      return newDocument;
    });
  }

  async getUserDocuments(
    userId: string,
  ): Promise<{ data?: Document[]; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay(300);

      const documents = this.getFromStorage<Document>(DB_KEYS.DOCUMENTS);
      return documents
        .filter((d) => d.userId === userId)
        .sort(
          (a, b) =>
            new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime(),
        );
    });
  }

  async approveDocument(
    id: string,
    approvedBy: string,
    comments?: string,
  ): Promise<{ data?: Document; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay();

      const documents = this.getFromStorage<Document>(DB_KEYS.DOCUMENTS);
      const docIndex = documents.findIndex((d) => d.id === id);

      if (docIndex === -1) {
        throw new Error("Document not found");
      }

      documents[docIndex] = {
        ...documents[docIndex],
        status: "approved",
        approvedBy,
        approvalDate: new Date().toISOString(),
        comments,
      };

      if (!this.saveToStorage(DB_KEYS.DOCUMENTS, documents)) {
        throw new Error("Failed to update document status");
      }

      return documents[docIndex];
    });
  }

  // Announcement operations
  async createAnnouncement(
    announcementData: Omit<Announcement, "id" | "createdAt" | "updatedAt">,
  ): Promise<{ data?: Announcement; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay();

      const announcements = this.getFromStorage<Announcement>(
        DB_KEYS.ANNOUNCEMENTS,
      );

      const newAnnouncement: Announcement = {
        ...announcementData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      announcements.push(newAnnouncement);

      if (!this.saveToStorage(DB_KEYS.ANNOUNCEMENTS, announcements)) {
        throw new Error("Failed to save announcement");
      }

      return newAnnouncement;
    });
  }

  async getAnnouncements(
    targetRole?: string,
  ): Promise<{ data?: Announcement[]; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay(300);

      const announcements = this.getFromStorage<Announcement>(
        DB_KEYS.ANNOUNCEMENTS,
      );
      let filtered = announcements.filter((a) => a.isActive);

      if (targetRole) {
        filtered = filtered.filter(
          (a) =>
            a.targetRoles.includes(targetRole) || a.targetRoles.includes("all"),
        );
      }

      return filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    });
  }

  // Evaluation operations
  async createEvaluation(
    evaluationData: Omit<Evaluation, "id" | "dateEvaluated">,
  ): Promise<{ data?: Evaluation; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay();

      const evaluations = this.getFromStorage<Evaluation>(DB_KEYS.EVALUATIONS);

      const newEvaluation: Evaluation = {
        ...evaluationData,
        id: Date.now().toString(),
        dateEvaluated: new Date().toISOString(),
      };

      evaluations.push(newEvaluation);

      if (!this.saveToStorage(DB_KEYS.EVALUATIONS, evaluations)) {
        throw new Error("Failed to save evaluation");
      }

      return newEvaluation;
    });
  }

  async getStudentEvaluations(
    studentId: string,
  ): Promise<{ data?: Evaluation[]; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay(300);

      const evaluations = this.getFromStorage<Evaluation>(DB_KEYS.EVALUATIONS);
      return evaluations
        .filter((e) => e.studentId === studentId)
        .sort(
          (a, b) =>
            new Date(b.dateEvaluated).getTime() -
            new Date(a.dateEvaluated).getTime(),
        );
    });
  }

  // Contact form operations
  async submitContactForm(
    contactData: Omit<ContactSubmission, "id" | "timestamp" | "status">,
  ): Promise<{ data?: ContactSubmission; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay();

      const submissions = this.getFromStorage<ContactSubmission>(
        DB_KEYS.CONTACT_SUBMISSIONS,
      );

      const newSubmission: ContactSubmission = {
        ...contactData,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        status: "new",
      };

      submissions.push(newSubmission);

      if (!this.saveToStorage(DB_KEYS.CONTACT_SUBMISSIONS, submissions)) {
        throw new Error("Failed to save contact submission");
      }

      return newSubmission;
    });
  }

  // System statistics
  async getSystemStats(): Promise<{ data?: any; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay(200);

      const users = this.getFromStorage<DatabaseUser>(DB_KEYS.USERS);
      const logbookEntries = this.getFromStorage<LogbookEntry>(
        DB_KEYS.LOGBOOK_ENTRIES,
      );
      const documents = this.getFromStorage<Document>(DB_KEYS.DOCUMENTS);
      const evaluations = this.getFromStorage<Evaluation>(DB_KEYS.EVALUATIONS);

      return {
        totalUsers: users.length,
        activeStudents: users.filter(
          (u) => u.role === "student" && u.status === "active",
        ).length,
        totalCoordinators: users.filter((u) => u.role === "coordinator").length,
        totalSupervisors: users.filter((u) => u.role === "supervisor").length,
        totalLogbookEntries: logbookEntries.length,
        pendingDocuments: documents.filter((d) => d.status === "pending")
          .length,
        completedEvaluations: evaluations.filter((e) => e.status === "approved")
          .length,
        registrationsThisMonth: users.filter((u) => {
          const regDate = new Date(u.registrationDate);
          const now = new Date();
          return (
            regDate.getMonth() === now.getMonth() &&
            regDate.getFullYear() === now.getFullYear()
          );
        }).length,
      };
    });
  }

  // Get all logbook entries (for coordinators)
  async getAllLogbookEntries(): Promise<{
    data?: LogbookEntry[];
    error?: string;
  }> {
    return withErrorHandling(async () => {
      await simulateDelay(300);

      const entries = this.getFromStorage<LogbookEntry>(
        DB_KEYS.LOGBOOK_ENTRIES,
      );
      return entries.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    });
  }

  // Get assigned students for supervisor
  async getAssignedStudents(
    supervisorId: string,
  ): Promise<{ data?: DatabaseUser[]; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay(300);

      // In a real app, this would fetch students assigned to this supervisor
      // For now, we'll return a subset of students
      const users = this.getFromStorage<DatabaseUser>(DB_KEYS.USERS);
      const students = users.filter(
        (u) => u.role === "student" && u.status === "active",
      );

      // Simulate assignment - return first 3 students for demo
      return students.slice(0, 3);
    });
  }

  // Get evaluations by supervisor
  async getSupervisorEvaluations(
    supervisorId: string,
  ): Promise<{ data?: Evaluation[]; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay(300);

      const evaluations = this.getFromStorage<Evaluation>(DB_KEYS.EVALUATIONS);
      return evaluations.filter((e) => e.evaluatorId === supervisorId);
    });
  }

  // Approve/Reject logbook entry
  async reviewLogbookEntry(
    entryId: string,
    status: "approved" | "rejected",
    feedback?: string,
  ): Promise<{ data?: LogbookEntry; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay();

      const entries = this.getFromStorage<LogbookEntry>(
        DB_KEYS.LOGBOOK_ENTRIES,
      );
      const entryIndex = entries.findIndex((e) => e.id === entryId);

      if (entryIndex === -1) {
        throw new Error("Logbook entry not found");
      }

      entries[entryIndex] = {
        ...entries[entryIndex],
        status,
        feedback,
        updatedAt: new Date().toISOString(),
      };

      if (!this.saveToStorage(DB_KEYS.LOGBOOK_ENTRIES, entries)) {
        throw new Error("Failed to update logbook entry");
      }

      return entries[entryIndex];
    });
  }

  // Delete user (for admin)
  async deleteUser(
    userId: string,
  ): Promise<{ data?: boolean; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay();

      const users = this.getFromStorage<DatabaseUser>(DB_KEYS.USERS);
      const filteredUsers = users.filter((u) => u.id !== userId);

      if (users.length === filteredUsers.length) {
        throw new Error("User not found");
      }

      if (!this.saveToStorage(DB_KEYS.USERS, filteredUsers)) {
        throw new Error("Failed to delete user");
      }

      return true;
    });
  }

  // Update announcement
  async updateAnnouncement(
    id: string,
    updates: Partial<Announcement>,
  ): Promise<{ data?: Announcement; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay();

      const announcements = this.getFromStorage<Announcement>(
        DB_KEYS.ANNOUNCEMENTS,
      );
      const announcementIndex = announcements.findIndex((a) => a.id === id);

      if (announcementIndex === -1) {
        throw new Error("Announcement not found");
      }

      announcements[announcementIndex] = {
        ...announcements[announcementIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      if (!this.saveToStorage(DB_KEYS.ANNOUNCEMENTS, announcements)) {
        throw new Error("Failed to update announcement");
      }

      return announcements[announcementIndex];
    });
  }

  // Update evaluation
  async updateEvaluation(
    id: string,
    updates: Partial<Evaluation>,
  ): Promise<{ data?: Evaluation; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay();

      const evaluations = this.getFromStorage<Evaluation>(DB_KEYS.EVALUATIONS);
      const evaluationIndex = evaluations.findIndex((e) => e.id === id);

      if (evaluationIndex === -1) {
        throw new Error("Evaluation not found");
      }

      evaluations[evaluationIndex] = {
        ...evaluations[evaluationIndex],
        ...updates,
      };

      if (!this.saveToStorage(DB_KEYS.EVALUATIONS, evaluations)) {
        throw new Error("Failed to update evaluation");
      }

      return evaluations[evaluationIndex];
    });
  }

  // Bulk operations for coordinators
  async bulkApproveLogbookEntries(
    entryIds: string[],
    approverId: string,
  ): Promise<{ data?: LogbookEntry[]; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay();

      const entries = this.getFromStorage<LogbookEntry>(
        DB_KEYS.LOGBOOK_ENTRIES,
      );
      const updatedEntries: LogbookEntry[] = [];

      for (const entryId of entryIds) {
        const entryIndex = entries.findIndex((e) => e.id === entryId);
        if (entryIndex !== -1) {
          entries[entryIndex] = {
            ...entries[entryIndex],
            status: "approved",
            updatedAt: new Date().toISOString(),
          };
          updatedEntries.push(entries[entryIndex]);
        }
      }

      if (!this.saveToStorage(DB_KEYS.LOGBOOK_ENTRIES, entries)) {
        throw new Error("Failed to bulk approve entries");
      }

      return updatedEntries;
    });
  }

  // Get logbook entries for coordinator review
  async getLogbookEntriesForReview(
    coordinatorId: string,
  ): Promise<{ data?: LogbookEntry[]; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay(300);

      const entries = this.getFromStorage<LogbookEntry>(
        DB_KEYS.LOGBOOK_ENTRIES,
      );
      // In a real app, this would filter by coordinator's assigned students
      return entries
        .filter((e) => e.status === "submitted")
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    });
  }

  // Get documents for coordinator review
  async getDocumentsForReview(
    coordinatorId: string,
  ): Promise<{ data?: Document[]; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay(300);

      const documents = this.getFromStorage<Document>(DB_KEYS.DOCUMENTS);
      // In a real app, this would filter by coordinator's assigned students
      return documents
        .filter((d) => d.status === "pending")
        .sort(
          (a, b) =>
            new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime(),
        );
    });
  }

  // Student progress tracking
  async getStudentProgress(
    studentId: string,
  ): Promise<{ data?: any; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay(300);

      const logbookEntries = this.getFromStorage<LogbookEntry>(
        DB_KEYS.LOGBOOK_ENTRIES,
      );
      const documents = this.getFromStorage<Document>(DB_KEYS.DOCUMENTS);
      const evaluations = this.getFromStorage<Evaluation>(DB_KEYS.EVALUATIONS);

      const studentEntries = logbookEntries.filter(
        (e) => e.userId === studentId,
      );
      const studentDocuments = documents.filter((d) => d.userId === studentId);
      const studentEvaluations = evaluations.filter(
        (e) => e.studentId === studentId,
      );

      const totalHours = studentEntries
        .filter((e) => e.status === "approved")
        .reduce((sum, e) => sum + e.hoursWorked, 0);

      const requiredDocuments = ["moa", "waiver"];
      const submittedDocuments = requiredDocuments.filter((type) =>
        studentDocuments.some(
          (d) => d.type === type && d.status === "approved",
        ),
      );

      return {
        totalHours,
        requiredHours: 486,
        completionPercentage: Math.round((totalHours / 486) * 100),
        logbookEntries: {
          total: studentEntries.length,
          approved: studentEntries.filter((e) => e.status === "approved")
            .length,
          pending: studentEntries.filter((e) => e.status === "submitted")
            .length,
          rejected: studentEntries.filter((e) => e.status === "rejected")
            .length,
        },
        documents: {
          required: requiredDocuments.length,
          submitted: submittedDocuments.length,
          pending: studentDocuments.filter((d) => d.status === "pending")
            .length,
        },
        evaluations: {
          total: studentEvaluations.length,
          completed: studentEvaluations.filter((e) => e.status === "approved")
            .length,
        },
        lastActivity:
          studentEntries.length > 0
            ? studentEntries.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )[0].createdAt
            : null,
      };
    });
  }

  // Delete announcement
  async deleteAnnouncement(
    id: string,
  ): Promise<{ data?: boolean; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay();

      const announcements = this.getFromStorage<Announcement>(
        DB_KEYS.ANNOUNCEMENTS,
      );
      const filteredAnnouncements = announcements.filter((a) => a.id !== id);

      if (announcements.length === filteredAnnouncements.length) {
        throw new Error("Announcement not found");
      }

      if (!this.saveToStorage(DB_KEYS.ANNOUNCEMENTS, filteredAnnouncements)) {
        throw new Error("Failed to delete announcement");
      }

      return true;
    });
  }

  // Delete logbook entry
  async deleteLogbookEntry(
    id: string,
  ): Promise<{ data?: boolean; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay();

      const entries = this.getFromStorage<LogbookEntry>(
        DB_KEYS.LOGBOOK_ENTRIES,
      );
      const filteredEntries = entries.filter((e) => e.id !== id);

      if (entries.length === filteredEntries.length) {
        throw new Error("Logbook entry not found");
      }

      if (!this.saveToStorage(DB_KEYS.LOGBOOK_ENTRIES, filteredEntries)) {
        throw new Error("Failed to delete logbook entry");
      }

      return true;
    });
  }

  // Delete document
  async deleteDocument(
    id: string,
  ): Promise<{ data?: boolean; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay();

      const documents = this.getFromStorage<Document>(DB_KEYS.DOCUMENTS);
      const filteredDocuments = documents.filter((d) => d.id !== id);

      if (documents.length === filteredDocuments.length) {
        throw new Error("Document not found");
      }

      if (!this.saveToStorage(DB_KEYS.DOCUMENTS, filteredDocuments)) {
        throw new Error("Failed to delete document");
      }

      return true;
    });
  }

  // Reject document
  async rejectDocument(
    id: string,
    rejectedBy: string,
    comments?: string,
  ): Promise<{ data?: Document; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay();

      const documents = this.getFromStorage<Document>(DB_KEYS.DOCUMENTS);
      const docIndex = documents.findIndex((d) => d.id === id);

      if (docIndex === -1) {
        throw new Error("Document not found");
      }

      documents[docIndex] = {
        ...documents[docIndex],
        status: "rejected",
        approvedBy: rejectedBy,
        approvalDate: new Date().toISOString(),
        comments,
      };

      if (!this.saveToStorage(DB_KEYS.DOCUMENTS, documents)) {
        throw new Error("Failed to update document status");
      }

      return documents[docIndex];
    });
  }

  // Delete evaluation
  async deleteEvaluation(
    id: string,
  ): Promise<{ data?: boolean; error?: string }> {
    return withErrorHandling(async () => {
      await simulateDelay();

      const evaluations = this.getFromStorage<Evaluation>(DB_KEYS.EVALUATIONS);
      const filteredEvaluations = evaluations.filter((e) => e.id !== id);

      if (evaluations.length === filteredEvaluations.length) {
        throw new Error("Evaluation not found");
      }

      if (!this.saveToStorage(DB_KEYS.EVALUATIONS, filteredEvaluations)) {
        throw new Error("Failed to delete evaluation");
      }

      return true;
    });
  }

  // Initialize default data
  async initializeDefaultData(): Promise<void> {
    const users = this.getFromStorage<DatabaseUser>(DB_KEYS.USERS);
    const announcements = this.getFromStorage<Announcement>(
      DB_KEYS.ANNOUNCEMENTS,
    );
    const logbookEntries = this.getFromStorage<LogbookEntry>(
      DB_KEYS.LOGBOOK_ENTRIES,
    );
    const documents = this.getFromStorage<Document>(DB_KEYS.DOCUMENTS);
    const evaluations = this.getFromStorage<Evaluation>(DB_KEYS.EVALUATIONS);

    if (users.length === 0) {
      const defaultUsers: DatabaseUser[] = [
        {
          id: "1",
          name: "Admin User",
          email: "admin@msu.edu.ph",
          role: "admin",
          registrationDate: new Date().toISOString(),
          status: "active",
        },
        {
          id: "0",
          name: "System Admin",
          email: "adminxx@minsu.com",
          role: "admin",
          registrationDate: new Date().toISOString(),
          status: "active",
        },
        {
          id: "2",
          name: "John Doe",
          email: "john.doe@student.msu.edu.ph",
          role: "student",
          studentId: "2021-12345",
          department: "Computer Science",
          registrationDate: new Date().toISOString(),
          status: "active",
        },
        {
          id: "3",
          name: "Jane Smith",
          email: "jane.smith@msu.edu.ph",
          role: "coordinator",
          department: "Computer Science",
          registrationDate: new Date().toISOString(),
          status: "active",
        },
        {
          id: "4",
          name: "Bob Wilson",
          email: "bob.wilson@company.com",
          role: "supervisor",
          company: "Tech Solutions Inc.",
          registrationDate: new Date().toISOString(),
          status: "active",
        },
        {
          id: "5",
          name: "Alice Johnson",
          email: "alice.johnson@student.msu.edu.ph",
          role: "student",
          studentId: "2021-67890",
          department: "Computer Science",
          registrationDate: new Date().toISOString(),
          status: "active",
        },
        {
          id: "6",
          name: "Mark Davis",
          email: "mark.davis@company2.com",
          role: "supervisor",
          company: "Digital Innovations Corp",
          registrationDate: new Date().toISOString(),
          status: "active",
        },
      ];

      this.saveToStorage(DB_KEYS.USERS, defaultUsers);
    }

    // Initialize sample announcements
    if (announcements.length === 0) {
      const defaultAnnouncements: Announcement[] = [
        {
          id: "1",
          title: "OJT Orientation Schedule",
          content:
            "All students must attend the orientation on January 25, 2024 at 10:00 AM via Zoom. Meeting ID will be sent via email.",
          authorId: "3",
          authorName: "Jane Smith",
          targetRoles: ["student"],
          priority: "high",
          createdAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          isActive: true,
        },
        {
          id: "2",
          title: "MOA Submission Deadline",
          content:
            "Please submit your signed Memorandum of Agreement by February 1, 2024. Late submissions will not be accepted.",
          authorId: "3",
          authorName: "Jane Smith",
          targetRoles: ["student"],
          priority: "urgent",
          createdAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          isActive: true,
        },
        {
          id: "3",
          title: "System Maintenance Notice",
          content:
            "The OJT system will undergo maintenance on January 30, 2024 from 2:00 AM to 4:00 AM. Please plan accordingly.",
          authorId: "1",
          authorName: "Admin User",
          targetRoles: ["all"],
          priority: "medium",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
        },
      ];

      this.saveToStorage(DB_KEYS.ANNOUNCEMENTS, defaultAnnouncements);
    }

    // Initialize sample logbook entries
    if (logbookEntries.length === 0) {
      const defaultLogbookEntries: LogbookEntry[] = [
        {
          id: "1",
          userId: "2",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          title: "Database Design and Implementation",
          description:
            "Worked on designing the database schema for the inventory management system. Created ERD diagrams and implemented the initial tables using MySQL. Learned about normalization and foreign key relationships.",
          activities: [
            "Database design",
            "ERD creation",
            "MySQL implementation",
          ],
          hoursWorked: 8,
          status: "approved",
          feedback:
            "Excellent work on the database design. The ERD is well-structured.",
          createdAt: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        {
          id: "2",
          userId: "2",
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          title: "Frontend Development with React",
          description:
            "Developed user interface components for the inventory system using React.js. Implemented responsive design and integrated with the backend API. Created forms for data entry and validation.",
          activities: ["React development", "UI/UX design", "API integration"],
          hoursWorked: 8,
          status: "approved",
          feedback:
            "Great progress on the frontend. The components are well-structured and responsive.",
          createdAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        {
          id: "3",
          userId: "2",
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          title: "API Development and Testing",
          description:
            "Created RESTful API endpoints using Node.js and Express. Implemented CRUD operations for inventory items. Conducted unit testing and API documentation using Postman.",
          activities: ["API development", "Testing", "Documentation"],
          hoursWorked: 8,
          status: "submitted",
          createdAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
      ];

      this.saveToStorage(DB_KEYS.LOGBOOK_ENTRIES, defaultLogbookEntries);
    }

    // Initialize sample documents
    if (documents.length === 0) {
      const defaultDocuments: Document[] = [
        {
          id: "1",
          userId: "2",
          type: "moa",
          title: "Memorandum of Agreement - Tech Solutions Inc.",
          fileName: "MOA_TechSolutions_JohnDoe.pdf",
          fileUrl: "#",
          uploadDate: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          status: "approved",
          approvedBy: "3",
          approvalDate: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          comments: "MOA approved. All terms and conditions are acceptable.",
        },
        {
          id: "2",
          userId: "2",
          type: "waiver",
          title: "Liability Waiver Form",
          fileName: "Waiver_JohnDoe.pdf",
          fileUrl: "#",
          uploadDate: new Date(
            Date.now() - 4 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          status: "approved",
          approvedBy: "3",
          approvalDate: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        {
          id: "3",
          userId: "5",
          type: "moa",
          title: "Memorandum of Agreement - Digital Innovations",
          fileName: "MOA_DigitalInnovations_AliceJohnson.pdf",
          fileUrl: "#",
          uploadDate: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          status: "pending",
        },
      ];

      this.saveToStorage(DB_KEYS.DOCUMENTS, defaultDocuments);
    }

    // Initialize sample evaluations
    if (evaluations.length === 0) {
      const defaultEvaluations: Evaluation[] = [
        {
          id: "1",
          studentId: "2",
          evaluatorId: "4",
          evaluatorRole: "supervisor",
          type: "midterm",
          scores: {
            technical: 85,
            communication: 90,
            teamwork: 88,
            initiative: 87,
            punctuality: 95,
            overall: 89,
          },
          comments:
            "John has shown excellent technical skills and great communication with the team. He takes initiative and is always punctual.",
          recommendations:
            "Continue with current performance. Consider assigning more complex tasks to further develop technical skills.",
          dateEvaluated: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          status: "approved",
        },
      ];

      this.saveToStorage(DB_KEYS.EVALUATIONS, defaultEvaluations);
    }
  }
}

// Export singleton instance
export const db = new DatabaseService();

// Initialize default data on module load
db.initializeDefaultData();

// Export database service for direct access
export default db;
