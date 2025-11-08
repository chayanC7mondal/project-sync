import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import SplashScreen from "./components/SplashScreen";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardLayout from "./components/layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import CaseManagement from "./pages/CaseManagement";
import Attendance from "./pages/Attendance";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Liaison Officer Pages
import LiaisonDashboard from "./pages/LiaisonDashboard";
import TodayHearings from "./pages/TodayHearings";
import UpcomingHearings from "./pages/UpcomingHearings";
import AttendanceMarking from "./pages/AttendanceMarking";
import AbsenceManagement from "./pages/AbsenceManagement";
import GenerateQRCode from "./pages/GenerateQRCode";

// Role-specific Dashboards
import AdminDashboard from "./pages/AdminDashboard";
import WitnessDashboard from "./pages/WitnessDashboard";
import IODashboard from "./pages/IODashboard";

// IO-specific Pages
import IOCases from "./pages/IOCases";
import IOWitnesses from "./pages/IOWitnesses";
import IOHearings from "./pages/IOHearings";
import IONotifications from "./pages/IONotifications";

// Witness-specific Pages
import WitnessCases from "./pages/WitnessCases";
import WitnessAttendance from "./pages/WitnessAttendance";
import WitnessNotifications from "./pages/WitnessNotifications";

// QR Verification Page (for IO and Witness)
import VerifyAttendance from "./pages/VerifyAttendance";

// Notification Center
import NotificationCenter from "./pages/NotificationCenter";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  // Skip splash screen in development for faster testing
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        console.log("App.tsx - User data from localStorage:", userData);
        console.log("App.tsx - User role:", userData.role);
        setIsAuthenticated(true);
        setUserRole(userData.role);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleLogin = (role: string) => {
    console.log("App.tsx - handleLogin called with role:", role);
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleSignup = (role: string) => {
    console.log("App.tsx - handleSignup called with role:", role);
    setIsAuthenticated(true);
    setUserRole(role);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {showSplash ? (
            <SplashScreen onComplete={handleSplashComplete} />
          ) : (
            <BrowserRouter>
              <Routes>
                <Route
                  path="/login"
                  element={<Login onLogin={handleLogin} />}
                />
                <Route
                  path="/signup"
                  element={<Signup onSignup={handleSignup} />}
                />

                {isAuthenticated ? (
                  <Route element={<DashboardLayout />}>
                    {/* Liaison Officer Routes */}
                    {userRole === "liaison" && (
                      <>
                        <Route path="/" element={<LiaisonDashboard />} />
                        <Route
                          path="/liaison/dashboard"
                          element={<LiaisonDashboard />}
                        />
                        <Route
                          path="/liaison/hearings/today"
                          element={<TodayHearings />}
                        />
                        <Route
                          path="/liaison/hearings/upcoming"
                          element={<UpcomingHearings />}
                        />
                        <Route
                          path="/liaison/attendance/:hearingId"
                          element={<AttendanceMarking />}
                        />
                        <Route
                          path="/liaison/absences"
                          element={<AbsenceManagement />}
                        />
                        <Route
                          path="/liaison/generate-qr"
                          element={<GenerateQRCode />}
                        />
                        <Route
                          path="/notifications"
                          element={<Notifications />}
                        />
                        <Route
                          path="/notification-center"
                          element={<NotificationCenter />}
                        />
                        <Route path="/settings" element={<Settings />} />
                      </>
                    )}

                    {/* Admin Routes */}
                    {userRole === "admin" && (
                      <>
                        <Route path="/" element={<AdminDashboard />} />
                        <Route path="/cases" element={<CaseManagement />} />
                        <Route path="/attendance" element={<Attendance />} />
                        <Route
                          path="/notifications"
                          element={<Notifications />}
                        />
                        <Route
                          path="/notification-center"
                          element={<NotificationCenter />}
                        />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/settings" element={<Settings />} />
                      </>
                    )}

                    {/* Witness Routes */}
                    {userRole === "witness" && (
                      <>
                        <Route path="/" element={<WitnessDashboard />} />
                        <Route path="/cases" element={<WitnessCases />} />
                        <Route
                          path="/attendance"
                          element={<WitnessAttendance />}
                        />
                        <Route
                          path="/attendance/verify"
                          element={<VerifyAttendance />}
                        />
                        <Route
                          path="/notifications"
                          element={<WitnessNotifications />}
                        />
                        <Route
                          path="/notification-center"
                          element={<NotificationCenter />}
                        />
                        <Route path="/settings" element={<Settings />} />
                      </>
                    )}

                    {/* Investigating Officer (IO) Routes */}
                    {userRole === "io" && (
                      <>
                        <Route path="/" element={<IODashboard />} />
                        <Route path="/cases" element={<IOCases />} />
                        <Route path="/witnesses" element={<IOWitnesses />} />
                        <Route path="/hearings" element={<IOHearings />} />
                        <Route
                          path="/attendance/verify"
                          element={<VerifyAttendance />}
                        />
                        <Route
                          path="/notifications"
                          element={<IONotifications />}
                        />
                        <Route
                          path="/notification-center"
                          element={<NotificationCenter />}
                        />
                        <Route path="/settings" element={<Settings />} />
                      </>
                    )}

                    {/* Default fallback */}
                    {!["liaison", "admin", "witness", "io"].includes(
                      userRole || ""
                    ) && <Route path="/" element={<Dashboard />} />}
                  </Route>
                ) : (
                  <Route path="*" element={<Navigate to="/login" replace />} />
                )}

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          )}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
