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
import { Users, Search, Phone, Mail, Eye, Filter, FileText } from "lucide-react";

interface Witness {
  id: string;
  name: string;
  case_number: string;
  case_type: string;
  contact: string;
  email: string;
  status: string;
  last_contacted: string;
  statement_recorded: boolean;
}

const IOWitnesses = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dummy witnesses for cases where IO is investigating
  const [witnesses] = useState<Witness[]>([
    {
      id: "WIT001",
      name: "Rajesh Kumar",
      case_number: "CR/001/2025",
      case_type: "Theft",
      contact: "+91-9876543210",
      email: "rajesh.k@email.com",
      status: "Statement Recorded",
      last_contacted: "2025-11-05",
      statement_recorded: true,
    },
    {
      id: "WIT002",
      name: "Priya Sharma",
      case_number: "CR/001/2025",
      case_type: "Theft",
      contact: "+91-9876543211",
      email: "priya.s@email.com",
      status: "Pending Statement",
      last_contacted: "2025-11-03",
      statement_recorded: false,
    },
    {
      id: "WIT003",
      name: "Amit Patel",
      case_number: "CR/001/2025",
      case_type: "Theft",
      contact: "+91-9876543212",
      email: "amit.p@email.com",
      status: "Statement Recorded",
      last_contacted: "2025-11-04",
      statement_recorded: true,
    },
    {
      id: "WIT004",
      name: "Sunita Desai",
      case_number: "CR/003/2025",
      case_type: "Fraud",
      contact: "+91-9876543213",
      email: "sunita.d@email.com",
      status: "Pending Statement",
      last_contacted: "2025-11-06",
      statement_recorded: false,
    },
    {
      id: "WIT005",
      name: "Vikram Singh",
      case_number: "CR/003/2025",
      case_type: "Fraud",
      contact: "+91-9876543214",
      email: "vikram.s@email.com",
      status: "Statement Recorded",
      last_contacted: "2025-11-07",
      statement_recorded: true,
    },
    {
      id: "WIT006",
      name: "Meena Rao",
      case_number: "CR/007/2025",
      case_type: "Assault",
      contact: "+91-9876543215",
      email: "meena.r@email.com",
      status: "Statement Recorded",
      last_contacted: "2025-11-02",
      statement_recorded: true,
    },
    {
      id: "WIT007",
      name: "Karan Mehta",
      case_number: "CR/007/2025",
      case_type: "Assault",
      contact: "+91-9876543216",
      email: "karan.m@email.com",
      status: "Pending Statement",
      last_contacted: "2025-11-01",
      statement_recorded: false,
    },
    {
      id: "WIT008",
      name: "Anjali Verma",
      case_number: "CR/007/2025",
      case_type: "Assault",
      contact: "+91-9876543217",
      email: "anjali.v@email.com",
      status: "Statement Recorded",
      last_contacted: "2025-11-05",
      statement_recorded: true,
    },
    {
      id: "WIT009",
      name: "Rohit Joshi",
      case_number: "CR/007/2025",
      case_type: "Assault",
      contact: "+91-9876543218",
      email: "rohit.j@email.com",
      status: "Pending Contact",
      last_contacted: "2025-10-28",
      statement_recorded: false,
    },
    {
      id: "WIT010",
      name: "Sneha Gupta",
      case_number: "CR/012/2025",
      case_type: "Robbery",
      contact: "+91-9876543219",
      email: "sneha.g@email.com",
      status: "Statement Recorded",
      last_contacted: "2025-11-06",
      statement_recorded: true,
    },
    {
      id: "WIT011",
      name: "Deepak Reddy",
      case_number: "CR/012/2025",
      case_type: "Robbery",
      contact: "+91-9876543220",
      email: "deepak.r@email.com",
      status: "Pending Statement",
      last_contacted: "2025-11-04",
      statement_recorded: false,
    },
    {
      id: "WIT012",
      name: "Kavita Nair",
      case_number: "CR/015/2025",
      case_type: "Cybercrime",
      contact: "+91-9876543221",
      email: "kavita.n@email.com",
      status: "Statement Recorded",
      last_contacted: "2025-11-07",
      statement_recorded: true,
    },
    {
      id: "WIT013",
      name: "Suresh Iyer",
      case_number: "CR/018/2025",
      case_type: "Burglary",
      contact: "+91-9876543222",
      email: "suresh.i@email.com",
      status: "Pending Statement",
      last_contacted: "2025-11-05",
      statement_recorded: false,
    },
    {
      id: "WIT014",
      name: "Lakshmi Pillai",
      case_number: "CR/018/2025",
      case_type: "Burglary",
      contact: "+91-9876543223",
      email: "lakshmi.p@email.com",
      status: "Statement Recorded",
      last_contacted: "2025-11-06",
      statement_recorded: true,
    },
    {
      id: "WIT015",
      name: "Arun Kumar",
      case_number: "CR/018/2025",
      case_type: "Burglary",
      contact: "+91-9876543224",
      email: "arun.k@email.com",
      status: "Pending Contact",
      last_contacted: "2025-10-30",
      statement_recorded: false,
    },
  ]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
    > = {
      "Statement Recorded": { variant: "default", className: "bg-green-500" },
      "Pending Statement": { variant: "secondary" },
      "Pending Contact": { variant: "destructive" },
    };

    const config = statusConfig[status] || { variant: "secondary" };
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const filteredWitnesses = witnesses.filter((witness) => {
    const matchesSearch =
      witness.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      witness.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      witness.case_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || witness.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Witnesses</h1>
          <p className="text-gray-600 mt-2">Witnesses for cases under my investigation</p>
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
                <p className="text-sm text-gray-600">Total Witnesses</p>
                <p className="text-2xl font-bold text-gray-900">{witnesses.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Statements Recorded</p>
                <p className="text-2xl font-bold text-gray-900">
                  {witnesses.filter((w) => w.statement_recorded).length}
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
                <p className="text-sm text-gray-600">Pending Statements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {witnesses.filter((w) => w.status === "Pending Statement").length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Contact</p>
                <p className="text-2xl font-bold text-gray-900">
                  {witnesses.filter((w) => w.status === "Pending Contact").length}
                </p>
              </div>
              <Phone className="w-8 h-8 text-red-500" />
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
                  placeholder="Search by name, case number, or case type..."
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
                <SelectItem value="Statement Recorded">Statement Recorded</SelectItem>
                <SelectItem value="Pending Statement">Pending Statement</SelectItem>
                <SelectItem value="Pending Contact">Pending Contact</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Witnesses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Witnesses List ({filteredWitnesses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Case Number</TableHead>
                <TableHead>Case Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Contacted</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWitnesses.map((witness) => (
                <TableRow key={witness.id}>
                  <TableCell className="font-medium">{witness.id}</TableCell>
                  <TableCell>{witness.name}</TableCell>
                  <TableCell>{witness.case_number}</TableCell>
                  <TableCell>{witness.case_type}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      {witness.contact}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      {witness.email}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(witness.status)}</TableCell>
                  <TableCell>{new Date(witness.last_contacted).toLocaleDateString()}</TableCell>
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

export default IOWitnesses;
