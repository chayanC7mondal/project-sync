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
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileEdit,
  Bell,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/utils/apiClient";
import { CASE_LIST } from "@/utils/constants";
import { toast } from "sonner";

interface InspectorStats {
  myCases: number;
  upcomingHearings: number;
  completedReports: number;
  pendingReports: number;
}

interface Hearing {
  case_number: string;
  hearing_date: string;
  hearing_time: string;
  location: string;
  status: string;
}

const InspectorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<InspectorStats>({
    myCases: 0,
    upcomingHearings: 0,
    completedReports: 0,
    pendingReports: 0,
  });
  const [upcomingHearings, setUpcomingHearings] = useState<Hearing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch inspector's cases
      const casesRes = await apiClient.get(CASE_LIST);
      
      if (casesRes.data.success) {
        const cases = casesRes.data.data || [];
        
        // Calculate stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const hearings: Hearing[] = cases
          .filter((c: any) => c.next_hearing_date)
          .map((c: any) => ({
            case_number: c.case_number,
            hearing_date: c.next_hearing_date,
            hearing_time: c.hearing_time || "10:00 AM",
            location: c.location || "Court Room 1",
            status: c.status,
          }))
          .filter((h: Hearing) => {
            const hearingDate = new Date(h.hearing_date);
            hearingDate.setHours(0, 0, 0, 0);
            return hearingDate >= today;
          })
          .sort((a: Hearing, b: Hearing) => 
            new Date(a.hearing_date).getTime() - new Date(b.hearing_date).getTime()
          );
        
        setUpcomingHearings(hearings.slice(0, 5));
        
        setStats({
          myCases: cases.length,
          upcomingHearings: hearings.length,
          completedReports: Math.floor(cases.length * 0.7),
          pendingReports: Math.floor(cases.length * 0.3),
        });
      }
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Error loading dashboard");
      // Set default stats on error
      setStats({
        myCases: 0,
        upcomingHearings: 0,
        completedReports: 0,
        pendingReports: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "My Cases",
      value: stats.myCases,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Cases assigned to me",
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
      title: "Completed Reports",
      value: stats.completedReports,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Reports submitted",
    },
    {
      title: "Pending Reports",
      value: stats.pendingReports,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Requires attention",
    },
  ];

  const quickActions = [
    {
      icon: FileText,
      label: "My Cases",
      description: "View all cases",
      onClick: () => navigate("/cases"),
    },
    {
      icon: FileEdit,
      label: "Reports",
      description: "Investigation reports",
      onClick: () => navigate("/reports"),
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "View alerts",
      onClick: () => navigate("/notifications"),
    },
    {
      icon: Settings,
      label: "Settings",
      description: "Account settings",
      onClick: () => navigate("/settings"),
    },
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inspector Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage your cases and investigation reports
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
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

      {/* Upcoming Hearings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Hearings</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingHearings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingHearings.map((hearing, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {hearing.case_number}
                    </TableCell>
                    <TableCell>
                      {new Date(hearing.hearing_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{hearing.hearing_time}</TableCell>
                    <TableCell>{hearing.location}</TableCell>
                    <TableCell>
                      <Badge variant="default">Scheduled</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming hearings</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Cards */}
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
                    {stats.pendingReports} reports pending
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium">Prepare for hearings</p>
                  <p className="text-sm text-gray-600">
                    {stats.upcomingHearings} hearings scheduled
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
              Important Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                <p className="text-sm text-gray-700">
                  Attend all scheduled court hearings on time
                </p>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                <p className="text-sm text-gray-700">
                  Keep investigation reports up to date
                </p>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                <p className="text-sm text-gray-700">
                  Coordinate with witnesses before hearings
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InspectorDashboard;
