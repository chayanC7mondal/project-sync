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
import { FileText, Search, Calendar, MapPin, Eye, Filter, LayoutDashboard } from "lucide-react";

interface Case {
  case_number: string;
  case_type: string;
  my_role: string;
  status: string;
  next_hearing: string;
  court_room: string;
  io_name: string;
  statement_given: boolean;
}

const WitnessCases = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dummy cases where witness is involved
  const [cases] = useState<Case[]>([
    {
      case_number: "CR/001/2025",
      case_type: "Theft",
      my_role: "Eye Witness",
      status: "Active",
      next_hearing: "2025-11-12",
      court_room: "Court Room 1",
      io_name: "IO Suresh Dash",
      statement_given: true,
    },
    {
      case_number: "CR/005/2025",
      case_type: "Accident",
      my_role: "Eye Witness",
      status: "Active",
      next_hearing: "2025-11-14",
      court_room: "Court Room 3",
      io_name: "IO Ramesh Kumar",
      statement_given: true,
    },
    {
      case_number: "CR/009/2025",
      case_type: "Property Dispute",
      my_role: "Character Witness",
      status: "Pending Statement",
      next_hearing: "2025-11-16",
      court_room: "Court Room 2",
      io_name: "IO Suresh Dash",
      statement_given: false,
    },
    {
      case_number: "CR/014/2025",
      case_type: "Fraud",
      my_role: "Material Witness",
      status: "Active",
      next_hearing: "2025-11-22",
      court_room: "Court Room 1",
      io_name: "IO Priya Sharma",
      statement_given: true,
    },
    {
      case_number: "CR/019/2025",
      case_type: "Assault",
      my_role: "Eye Witness",
      status: "Pending Statement",
      next_hearing: "2025-11-26",
      court_room: "Court Room 2",
      io_name: "IO Suresh Dash",
      statement_given: false,
    },
  ]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
    > = {
      Active: { variant: "default", className: "bg-green-500" },
      "Pending Statement": { variant: "default", className: "bg-orange-500" },
      Completed: { variant: "secondary" },
      Closed: { variant: "outline" },
    };

    const config = statusConfig[status] || { variant: "secondary" };
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { className: string }> = {
      "Eye Witness": { className: "bg-blue-100 text-blue-800" },
      "Character Witness": { className: "bg-purple-100 text-purple-800" },
      "Material Witness": { className: "bg-green-100 text-green-800" },
      "Expert Witness": { className: "bg-orange-100 text-orange-800" },
    };

    const config = roleConfig[role] || { className: "bg-gray-100 text-gray-800" };
    return (
      <Badge variant="outline" className={config.className}>
        {role}
      </Badge>
    );
  };

  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch =
      caseItem.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.case_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.io_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || caseItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Cases</h1>
          <p className="text-gray-600 mt-2">Cases where I am involved as a witness</p>
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
                <p className="text-sm text-gray-600">Total Cases</p>
                <p className="text-2xl font-bold text-gray-900">{cases.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Cases</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cases.filter((c) => c.status === "Active").length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Statements Given</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cases.filter((c) => c.statement_given).length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Statements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cases.filter((c) => !c.statement_given).length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-orange-500" />
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
                  placeholder="Search by case number, type, or IO name..."
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
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending Statement">Pending Statement</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cases List ({filteredCases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Number</TableHead>
                <TableHead>Case Type</TableHead>
                <TableHead>My Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Statement</TableHead>
                <TableHead>Next Hearing</TableHead>
                <TableHead>Court Room</TableHead>
                <TableHead>Investigating Officer</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.map((caseItem, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{caseItem.case_number}</TableCell>
                  <TableCell>{caseItem.case_type}</TableCell>
                  <TableCell>{getRoleBadge(caseItem.my_role)}</TableCell>
                  <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                  <TableCell>
                    {caseItem.statement_given ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Given
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {new Date(caseItem.next_hearing).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      {caseItem.court_room}
                    </div>
                  </TableCell>
                  <TableCell>{caseItem.io_name}</TableCell>
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
    </div>
  );
};

export default WitnessCases;
