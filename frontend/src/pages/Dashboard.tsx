import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  FileText,
  Bell,
  Users,
  Eye
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Mock data for today's schedule
const todaysSchedule = [
  { 
    id: "CID/2024/001", 
    court: "District Court-A", 
    date: "2024-11-08", 
    investigatingOfficer: "SI Ramesh Kumar", 
    time: "09:30 AM",
    status: "scheduled"
  },
  { 
    id: "CID/2024/002", 
    court: "District Court-B", 
    date: "2024-11-08", 
    investigatingOfficer: "SI Priya Patel", 
    time: "10:15 AM",
    status: "scheduled"
  },
  { 
    id: "CID/2024/003", 
    court: "Sessions Court", 
    date: "2024-11-08", 
    investigatingOfficer: "ASI Suresh Nayak", 
    time: "11:00 AM",
    status: "scheduled"
  },
  { 
    id: "CID/2024/004", 
    court: "District Court-C", 
    date: "2024-11-08", 
    investigatingOfficer: "SI Anjali Das", 
    time: "02:30 PM",
    status: "scheduled"
  }
];

// Mock data for registered cases
const registeredCases = [
  { 
    id: "CID/2024/001", 
    court: "District Court-A", 
    date: "2024-11-08", 
    investigatingOfficer: "SI Ramesh Kumar", 
    time: "09:30 AM",
    attendance: "present"
  },
  { 
    id: "CID/2024/002", 
    court: "District Court-B", 
    date: "2024-11-07", 
    investigatingOfficer: "SI Priya Patel", 
    time: "10:15 AM",
    attendance: "present"
  },
  { 
    id: "CID/2024/003", 
    court: "Sessions Court", 
    date: "2024-11-06", 
    investigatingOfficer: "ASI Suresh Nayak", 
    time: "11:00 AM",
    attendance: "absent"
  },
  { 
    id: "CID/2024/005", 
    court: "High Court", 
    date: "2024-11-05", 
    investigatingOfficer: "Inspector Raj Mohan", 
    time: "09:00 AM",
    attendance: "present"
  }
];

// QR Code Component
const QRCodeGenerator = ({ caseId, date }: { caseId: string; date: string }) => {
  const qrData = `${caseId}_${date}_${Date.now()}`;
  
  return (
    <div className="flex flex-col items-center p-6 space-y-4">
      <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
        <div className="text-xs text-center p-4 font-mono break-all">
          {qrData}
        </div>
      </div>
      <p className="text-sm text-muted-foreground text-center">
        QR Code for Case: <strong>{caseId}</strong><br />
        Date: <strong>{date}</strong>
      </p>
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Officers and witnesses can scan this QR code to mark their attendance for this case.
      </p>
    </div>
  );
};

const Dashboard = () => {
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  const handleGenerateQR = (caseId: string, date: string) => {
    setSelectedCase(caseId);
    toast.success(`QR Code generated for case ${caseId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Present</Badge>;
      case "absent":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Absent</Badge>;
      case "late":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Late</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>;
    }
  };

  // Analytics data
  const analyticsData = {
    totalCases: 156,
    todaysCases: 4,
    presentToday: 3,
    absentToday: 1,
    attendanceRate: 92
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Liaison Officer - Court Attendance Management</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
              Today: {new Date().toLocaleDateString('en-IN')}
            </Badge>
          </div>
        </div>

        {/* Analytics Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Cases</p>
                  <p className="text-2xl font-bold">{analyticsData.totalCases}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Today's Cases</p>
                  <p className="text-2xl font-bold">{analyticsData.todaysCases}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Present Today</p>
                  <p className="text-2xl font-bold">{analyticsData.presentToday}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Absent Today</p>
                  <p className="text-2xl font-bold">{analyticsData.absentToday}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Attendance Rate</p>
                  <p className="text-2xl font-bold">{analyticsData.attendanceRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {todaysSchedule.map((case_, index) => (
                    <div key={case_.id} className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-blue-600">{case_.id}</span>
                            {getStatusBadge(case_.status)}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {case_.court}
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {case_.investigatingOfficer}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {case_.time}
                            </div>
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleGenerateQR(case_.id, case_.date)}
                            >
                              <QrCode className="w-4 h-4 mr-1" />
                              Generate QR
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Attendance QR Code</DialogTitle>
                            </DialogHeader>
                            <QRCodeGenerator caseId={case_.id} date={case_.date} />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Registered Cases */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Recent Cases
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {registeredCases.map((case_, index) => (
                    <div key={case_.id} className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-purple-600">{case_.id}</span>
                            {getStatusBadge(case_.attendance)}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {case_.court}
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {case_.investigatingOfficer}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {case_.date} at {case_.time}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-20 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700">
                  <FileText className="w-6 h-6" />
                  <span className="text-sm">Add Case</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Users className="w-6 h-6" />
                  <span className="text-sm">Manage Officers</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Bell className="w-6 h-6" />
                  <span className="text-sm">Notifications</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-sm">Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
