import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Calendar,
  Users,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Eye,
  Plus,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import apiClient from "@/utils/apiClient";
import { CASE_LIST } from "@/utils/constants";

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  upcomingHearings: number;
  pendingReports: number;
  witnessesManaged: number;
}

interface Case {
  case_id: string;
  case_number: string;
  case_type: string;
  status: string;
  next_hearing_date: string;
  location?: string;
  witnesses?: number;
}

const IODashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    activeCases: 0,
    closedCases: 0,
    upcomingHearings: 0,
    pendingReports: 0,
    witnessesManaged: 0,
  });
  const [recentCases, setRecentCases] = useState<Case[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(CASE_LIST);
      const cases = response.data.data || [];

      // Calculate stats from cases
      const activeCases = cases.filter((c: Case) => c.status === "active" || c.status === "pending");
      const closedCases = cases.filter((c: Case) => c.status === "closed" || c.status === "completed");
      const upcomingHearings = cases.filter((c: Case) => {
        if (!c.next_hearing_date) return false;
        const hearingDate = new Date(c.next_hearing_date);
        const today = new Date();
        return hearingDate >= today;
      });

      setStats({
        totalCases: cases.length,
        activeCases: activeCases.length,
        closedCases: closedCases.length,
        upcomingHearings: upcomingHearings.length,
        pendingReports: Math.floor(cases.length * 0.3), // Estimate
        witnessesManaged: cases.reduce((sum: number, c: Case) => sum + (c.witnesses || 0), 0),
      });

      // Get recent 5 cases
      setRecentCases(cases.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Fallback to default stats
      setStats({
        totalCases: 0,
        activeCases: 0,
        closedCases: 0,
        upcomingHearings: 0,
        pendingReports: 0,
        witnessesManaged: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Cases",
      value: stats.totalCases,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "All assigned cases",
    },
    {
      title: "Active Cases",
      value: stats.activeCases,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Currently ongoing",
    },
    {
      title: "Upcoming Hearings",
      value: stats.upcomingHearings,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Scheduled hearings",
    },
    {
      title: "Pending Reports",
      value: stats.pendingReports,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Reports to submit",
    },
    {
      title: "Closed Cases",
      value: stats.closedCases,
      icon: CheckCircle2,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      description: "Completed cases",
    },
    {
      title: "Witnesses Managed",
      value: stats.witnessesManaged,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "Total witnesses",
    },
  ];

  const quickActions = [
    {
      icon: Plus,
      label: "New Case",
      description: "Register new case",
      onClick: () => navigate("/cases"),
    },
    {
      icon: FileText,
      label: "My Cases",
      description: "View all cases",
      onClick: () => navigate("/cases"),
    },
    {
      icon: Calendar,
      label: "Hearings",
      description: "Hearing schedule",
      onClick: () => navigate("/hearings"),
    },
    {
      icon: Users,
      label: "Witnesses",
      description: "Manage witnesses",
      onClick: () => navigate("/witnesses"),
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      active: { variant: "default", label: "Active" },
      pending: { variant: "secondary", label: "Pending" },
      closed: { variant: "outline", label: "Closed" },
      completed: { variant: "outline", label: "Completed" },
    };

    const config = statusConfig[status.toLowerCase()] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Investigating Officer Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage cases, reports, and witness coordination
          </p>
        </div>
        <Button onClick={() => navigate("/cases")} className="gap-2">
          <Plus className="w-4 h-4" />
          New Case
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto flex-col gap-2 p-4 hover:bg-primary hover:text-white transition-colors"
                onClick={action.onClick}
              >
                <action.icon className="w-6 h-6" />
                <div className="text-center">
                  <span className="font-medium text-sm block">{action.label}</span>
                  <span className="text-xs opacity-70">{action.description}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Cases */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Cases</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/cases")}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Number</TableHead>
                <TableHead>Case Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Hearing</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCases.length > 0 ? (
                recentCases.map((caseItem) => (
                  <TableRow key={caseItem.case_id}>
                    <TableCell className="font-medium">
                      {caseItem.case_number}
                    </TableCell>
                    <TableCell>{caseItem.case_type || "N/A"}</TableCell>
                    <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                    <TableCell>
                      {caseItem.next_hearing_date ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {new Date(caseItem.next_hearing_date).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not scheduled</span>
                      )}
                    </TableCell>
                    <TableCell>{caseItem.location || "N/A"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/cases/${caseItem.case_id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No cases found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Important Reminders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium">Submit investigation reports</p>
                  <p className="text-sm text-gray-600">
                    {stats.pendingReports} reports pending submission
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium">Upcoming hearings</p>
                  <p className="text-sm text-gray-600">
                    {stats.upcomingHearings} hearings scheduled
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Users className="w-4 h-4 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium">Witness coordination</p>
                  <p className="text-sm text-gray-600">
                    Ensure all witnesses are informed
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
              Important Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                <p className="text-sm text-gray-700">
                  Submit all case reports within 48 hours of investigation
                </p>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                <p className="text-sm text-gray-700">
                  Coordinate with witnesses at least 24 hours before hearings
                </p>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                <p className="text-sm text-gray-700">
                  Update case status regularly in the system
                </p>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                <p className="text-sm text-gray-700">
                  Attend all scheduled hearings with proper documentation
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IODashboard;
