import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import CaseManagement from "@/pages/CaseManagement";
import Attendance from "@/pages/Attendance";
import Notifications from "@/pages/Notifications";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

// Liaison Officer Pages
import LiaisonDashboard from "@/pages/LiaisonDashboard";
import TodayHearings from "@/pages/TodayHearings";
import UpcomingHearings from "@/pages/UpcomingHearings";
import AttendanceMarking from "@/pages/AttendanceMarking";
import AbsenceManagement from "@/pages/AbsenceManagement";
import GenerateQRCode from "@/pages/GenerateQRCode";

// Role-specific Dashboards
import AdminDashboard from "@/pages/AdminDashboard";
import WitnessDashboard from "@/pages/WitnessDashboard";
import IODashboard from "@/pages/IODashboard";

// IO-specific Pages
import IOCases from "@/pages/IOCases";
import IOWitnesses from "@/pages/IOWitnesses";
import IOHearings from "@/pages/IOHearings";
import IONotifications from "@/pages/IONotifications";
import IOAttendanceMarking from "@/pages/IOAttendanceMarking";

// Witness-specific Pages
import WitnessCases from "@/pages/WitnessCases";
import WitnessAttendance from "@/pages/WitnessAttendance";
import WitnessNotifications from "@/pages/WitnessNotifications";

// QR Verification Page (for IO and Witness)
import VerifyAttendance from "@/pages/VerifyAttendance";
import AdminReports from "@/pages/AdminReports";

// Notification Center
import NotificationCenter from "@/pages/NotificationCenter";

const AuthenticatedApp = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const userRole = user?.role;

  return (
    <Routes>
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
      />
      <Route
        path="/signup"
        element={!isAuthenticated ? <Signup /> : <Navigate to="/" replace />}
      />

      {isAuthenticated ? (
        <Route element={<DashboardLayout />}>
          {/* Liaison Officer Routes */}
          {userRole === "liaison" && (
            <>
              <Route path="/" element={<LiaisonDashboard />} />
              <Route path="/liaison/dashboard" element={<LiaisonDashboard />} />
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
              <Route path="/liaison/absences" element={<AbsenceManagement />} />
              <Route path="/liaison/generate-qr" element={<GenerateQRCode />} />
              <Route path="/notifications" element={<Notifications />} />
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
              <Route path="/notifications" element={<Notifications />} />
              <Route
                path="/notification-center"
                element={<NotificationCenter />}
              />
              <Route path="/reports" element={<Reports />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/settings" element={<Settings />} />
            </>
          )}

          {/* Witness Routes */}
          {userRole === "witness" && (
            <>
              <Route path="/" element={<WitnessDashboard />} />
              <Route path="/cases" element={<WitnessCases />} />
              <Route path="/attendance" element={<WitnessAttendance />} />
              <Route path="/attendance/verify" element={<VerifyAttendance />} />
              <Route path="/notifications" element={<WitnessNotifications />} />
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
              <Route path="/attendance" element={<IOAttendanceMarking />} />
              <Route path="/attendance/verify" element={<VerifyAttendance />} />
              <Route path="/notifications" element={<IONotifications />} />
              <Route
                path="/notification-center"
                element={<NotificationCenter />}
              />
              <Route path="/settings" element={<Settings />} />
            </>
          )}

          {/* Default fallback */}
          {!["liaison", "admin", "witness", "io"].includes(userRole || "") && (
            <Route path="/" element={<Dashboard />} />
          )}
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AuthenticatedApp;
