import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiClient from "@/utils/apiClient";
import { toast } from "sonner";
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
  liaison_officer: string;
}

const IOAttendanceMarking = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [selectedCase, setSelectedCase] = useState("");
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dummy attendance records
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([
    {
      id: "ATT001",
      case_number: "CR/001/2025",
      case_type: "Theft",
      hearing_date: "2025-11-12",
      hearing_time: "10:00 AM",
      court_room: "Court Room 1",
      attendance_status: "Pending",
      liaison_officer: "Amit Mahapatra",
    },
    {
      id: "ATT002",
      case_number: "CR/005/2025",
      case_type: "Fraud",
      hearing_date: "2025-11-14",
      hearing_time: "02:00 PM",
      court_room: "Court Room 3",
      attendance_status: "Present",
      marked_at: "2025-11-14 01:55 PM",
      marked_method: "QR Code",
      liaison_officer: "Priya Sharma",
    },
    {
      id: "ATT003",
      case_number: "CR/012/2025",
      case_type: "Assault",
      hearing_date: "2025-11-15",
      hearing_time: "11:30 AM",
      court_room: "Court Room 2",
      attendance_status: "Pending",
      liaison_officer: "Rajesh Kumar",
    },
  ]);

  const handleMarkAttendance = async (caseNumber: string, method: "qr" | "manual") => {
    try {
      setMarkingAttendance(true);
      setSelectedCase(caseNumber);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update the record
      setAttendanceRecords((prev) =>
        prev.map((record) =>
          record.case_number === caseNumber
            ? {
                ...record,
                attendance_status: "Present",
                marked_at: new Date().toLocaleString(),
                marked_method: method === "qr" ? "QR Code" : "Manual Entry",
              }
            : record
        )
      );

      toast.success("Attendance marked successfully!");
      setShowQRScanner(false);
      setShowManualEntry(false);
      setManualCode("");
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error("Failed to mark attendance");
    } finally {
      setMarkingAttendance(false);
      setSelectedCase("");
    }
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    // Find matching case by code (simplified)
    const caseToMark = attendanceRecords.find(
      (r) => r.attendance_status === "Pending"
    );

    if (caseToMark) {
      handleMarkAttendance(caseToMark.case_number, "manual");
    } else {
      toast.error("Invalid code or no pending cases");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        className?: string;
        icon: JSX.Element;
      }
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

    const config = statusConfig[status] || {
      variant: "secondary",
      icon: <></>,
    };
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
    const matchesStatus =
      statusFilter === "all" || record.attendance_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingRecords = filteredRecords.filter(
    (r) => r.attendance_status === "Pending"
  );

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-600 mt-2">
            Track your hearing attendance and mark presence
          </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceRecords.length}
                </p>
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
                  {
                    attendanceRecords.filter(
                      (r) => r.attendance_status === "Present"
                    ).length
                  }
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
                  {
                    attendanceRecords.filter(
                      (r) => r.attendance_status === "Absent"
                    ).length
                  }
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
                  {attendanceRecords.filter((r) => r.attendance_status !== "Pending").length > 0
                    ? Math.round(
                        (attendanceRecords.filter(
                          (r) => r.attendance_status === "Present"
                        ).length /
                          attendanceRecords.filter(
                            (r) => r.attendance_status !== "Pending"
                          ).length) *
                          100
                      )
                    : 0}
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-700 mb-2">
                  You have{" "}
                  <span className="font-bold text-blue-600">
                    {pendingRecords.length}
                  </span>{" "}
                  upcoming hearing(s) requiring attendance
                </p>
                <p className="text-sm text-gray-600">
                  Scan the QR code or enter manual code to mark your attendance
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="lg"
                  variant={showQRScanner ? "destructive" : "default"}
                  onClick={() => {
                    setShowQRScanner(!showQRScanner);
                    setShowManualEntry(false);
                  }}
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  {showQRScanner ? "Close Scanner" : "Scan QR Code"}
                </Button>
                <Button
                  size="lg"
                  variant={showManualEntry ? "destructive" : "outline"}
                  onClick={() => {
                    setShowManualEntry(!showManualEntry);
                    setShowQRScanner(false);
                  }}
                >
                  Enter Code
                </Button>
              </div>
            </div>

            {/* QR Scanner Section */}
            {showQRScanner && (
              <div className="mt-4 p-8 bg-gray-100 rounded-lg text-center">
                <QrCode className="w-32 h-32 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">QR Scanner would appear here</p>
                <p className="text-sm text-gray-500 mt-2">
                  Point your camera at the QR code displayed at the court
                </p>
                {/* Case Selection for QR Scanner */}
                <div className="mt-4 max-w-md mx-auto">
                  <select
                    value={selectedCase}
                    onChange={(e) => setSelectedCase(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Case for QR Scanning</option>
                    {pendingRecords.map((record) => (
                      <option key={record.id} value={record.case_number}>
                        {record.case_number} - {record.case_type}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedCase && (
                  <Button
                    size="lg"
                    className="mt-4"
                    onClick={() => handleMarkAttendance(selectedCase, "qr")}
                    disabled={markingAttendance}
                  >
                    {markingAttendance ? "Marking..." : "Simulate QR Scan"}
                  </Button>
                )}
              </div>
            )}

            {/* Manual Code Entry Section */}
            {showManualEntry && (
              <div className="mt-4 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  Enter Manual Code
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Case
                    </label>
                    <select
                      value={selectedCase}
                      onChange={(e) => setSelectedCase(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a case</option>
                      {pendingRecords.map((record) => (
                        <option key={record.id} value={record.case_number}>
                          {record.case_number} - {record.case_type} (
                          {new Date(record.hearing_date).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manual Code
                    </label>
                    <Input
                      placeholder="Enter code"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      className="text-center text-xl font-mono"
                    />
                  </div>

                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleManualSubmit}
                    disabled={
                      markingAttendance || !manualCode.trim() || !selectedCase
                    }
                  >
                    {markingAttendance ? "Marking..." : "Submit Attendance"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Attendance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search cases, types, or court rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Hearing Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Court Room</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Liaison Officer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-gray-500">No records found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.case_number}
                    </TableCell>
                    <TableCell>{record.case_type}</TableCell>
                    <TableCell>
                      {new Date(record.hearing_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{record.hearing_time}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {record.court_room}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(record.attendance_status)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {record.liaison_officer}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default IOAttendanceMarking;
