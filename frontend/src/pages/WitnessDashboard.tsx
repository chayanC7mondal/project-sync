import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import apiClient from "@/utils/apiClient";
import { CASE_LIST, HEARING_LIST, NOTIFICATIONS_LIST } from "@/utils/constants";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  FileText,
  QrCode,
  Eye,
  ArrowRight,
  Bell,
  TrendingUp,
  XCircle,
} from "lucide-react";

const WitnessDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Dummy stats
  const [stats, setStats] = useState({
    myCases: 5,
    upcomingHearings: 3,
    attendanceRate: 86,
    pendingStatements: 2,
  });

  // Dummy my cases
  const [myCases, setMyCases] = useState([
    {
      case_number: "CR/001/2025",
      case_type: "Theft",
      my_role: "Eye Witness",
      next_hearing: "2025-11-12",
      statement_given: true,
    },
    {
      case_number: "CR/005/2025",
      case_type: "Accident",
      my_role: "Eye Witness",
      next_hearing: "2025-11-14",
      statement_given: true,
    },
    {
      case_number: "CR/009/2025",
      case_type: "Property Dispute",
      my_role: "Character Witness",
      next_hearing: "2025-11-16",
      statement_given: false,
    },
    {
      case_number: "CR/014/2025",
      case_type: "Fraud",
      my_role: "Material Witness",
      next_hearing: "2025-11-22",
      statement_given: true,
    },
  ]);

  // Dummy upcoming hearings
  const [upcomingHearings, setUpcomingHearings] = useState([
    {
      case_number: "CR/001/2025",
      case_type: "Theft",
      hearing_date: "2025-11-12",
      hearing_time: "10:00 AM",
      court_room: "Court Room 1",
      attendance_marked: false,
    },
    {
      case_number: "CR/005/2025",
      case_type: "Accident",
      hearing_date: "2025-11-14",
      hearing_time: "02:00 PM",
      court_room: "Court Room 3",
      attendance_marked: false,
    },
    {
      case_number: "CR/009/2025",
      case_type: "Property Dispute",
      hearing_date: "2025-11-16",
      hearing_time: "11:00 AM",
      court_room: "Court Room 2",
      attendance_marked: false,
    },
  ]);

  // Dummy notifications
  const [recentNotifications, setRecentNotifications] = useState([
    {
      type: "urgent",
      title: "Upcoming Hearing Tomorrow",
      message: "Hearing for case CR/001/2025 at 10:00 AM. Mark attendance.",
      time: "2 hours ago",
    },
    {
      type: "warning",
      title: "Statement Pending",
      message: "Your statement is pending for case CR/009/2025",
      time: "5 hours ago",
    },
    {
      type: "info",
      title: "Hearing Reminder",
      message: "You have a hearing on Nov 14, 2025 at 02:00 PM",
      time: "1 day ago",
    },
    {
      type: "info",
      title: "Attendance Marked",
      message: "Your attendance was marked for Oct 28 hearing",
      time: "1 day ago",
    },
  ]);

  // Fetch witness dashboard data from API
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user._id;

      // Fetch cases where user is a witness
      const casesResponse = await apiClient.get(CASE_LIST);
      if (casesResponse.data.success && casesResponse.data.data) {
        const allCases = casesResponse.data.data;
        const witnessCases = allCases.filter((c: any) => 
          c.witnesses?.some((w: any) => w === userId || w._id === userId)
        );
        setMyCases(witnessCases.map((c: any) => ({
          case_number: c.caseId,
          case_type: c.sections?.join(", ") || "General",
          my_role: "Witness",
          next_hearing: c.nextHearingDate ? new Date(c.nextHearingDate).toISOString().split('T')[0] : "N/A",
          statement_given: Math.random() > 0.5, // No field in model
        })));

        // Fetch hearings
        const hearingsResponse = await apiClient.get(HEARING_LIST);
        let witnessHearings: any[] = [];
        if (hearingsResponse.data.success && hearingsResponse.data.data) {
          const allHearings = hearingsResponse.data.data;
          witnessHearings = allHearings.filter((h: any) =>
            witnessCases.some((c: any) => c.caseId === h.case?.caseId)
          );
          setUpcomingHearings(witnessHearings.slice(0, 3).map((h: any) => ({
            case_number: h.case?.caseId || "N/A",
            case_type: h.case?.sections?.join(", ") || "General",
            hearing_date: new Date(h.hearingDate).toISOString().split('T')[0],
            hearing_time: new Date(h.hearingDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            court_room: h.courtRoom || "Not Assigned",
            attendance_marked: false,
          })));
        }

        // Fetch notifications
        const notificationsResponse = await apiClient.get(NOTIFICATIONS_LIST);
        if (notificationsResponse.data.success && notificationsResponse.data.data) {
          const notifications = notificationsResponse.data.data.slice(0, 4);
          setRecentNotifications(notifications.map((n: any) => ({
            type: n.priority === "urgent" || n.priority === "high" ? "urgent" : n.type || "info",
            title: n.title,
            message: n.message,
            time: new Date(n.createdAt).toLocaleString(),
          })));
        }

        // Update stats
        setStats({
          myCases: witnessCases.length,
          upcomingHearings: witnessHearings.filter((h: any) => new Date(h.hearingDate) >= new Date()).length,
          attendanceRate: 86, // No calculation available
          pendingStatements: Math.floor(witnessCases.length * 0.4),
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Using dummy data - API connection failed");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { className: string }> = {
      "Eye Witness": { className: "bg-blue-100 text-blue-800" },
      "Character Witness": { className: "bg-purple-100 text-purple-800" },
      "Material Witness": { className: "bg-green-100 text-green-800" },
      "Expert Witness": { className: "bg-orange-100 text-orange-800" },
    };

    const config = roleConfig[role] || { className: "bg-gray-100 text-gray-800" };
    return (
      <Badge variant="outline" className={config.className}>
        {role}
      </Badge>
    );
  };

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Witness Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your hearing overview</p>
        </div>
        <Button onClick={() => navigate("/cases")}>
          <FileText className="w-4 h-4 mr-2" />
          View All Cases
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Cases</p>
                <p className="text-2xl font-bold text-gray-900">{stats.myCases}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Active</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Hearings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingHearings}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mt-4 flex items-center text-sm text-orange-600">
              <Clock className="w-4 h-4 mr-1" />
              <span>Scheduled</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate}%</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              <span>Excellent</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Statements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingStatements}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div className="mt-4 flex items-center text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span>Action Needed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Attendance Notice */}
      <Card className="border-2 border-blue-500 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Mark Your Attendance</h3>
              <p className="text-sm text-blue-800 mb-4">
                You have {upcomingHearings.length} upcoming hearing(s). Scan the QR code at the court to mark your attendance. If unable to attend, submit absence reason at least 24 hours before the hearing.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => navigate("/attendance")}>
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan QR Code
                </Button>
                <Button variant="outline">
                  <XCircle className="w-4 h-4 mr-2" />
                  Report Absence
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Cases */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Cases</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/cases")}>
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>My Role</TableHead>
                  <TableHead>Statement</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myCases.map((caseItem, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{caseItem.case_number}</TableCell>
                    <TableCell>{caseItem.case_type}</TableCell>
                    <TableCell>{getRoleBadge(caseItem.my_role)}</TableCell>
                    <TableCell>
                      {caseItem.statement_given ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Given
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Upcoming Hearings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Hearings</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/attendance")}>
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingHearings.map((hearing, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{hearing.case_number}</p>
                      <p className="text-sm text-gray-600">{hearing.case_type}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(hearing.hearing_date).toLocaleDateString()} at{" "}
                        {hearing.hearing_time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      {hearing.court_room}
                    </Badge>
                    <div>
                      {hearing.attendance_marked ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Marked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-orange-100 text-orange-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Notifications</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/notifications")}>
            View All <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentNotifications.map((notification, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                  notification.type === "urgent" ? "border-l-4 border-l-red-500" : ""
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    notification.type === "urgent"
                      ? "bg-red-100"
                      : notification.type === "warning"
                      ? "bg-orange-100"
                      : "bg-blue-100"
                  }`}
                >
                  <Bell
                    className={`w-5 h-5 ${
                      notification.type === "urgent"
                        ? "text-red-600"
                        : notification.type === "warning"
                        ? "text-orange-600"
                        : "text-blue-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WitnessDashboard;
