import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Search, Filter, Trash2, Edit, Eye, Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { CASE_LIST, CASE_CREATE, CASE_DETAIL, CASE_UPDATE } from "@/utils/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface Case {
  _id?: string;
  id?: string;
  caseNumber: string;
  caseId?: string;
  title?: string;
  court: string;
  date: string;
  nextHearingDate?: string;
  io: string;
  investigatingOfficer?: string;
  witnesses: number;
  status: string;
  description?: string;
  sections?: string[];
}

// Mock data - will be replaced with API data when backend is ready
const mockCases: Case[] = [
  { id: "1", caseNumber: "CR/001/2025", caseId: "CR/001/2025", title: "State vs. Accused - Theft", court: "District Court-A", date: "2024-11-08", io: "SI Ramesh Kumar", witnesses: 3, status: "active" },
  { id: "2", caseNumber: "CR/002/2025", caseId: "CR/002/2025", title: "State vs. Defendant - Fraud", court: "District Court-B", date: "2024-11-09", io: "SI Priya Patel", witnesses: 2, status: "pending" },
  { id: "3", caseNumber: "CR/003/2025", caseId: "CR/003/2025", title: "State vs. Suspect - Assault", court: "Sessions Court", date: "2024-11-10", io: "ASI Suresh Nayak", witnesses: 4, status: "under_investigation" },
  { id: "4", caseNumber: "CR/004/2025", caseId: "CR/004/2025", title: "State vs. Accused - Robbery", court: "District Court-A", date: "2024-11-11", io: "SI Anjali Das", witnesses: 1, status: "active" },
  { id: "5", caseNumber: "CR/005/2025", caseId: "CR/005/2025", title: "State vs. Defendant - Drug Case", court: "District Court-C", date: "2024-11-12", io: "SI Rajesh Mohanty", witnesses: 5, status: "active" },
  { id: "6", caseNumber: "CR/006/2025", caseId: "CR/006/2025", title: "State vs. Suspect - Cybercrime", court: "Sessions Court", date: "2024-11-13", io: "ASI Kavita Rath", witnesses: 2, status: "pending" },
];

const CaseManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cases, setCases] = useState<Case[]>(mockCases);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [viewingCase, setViewingCase] = useState<Case | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    caseNumber: "",
    title: "",
    court: "",
    date: "",
    io: "",
    witnesses: 0,
    status: "active",
    description: "",
    sections: "",
  });

  useEffect(() => {
    fetchCases();
  }, []);

  // Fetch all cases with API fallback to dummy data
  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(CASE_LIST);
      if (response.data.success && response.data.data) {
        const mappedCases = response.data.data.map((c: any) => ({
          _id: c._id,
          id: c._id,
          caseNumber: c.caseId || c.caseNumber || "N/A",
          caseId: c.caseId || c.caseNumber,
          title: c.title || c.caseName || "Untitled Case",
          court: c.courtName || "N/A",
          date: c.nextHearingDate || c.createdAt,
          io: c.investigatingOfficer?.name || c.investigatingOfficer || "N/A",
          witnesses: c.witnesses?.length || 0,
          status: c.status || "active",
          description: c.description || "",
          sections: c.sections || [],
        }));
        setCases(mappedCases);
      } else {
        setCases(mockCases);
        toast.info("Using demo data - API returned no data");
      }
    } catch (error) {
      toast.error("Using demo data - API not connected");
      console.error("Error fetching cases:", error);
      setCases(mockCases);
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single case by ID
  const fetchCaseById = async (caseId: string) => {
    try {
      const response = await apiClient.get(CASE_DETAIL(caseId));
      if (response.data.success) {
        setViewingCase(response.data.data);
        setIsViewDialogOpen(true);
      }
    } catch (error) {
      toast.error("Failed to fetch case details");
      console.error("Error fetching case:", error);
    }
  };

  // Create a new case
  const handleCreateCase = async () => {
    try {
      const caseData = {
        caseId: formData.caseNumber,
        caseNumber: formData.caseNumber,
        title: formData.title,
        courtName: formData.court,
        nextHearingDate: formData.date,
        investigatingOfficer: formData.io,
        status: formData.status,
        description: formData.description,
        sections: formData.sections.split(",").map((s) => s.trim()).filter(Boolean),
      };
      
      const response = await apiClient.post(CASE_CREATE, caseData);
      if (response.data.success) {
        toast.success("Case created successfully");
        setIsDialogOpen(false);
        fetchCases();
        resetForm();
      }
    } catch (error) {
      toast.error("Failed to create case");
      console.error("Error creating case:", error);
    }
  };

  // Update an existing case
  const handleUpdateCase = async () => {
    if (!editingCase) return;
    try {
      const caseData = {
        caseId: formData.caseNumber,
        caseNumber: formData.caseNumber,
        title: formData.title,
        courtName: formData.court,
        nextHearingDate: formData.date,
        investigatingOfficer: formData.io,
        status: formData.status,
        description: formData.description,
        sections: formData.sections.split(",").map((s) => s.trim()).filter(Boolean),
      };
      
      const response = await apiClient.put(CASE_UPDATE(editingCase._id || editingCase.id!), caseData);
      if (response.data.success) {
        toast.success("Case updated successfully");
        setIsDialogOpen(false);
        setEditingCase(null);
        fetchCases();
        resetForm();
      }
    } catch (error) {
      toast.error("Failed to update case");
      console.error("Error updating case:", error);
    }
  };

  // Delete a case
  const handleDeleteCase = async (caseId: string) => {
    if (!confirm("Are you sure you want to delete this case?")) return;
    try {
      await apiClient.delete(CASE_DETAIL(caseId));
      toast.success("Case deleted successfully");
      fetchCases();
    } catch (error) {
      toast.error("Failed to delete case");
      console.error("Error deleting case:", error);
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setEditingCase(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (caseItem: Case) => {
    setEditingCase(caseItem);
    setFormData({
      caseNumber: caseItem.caseNumber || caseItem.caseId || "",
      title: caseItem.title || "",
      court: caseItem.court || "",
      date: caseItem.date || caseItem.nextHearingDate || "",
      io: caseItem.io || caseItem.investigatingOfficer || "",
      witnesses: caseItem.witnesses || 0,
      status: caseItem.status || "active",
      description: caseItem.description || "",
      sections: Array.isArray(caseItem.sections) ? caseItem.sections.join(", ") : "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingCase) {
      handleUpdateCase();
    } else {
      handleCreateCase();
    }
  };

  const resetForm = () => {
    setFormData({
      caseNumber: "",
      title: "",
      court: "",
      date: "",
      io: "",
      witnesses: 0,
      status: "active",
      description: "",
      sections: "",
    });
  };

  // Handle CSV file upload
  const handleFileUpload = () => {
    toast.success("CSV upload functionality coming soon");
  };

  const filteredCases = cases.filter((case_) => {
    const matchesSearch =
      case_.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.caseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.io?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.court?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || case_.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
      active: { variant: "default", color: "bg-green-100 text-green-800" },
      pending: { variant: "secondary", color: "bg-yellow-100 text-yellow-800" },
      under_investigation: { variant: "default", color: "bg-blue-100 text-blue-800" },
      closed: { variant: "outline", color: "bg-gray-100 text-gray-800" },
    };
    const config = variants[status] || { variant: "outline", color: "" };
    return (
      <Badge variant={config.variant} className={config.color}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Case Management</h1>
          <p className="text-gray-600 mt-2">Manage court cases and daily cause lists</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleFileUpload}>
            <Upload className="w-4 h-4 mr-2" />
            Upload CSV
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Case
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cases</p>
                <p className="text-2xl font-bold text-gray-900">{cases.length}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Cases</p>
                <p className="text-2xl font-bold text-green-900">
                  {cases.filter((c) => c.status === "active").length}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Cases</p>
                <p className="text-2xl font-bold text-amber-900">
                  {cases.filter((c) => c.status === "pending").length}
                </p>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Under Investigation</p>
                <p className="text-2xl font-bold text-purple-900">
                  {cases.filter((c) => c.status === "under_investigation").length}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by Case ID, Title, Officer, or Court..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_investigation">Under Investigation</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No cases found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Case Number</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Title</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Court</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Next Hearing</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">IO Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Witnesses</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map((case_, index) => (
                    <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-primary">
                        {case_.caseNumber || case_.caseId}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground max-w-xs truncate">
                        {case_.title || "Untitled Case"}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">{case_.court}</td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        {case_.date ? new Date(case_.date).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">{case_.io}</td>
                      <td className="py-3 px-4 text-sm text-center">{case_.witnesses}</td>
                      <td className="py-3 px-4">{getStatusBadge(case_.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => fetchCaseById(case_._id || case_.id!)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditDialog(case_)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteCase(case_._id || case_.id!)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Case Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCase ? "Edit Case" : "Create New Case"}</DialogTitle>
            <DialogDescription>
              {editingCase ? "Update case information" : "Add a new case to the system"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="caseNumber">Case Number *</Label>
                <Input
                  id="caseNumber"
                  value={formData.caseNumber}
                  onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                  placeholder="CR/001/2025"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_investigation">Under Investigation</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Case Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="State vs. Accused - Case Type"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="court">Court Name *</Label>
                <Input
                  id="court"
                  value={formData.court}
                  onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                  placeholder="District Court-A"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Next Hearing Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="io">Investigating Officer</Label>
              <Input
                id="io"
                value={formData.io}
                onChange={(e) => setFormData({ ...formData, io: e.target.value })}
                placeholder="SI Rajesh Kumar"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sections">Sections (comma-separated)</Label>
              <Input
                id="sections"
                value={formData.sections}
                onChange={(e) => setFormData({ ...formData, sections: e.target.value })}
                placeholder="IPC 302, IPC 307, CrPC 41"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Case details and summary"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingCase ? "Update Case" : "Create Case"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Case Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Case Details</DialogTitle>
            <DialogDescription>Complete information about the case</DialogDescription>
          </DialogHeader>
          {viewingCase && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Case Number</Label>
                  <p className="font-medium">{viewingCase.caseNumber || viewingCase.caseId}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(viewingCase.status)}</div>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Title</Label>
                <p className="font-medium">{viewingCase.title || "Untitled Case"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Court</Label>
                  <p className="font-medium">{viewingCase.court}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Next Hearing</Label>
                  <p className="font-medium">
                    {viewingCase.date ? new Date(viewingCase.date).toLocaleDateString() : "-"}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Investigating Officer</Label>
                <p className="font-medium">{viewingCase.io || "Not assigned"}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Witnesses</Label>
                <p className="font-medium">{viewingCase.witnesses}</p>
              </div>
              {viewingCase.sections && Array.isArray(viewingCase.sections) && viewingCase.sections.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground">Sections</Label>
                  <p className="font-medium">{viewingCase.sections.join(", ")}</p>
                </div>
              )}
              {viewingCase.description && (
                <div>
                  <Label className="text-sm text-muted-foreground">Description</Label>
                  <p className="text-sm">{viewingCase.description}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CaseManagement;
