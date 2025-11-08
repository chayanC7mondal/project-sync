import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  Users,
  AlertCircle,
  Clock,
  CheckCircle2,
  Bell,
  Settings,
  Eye,
  UserCheck,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DashboardStats {
  casesInvestigating: number;
  witnessesUnderMe: number;
  upcomingHearings: number;
  pendingReports: number;
}

interface Case {
  case_number: string;
  case_type: string;
  status: string;
  witnesses_count: number;
}

interface Witness {
  name: string;
  phone: string;
  case_number: string;
  status: string;
}

interface Hearing {
  case_number: string;
  hearing_date: string;
  hearing_time: string;
  location: string;
  witnesses: number;
}

interface Notification {
  id: number;
  message: string;
  time: string;
  type: string;
}

const IODashboard = () => {
  const navigate = useNavigate();
  
  // Dummy Stats
  const [stats] = useState<DashboardStats>({
    casesInvestigating: 8,
    witnessesUnderMe: 15,
    upcomingHearings: 5,
    pendingReports: 3,
  });

  // Dummy Cases I'm Investigating
  const [myCases] = useState<Case[]>([
    { case_number: "CR/001/2025", case_type: "Theft", status: "Under Investigation", witnesses_count: 3 },
    { case_number: "CR/003/2025", case_type: "Fraud", status: "Under Investigation", witnesses_count: 2 },
    { case_number: "CR/007/2025", case_type: "Assault", status: "Under Investigation", witnesses_count: 4 },
    { case_number: "CR/012/2025", case_type: "Robbery", status: "Pending Verification", witnesses_count: 2 },
    { case_number: "CR/015/2025", case_type: "Cybercrime", status: "Under Investigation", witnesses_count: 1 },
  ]);

  // Dummy Witnesses Under Me
  const [myWitnesses] = useState<Witness[]>([
    { name: "Rajesh Kumar", phone: "9876543210", case_number: "CR/001/2025", status: "Available" },
    { name: "Priya Singh", phone: "9876543211", case_number: "CR/001/2025", status: "Available" },
    { name: "Amit Patel", phone: "9876543212", case_number: "CR/003/2025", status: "Unavailable" },
    { name: "Sunita Sharma", phone: "9876543213", case_number: "CR/007/2025", status: "Available" },
    { name: "Vikram Mehta", phone: "9876543214", case_number: "CR/007/2025", status: "Available" },
  ]);

  // Dummy Upcoming Hearings
  const [upcomingHearings] = useState<Hearing[]>([
    { case_number: "CR/001/2025", hearing_date: "2025-11-12", hearing_time: "10:00 AM", location: "Court Room 1", witnesses: 3 },
    { case_number: "CR/003/2025", hearing_date: "2025-11-15", hearing_time: "11:30 AM", location: "Court Room 2", witnesses: 2 },
    { case_number: "CR/007/2025", hearing_date: "2025-11-18", hearing_time: "02:00 PM", location: "Court Room 1", witnesses: 4 },
    { case_number: "CR/012/2025", hearing_date: "2025-11-20", hearing_time: "10:30 AM", location: "Court Room 3", witnesses: 2 },
    { case_number: "CR/015/2025", hearing_date: "2025-11-25", hearing_time: "03:00 PM", location: "Court Room 2", witnesses: 1 },
  ]);

  // Dummy Notifications
  const [notifications] = useState<Notification[]>([
    { id: 1, message: "Witness Rajesh Kumar confirmed for CR/001/2025 hearing", time: "2 hours ago", type: "info" },
    { id: 2, message: "Report pending for CR/012/2025 - Due in 2 days", time: "5 hours ago", type: "warning" },
    { id: 3, message: "New evidence submitted for CR/007/2025", time: "1 day ago", type: "info" },
    { id: 4, message: "Hearing rescheduled for CR/003/2025", time: "2 days ago", type: "alert" },
  ]);

  const statCards = [
    {
      title: "Cases Investigating",
      value: stats.casesInvestigating,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Active investigations",
    },
    {
      title: "Witnesses Under Me",
      value: stats.witnessesUnderMe,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Total witnesses managed",
    },
    {
      title: "Upcoming Hearings",
      value: stats.upcomingHearings,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
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
  ];

  const quickActions = [
    {
      icon: FileText,
      label: "My Cases",
      description: "View all cases",
      onClick: () => navigate("/cases"),
    },
    {
      icon: Users,
      label: "Witnesses",
      description: "Manage witnesses",
      onClick: () => navigate("/witnesses"),
    },
    {
      icon: Calendar,
      label: "Hearings",
      description: "View schedule",
      onClick: () => navigate("/hearings"),
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "View alerts",
      onClick: () => navigate("/notifications"),
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className?: string }> = {
      "Under Investigation": { variant: "default", className: "bg-blue-500" },
      "Pending Verification": { variant: "secondary" },
      "Available": { variant: "default", className: "bg-green-500" },
      "Unavailable": { variant: "destructive" },
    };

    const config = statusConfig[status] || { variant: "secondary" };
    return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
  };

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Investigating Officer Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Manage cases, witnesses, and investigation reports
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* My Cases */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Cases I'm Investigating</CardTitle>
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
                <TableHead>Witnesses</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myCases.map((caseItem, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {caseItem.case_number}
                  </TableCell>
                  <TableCell>{caseItem.case_type}</TableCell>
                  <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      {caseItem.witnesses_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate("/cases")}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Witnesses and Hearings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Witnesses Under Me */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Witnesses Under Me
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myWitnesses.map((witness, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{witness.name}</p>
                      <p className="text-xs text-gray-500">{witness.phone}</p>
                      <p className="text-xs text-gray-400">{witness.case_number}</p>
                    </div>
                  </div>
                  {getStatusBadge(witness.status)}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate("/witnesses")}
            >
              View All Witnesses
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Hearings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Hearings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingHearings.map((hearing, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-3 border-l-4 border-l-blue-500 bg-blue-50 rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{hearing.case_number}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      {new Date(hearing.hearing_date).toLocaleDateString()} at {hearing.hearing_time}
                    </div>
                    <p className="text-xs text-gray-500">{hearing.location}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {hearing.witnesses} witnesses
                  </Badge>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate("/hearings")}
            >
              View All Hearings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => navigate("/notifications")}
          >
            View All Notifications
          </Button>
        </CardContent>
      </Card>

      {/* Important Reminders */}
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
                Submit investigation reports within 48 hours of completion
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
  );
};

export default IODashboard;
