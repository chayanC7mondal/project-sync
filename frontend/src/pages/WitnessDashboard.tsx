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
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  FileText,
  QrCode,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/utils/apiClient";
import { CASE_LIST } from "@/utils/constants";
import { toast } from "sonner";

interface WitnessStats {
  myCases: number;
  upcomingHearings: number;
  myAttendance: number;
  pendingActions: number;
}

interface Hearing {
  _id: string;
  caseNumber: string;
  caseTitle: string;
  hearingDate: string;
  hearingTime: string;
  location: string;
  status: string;
}

const WitnessDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<WitnessStats>({
    myCases: 0,
    upcomingHearings: 0,
    myAttendance: 0,
    pendingActions: 0,
  });
  const [upcomingHearings, setUpcomingHearings] = useState<Hearing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch witness cases
      const casesRes = await apiClient.get(CASE_LIST);
      
      if (casesRes.data.success) {
        const cases = casesRes.data.data || [];
        
        // Generate dummy upcoming hearings from cases
        const hearings: Hearing[] = cases.slice(0, 5).map((c: any, index: number) => ({
          _id: c._id,
          caseNumber: c.caseNumber,
          caseTitle: c.title,
          hearingDate: c.nextHearingDate || new Date(Date.now() + (index + 1) * 86400000).toISOString(),
          hearingTime: "10:00 AM",
          location: c.location || "Court Room 1",
          status: "scheduled",
        }));
        
        setUpcomingHearings(hearings);
        
        setStats({
          myCases: cases.length,
          upcomingHearings: hearings.length,
          myAttendance: Math.floor(cases.length * 0.9), // Dummy attendance
          pendingActions: 0,
        });
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
      title: "My Cases",
      value: stats.myCases,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Cases I'm involved in",
    },
    {
      title: "Upcoming Hearings",
      value: stats.upcomingHearings,
      icon: Calendar,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      description: "Scheduled hearings",
    },
    {
      title: "My Attendance",
      value: stats.myAttendance,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Times marked present",
    },
    {
      title: "Pending Actions",
      value: stats.pendingActions,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Requires attention",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      scheduled: "default",
      in_progress: "secondary",
      completed: "outline",
      cancelled: "destructive",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Witness Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            View your hearings and manage attendance
          </p>
        </div>
        <Button size="sm" onClick={fetchDashboardData}>
          Refresh
        </Button>
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

      {/* Important Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500 p-2 rounded-lg">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">
                Attendance Instructions
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Scan the QR code provided by the liaison officer to mark your attendance.
                If unable to attend, submit absence reason at least 24 hours before hearing.
              </p>
              <Button size="sm" variant="default">
                <QrCode className="h-4 w-4 mr-2" />
                Scan QR Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
              onClick={() => navigate("/attendance")}
            >
              <QrCode className="h-5 w-5" />
              <span className="text-sm">Mark Attendance</span>
            </Button>
            <Button
              className="h-auto py-4 flex-col gap-2"
              variant="outline"
              onClick={() => navigate("/cases")}
            >
              <FileText className="h-5 w-5" />
              <span className="text-sm">My Cases</span>
            </Button>
            <Button
              className="h-auto py-4 flex-col gap-2"
              variant="outline"
              onClick={() => toast.info("Absence form feature coming soon")}
            >
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">Submit Absence</span>
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

      {/* Upcoming Hearings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Upcoming Hearings</CardTitle>
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
          ) : upcomingHearings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No upcoming hearings</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case Number</TableHead>
                    <TableHead>Case Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingHearings.map((hearing) => (
                    <TableRow key={hearing._id}>
                      <TableCell className="font-medium">
                        {hearing.caseNumber}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {hearing.caseTitle}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(hearing.hearingDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {hearing.hearingTime}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {hearing.location}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(hearing.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              My Attendance Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Hearings
                </span>
                <span className="font-semibold">{stats.myCases}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Times Present
                </span>
                <span className="font-semibold">{stats.myAttendance}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Attendance Rate
                </span>
                <Badge variant="default">
                  {stats.myCases > 0 
                    ? Math.round((stats.myAttendance / stats.myCases) * 100) 
                    : 0}%
                </Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/attendance")}>
                View Full Record
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Important Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="font-medium text-amber-900 mb-1">
                  Upcoming Hearing
                </p>
                <p className="text-amber-800">
                  {upcomingHearings.length > 0 
                    ? `Next hearing on ${new Date(upcomingHearings[0].hearingDate).toLocaleDateString()}`
                    : "No upcoming hearings"}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900 mb-1">
                  Mark Attendance
                </p>
                <p className="text-blue-800">
                  Scan QR code or enter code manually
                </p>
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

export default WitnessDashboard;
