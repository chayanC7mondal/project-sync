import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { User, Lock, Mail, Phone, Badge as BadgeIcon, Building, MapPin, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { AUTH_SIGNUP } from "@/utils/constants";
import { useAuth } from "@/contexts/AuthContext";

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employeeId: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
    rank: "",
    department: "",
    station: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.employeeId ||
      !formData.username ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.role
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (formData.phone.length < 10) {
      toast.error("Phone number must be at least 10 digits");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post(AUTH_SIGNUP, {
        employeeId: formData.employeeId,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        rank: formData.rank || undefined,
        department: formData.department || undefined,
        station: formData.station || undefined,
      });

      if (response.data.success && response.data.data) {
        // Store token
        if (response.data.data.token) {
          localStorage.setItem('token', response.data.data.token);
        }

        // Use AuthContext login
        const userData = response.data.data.user;
        login(userData);

        toast.success(response.data.message || "Registration successful! Welcome to the system.");
        navigate("/");
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 sm:p-6 lg:p-8 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 1 }}
      >
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-accent/5 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeOut",
        }}
        className="w-full max-w-2xl"
      >
        <Card className="relative z-10 border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl">
          <CardHeader className="space-y-4 text-center pb-6">
            <motion.div
              className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg ring-4 ring-primary/10 overflow-hidden"
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                delay: 0.5,
                duration: 0.8,
                ease: "easeOut",
              }}
            >
              <img
                src="/op.png"
                alt="Odisha Police Logo"
                className="w-12 h-12 object-contain"
              />
            </motion.div>
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Create Account
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Register for Odisha Police Court Attendance System
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="pb-6">
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Row 1: Employee ID & Username */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="text-sm font-medium">
                    Employee ID <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <BadgeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="employeeId"
                      type="text"
                      placeholder="Enter employee ID"
                      value={formData.employeeId}
                      onChange={(e) => handleChange("employeeId", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose username"
                      value={formData.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@odishapolice.gov.in"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Password & Confirm Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Role */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="io">Investigating Officer (IO)</SelectItem>
                    <SelectItem value="liaison">Liaison Officer</SelectItem>
                    <SelectItem value="witness">Witness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Row 5: Optional Fields - Rank, Department, Station */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rank" className="text-sm font-medium">
                    Rank <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    id="rank"
                    type="text"
                    placeholder="e.g., ASI, SI, Inspector"
                    value={formData.rank}
                    onChange={(e) => handleChange("rank", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium">
                    Department <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="department"
                      type="text"
                      placeholder="Enter department"
                      value={formData.department}
                      onChange={(e) => handleChange("department", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="station" className="text-sm font-medium">
                    Station <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="station"
                      type="text"
                      placeholder="Police station"
                      value={formData.station}
                      onChange={(e) => handleChange("station", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-4 border-t">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-semibold"
              >
                Login here
              </Link>
            </div>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Signup;
