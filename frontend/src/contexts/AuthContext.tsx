import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/utils/apiClient";
import { AUTH_LOGOUT, AUTH_VALIDATE } from "@/utils/constants";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  employeeId?: string;
  rank?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in on mount
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (storedUser && token) {
          const userData = JSON.parse(storedUser);
          
          // Validate token with backend
          try {
            await apiClient.get(AUTH_VALIDATE);
            setUser(userData);
            setIsAuthenticated(true);
          } catch (error) {
            // Token is invalid, clear storage
            console.error("Token validation failed:", error);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint
      await apiClient.post(AUTH_LOGOUT);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local state regardless of API call success
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
