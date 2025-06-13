import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { register } from "@/lib/auth";
import { db } from "@/lib/database";
import {
  Eye,
  EyeOff,
  CheckCircle,
  Users,
  BookOpen,
  FileText,
  Award,
  Building,
  GraduationCap,
  Shield,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "student" | "coordinator" | "supervisor" | "";
  phone?: string;
  company?: string;
  studentId?: string;
  department?: string;
  message?: string;
}

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const LandingPage = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    phone: "",
    company: "",
    studentId: "",
    department: "",
    message: "",
  });

  const [contactForm, setContactForm] = useState<ContactForm>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleContactChange = (field: keyof ContactForm, value: string) => {
    setContactForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
      setError("Please fill in all required fields");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.role === "student" && !formData.studentId) {
      setError("Student ID is required for student registration");
      return false;
    }

    if (formData.role === "supervisor" && !formData.company) {
      setError("Company name is required for supervisor registration");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (!validateForm()) {
        setIsLoading(false);
        return;
      }

      // Simulate backend API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create user in database
      const dbResult = await db.createUser({
        name: formData.name,
        email: formData.email,
        role: formData.role as "student" | "coordinator" | "supervisor",
        phone: formData.phone,
        company: formData.company,
        studentId: formData.studentId,
        department: formData.department,
        message: formData.message,
        status: "pending_approval",
      });

      if (dbResult.error) {
        setError(dbResult.error);
        return;
      }

      // Register user in auth system
      const user = register(
        formData.name,
        formData.email,
        formData.password,
        formData.role as "student" | "coordinator" | "supervisor",
      );

      if (user) {
        setSuccess("Registration successful! Redirecting to dashboard...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setError("Email already exists. Please use a different email address.");
      }
    } catch (err) {
      setError("An error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate backend API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Submit contact form to database
      const dbResult = await db.submitContactForm(contactForm);

      if (dbResult.error) {
        setError(dbResult.error);
        return;
      }

      setContactSuccess(true);
      setContactForm({ name: "", email: "", subject: "", message: "" });

      setTimeout(() => {
        setContactSuccess(false);
      }, 5000);
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Multi-Role Management",
      description:
        "Support for students, coordinators, supervisors, and administrators with role-based access control.",
    },
    {
      icon: <BookOpen className="h-8 w-8 text-green-600" />,
      title: "Digital Logbook",
      description:
        "Interactive daily/weekly activity submissions with rich text editor and file upload capabilities.",
    },
    {
      icon: <FileText className="h-8 w-8 text-green-600" />,
      title: "Document Management",
      description:
        "Secure storage for MOAs, waivers, and evaluation forms with approval workflow system.",
    },
    {
      icon: <Award className="h-8 w-8 text-green-600" />,
      title: "Evaluation System",
      description:
        "Comprehensive evaluation and feedback system for tracking student progress and performance.",
    },
  ];

  const stats = [
    { number: "500+", label: "Students Registered" },
    { number: "50+", label: "Partner Companies" },
    { number: "25+", label: "Active Coordinators" },
    { number: "98%", label: "Success Rate" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img
                src="https://storage.googleapis.com/tempo-public-images/user_2yAjVzLg0r41N3IxzzIm7ttGg1t-1749284332996-image.png"
                alt="MSU CCS Logo"
                className="h-12 w-12"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">MSU CCS</h1>
                <p className="text-sm text-green-600">OJT Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  Sign In
                </Button>
              </Link>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  const registerSection = document.getElementById("register");
                  if (registerSection) {
                    registerSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 mb-4">
              🎓 Mindoro State University - College of Computer Studies
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Streamline Your
              <span className="text-green-600"> OJT Journey</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A comprehensive OJT tracking system that manages the entire
              internship workflow from registration to evaluation, designed
              specifically for MSU CCS students.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                onClick={() => {
                  const registerSection = document.getElementById("register");
                  if (registerSection) {
                    registerSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                Register Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-yellow-400 text-yellow-700 hover:bg-yellow-50 px-8 py-3"
                onClick={() => {
                  const featuresSection = document.querySelector(
                    '[data-section="features"]',
                  );
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="py-20 bg-gradient-to-r from-green-50 to-yellow-50"
        data-section="features"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for
              <span className="text-green-600"> Every Role</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides specialized tools and interfaces for
              students, coordinators, supervisors, and administrators.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-yellow-200 hover:shadow-lg transition-shadow"
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section className="py-20 bg-white" id="register">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Join the <span className="text-green-600">OJT Community</span>
            </h2>
            <p className="text-xl text-gray-600">
              Register now to start your OJT journey with MSU CCS
            </p>
          </div>

          <Card className="border-yellow-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
              <CardTitle className="text-2xl text-center">
                Create Your Account
              </CardTitle>
              <CardDescription className="text-green-100 text-center">
                Fill in your information to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-700">
                    Role *
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange("role", value)}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">
                        <div className="flex items-center">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          Student
                        </div>
                      </SelectItem>
                      <SelectItem value="coordinator">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          Coordinator
                        </div>
                      </SelectItem>
                      <SelectItem value="supervisor">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          Company Supervisor
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Conditional Fields */}
                {formData.role === "student" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="studentId" className="text-gray-700">
                        Student ID *
                      </Label>
                      <Input
                        id="studentId"
                        type="text"
                        placeholder="Enter your student ID"
                        value={formData.studentId}
                        onChange={(e) =>
                          handleInputChange("studentId", e.target.value)
                        }
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-gray-700">
                        Department
                      </Label>
                      <Input
                        id="department"
                        type="text"
                        placeholder="e.g., Computer Science"
                        value={formData.department}
                        onChange={(e) =>
                          handleInputChange("department", e.target.value)
                        }
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>
                )}

                {formData.role === "supervisor" && (
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-gray-700">
                      Company Name *
                    </Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="Enter your company name"
                      value={formData.company}
                      onChange={(e) =>
                        handleInputChange("company", e.target.value)
                      }
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700">
                      Confirm Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-700">
                    Additional Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Any additional information or questions..."
                    value={formData.message}
                    onChange={(e) =>
                      handleInputChange("message", e.target.value)
                    }
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500 min-h-[100px]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-green-600 hover:text-green-500 font-medium"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Admin accounts cannot be created
                  through registration. Contact your system administrator for
                  admin access.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-yellow-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get in <span className="text-green-600">Touch</span>
            </h2>
            <p className="text-xl text-gray-600">
              Have questions? We're here to help you get started.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Address</p>
                      <p className="text-gray-600">
                        Mindoro State University, Calapan City
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <p className="text-gray-600">+63 (063) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Mail className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">ccs@msu.edu.ph</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-yellow-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Office Hours
                </h4>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <strong>Monday - Friday:</strong> 8:00 AM - 5:00 PM
                  </p>
                  <p>
                    <strong>Saturday:</strong> 8:00 AM - 12:00 PM
                  </p>
                  <p>
                    <strong>Sunday:</strong> Closed
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="border-yellow-200">
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you soon.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contactSuccess && (
                  <Alert className="mb-6 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Message sent successfully! We'll get back to you soon.
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Name</Label>
                      <Input
                        id="contactName"
                        type="text"
                        placeholder="Your name"
                        value={contactForm.name}
                        onChange={(e) =>
                          handleContactChange("name", e.target.value)
                        }
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="Your email"
                        value={contactForm.email}
                        onChange={(e) =>
                          handleContactChange("email", e.target.value)
                        }
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactSubject">Subject</Label>
                    <Input
                      id="contactSubject"
                      type="text"
                      placeholder="Message subject"
                      value={contactForm.subject}
                      onChange={(e) =>
                        handleContactChange("subject", e.target.value)
                      }
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactMessage">Message</Label>
                    <Textarea
                      id="contactMessage"
                      placeholder="Your message"
                      value={contactForm.message}
                      onChange={(e) =>
                        handleContactChange("message", e.target.value)
                      }
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500 min-h-[120px]"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="https://storage.googleapis.com/tempo-public-images/user_2yAjVzLg0r41N3IxzzIm7ttGg1t-1749284332996-image.png"
                  alt="MSU CCS Logo"
                  className="h-10 w-10"
                />
                <div>
                  <h3 className="text-lg font-bold">MSU CCS OJT Tracker</h3>
                  <p className="text-gray-400 text-sm">
                    College of Computer Studies
                  </p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Streamlining the OJT experience for students, coordinators, and
                supervisors at Mindoro State University's College of Computer
                Studies.
              </p>
              <div className="flex space-x-4">
                <div className="bg-green-600 p-2 rounded-full">
                  <Star className="h-4 w-4" />
                </div>
                <div className="bg-yellow-500 p-2 rounded-full">
                  <Award className="h-4 w-4" />
                </div>
                <div className="bg-blue-600 p-2 rounded-full">
                  <Shield className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    to="/login"
                    className="hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="hover:text-white transition-colors"
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2024 Mindoro State University - College of Computer
              Studies. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
