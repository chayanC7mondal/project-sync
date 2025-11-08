import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, CheckCircle2, AlertCircle, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { DASHBOARD_STATS, DASHBOARD_RECENT_CASES } from "@/utils/constants";

// Mock data - will be replaced with API data when backend is ready
const mockRecentCases = [
  { id: "CID/2024/001", court: "District Court-A", date: "2024-11-08", io: "SI Ramesh Kumar", status: "Present", time: "09:30 AM" },
  { id: "CID/2024/002", court: "District Court-B", date: "2024-11-08", io: "SI Priya Patel", status: "Present", time: "10:15 AM" },
  { id: "CID/2024/003", court: "Sessions Court", date: "2024-11-08", io: "ASI Suresh Nayak", status: "Absent", time: "--" },
  { id: "CID/2024/004", court: "District Court-A", date: "2024-11-08", io: "SI Anjali Das", status: "Late", time: "10:45 AM" },
  { id: "CID/2024/005", court: "High Court", date: "2024-11-08", io: "Inspector Raj Mohan", status: "Present", time: "09:00 AM" },
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentCases, setRecentCases] = useState(mockRecentCases); // Using mock data initially
  const [loading, setLoading] = useState(false);

  // Fetch dashboard statistics - API function (uncomment when backend is ready)
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(DASHBOARD_STATS);
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to fetch dashboard statistics");
      console.error("Error fetching stats:", error);
      // Stats will use default values defined in statsCards
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent cases with optional limit - API function (uncomment when backend is ready)
  const fetchRecentCases = async (limit = 5) => {
    try {
      const response = await apiClient.get(`${DASHBOARD_RECENT_CASES}?limit=${limit}`);
      setRecentCases(response.data);
    } catch (error) {
      toast.error("Failed to fetch recent cases");
      console.error("Error fetching recent cases:", error);
      // Fallback to mock data on error
      setRecentCases(mockRecentCases);
    }
  };

  // Uncomment this to enable API calls when backend is ready
  // useEffect(() => {
  //   fetchDashboardStats();
  //   fetchRecentCases();
  // }, []);

  const statsCards = stats ? [
    {
      title: "Total Cases",
      value: stats.totalCases || "234",
      icon: FileText,
      trend: stats.caseTrend || "+12%",
      trendLabel: "from last month",
      trendUp: true,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      borderColor: "border-blue-200 dark:border-blue-800/50",
      progress: 75
    },
    {
      title: "Active Officers",
      value: stats.activeOfficers || "45",
      icon: Users,
      trend: stats.officerTrend || "+3",
      trendLabel: "new this week",
      trendUp: true,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      borderColor: "border-purple-200 dark:border-purple-800/50",
      progress: 90
    },
    {
      title: "Today's Attendance",
      value: stats.todayAttendance || "42/45",
      icon: CheckCircle2,
      trend: stats.attendanceRate || "93%",
      trendLabel: "attendance rate",
      trendUp: true,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      borderColor: "border-green-200 dark:border-green-800/50",
      progress: 93
    },
    {
      title: "Pending Alerts",
      value: stats.pendingAlerts || "8",
      icon: AlertCircle,
      trend: stats.alertsTrend || "-2",
      trendLabel: "from yesterday",
      trendUp: false,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      borderColor: "border-orange-200 dark:border-orange-800/50",
      progress: 35
    }
  ] : [];
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Welcome back! Here's your overview for today - {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </p>
        </div>
        <Button className="btn-primary-hover" onClick={fetchDashboardStats}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Refresh Stats
        </Button>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="text-center py-8">Loading dashboard...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index} className={cn(
              "relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer border-2",
              stat.borderColor
            )}>
              {/* Decorative background gradient */}
              <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20", stat.bgColor)} 
                   style={{ transform: 'translate(30%, -30%)' }} />
              
              <CardHeader className="flex flex-row items-start justify-between pb-3 space-y-0 relative z-10">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <div className={cn(
                      "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                      stat.trendUp 
                        ? "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400" 
                        : "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400"
                    )}>
                      {stat.trendUp ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {stat.trend}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.trendLabel}</p>
                </div>
                
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110",
                  stat.bgColor
                )}>
                  <stat.icon className={cn("w-7 h-7", stat.color)} />
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10 pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-foreground">{stat.progress}%</span>
                  </div>
                  <Progress value={stat.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Today's Court Schedule */}
      <Card className="glass-card">
        <CardHeader className="border-b border-border bg-muted/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-foreground">Today's Court Schedule</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Real-time attendance tracking for all court proceedings</p>
            </div>
            <Button variant="outline" size="sm">
              View All Cases
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Case ID</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Court</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Investigating Officer</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Time</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentCases.map((case_, index) => (
                  <tr key={index} className="border-b border-border table-row-hover">
                    <td className="py-4 px-6 text-sm font-semibold text-primary">{case_.id}</td>
                    <td className="py-4 px-6 text-sm text-foreground">{case_.court}</td>
                    <td className="py-4 px-6 text-sm text-foreground">{case_.date}</td>
                    <td className="py-4 px-6 text-sm text-foreground font-medium">{case_.io}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{case_.time}</td>
                    <td className="py-4 px-6">
                      <Badge className={`
                        ${case_.status === "Present" 
                          ? "status-badge-success" 
                          : case_.status === "Late"
                          ? "status-badge-warning"
                          : "status-badge-error"
                        }
                      `}>
                        {case_.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
