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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AlertCircle, Search, FileText, Clock, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AbsenceReason {
  id: number;
  hearing_session_id: number;
  user_id: number;
  user_name: string;
  user_role: string;
  reason: string;
  submitted_at: string;
  status: "pending" | "approved" | "rejected";
}

// Dummy absence data
const dummyAbsences: AbsenceReason[] = [
  {
    id: 1,
    hearing_session_id: 123,
    user_id: 201,
    user_name: "Inspector John Doe",
    user_role: "inspector",
    reason: "Medical emergency - hospitalized with fever",
    submitted_at: "2025-11-08T08:30:00",
    status: "pending",
  },
  {
    id: 2,
    hearing_session_id: 124,
    user_id: 301,
    user_name: "Jane Smith",
    user_role: "witness",
    reason: "Family emergency - need to travel urgently",
    submitted_at: "2025-11-07T15:45:00",
    status: "pending",
  },
  {
    id: 3,
    hearing_session_id: 125,
    user_id: 302,
    user_name: "Bob Wilson",
    user_role: "witness",
    reason: "Work commitment - unable to take leave",
    submitted_at: "2025-11-07T10:20:00",
    status: "approved",
  },
  {
    id: 4,
    hearing_session_id: 126,
    user_id: 202,
    user_name: "Inspector Alice Brown",
    user_role: "inspector",
    reason: "Official duty in another district",
    submitted_at: "2025-11-06T14:00:00",
    status: "approved",
  },
  {
    id: 5,
    hearing_session_id: 127,
    user_id: 303,
    user_name: "Charlie Davis",
    user_role: "witness",
    reason: "No valid reason provided",
    submitted_at: "2025-11-06T09:15:00",
    status: "rejected",
  },
  {
    id: 6,
    hearing_session_id: 128,
    user_id: 304,
    user_name: "Diana Evans",
    user_role: "witness",
    reason: "Transportation issues - vehicle breakdown",
    submitted_at: "2025-11-05T16:30:00",
    status: "pending",
  },
  {
    id: 7,
    hearing_session_id: 129,
    user_id: 203,
    user_name: "Inspector Frank Miller",
    user_role: "inspector",
    reason: "Training program scheduled by department",
    submitted_at: "2025-11-05T11:00:00",
    status: "approved",
  },
  {
    id: 8,
    hearing_session_id: 130,
    user_id: 305,
    user_name: "Grace Taylor",
    user_role: "witness",
    reason: "Health issues - doctor's appointment",
    submitted_at: "2025-11-04T13:45:00",
    status: "approved",
  },
];

const AbsenceManagement = () => {
  const [absences] = useState<AbsenceReason[]>(dummyAbsences);
  const [filteredAbsences, setFilteredAbsences] = useState<AbsenceReason[]>(dummyAbsences);
  const [loading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedAbsence, setSelectedAbsence] = useState<AbsenceReason | null>(null);

  useEffect(() => {
    filterAbsences();
  }, [searchTerm, statusFilter, roleFilter, absences]);

  const filterAbsences = () => {
    let filtered = [...absences];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((a) => a.user_role === roleFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAbsences(filtered);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      inspector: "bg-blue-100 text-blue-800 border-blue-200",
      witness: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return (
      <Badge variant="outline" className={colors[role] || ""}>
        {role.toUpperCase()}
      </Badge>
    );
  };

  const pendingCount = absences.filter((a) => a.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Absence Management</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage absence reasons
          </p>
        </div>
        <Button onClick={() => toast.success("Data refreshed")}>Refresh</Button>
      </div>

      {/* Stats and Filters */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <span className="text-sm text-muted-foreground">Pending</span>
              </div>
              <span className="text-2xl font-bold">{pendingCount}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-3">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Role</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="inspector">Inspector</SelectItem>
                  <SelectItem value="witness">Witness</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Absences Table */}
      <Card>
        <CardHeader>
          <CardTitle>Absence Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredAbsences.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No absence records found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Hearing ID</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAbsences.map((absence) => (
                    <TableRow key={absence.id}>
                      <TableCell className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{absence.user_name}</span>
                      </TableCell>
                      <TableCell>{getRoleBadge(absence.user_role)}</TableCell>
                      <TableCell>#{absence.hearing_session_id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {new Date(absence.submitted_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(absence.status)}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAbsence(absence)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Absence Details</DialogTitle>
                              <DialogDescription>
                                Submitted by {selectedAbsence?.user_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <label className="text-sm font-medium">Name</label>
                                <p className="mt-1">{selectedAbsence?.user_name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Role</label>
                                <div className="mt-1">
                                  {selectedAbsence && getRoleBadge(selectedAbsence.user_role)}
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Hearing Session</label>
                                <p className="mt-1">#{selectedAbsence?.hearing_session_id}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Reason</label>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {selectedAbsence?.reason}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Status</label>
                                <div className="mt-1">
                                  {selectedAbsence && getStatusBadge(selectedAbsence.status)}
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Submitted At</label>
                                <p className="mt-1 text-sm">
                                  {selectedAbsence &&
                                    new Date(selectedAbsence.submitted_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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

export default AbsenceManagement;
