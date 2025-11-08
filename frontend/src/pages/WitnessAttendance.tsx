import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiClient from "@/utils/apiClient";
import { ATTENDANCE_REPORT } from "@/utils/constants";
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
  io_name: string;
}

interface ApiAttendanceRecord {
  _id: string;
  case: {
    caseId: string;
    sections: string[];
    investigatingOfficer: {
      name: string;
    };
  };
  hearingSession: {
    hearingDate: string;
    courtRoom: string;
  };
  status: string;
  markedAt?: string;
  method?: string;
}

const WitnessAttendance = () => {
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
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
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

  // Fetch attendance records from API
  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user._id;

      const response = await apiClient.get(`${ATTENDANCE_REPORT}?witnessId=${userId}`);
      if (response.data.success && response.data.data) {
        const records = response.data.data;
        setAttendanceRecords(records.map((r: ApiAttendanceRecord, idx: number) => ({
          id: r._id || `ATT${String(idx + 1).padStart(3, '0')}`,
          case_number: r.case?.caseId || "N/A",
          case_type: r.case?.sections?.join(", ") || "General",
          hearing_date: new Date(r.hearingSession?.hearingDate).toISOString().split('T')[0],
          hearing_time: new Date(r.hearingSession?.hearingDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          court_room: r.hearingSession?.courtRoom || "Not Assigned",
          attendance_status: r.status || "Pending",
          marked_at: r.markedAt ? new Date(r.markedAt).toLocaleString() : undefined,
          marked_method: r.method || undefined,
          io_name: r.case?.investigatingOfficer?.name || "Not Assigned",
        })));
      }
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      toast.error("Using dummy data - API connection failed");
    } finally {
      setLoading(false);
    }
  };

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

  // Function to mark self-attendance using manual code or QR code
  const markSelfAttendance = async (code: string, caseNumber: string) => {
    try {
      setMarkingAttendance(true);
      
      // Get user info if logged in, otherwise use anonymous witness info
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const witnessId = user._id || `ANON_${Date.now()}`;
      const witnessName = user.name || user.username || "Anonymous Witness";
      
      console.log("Marking attendance with:", { code, caseNumber, witnessId, witnessName });
      
      // Get user's location if available
      let latitude, longitude;
      try {
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve, 
              reject, 
              { timeout: 5000, enableHighAccuracy: false }
            );
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        }
      } catch (locationError) {
        console.log("Location not available:", locationError);
        // Continue without location
      }

      const requestData = {
        code: code.trim(),
        caseId: caseNumber,
        witnessId,
        witnessName,
        latitude,
        longitude
      };

      console.log("API Request:", requestData);

      const response = await apiClient.post('/api/hearings/mark-self-attendance', requestData);

      console.log("API Response:", response.data);

      if (response.data.success) {
        toast.success(`Attendance marked successfully for ${caseNumber}!`);
        
        // Refresh attendance records
        await fetchAttendanceRecords();
        
        // Reset form
        setManualCode("");
        setSelectedCase("");
        setShowManualEntry(false);
        setShowQRScanner(false);
      } else {
        toast.error(response.data.message || "Failed to mark attendance");
      }
    } catch (error) {
      console.error("Full error object:", error);
      
      let errorMessage = "Failed to mark attendance";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string }; status?: number } };
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        } else if (apiError.response?.status === 401) {
          errorMessage = "Authentication required. Please log in again.";
        } else if (apiError.response?.status === 404) {
          errorMessage = "Invalid code or hearing session not found";
        } else if (apiError.response?.status === 400) {
          errorMessage = "Invalid request. Please check the code and case selection.";
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as Error).message;
      }
      
      toast.error(errorMessage);
    } finally {
      setMarkingAttendance(false);
    }
  };

  // Handle manual code submission
  const handleManualCodeSubmit = () => {
    if (!manualCode.trim()) {
      toast.error("Please enter a manual code");
      return;
    }
    if (!selectedCase) {
      toast.error("Please select a case");
      return;
    }
    markSelfAttendance(manualCode.trim(), selectedCase);
  };

  // Handle QR code scan (placeholder - would integrate with actual QR scanner)
  const handleQRCodeScan = (scannedCode: string) => {
    // Parse QR code to extract case information
    try {
      const qrData = JSON.parse(scannedCode);
      if (qrData.caseId && qrData.code) {
        markSelfAttendance(qrData.code, qrData.caseId);
      }
    } catch {
      // If not JSON, treat as direct code
      if (selectedCase) {
        markSelfAttendance(scannedCode, selectedCase);
      } else {
        toast.error("Please select a case first");
      }
    }
  };

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
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-700 mb-2">
                  You have <span className="font-bold text-blue-600">{pendingRecords.length}</span>{" "}
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
              </div>
            )}

            {/* Manual Code Entry Section */}
            {showManualEntry && (
              <div className="mt-4 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Enter Manual Code</h3>
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
                          {record.case_number} - {record.case_type} ({new Date(record.hearing_date).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manual Code
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter manual code (e.g., CR001-001A8B2)"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      className="w-full p-3 text-center font-mono text-lg"
                      maxLength={15}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the code displayed below the QR code (format: CR001-001A8B2)
                    </p>
                    {/* Debug info - remove in production */}
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <p><strong>Debug Info:</strong></p>
                      <p>Selected Case: {selectedCase || "None"}</p>
                      <p>Manual Code: {manualCode || "None"}</p>
                      <p>Expected format: CR001-XXXX (4 random chars)</p>
                      <p>Test codes: CR001-A8B2, CR005-B9C3, CR009-D4E5, CR014-F6G7, CR019-H8I9</p>
                      <p className="text-blue-600 font-semibold">
                        💡 Tip: First create a hearing session in the database with manual codes, then test here.
                      </p>
                      <p className="text-red-600 text-xs mt-1">
                        Note: The attendance marking API is working! The 404 error is expected because no hearing sessions exist in the database yet.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleManualCodeSubmit}
                      disabled={!manualCode.trim() || !selectedCase || markingAttendance}
                      className="flex-1"
                      size="lg"
                    >
                      {markingAttendance ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Marking...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Mark Present
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setManualCode("");
                        setSelectedCase("");
                      }}
                      disabled={markingAttendance}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
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
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedCase(record.case_number);
                            setShowQRScanner(true);
                            setShowManualEntry(false);
                          }}
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          QR
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedCase(record.case_number);
                            setShowManualEntry(true);
                            setShowQRScanner(false);
                          }}
                        >
                          Code
                        </Button>
                      </div>
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
