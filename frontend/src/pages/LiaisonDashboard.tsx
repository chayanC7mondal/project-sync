import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  FileText,
  QrCode,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  hearings_today: number;
  hearings_upcoming: number;
  attendance_rate_today: number;
  pending_absences: number;
  cases_assigned: number;
}

const LiaisonDashboard = () => {
  const navigate = useNavigate();
  // Dummy data - no API calls
  const [stats] = useState<DashboardStats>({
    hearings_today: 5,
    hearings_upcoming: 12,
    attendance_rate_today: 87,
    pending_absences: 3,
    cases_assigned: 28,
  });
  const [loading] = useState(false);

  const statCards = [
    {
      title: "Today's Hearings",
      value: stats?.hearings_today || 0,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Scheduled for today",
    },
    {
      title: "Upcoming Hearings",
      value: stats?.hearings_upcoming || 0,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      description: "Next 7 days",
    },
    {
      title: "Attendance Rate",
      value: `${stats?.attendance_rate_today || 0}%`,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Today's rate",
    },
    {
      title: "Pending Absences",
      value: stats?.pending_absences || 0,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Requires action",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Liaison Officer Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage hearings and track attendance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.bgColor} p-2 rounded-md`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
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
              onClick={() => navigate("/liaison/hearings/today")}
            >
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Today's Hearings</span>
            </Button>
            <Button
              className="h-auto py-4 flex-col gap-2"
              variant="outline"
              onClick={() => navigate("/liaison/hearings/upcoming")}
            >
              <Clock className="h-5 w-5" />
              <span className="text-sm">Upcoming</span>
            </Button>
            <Button
              className="h-auto py-4 flex-col gap-2"
              variant="outline"
              onClick={() => navigate("/liaison/hearings/today")}
            >
              <Users className="h-5 w-5" />
              <span className="text-sm">Mark Attendance</span>
            </Button>
            <Button
              className="h-auto py-4 flex-col gap-2"
              variant="outline"
              onClick={() => navigate("/liaison/absences")}
            >
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">View Absences</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Cases Assigned
                </span>
                <span className="font-semibold">
                  {stats?.cases_assigned || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Avg. Attendance Rate
                </span>
                <span className="font-semibold">
                  {stats?.attendance_rate_today || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Pending Actions
                </span>
                <Badge variant="destructive">
                  {stats?.pending_absences || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              QR Code Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              QR codes are automatically generated for each hearing session.
              Officers and witnesses can scan them to mark attendance.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              View QR Codes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiaisonDashboard;
