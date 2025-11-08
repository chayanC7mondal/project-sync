import { useEffect, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QrCode, Users, Clock, MapPin, Search, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface HearingSession {
  id: number;
  case_id: number;
  hearing_date: string;
  hearing_time: string;
  case_number: string;
  case_title: string;
  location: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  qr_code_data?: string;
  attendance_marked?: boolean;
  total_expected?: number;
  total_present?: number;
  manualCode?: string;
}

// Dummy data with unique manual codes
const dummyHearings: HearingSession[] = [
  {
    id: 1,
    case_id: 101,
    hearing_date: "2025-11-08",
    hearing_time: "10:00 AM",
    case_number: "CR/001/2025",
    case_title: "Theft case - Main Street robbery",
    location: "Court Room 1",
    status: "scheduled",
    total_expected: 3,
    total_present: 2,
    manualCode: "CR001-A8B2",
  },
  {
    id: 2,
    case_id: 102,
    hearing_date: "2025-11-08",
    hearing_time: "11:30 AM",
    case_number: "CR/002/2025",
    case_title: "Assault case - Market area incident",
    location: "Court Room 2",
    status: "scheduled",
    total_expected: 2,
    total_present: 1,
    manualCode: "CR002-C4D6",
  },
  {
    id: 3,
    case_id: 103,
    hearing_date: "2025-11-08",
    hearing_time: "02:00 PM",
    case_number: "CR/003/2025",
    case_title: "Fraud case - Financial scam investigation",
    location: "Court Room 1",
    status: "in_progress",
    total_expected: 4,
    total_present: 4,
    manualCode: "CR003-E7F9",
  },
  {
    id: 4,
    case_id: 104,
    hearing_date: "2025-11-08",
    hearing_time: "03:30 PM",
    case_number: "CR/004/2025",
    case_title: "Burglary case - Residential break-in",
    location: "Court Room 3",
    status: "scheduled",
    total_expected: 2,
    total_present: 0,
    manualCode: "CR004-G1H3",
  },
  {
    id: 5,
    case_id: 105,
    hearing_date: "2025-11-08",
    hearing_time: "04:30 PM",
    case_number: "CR/005/2025",
    case_title: "Drug possession case - Highway seizure",
    location: "Court Room 2",
    status: "scheduled",
    total_expected: 3,
    total_present: 1,
    manualCode: "CR005-I2J4",
  },
];

const TodayHearings = () => {
  const navigate = useNavigate();
  const [hearings, setHearings] = useState<HearingSession[]>([]);
  const [filteredHearings, setFilteredHearings] = useState<HearingSession[]>([]);
  const [loading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHearing, setSelectedHearing] = useState<HearingSession | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  // Initialize hearings with unique manual codes
  useEffect(() => {
    const hearingsWithCodes = dummyHearings.map(hearing => ({
      ...hearing,
      manualCode: generateUniqueCode(hearing.case_number, hearing.id)
    }));
    setHearings(hearingsWithCodes);
    setFilteredHearings(hearingsWithCodes);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = hearings.filter(
        (hearing) =>
          hearing.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hearing.case_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hearing.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHearings(filtered);
    } else {
      setFilteredHearings(hearings);
    }
  }, [searchTerm, hearings]);

  const generateUniqueCode = (caseNumber: string, hearingId: number) => {
    // Generate a unique code based on case number and hearing ID
    const casePrefix = caseNumber.replace(/[/-]/g, '').substring(0, 5).toUpperCase();
    const uniqueId = hearingId.toString().padStart(3, '0');
    const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
    return `${casePrefix}-${uniqueId}${randomHex}`;
  };

  const generateQRData = (hearing: HearingSession) => {
    // Generate QR code data that includes all necessary information for attendance
    const qrData = {
      type: 'hearing_attendance',
      hearingId: hearing.id,
      caseId: hearing.case_number,
      hearingDate: hearing.hearing_date,
      hearingTime: hearing.hearing_time,
      location: hearing.location,
      manualCode: hearing.manualCode,
      timestamp: Date.now()
    };
    return JSON.stringify(qrData);
  };

  const handleViewQRCode = (hearing: HearingSession) => {
    setSelectedHearing(hearing);
    
    // Generate unique QR code data for this specific hearing
    const qrData = generateQRData(hearing);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrData)}`;
    
    // Set the QR code URL for display
    setQrCodeUrl(qrUrl);
    
    toast.success(`QR Code generated for ${hearing.case_number}`);
  };

  // Function to simulate attendance update from database
  const updateAttendance = (hearingId: number) => {
    setHearings(prevHearings => 
      prevHearings.map(hearing => 
        hearing.id === hearingId 
          ? { ...hearing, total_present: (hearing.total_present || 0) + 1 }
          : hearing
      )
    );
    setFilteredHearings(prevFiltered => 
      prevFiltered.map(hearing => 
        hearing.id === hearingId 
          ? { ...hearing, total_present: (hearing.total_present || 0) + 1 }
          : hearing
      )
    );
  };

  // Simulate a witness marking attendance (for testing)
  const simulateWitnessAttendance = (hearing: HearingSession) => {
    toast.success(`Simulating witness attendance for ${hearing.case_number}`);
    setTimeout(() => {
      updateAttendance(hearing.id);
      toast.success(`Witness marked present for ${hearing.case_number}`);
    }, 2000);
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Today's Hearings</h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button onClick={() => toast.success("Data refreshed")}>Refresh</Button>
      </div>

      {/* Search and Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-3">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by case number, title, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-bold">{hearings.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hearings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Hearings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredHearings.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hearings scheduled for today</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case Number</TableHead>
                    <TableHead>Case Title</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHearings.map((hearing) => (
                    <TableRow key={hearing.id}>
                      <TableCell className="font-medium">
                        {hearing.case_number}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {hearing.case_title}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {hearing.hearing_time}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {hearing.location}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(hearing.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {hearing.total_present || 0}/{hearing.total_expected || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewQRCode(hearing)}
                              >
                                <QrCode className="h-4 w-4 mr-1" />
                                QR
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Hearing QR Code</DialogTitle>
                                <DialogDescription>
                                  Case: {selectedHearing?.case_number}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex flex-col items-center gap-4 py-4">
                                {qrCodeUrl && selectedHearing ? (
                                  <img
                                    src={qrCodeUrl}
                                    alt={`QR Code for ${selectedHearing.case_number}`}
                                    className="w-64 h-64 border rounded-lg"
                                    data-qr-code
                                  />
                                ) : (
                                  <div className="w-64 h-64 border rounded-lg bg-gray-100 flex items-center justify-center">
                                    <QrCode className="w-16 h-16 text-gray-400" />
                                  </div>
                                )}
                                <p className="text-sm text-muted-foreground text-center">
                                  Scan this QR code to mark attendance
                                </p>
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                  <p className="text-sm text-blue-800 text-center mb-2 font-medium">
                                    Manual Entry Code:
                                  </p>
                                  <p className="text-xl font-bold text-center font-mono tracking-wider text-blue-900 bg-white px-3 py-2 rounded border">
                                    {selectedHearing?.manualCode || "N/A"}
                                  </p>
                                  <p className="text-xs text-blue-600 text-center mt-2">
                                    Witnesses can enter this code in their attendance form
                                  </p>
                                  <p className="text-xs text-blue-500 text-center mt-1">
                                    Case: {selectedHearing?.case_number} • {selectedHearing?.hearing_time}
                                  </p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            size="sm"
                            onClick={() =>
                              navigate(`/liaison/attendance/${hearing.id}`)
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => simulateWitnessAttendance(hearing)}
                            className="ml-2"
                          >
                            Test
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TodayHearings;
