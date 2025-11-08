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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/utils/apiClient";
import { DASHBOARD_STATS, DASHBOARD_RECENT_CASES } from "@/utils/constants";
import { toast } from "sonner";

interface DashboardStats {
  totalCases: number;
  totalWitnesses: number;
  hearingsToday: number;
  attendanceToday: number;
}

interface RecentCase {
  _id: string;
  caseNumber: string;
  title: string;
  status: string;
  nextHearingDate?: string;
  assignedOfficer?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, casesRes] = await Promise.all([
        apiClient.get(DASHBOARD_STATS),
        apiClient.get(`${DASHBOARD_RECENT_CASES}?limit=5`),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (casesRes.data.success) {
        setRecentCases(casesRes.data.data);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Error loading dashboard");
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
    },
    {
      title: "Total Witnesses",
      value: stats?.totalWitnesses || 0,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Registered witnesses",
    },
    {
      title: "Today's Hearings",
      value: stats?.hearingsToday || 0,
      icon: Calendar,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      description: "Scheduled for today",
    },
    {
      title: "Attendance Today",
      value: stats?.attendanceToday || 0,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Marked present",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      active: "default",
      closed: "outline",
      under_investigation: "default",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace("_", " ").toUpperCase()}
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
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-32" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
              onClick={() => navigate("/attendance")}
            >
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm">View Attendance</span>
            </Button>
            <Button
              className="h-auto py-4 flex-col gap-2"
              variant="outline"
              onClick={() => navigate("/reports")}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm">Generate Reports</span>
            </Button>
            <Button
              className="h-auto py-4 flex-col gap-2"
              variant="outline"
              onClick={() => navigate("/notifications")}
            >
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">Notifications</span>
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
                    <TableHead>Case Number</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Hearing</TableHead>
                    <TableHead>Assigned To</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCases.map((caseItem) => (
                    <TableRow key={caseItem._id}>
                      <TableCell className="font-medium">
                        {caseItem.caseNumber}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {caseItem.title}
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
                        {caseItem.assignedOfficer || "Not assigned"}
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
