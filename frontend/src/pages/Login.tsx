import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 relative overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="w-full max-w-md relative z-10 animate-fade-in border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl">
        <CardHeader className="space-y-6 text-center pb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-primary/10">
            <Shield className="w-11 h-11 text-primary-foreground" />
          </div>
          <div className="space-y-3">
            <CardTitle className="text-2xl font-bold text-foreground">Odisha Police Department</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Court Attendance & Witness Tracking System
            </CardDescription>
            <div className="pt-2">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                Government of Odisha
              </span>
            </div>
          </div>
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
              <Label htmlFor="role" className="text-sm font-semibold">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role" className="h-11">
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
              <Label htmlFor="username" className="text-sm font-semibold">Username / Employee ID</Label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your ID"
                  className="pl-10 h-11"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10 h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In Securely"}
            </Button>

            <div className="text-center space-y-3">
              <p className="text-xs text-muted-foreground">
                Forgot password? Contact your system administrator
              </p>
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  © 2024 Odisha Police Department
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  All rights reserved. Secure access only.
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
