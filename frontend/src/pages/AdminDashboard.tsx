import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3,
  Shield,
  UserCheck,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/utils/apiClient";
import { DASHBOARD_STATS, DASHBOARD_RECENT_CASES, ADMIN_SYSTEM_STATS } from "@/utils/constants";
import { toast } from "sonner";

interface DashboardStats {
  totalCases: number;
  totalWitnesses: number;
  hearingsToday: number;
  attendanceToday: number;
  totalUsers?: number;
  activeUsers?: number;
  activeCases?: number;
}

interface RecentCase {
  _id: string;
  caseId: string;
  caseNumber?: string; // For backward compatibility
  firNumber: string;
  policeStation: string;
  sections?: string[];
  courtName: string;
  status: string;
  nextHearingDate?: string;
  investigatingOfficer?: {
    _id: string;
    name: string;
    email: string;
  };
  assignedOfficer?: string; // For backward compatibility
}

// Comprehensive dummy data for Admin Dashboard
const dummyStats: DashboardStats = {
  totalCases: 147,
  totalWitnesses: 328,
  hearingsToday: 18,
  attendanceToday: 15,
  totalUsers: 67,
  activeUsers: 52,
  activeCases: 89,
};

const dummyRecentCases: RecentCase[] = [
  {
    _id: "1",
    caseId: "CASE001",
    firNumber: "FIR/001/2025",
    policeStation: "City Police Station",
    sections: ["IPC 379", "IPC 411"],
    courtName: "District Court, Bhubaneswar",
    status: "ongoing",
    nextHearingDate: "2025-11-12",
    investigatingOfficer: {
      _id: "io1",
      name: "SI Rajesh Kumar",
      email: "rajesh.kumar@police.gov.in",
    },
  },
  {
    _id: "2",
    caseId: "CASE003",
    firNumber: "FIR/003/2025",
    policeStation: "Cyber Crime Police Station",
    sections: ["IPC 420", "IPC 468"],
    courtName: "District Court, Bhubaneswar",
    status: "pending",
    nextHearingDate: "2025-11-15",
    investigatingOfficer: {
      _id: "io2",
      name: "SI Priya Singh",
      email: "priya.singh@police.gov.in",
    },
  },
  {
    _id: "3",
    caseId: "CASE007",
    firNumber: "FIR/007/2025",
    policeStation: "Khandagiri Police Station",
    sections: ["IPC 323", "IPC 324"],
    courtName: "Magistrate Court, Bhubaneswar",
    status: "ongoing",
    nextHearingDate: "2025-11-18",
    investigatingOfficer: {
      _id: "io3",
      name: "ASI Suresh Nayak",
      email: "suresh.nayak@police.gov.in",
    },
  },
  {
    _id: "4",
    caseId: "CASE012",
    firNumber: "FIR/012/2025",
    policeStation: "Saheed Nagar Police Station",
    sections: ["IPC 392", "IPC 397"],
    courtName: "District Court, Bhubaneswar",
    status: "pending",
    nextHearingDate: "2025-11-20",
    investigatingOfficer: {
      _id: "io4",
      name: "SI Anjali Das",
      email: "anjali.das@police.gov.in",
    },
  },
  {
    _id: "5",
    caseId: "CASE015",
    firNumber: "FIR/015/2025",
    policeStation: "Cyber Crime Police Station",
    sections: ["IT Act 66", "IPC 419"],
    courtName: "Special Court, Bhubaneswar",
    status: "adjourned",
    nextHearingDate: "2025-11-25",
    investigatingOfficer: {
      _id: "io5",
      name: "ASI Kavita Rath",
      email: "kavita.rath@police.gov.in",
    },
  },
  {
    _id: "6",
    caseId: "CASE018",
    firNumber: "FIR/018/2025",
    policeStation: "Market Police Station",
    sections: ["IPC 406", "IPC 408"],
    courtName: "District Court, Bhubaneswar",
    status: "ongoing",
    nextHearingDate: "2025-11-28",
    investigatingOfficer: {
      _id: "io1",
      name: "SI Rajesh Kumar",
      email: "rajesh.kumar@police.gov.in",
    },
  },
  {
    _id: "7",
    caseId: "CASE022",
    firNumber: "FIR/022/2025",
    policeStation: "Mancheswar Police Station",
    sections: ["IPC 447", "IPC 506"],
    courtName: "Civil Court, Bhubaneswar",
    status: "pending",
    nextHearingDate: "2025-12-02",
    investigatingOfficer: {
      _id: "io2",
      name: "SI Priya Singh",
      email: "priya.singh@police.gov.in",
    },
  },
  {
    _id: "8",
    caseId: "CASE025",
    firNumber: "FIR/025/2025",
    policeStation: "Anti Corruption Bureau",
    sections: ["Prevention of Corruption Act"],
    courtName: "Special Court, Bhubaneswar",
    status: "ongoing",
    nextHearingDate: "2025-12-05",
    investigatingOfficer: {
      _id: "io3",
      name: "ASI Suresh Nayak",
      email: "suresh.nayak@police.gov.in",
    },
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>(dummyStats);
  const [recentCases, setRecentCases] = useState<RecentCase[]>(dummyRecentCases);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, casesRes, systemStatsRes] = await Promise.all([
        apiClient.get(DASHBOARD_STATS).catch(() => null),
        apiClient.get(`${DASHBOARD_RECENT_CASES}?limit=5`).catch(() => null),
        apiClient.get(ADMIN_SYSTEM_STATS).catch(() => null),
      ]);

      let updatedStats = { ...dummyStats };
      let foundData = false;

      if (statsRes?.data?.success) {
        updatedStats = { ...updatedStats, ...statsRes.data.data };
        foundData = true;
      }
      if (systemStatsRes?.data?.success) {
        updatedStats = { ...updatedStats, ...systemStatsRes.data.data };
        foundData = true;
      }
      
      setStats(updatedStats);
      
      if (casesRes?.data?.success && casesRes.data.data?.length > 0) {
        setRecentCases(casesRes.data.data);
        foundData = true;
      }

      setApiConnected(foundData);
      if (!foundData) {
        toast.info("Using demo data - Backend not connected");
      }
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Using demo data - API connection failed");
      setApiConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Cases",
      value: stats?.totalCases || 0,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "All registered cases",
      route: "/cases",
    },
    {
      title: "Active Cases",
      value: stats?.activeCases || stats?.totalCases || 0,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Currently active",
      route: "/cases",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Shield,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "System users",
      route: "/admin/users",
    },
    {
      title: "Total Witnesses",
      value: stats?.totalWitnesses || 0,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Registered witnesses",
      route: "/witnesses",
    },
    {
      title: "Today's Hearings",
      value: stats?.hearingsToday || 0,
      icon: Calendar,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      description: "Scheduled for today",
      route: "/hearings/today",
    },
    {
      title: "Attendance Today",
      value: stats?.attendanceToday || 0,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Marked present",
      route: "/attendance",
    },
    {
      title: "Active Users",
      value: stats?.activeUsers || 0,
      icon: UserCheck,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      description: "Currently online",
      route: "/admin/users",
    },
    {
      title: "System Health",
      value: apiConnected ? "100%" : "Demo",
      icon: TrendingUp,
      color: apiConnected ? "text-green-600" : "text-orange-600",
      bgColor: apiConnected ? "bg-green-50" : "bg-orange-50",
      description: apiConnected ? "All systems operational" : "Using demo data",
      route: "/admin/settings",
    },
  ];

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending: { variant: "secondary", label: "PENDING" },
      ongoing: { variant: "default", label: "ONGOING" },
      disposed: { variant: "outline", label: "DISPOSED" },
      adjourned: { variant: "default", label: "ADJOURNED" },
      active: { variant: "default", label: "ACTIVE" },
      closed: { variant: "outline", label: "CLOSED" },
      under_investigation: { variant: "secondary", label: "UNDER INVESTIGATION" },
    };
    
    const statusConfig = config[status?.toLowerCase()] || { variant: "default", label: status?.toUpperCase() || "UNKNOWN" };
    
    return (
      <Badge variant={statusConfig.variant}>
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            System overview and management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/reports")}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Reports
          </Button>
          <Button size="sm" onClick={fetchDashboardData}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-32" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary hover:scale-105"
                onClick={() => stat.route && navigate(stat.route)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.description}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-xl`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Button
              className="h-auto py-4 flex-col gap-2"
              variant="outline"
              onClick={() => navigate("/cases")}
            >
              <FileText className="h-5 w-5" />
              <span className="text-sm">Manage Cases</span>
            </Button>
            <Button
              className="h-auto py-4 flex-col gap-2"
              variant="outline"
              onClick={() => navigate("/admin/users")}
            >
              <Shield className="h-5 w-5" />
              <span className="text-sm">User Management</span>
            </Button>
            <Button
              className="h-auto py-4 flex-col gap-2"
              variant="outline"
              onClick={() => navigate("/attendance")}
            >
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm">Attendance</span>
            </Button>
            <Button
              className="h-auto py-4 flex-col gap-2"
              variant="outline"
              onClick={() => navigate("/admin/reports")}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm">Reports</span>
            </Button>
            <Button
              className="h-auto py-4 flex-col gap-2"
              variant="outline"
              onClick={() => navigate("/admin/audit-logs")}
            >
              <Activity className="h-5 w-5" />
              <span className="text-sm">Audit Logs</span>
            </Button>
            <Button
              className="h-auto py-4 flex-col gap-2"
              variant="outline"
              onClick={() => navigate("/admin/settings")}
            >
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Cases */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Cases</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate("/cases")}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentCases.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No cases found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case ID</TableHead>
                    <TableHead>FIR Number</TableHead>
                    <TableHead>Court Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Hearing</TableHead>
                    <TableHead>IO Assigned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCases.map((caseItem) => (
                    <TableRow key={caseItem._id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {caseItem.caseId || caseItem.caseNumber}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {caseItem.firNumber}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {caseItem.courtName}
                      </TableCell>
                      <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                      <TableCell>
                        {caseItem.nextHearingDate ? (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {new Date(caseItem.nextHearingDate).toLocaleDateString()}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {caseItem.investigatingOfficer?.name || caseItem.assignedOfficer || "Not assigned"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Active Cases</span>
                <span className="font-bold text-lg text-blue-600">{stats?.totalCases || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Today's Attendance Rate</span>
                <span className="font-bold text-lg text-green-600">
                  {stats?.hearingsToday ? 
                    Math.round((stats.attendanceToday / stats.hearingsToday) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Registered Witnesses</span>
                <span className="font-bold text-lg text-purple-600">{stats?.totalWitnesses || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Important Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Today's Hearings</p>
                  <p className="text-xs text-gray-600">{stats?.hearingsToday || 0} hearings scheduled</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Attendance Marked</p>
                  <p className="text-xs text-gray-600">{stats?.attendanceToday || 0} attendees present</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/notifications")}>
                View All Notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
