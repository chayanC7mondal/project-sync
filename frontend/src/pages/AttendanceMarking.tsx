import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, XCircle, Clock, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface HearingSession {
  id: number;
  case_number: string;
  case_title: string;
  hearing_date: string;
  hearing_time: string;
  location: string;
  total_expected?: number;
  total_present?: number;
}

interface AttendanceRecord {
  id: number;
  hearing_session_id: number;
  user_id: number;
  user_name: string;
  user_role: "inspector" | "witness";
  status: "present" | "absent" | "late";
  marked_at: string;
  marked_by?: string;
}

// Dummy data
const dummyHearing: HearingSession = {
  id: 1,
  case_number: "CR/001/2025",
  case_title: "Theft case - Main Street robbery",
  hearing_date: "Nov 8, 2025",
  hearing_time: "10:00 AM",
  location: "Court Room 1",
  total_expected: 3,
  total_present: 2,
};

const dummyAttendance: AttendanceRecord[] = [
  {
    id: 1,
    hearing_session_id: 1,
    user_id: 201,
    user_name: "Inspector John Doe",
    user_role: "inspector",
    status: "present",
    marked_at: "2025-11-08T10:05:00",
  },
  {
    id: 2,
    hearing_session_id: 1,
    user_id: 301,
    user_name: "Jane Smith",
    user_role: "witness",
    status: "present",
    marked_at: "2025-11-08T10:15:00",
  },
  {
    id: 3,
    hearing_session_id: 1,
    user_id: 302,
    user_name: "Bob Wilson",
    user_role: "witness",
    status: "absent",
    marked_at: "",
  },
];

const AttendanceMarking = () => {
  const { hearingId } = useParams<{ hearingId: string }>();
  const navigate = useNavigate();
  const [hearing] = useState<HearingSession>(dummyHearing);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(dummyAttendance);
  const [loading] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);

  const handleMarkAttendance = (
    userId: number,
    userRole: "inspector" | "witness",
    status: "present" | "absent" | "late"
  ) => {
    setUpdating(userId);
    
    // Update the attendance state
    setTimeout(() => {
      setAttendance(prev => 
        prev.map(record => 
          record.user_id === userId 
            ? { ...record, status, marked_at: new Date().toISOString() }
            : record
        )
      );
      toast.success("Attendance marked successfully");
      setUpdating(null);
    }, 500);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      present: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      absent: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
      late: { variant: "secondary" as const, icon: Clock, color: "text-amber-600" },
    };
    const { variant, icon: Icon, color } = config[status as keyof typeof config] || config.present;

    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <Icon className={`h-3 w-3 ${color}`} />
        {status.toUpperCase()}
      </Badge>
    );
  };

  const groupedAttendance = {
    inspector: attendance.filter((a) => a.user_role === "inspector"),
    witness: attendance.filter((a) => a.user_role === "witness"),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Mark Attendance</h1>
          {hearing && (
            <p className="text-muted-foreground mt-1">
              {hearing.case_number} - {hearing.case_title}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          {/* Hearing Details */}
          <Card>
            <CardHeader>
              <CardTitle>Hearing Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{hearing?.hearing_date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{hearing?.hearing_time}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{hearing?.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Attendance</p>
                  <p className="font-medium">
                    {hearing?.total_present}/{hearing?.total_expected}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inspector Attendance */}
          <Card>
            <CardHeader>
              <CardTitle>Inspector Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {groupedAttendance.inspector.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No inspector assigned
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Marked At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedAttendance.inspector.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{record.user_name}</span>
                          </TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell>
                            {record.marked_at
                              ? new Date(record.marked_at).toLocaleString()
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Select
                              value={record.status}
                              onValueChange={(value) =>
                                handleMarkAttendance(
                                  record.user_id,
                                  "inspector",
                                  value as "present" | "absent" | "late"
                                )
                              }
                              disabled={updating === record.user_id}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="present">Present</SelectItem>
                                <SelectItem value="absent">Absent</SelectItem>
                                <SelectItem value="late">Late</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Witness Attendance */}
          <Card>
            <CardHeader>
              <CardTitle>Witness Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {groupedAttendance.witness.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No witnesses assigned
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Marked At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedAttendance.witness.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{record.user_name}</span>
                          </TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell>
                            {record.marked_at
                              ? new Date(record.marked_at).toLocaleString()
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Select
                              value={record.status}
                              onValueChange={(value) =>
                                handleMarkAttendance(
                                  record.user_id,
                                  "witness",
                                  value as "present" | "absent" | "late"
                                )
                              }
                              disabled={updating === record.user_id}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="present">Present</SelectItem>
                                <SelectItem value="absent">Absent</SelectItem>
                                <SelectItem value="late">Late</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AttendanceMarking;
