import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  User,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { ADMIN_AUDIT_LOGS } from "@/utils/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface AuditLog {
  _id: string;
  action: string;
  actionType: "create" | "update" | "delete" | "login" | "logout" | "view" | "export";
  module: string;
  userId: string;
  username: string;
  userRole: string;
  targetId?: string;
  targetType?: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
  status: "success" | "failed" | "warning";
}

// Dummy audit log data
const dummyAuditLogs: AuditLog[] = [
  {
    _id: "1",
    action: "User Login",
    actionType: "login",
    module: "Authentication",
    userId: "101",
    username: "admin1",
    userRole: "admin",
    details: "Successful login from Chrome browser",
    ipAddress: "192.168.1.10",
    timestamp: "2025-11-09T10:30:00Z",
    status: "success",
  },
  {
    _id: "2",
    action: "Case Created",
    actionType: "create",
    module: "Cases",
    userId: "102",
    username: "io_rajesh",
    userRole: "investigating_officer",
    targetId: "CR/001/2025",
    targetType: "Case",
    details: "New case CR/001/2025 created with 3 witnesses",
    ipAddress: "192.168.1.15",
    timestamp: "2025-11-09T09:15:00Z",
    status: "success",
  },
  {
    _id: "3",
    action: "Attendance Marked",
    actionType: "update",
    module: "Attendance",
    userId: "103",
    username: "liaison_amit",
    userRole: "liaison_officer",
    targetId: "ATT-2025-001",
    targetType: "Attendance",
    details: "Marked attendance for hearing on 2025-11-09",
    ipAddress: "192.168.1.20",
    timestamp: "2025-11-09T08:45:00Z",
    status: "success",
  },
  {
    _id: "4",
    action: "User Update Failed",
    actionType: "update",
    module: "User Management",
    userId: "101",
    username: "admin1",
    userRole: "admin",
    targetId: "105",
    targetType: "User",
    details: "Failed to update user - Invalid email format",
    ipAddress: "192.168.1.10",
    timestamp: "2025-11-09T08:30:00Z",
    status: "failed",
  },
  {
    _id: "5",
    action: "Witness Deleted",
    actionType: "delete",
    module: "Witnesses",
    userId: "102",
    username: "io_rajesh",
    userRole: "investigating_officer",
    targetId: "WIT-2025-042",
    targetType: "Witness",
    details: "Witness WIT-2025-042 removed from case CR/001/2025",
    ipAddress: "192.168.1.15",
    timestamp: "2025-11-09T07:20:00Z",
    status: "success",
  },
  {
    _id: "6",
    action: "Report Exported",
    actionType: "export",
    module: "Reports",
    userId: "101",
    username: "admin1",
    userRole: "admin",
    details: "Attendance report exported for October 2025",
    ipAddress: "192.168.1.10",
    timestamp: "2025-11-08T16:45:00Z",
    status: "success",
  },
  {
    _id: "7",
    action: "Settings Updated",
    actionType: "update",
    module: "System Settings",
    userId: "101",
    username: "admin1",
    userRole: "admin",
    details: "Changed system theme to dark mode",
    ipAddress: "192.168.1.10",
    timestamp: "2025-11-08T15:30:00Z",
    status: "success",
  },
  {
    _id: "8",
    action: "Unauthorized Access Attempt",
    actionType: "view",
    module: "Authentication",
    userId: "999",
    username: "unknown",
    userRole: "unknown",
    details: "Failed to access admin panel without proper credentials",
    ipAddress: "203.0.113.42",
    timestamp: "2025-11-08T14:22:00Z",
    status: "failed",
  },
  {
    _id: "9",
    action: "Hearing Scheduled",
    actionType: "create",
    module: "Hearings",
    userId: "103",
    username: "liaison_amit",
    userRole: "liaison_officer",
    targetId: "HEAR-2025-125",
    targetType: "Hearing",
    details: "New hearing scheduled for case CR/003/2025 on 2025-11-15",
    ipAddress: "192.168.1.20",
    timestamp: "2025-11-08T13:10:00Z",
    status: "success",
  },
  {
    _id: "10",
    action: "User Created",
    actionType: "create",
    module: "User Management",
    userId: "101",
    username: "admin1",
    userRole: "admin",
    targetId: "106",
    targetType: "User",
    details: "New investigating officer account created for Sunita Sharma",
    ipAddress: "192.168.1.10",
    timestamp: "2025-11-08T11:05:00Z",
    status: "success",
  },
];

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>(dummyAuditLogs);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("7");

  useEffect(() => {
    fetchAuditLogs();
  }, [actionTypeFilter, moduleFilter, statusFilter, dateFilter]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(ADMIN_AUDIT_LOGS, {
        params: {
          actionType: actionTypeFilter !== "all" ? actionTypeFilter : undefined,
          module: moduleFilter !== "all" ? moduleFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          days: dateFilter,
        },
      });

      if (response.data.success && response.data.data) {
        setLogs(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("Using dummy data - API not connected");
      setLogs(dummyAuditLogs);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleExportLogs = () => {
    const csv = [
      [
        "Timestamp",
        "Action",
        "Type",
        "Module",
        "User",
        "Role",
        "Target",
        "Details",
        "IP Address",
        "Status",
      ],
      ...filteredLogs.map((log) => [
        new Date(log.timestamp).toLocaleString(),
        log.action,
        log.actionType,
        log.module,
        log.username,
        log.userRole,
        log.targetId || "-",
        log.details || "-",
        log.ipAddress || "-",
        log.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Audit logs exported successfully");
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "create":
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case "update":
        return <Edit className="h-4 w-4 text-blue-600" />;
      case "delete":
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case "login":
        return <User className="h-4 w-4 text-purple-600" />;
      case "logout":
        return <User className="h-4 w-4 text-gray-600" />;
      case "view":
        return <Eye className="h-4 w-4 text-orange-600" />;
      case "export":
        return <Download className="h-4 w-4 text-indigo-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case "warning":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Warning
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const modules = ["All Modules", "Authentication", "Cases", "Attendance", "Hearings", "Witnesses", "User Management", "System Settings", "Reports"];
  const actionTypes = ["All Types", "create", "update", "delete", "login", "logout", "view", "export"];

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-2">Track all system activities and user actions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button size="sm" onClick={fetchAuditLogs}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-900">
                  {logs.filter((l) => l.status === "success").length}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-900">
                  {logs.filter((l) => l.status === "failed").length}
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded-xl">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Logs</p>
                <p className="text-2xl font-bold text-purple-900">
                  {
                    logs.filter(
                      (l) =>
                        new Date(l.timestamp).toDateString() === new Date().toDateString()
                    ).length
                  }
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-xl">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by action, user, or details..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last 24 Hours</SelectItem>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((mod) => (
                    <SelectItem key={mod} value={mod === "All Modules" ? "all" : mod}>
                      {mod}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((type) => (
                    <SelectItem key={type} value={type === "All Types" ? "all" : type}>
                      {type === "All Types" ? type : type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Type</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        No audit logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell>{getActionIcon(log.actionType)}</TableCell>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.module}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.username}</div>
                            <div className="text-xs text-gray-500">{log.userRole}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.targetId ? (
                            <div>
                              <div className="font-mono text-xs">{log.targetId}</div>
                              <div className="text-xs text-gray-500">{log.targetType}</div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{log.details || "-"}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.ipAddress || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuditLogs;
