import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Search, Filter, Trash2, Edit, Eye } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { CASE_LIST, CASE_CREATE, CASE_DETAIL, CASE_UPDATE } from "@/utils/constants";

// Mock data - will be replaced with API data when backend is ready
const mockCases = [
  { id: "CID/2024/001", court: "District Court-A", date: "2024-11-08", io: "SI Ramesh Kumar", witnesses: 3, status: "Present" },
  { id: "CID/2024/002", court: "District Court-B", date: "2024-11-09", io: "SI Priya Patel", witnesses: 2, status: "Pending" },
  { id: "CID/2024/003", court: "Sessions Court", date: "2024-11-10", io: "ASI Suresh Nayak", witnesses: 4, status: "Absent" },
  { id: "CID/2024/004", court: "District Court-A", date: "2024-11-11", io: "SI Anjali Das", witnesses: 1, status: "Late" },
  { id: "CID/2024/005", court: "District Court-C", date: "2024-11-12", io: "SI Rajesh Mohanty", witnesses: 5, status: "Present" },
  { id: "CID/2024/006", court: "Sessions Court", date: "2024-11-13", io: "ASI Kavita Rath", witnesses: 2, status: "Pending" },
];

const CaseManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cases, setCases] = useState(mockCases); // Using mock data initially
  const [loading, setLoading] = useState(false);

  // Fetch all cases - API function (uncomment when backend is ready)
  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(CASE_LIST);
      setCases(response.data);
      toast.success("Cases loaded successfully");
    } catch (error) {
      toast.error("Failed to fetch cases");
      console.error("Error fetching cases:", error);
      // Fallback to mock data on error
      setCases(mockCases);
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single case by ID
  const fetchCaseById = async (caseId) => {
    try {
      const response = await apiClient.get(CASE_DETAIL(caseId));
      return response.data;
    } catch (error) {
      toast.error("Failed to fetch case details");
      console.error("Error fetching case:", error);
      return null;
    }
  };

  // Create a new case
  const handleCreateCase = async (caseData) => {
    try {
      await apiClient.post(CASE_CREATE, caseData);
      toast.success("Case created successfully");
      fetchCases();
    } catch (error) {
      toast.error("Failed to create case");
      console.error("Error creating case:", error);
    }
  };

  // Update an existing case
  const handleUpdateCase = async (caseId, caseData) => {
    try {
      await apiClient.put(CASE_UPDATE(caseId), caseData);
      toast.success("Case updated successfully");
      fetchCases();
    } catch (error) {
      toast.error("Failed to update case");
      console.error("Error updating case:", error);
    }
  };

  // Delete a case (if backend supports it)
  const handleDeleteCase = async (caseId) => {
    try {
      await apiClient.delete(CASE_DETAIL(caseId));
      toast.success("Case deleted successfully");
      fetchCases();
    } catch (error) {
      toast.error("Failed to delete case");
      console.error("Error deleting case:", error);
    }
  };

  // Handle CSV file upload
  const handleFileUpload = () => {
    toast.success("CSV upload functionality coming soon");
  };

  // Uncomment this to enable API calls when backend is ready
  // useEffect(() => {
  //   fetchCases();
  // }, []);

  const filteredCases = cases.filter(case_ =>
    case_.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.io?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.court?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Case Management</h1>
          <p className="text-muted-foreground mt-1">Manage court cases and daily cause lists</p>
        </div>
        <Button onClick={handleFileUpload} className="bg-primary hover:bg-primary/90">
          <Upload className="w-4 h-4 mr-2" />
          Upload Cause List (CSV)
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by Case ID, Officer, or Court..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading cases...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Case ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Court</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">IO Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Witnesses</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map((case_, index) => (
                    <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-primary">{case_.id}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{case_.court}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{case_.date}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{case_.io}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{case_.witnesses}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          case_.status === "Present" 
                            ? "status-badge-success" 
                            : case_.status === "Late"
                            ? "status-badge-warning"
                            : case_.status === "Pending"
                            ? "bg-muted text-muted-foreground border border-border"
                            : "status-badge-error"
                        }`}>
                          {case_.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => fetchCaseById(case_.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleUpdateCase(case_.id, case_)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteCase(case_.id)}
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
    </div>
  );
};

export default CaseManagement;
