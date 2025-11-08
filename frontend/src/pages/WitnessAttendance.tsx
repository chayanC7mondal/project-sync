import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Search,
  Filter,
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  MapPin,
  AlertCircle,
} from "lucide-react";

interface AttendanceRecord {
  id: string;
  case_number: string;
  case_type: string;
  hearing_date: string;
  hearing_time: string;
  court_room: string;
  attendance_status: string;
  marked_at?: string;
  marked_method?: string;
  io_name: string;
}

const WitnessAttendance = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Dummy attendance records
  const [attendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: "ATT001",
      case_number: "CR/001/2025",
      case_type: "Theft",
      hearing_date: "2025-11-12",
      hearing_time: "10:00 AM",
      court_room: "Court Room 1",
      attendance_status: "Pending",
      io_name: "IO Suresh Dash",
    },
    {
      id: "ATT002",
      case_number: "CR/005/2025",
      case_type: "Accident",
      hearing_date: "2025-11-14",
      hearing_time: "02:00 PM",
      court_room: "Court Room 3",
      attendance_status: "Pending",
      io_name: "IO Ramesh Kumar",
    },
    {
      id: "ATT003",
      case_number: "CR/001/2025",
      case_type: "Theft",
      hearing_date: "2025-10-28",
      hearing_time: "10:00 AM",
      court_room: "Court Room 1",
      attendance_status: "Present",
      marked_at: "2025-10-28 09:45 AM",
      marked_method: "QR Code",
      io_name: "IO Suresh Dash",
    },
    {
      id: "ATT004",
      case_number: "CR/005/2025",
      case_type: "Accident",
      hearing_date: "2025-10-20",
      hearing_time: "02:00 PM",
      court_room: "Court Room 3",
      attendance_status: "Present",
      marked_at: "2025-10-20 01:50 PM",
      marked_method: "Manual",
      io_name: "IO Ramesh Kumar",
    },
    {
      id: "ATT005",
      case_number: "CR/009/2025",
      case_type: "Property Dispute",
      hearing_date: "2025-10-15",
      hearing_time: "11:00 AM",
      court_room: "Court Room 2",
      attendance_status: "Absent",
      io_name: "IO Suresh Dash",
    },
    {
      id: "ATT006",
      case_number: "CR/014/2025",
      case_type: "Fraud",
      hearing_date: "2025-10-10",
      hearing_time: "03:00 PM",
      court_room: "Court Room 1",
      attendance_status: "Present",
      marked_at: "2025-10-10 02:55 PM",
      marked_method: "QR Code",
      io_name: "IO Priya Sharma",
    },
    {
      id: "ATT007",
      case_number: "CR/001/2025",
      case_type: "Theft",
      hearing_date: "2025-10-05",
      hearing_time: "10:00 AM",
      court_room: "Court Room 1",
      attendance_status: "Present",
      marked_at: "2025-10-05 09:50 AM",
      marked_method: "QR Code",
      io_name: "IO Suresh Dash",
    },
    {
      id: "ATT008",
      case_number: "CR/019/2025",
      case_type: "Assault",
      hearing_date: "2025-11-26",
      hearing_time: "01:00 PM",
      court_room: "Court Room 2",
      attendance_status: "Pending",
      io_name: "IO Suresh Dash",
    },
  ]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { variant: "default" | "secondary" | "destructive" | "outline"; className?: string; icon: JSX.Element }
    > = {
      Present: {
        variant: "default",
        className: "bg-green-500",
        icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
      },
      Absent: {
        variant: "destructive",
        icon: <XCircle className="w-3 h-3 mr-1" />,
      },
      Pending: {
        variant: "default",
        className: "bg-orange-500",
        icon: <Clock className="w-3 h-3 mr-1" />,
      },
    };

    const config = statusConfig[status] || { variant: "secondary", icon: <></> };
    return (
      <Badge variant={config.variant} className={config.className}>
        <span className="flex items-center">
          {config.icon}
          {status}
        </span>
      </Badge>
    );
  };

  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesSearch =
      record.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.case_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.court_room.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || record.attendance_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingRecords = filteredRecords.filter((r) => r.attendance_status === "Pending");
  const pastRecords = filteredRecords.filter((r) => r.attendance_status !== "Pending");

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-600 mt-2">Track your hearing attendance and mark presence</p>
        </div>
        <Button onClick={() => navigate("/")}>
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hearings</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceRecords.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceRecords.filter((r) => r.attendance_status === "Present").length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceRecords.filter((r) => r.attendance_status === "Absent").length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(
                    (attendanceRecords.filter((r) => r.attendance_status === "Present").length /
                      attendanceRecords.filter((r) => r.attendance_status !== "Pending").length) *
                      100
                  )}
                  %
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Scanner Card */}
      {pendingRecords.length > 0 && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-6 h-6 text-blue-500" />
              Mark Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 mb-2">
                  You have <span className="font-bold text-blue-600">{pendingRecords.length}</span>{" "}
                  upcoming hearing(s) requiring attendance
                </p>
                <p className="text-sm text-gray-600">
                  Scan the QR code at the court to mark your attendance
                </p>
              </div>
              <Button size="lg" onClick={() => setShowQRScanner(!showQRScanner)}>
                <QrCode className="w-5 h-5 mr-2" />
                {showQRScanner ? "Close Scanner" : "Scan QR Code"}
              </Button>
            </div>
            {showQRScanner && (
              <div className="mt-4 p-8 bg-gray-100 rounded-lg text-center">
                <QrCode className="w-32 h-32 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">QR Scanner would appear here</p>
                <p className="text-sm text-gray-500 mt-2">
                  Point your camera at the QR code displayed at the court
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by case number, type, or court room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[250px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Hearings */}
      {pendingRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Hearings - Pending Attendance ({pendingRecords.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case Number</TableHead>
                  <TableHead>Case Type</TableHead>
                  <TableHead>Hearing Date</TableHead>
                  <TableHead>Hearing Time</TableHead>
                  <TableHead>Court Room</TableHead>
                  <TableHead>Investigating Officer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRecords.map((record) => (
                  <TableRow key={record.id} className="bg-blue-50">
                    <TableCell className="font-medium">{record.case_number}</TableCell>
                    <TableCell>{record.case_type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {new Date(record.hearing_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        {record.hearing_time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {record.court_room}
                      </div>
                    </TableCell>
                    <TableCell>{record.io_name}</TableCell>
                    <TableCell>{getStatusBadge(record.attendance_status)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <QrCode className="w-4 h-4 mr-2" />
                        Mark
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Past Attendance Records */}
      {pastRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Attendance Records ({pastRecords.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case Number</TableHead>
                  <TableHead>Case Type</TableHead>
                  <TableHead>Hearing Date</TableHead>
                  <TableHead>Hearing Time</TableHead>
                  <TableHead>Court Room</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Marked At</TableHead>
                  <TableHead>Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.case_number}</TableCell>
                    <TableCell>{record.case_type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {new Date(record.hearing_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        {record.hearing_time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {record.court_room}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(record.attendance_status)}</TableCell>
                    <TableCell className="text-sm">{record.marked_at || "N/A"}</TableCell>
                    <TableCell>
                      {record.marked_method && (
                        <Badge variant="outline">
                          {record.marked_method === "QR Code" && (
                            <QrCode className="w-3 h-3 mr-1" />
                          )}
                          {record.marked_method}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WitnessAttendance;
