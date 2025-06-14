import { db, type DatabaseUser } from "@/lib/database";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "coordinator" | "supervisor" | "admin";
  studentId?: string;
  company?: string;
  department?: string;
  phone?: string;
  status?: string;
}

// Current user state
let currentUser: User | null = null;

export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const login = async (
  email: string,
  password: string,
): Promise<User | null> => {
  try {
    // Special handling for the seeded admin user
    if (email === "adminxx@minsu.com" && password === "adminxx123") {
      const adminUser: User = {
        id: "0",
        name: "System Admin",
        email: "adminxx@minsu.com",
        role: "admin",
        status: "active",
      };
      currentUser = adminUser;
      localStorage.setItem("currentUser", JSON.stringify(adminUser));
      return adminUser;
    }

    // Try to find user in database
    const allUsersResult = await db.getAllUsers();
    if (allUsersResult.error || !allUsersResult.data) {
      console.error("Failed to fetch users:", allUsersResult.error);
      return null;
    }

    const dbUser = allUsersResult.data.find((u) => u.email === email);
    if (!dbUser || dbUser.status !== "active") {
      return null;
    }

    // Convert database user to auth user
    const user: User = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      studentId: dbUser.studentId,
      company: dbUser.company,
      department: dbUser.department,
      phone: dbUser.phone,
      status: dbUser.status,
    };

    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    return user;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
};

export const register = async (
  name: string,
  email: string,
  password: string,
  role: "student" | "coordinator" | "supervisor",
  additionalData?: {
    studentId?: string;
    company?: string;
    department?: string;
    phone?: string;
  },
): Promise<User | null> => {
  try {
    // Check if user already exists in database
    const existingUsersResult = await db.getAllUsers();
    if (existingUsersResult.data) {
      const existingUser = existingUsersResult.data.find(
        (u) => u.email === email,
      );
      if (existingUser) {
        return null; // User already exists
      }
    }

    // Create user in database first
    const dbResult = await db.createUser({
      name,
      email,
      role,
      phone: additionalData?.phone,
      company: additionalData?.company,
      studentId: additionalData?.studentId,
      department: additionalData?.department,
    });

    if (dbResult.error || !dbResult.data) {
      console.error("Failed to create user in database:", dbResult.error);
      return null;
    }

    // Create auth user from database user - set status to active for immediate login
    const newUser: User = {
      id: dbResult.data.id,
      name: dbResult.data.name,
      email: dbResult.data.email,
      role: dbResult.data.role,
      studentId: dbResult.data.studentId,
      company: dbResult.data.company,
      department: dbResult.data.department,
      phone: dbResult.data.phone,
      status: "active", // Set to active for immediate access
    };

    // Update the user status in database to active
    await db.updateUser(dbResult.data.id, { status: "active" });

    currentUser = newUser;
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    return newUser;
  } catch (error) {
    console.error("Registration error:", error);
    return null;
  }
};

export const logout = (): void => {
  currentUser = null;
  localStorage.removeItem("currentUser");
};

export const initializeAuth = (): void => {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
    } catch (error) {
      console.error("Error parsing saved user:", error);
      localStorage.removeItem("currentUser");
    }
  }
};

// Initialize auth on module load
initializeAuth();

export const isAuthenticated = (): boolean => {
  return currentUser !== null;
};

export const isAdmin = (): boolean => {
  return currentUser?.role === "admin";
};
