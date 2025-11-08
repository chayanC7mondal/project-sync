import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiClient from "@/utils/apiClient";
import { HEARING_LIST } from "@/utils/constants";
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
import { Calendar, Search, Clock, MapPin, Eye, Filter, FileText } from "lucide-react";

interface Hearing {
  hearing_id: string;
  case_number: string;
  case_type: string;
  hearing_date: string;
  hearing_time: string;
  court_room: string;
  judge_name: string;
  status: string;
  witnesses_required: number;
  purpose: string;
}

const IOHearings = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // Dummy hearings for cases where IO is investigating
  const [hearings, setHearings] = useState<Hearing[]>([
    {
      hearing_id: "H001",
      case_number: "CR/001/2025",
      case_type: "Theft",
      hearing_date: "2025-11-12",
      hearing_time: "10:00 AM",
      court_room: "Court Room 1",
      judge_name: "Justice M. R. Shah",
      status: "Scheduled",
      witnesses_required: 2,
      purpose: "Evidence Presentation",
    },
    {
      hearing_id: "H002",
      case_number: "CR/003/2025",
      case_type: "Fraud",
      hearing_date: "2025-11-15",
      hearing_time: "11:30 AM",
      court_room: "Court Room 2",
      judge_name: "Justice S. K. Verma",
      status: "Scheduled",
      witnesses_required: 1,
      purpose: "Witness Examination",
    },
    {
      hearing_id: "H003",
      case_number: "CR/007/2025",
      case_type: "Assault",
      hearing_date: "2025-11-18",
      hearing_time: "02:00 PM",
      court_room: "Court Room 1",
      judge_name: "Justice M. R. Shah",
      status: "Scheduled",
      witnesses_required: 3,
      purpose: "Investigation Report",
    },
    {
      hearing_id: "H004",
      case_number: "CR/012/2025",
      case_type: "Robbery",
      hearing_date: "2025-11-20",
      hearing_time: "09:30 AM",
      court_room: "Court Room 3",
      judge_name: "Justice A. K. Sharma",
      status: "Scheduled",
      witnesses_required: 1,
      purpose: "Evidence Verification",
    },
    {
      hearing_id: "H005",
      case_number: "CR/015/2025",
      case_type: "Cybercrime",
      hearing_date: "2025-11-25",
      hearing_time: "03:30 PM",
      court_room: "Court Room 2",
      judge_name: "Justice S. K. Verma",
      status: "Scheduled",
      witnesses_required: 1,
      purpose: "Technical Evidence",
    },
    {
      hearing_id: "H006",
      case_number: "CR/001/2025",
      case_type: "Theft",
      hearing_date: "2025-10-28",
      hearing_time: "10:00 AM",
      court_room: "Court Room 1",
      judge_name: "Justice M. R. Shah",
      status: "Completed",
      witnesses_required: 2,
      purpose: "Initial Hearing",
    },
    {
      hearing_id: "H007",
      case_number: "CR/003/2025",
      case_type: "Fraud",
      hearing_date: "2025-10-30",
      hearing_time: "11:30 AM",
      court_room: "Court Room 2",
      judge_name: "Justice S. K. Verma",
      status: "Completed",
      witnesses_required: 1,
      purpose: "Case Filing",
    },
    {
      hearing_id: "H008",
      case_number: "CR/007/2025",
      case_type: "Assault",
      hearing_date: "2025-11-02",
      hearing_time: "02:00 PM",
      court_room: "Court Room 1",
      judge_name: "Justice M. R. Shah",
      status: "Completed",
      witnesses_required: 2,
      purpose: "Preliminary Report",
    },
    {
      hearing_id: "H009",
      case_number: "CR/018/2025",
      case_type: "Burglary",
      hearing_date: "2025-11-28",
      hearing_time: "01:00 PM",
      court_room: "Court Room 1",
      judge_name: "Justice M. R. Shah",
      status: "Scheduled",
      witnesses_required: 2,
      purpose: "Evidence Collection Update",
    },
    {
      hearing_id: "H010",
      case_number: "CR/021/2025",
      case_type: "Forgery",
      hearing_date: "2025-11-30",
      hearing_time: "10:30 AM",
      court_room: "Court Room 3",
      judge_name: "Justice A. K. Sharma",
      status: "Scheduled",
      witnesses_required: 1,
      purpose: "Document Verification",
    },
  ]);

  // Fetch hearings from API
  useEffect(() => {
    fetchHearings();
  }, []);

  const fetchHearings = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user._id;

      const response = await apiClient.get(HEARING_LIST);
      if (response.data.success && response.data.data) {
        const allHearings = response.data.data;
        // Filter hearings for IO's cases
        const ioHearings = allHearings.filter((h: any) => 
          h.case?.investigatingOfficer === userId || 
          h.case?.investigatingOfficer?._id === userId
        );
        setHearings(ioHearings.map((h: any, idx: number) => ({
          hearing_id: h.sessionId || `H${String(idx + 1).padStart(3, '0')}`,
          case_number: h.case?.caseId || "N/A",
          case_type: h.case?.sections?.join(", ") || "General",
          hearing_date: new Date(h.hearingDate).toISOString().split('T')[0],
          hearing_time: new Date(h.hearingDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          court_room: h.courtRoom || "Not Assigned",
          judge_name: h.judge || "To Be Assigned",
          status: h.status || "Scheduled",
          witnesses_required: h.expectedWitnesses?.length || 0,
          purpose: h.purpose || "General Hearing",
        })));
      }
    } catch (error) {
      console.error("Error fetching hearings:", error);
      toast.error("Using dummy data - API connection failed");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
    > = {
      Scheduled: { variant: "default", className: "bg-blue-500" },
      Completed: { variant: "secondary" },
      Postponed: { variant: "destructive" },
      Cancelled: { variant: "outline" },
    };

    const config = statusConfig[status] || { variant: "secondary" };
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const isUpcoming = (hearing: Hearing) => {
    return new Date(hearing.hearing_date) >= new Date() && hearing.status === "Scheduled";
  };

  const filteredHearings = hearings.filter((hearing) => {
    const matchesSearch =
      hearing.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hearing.case_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hearing.court_room.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || hearing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const upcomingHearings = filteredHearings.filter(isUpcoming);
  const pastHearings = filteredHearings.filter((h) => !isUpcoming(h));

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Hearings</h1>
          <p className="text-gray-600 mt-2">Hearings for cases under my investigation</p>
        </div>
        <Button onClick={() => navigate("/")}>
          <FileText className="w-4 h-4 mr-2" />
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
                <p className="text-2xl font-bold text-gray-900">{hearings.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {hearings.filter((h) => isUpcoming(h)).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {hearings.filter((h) => h.status === "Completed").length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    hearings.filter((h) => {
                      const hDate = new Date(h.hearing_date);
                      const today = new Date();
                      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                      return hDate >= today && hDate <= weekFromNow && h.status === "Scheduled";
                    }).length
                  }
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

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
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Postponed">Postponed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Hearings */}
      {upcomingHearings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Hearings ({upcomingHearings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hearing ID</TableHead>
                  <TableHead>Case Number</TableHead>
                  <TableHead>Case Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Court Room</TableHead>
                  <TableHead>Judge</TableHead>
                  <TableHead>Witnesses</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingHearings.map((hearing) => (
                  <TableRow key={hearing.hearing_id}>
                    <TableCell className="font-medium">{hearing.hearing_id}</TableCell>
                    <TableCell>{hearing.case_number}</TableCell>
                    <TableCell>{hearing.case_type}</TableCell>
                    <TableCell>{new Date(hearing.hearing_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        {hearing.hearing_time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {hearing.court_room}
                      </div>
                    </TableCell>
                    <TableCell>{hearing.judge_name}</TableCell>
                    <TableCell>{hearing.witnesses_required}</TableCell>
                    <TableCell>{hearing.purpose}</TableCell>
                    <TableCell>{getStatusBadge(hearing.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Past Hearings */}
      {pastHearings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Hearings ({pastHearings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hearing ID</TableHead>
                  <TableHead>Case Number</TableHead>
                  <TableHead>Case Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Court Room</TableHead>
                  <TableHead>Judge</TableHead>
                  <TableHead>Witnesses</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastHearings.map((hearing) => (
                  <TableRow key={hearing.hearing_id}>
                    <TableCell className="font-medium">{hearing.hearing_id}</TableCell>
                    <TableCell>{hearing.case_number}</TableCell>
                    <TableCell>{hearing.case_type}</TableCell>
                    <TableCell>{new Date(hearing.hearing_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        {hearing.hearing_time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {hearing.court_room}
                      </div>
                    </TableCell>
                    <TableCell>{hearing.judge_name}</TableCell>
                    <TableCell>{hearing.witnesses_required}</TableCell>
                    <TableCell>{hearing.purpose}</TableCell>
                    <TableCell>{getStatusBadge(hearing.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
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

export default IOHearings;
