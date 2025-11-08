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
import { FileText, Search, Users, Calendar, Eye, Filter } from "lucide-react";

interface Case {
  case_number: string;
  case_type: string;
  status: string;
  date_filed: string;
  next_hearing: string;
  witnesses_count: number;
  location: string;
}

const IOCases = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dummy cases where IO is investigating
  const [cases] = useState<Case[]>([
    {
      case_number: "CR/001/2025",
      case_type: "Theft",
      status: "Under Investigation",
      date_filed: "2025-10-15",
      next_hearing: "2025-11-12",
      witnesses_count: 3,
      location: "Court Room 1",
    },
    {
      case_number: "CR/003/2025",
      case_type: "Fraud",
      status: "Under Investigation",
      date_filed: "2025-10-20",
      next_hearing: "2025-11-15",
      witnesses_count: 2,
      location: "Court Room 2",
    },
    {
      case_number: "CR/007/2025",
      case_type: "Assault",
      status: "Under Investigation",
      date_filed: "2025-10-25",
      next_hearing: "2025-11-18",
      witnesses_count: 4,
      location: "Court Room 1",
    },
    {
      case_number: "CR/012/2025",
      case_type: "Robbery",
      status: "Pending Verification",
      date_filed: "2025-10-28",
      next_hearing: "2025-11-20",
      witnesses_count: 2,
      location: "Court Room 3",
    },
    {
      case_number: "CR/015/2025",
      case_type: "Cybercrime",
      status: "Under Investigation",
      date_filed: "2025-11-01",
      next_hearing: "2025-11-25",
      witnesses_count: 1,
      location: "Court Room 2",
    },
    {
      case_number: "CR/018/2025",
      case_type: "Burglary",
      status: "Evidence Collection",
      date_filed: "2025-11-03",
      next_hearing: "2025-11-28",
      witnesses_count: 3,
      location: "Court Room 1",
    },
    {
      case_number: "CR/021/2025",
      case_type: "Forgery",
      status: "Under Investigation",
      date_filed: "2025-11-05",
      next_hearing: "2025-11-30",
      witnesses_count: 2,
      location: "Court Room 3",
    },
    {
      case_number: "CR/024/2025",
      case_type: "Vandalism",
      status: "Pending Verification",
      date_filed: "2025-11-06",
      next_hearing: "2025-12-02",
      witnesses_count: 1,
      location: "Court Room 2",
    },
  ]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
    > = {
      "Under Investigation": { variant: "default", className: "bg-blue-500" },
      "Pending Verification": { variant: "secondary" },
      "Evidence Collection": { variant: "default", className: "bg-purple-500" },
    };

    const config = statusConfig[status] || { variant: "secondary" };
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch =
      caseItem.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.case_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || caseItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Cases</h1>
          <p className="text-gray-600 mt-2">Cases where I am the investigating officer</p>
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
                <p className="text-sm text-gray-600">Under Investigation</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cases.filter((c) => c.status === "Under Investigation").length}
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
                <p className="text-sm text-gray-600">Total Witnesses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cases.reduce((sum, c) => sum + c.witnesses_count, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Verification</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cases.filter((c) => c.status === "Pending Verification").length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
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
                  placeholder="Search by case number or type..."
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
                <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                <SelectItem value="Pending Verification">Pending Verification</SelectItem>
                <SelectItem value="Evidence Collection">Evidence Collection</SelectItem>
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
                <TableHead>Status</TableHead>
                <TableHead>Date Filed</TableHead>
                <TableHead>Next Hearing</TableHead>
                <TableHead>Witnesses</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.map((caseItem, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{caseItem.case_number}</TableCell>
                  <TableCell>{caseItem.case_type}</TableCell>
                  <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                  <TableCell>{new Date(caseItem.date_filed).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(caseItem.next_hearing).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      {caseItem.witnesses_count}
                    </div>
                  </TableCell>
                  <TableCell>{caseItem.location}</TableCell>
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

export default IOCases;
