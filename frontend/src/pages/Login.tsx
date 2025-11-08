import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@/components/ui/card";
import { Shield, Lock, User, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role || !username || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    // Mock authentication with delay
    setTimeout(() => {
      toast.success("Login successful! Welcome to the system.");
      onLogin();
      navigate("/");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 sm:p-6 lg:p-8 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Subtle animated background */}
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
      >
        <Card className="w-full max-w-sm sm:max-w-md lg:max-w-lg relative z-10 border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl">
          <CardHeader className="space-y-6 text-center pb-8">
            <motion.div
              className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-lg ring-4 ring-primary/10 overflow-hidden"
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
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              />
            </motion.div>
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                Odisha Police Department
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-muted-foreground">
                Court Attendance & Witness Tracking System
              </CardDescription>
              <div className="pt-2">
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                  Government of Odisha
                </span>
              </div>
            </motion.div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-info/10 border-info/20 text-foreground">
              <AlertCircle className="h-4 w-4 text-info" />
              <AlertDescription className="text-sm">
                Use your official credentials to access the system securely.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-semibold">
                  Role
                </Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role" className="h-10 sm:h-11">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin (SP/SDPO)</SelectItem>
                    <SelectItem value="io">Investigating Officer</SelectItem>
                    <SelectItem value="liaison">Liaison Officer</SelectItem>
                    <SelectItem value="witness">Witness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold">
                  Username / Employee ID
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your ID"
                    className="pl-10 h-10 sm:h-11"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10 h-10 sm:h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 sm:h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In Securely"}
              </Button>

              <div className="text-center space-y-3">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Forgot password? Contact your system administrator
                </p>
                <div className="pt-4 border-t border-border">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    © 2025 Odisha Police Department
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    All rights reserved. Secure access only.
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Login;
