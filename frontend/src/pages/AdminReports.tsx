import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { ADMIN_REPORTS } from "@/utils/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceReport {
  totalHearings: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
}

interface CaseReport {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  pendingCases: number;
  casesByType: Record<string, number>;
}

interface OfficerPerformance {
  officerId: string;
  officerName: string;
  casesHandled: number;
  hearingsAttended: number;
  attendanceRate: number;
}

interface WitnessCompliance {
  totalWitnesses: number;
  compliantWitnesses: number;
  nonCompliantWitnesses: number;
  averageAttendanceRate: number;
}

// Dummy data for reports
const dummyAttendanceReport: AttendanceReport = {
  totalHearings: 150,
  presentCount: 120,
  absentCount: 20,
  lateCount: 10,
  attendanceRate: 80,
};

const dummyCaseReport: CaseReport = {
  totalCases: 85,
  activeCases: 45,
  closedCases: 30,
  pendingCases: 10,
  casesByType: {
    Theft: 25,
    Fraud: 18,
    Assault: 15,
    Robbery: 12,
    Cybercrime: 10,
    Other: 5,
  },
};

const dummyOfficerPerformance: OfficerPerformance[] = [
  {
    officerId: "1",
    officerName: "SI Rajesh Kumar",
    casesHandled: 12,
    hearingsAttended: 45,
    attendanceRate: 95,
  },
  {
    officerId: "2",
    officerName: "SI Priya Singh",
    casesHandled: 10,
    hearingsAttended: 38,
    attendanceRate: 92,
  },
  {
    officerId: "3",
    officerName: "ASI Suresh Nayak",
    casesHandled: 8,
    hearingsAttended: 30,
    attendanceRate: 88,
  },
  {
    officerId: "4",
    officerName: "SI Anjali Das",
    casesHandled: 15,
    hearingsAttended: 52,
    attendanceRate: 96,
  },
  {
    officerId: "5",
    officerName: "ASI Kavita Rath",
    casesHandled: 7,
    hearingsAttended: 25,
    attendanceRate: 85,
  },
];

const dummyWitnessCompliance: WitnessCompliance = {
  totalWitnesses: 120,
  compliantWitnesses: 95,
  nonCompliantWitnesses: 25,
  averageAttendanceRate: 79,
};

const AdminReports = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("30");
  const [reportType, setReportType] = useState("all");

  const [attendanceReport, setAttendanceReport] = useState<AttendanceReport>(dummyAttendanceReport);
  const [caseReport, setCaseReport] = useState<CaseReport>(dummyCaseReport);
  const [officerPerformance, setOfficerPerformance] =
    useState<OfficerPerformance[]>(dummyOfficerPerformance);
  const [witnessCompliance, setWitnessCompliance] =
    useState<WitnessCompliance>(dummyWitnessCompliance);

  useEffect(() => {
    fetchReports();
  }, [dateRange, reportType]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(ADMIN_REPORTS, {
        params: {
          dateRange,
          type: reportType,
        },
      });

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setAttendanceReport(data.attendance || dummyAttendanceReport);
        setCaseReport(data.cases || dummyCaseReport);
        setOfficerPerformance(data.officers || dummyOfficerPerformance);
        setWitnessCompliance(data.witnesses || dummyWitnessCompliance);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Using dummy data - API not connected");
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = (reportName: string) => {
    let csvContent = "";
    let filename = "";

    switch (reportName) {
      case "attendance":
        csvContent = [
          ["Metric", "Value"],
          ["Total Hearings", attendanceReport.totalHearings],
          ["Present", attendanceReport.presentCount],
          ["Absent", attendanceReport.absentCount],
          ["Late", attendanceReport.lateCount],
          ["Attendance Rate", `${attendanceReport.attendanceRate}%`],
        ]
          .map((row) => row.join(","))
          .join("\n");
        filename = `attendance_report_${new Date().toISOString().split("T")[0]}.csv`;
        break;

      case "cases":
        csvContent = [
          ["Metric", "Value"],
          ["Total Cases", caseReport.totalCases],
          ["Active Cases", caseReport.activeCases],
          ["Closed Cases", caseReport.closedCases],
          ["Pending Cases", caseReport.pendingCases],
          ["", ""],
          ["Case Type", "Count"],
          ...Object.entries(caseReport.casesByType).map(([type, count]) => [type, count]),
        ]
          .map((row) => row.join(","))
          .join("\n");
        filename = `case_report_${new Date().toISOString().split("T")[0]}.csv`;
        break;

      case "officers":
        csvContent = [
          ["Officer Name", "Cases Handled", "Hearings Attended", "Attendance Rate"],
          ...officerPerformance.map((officer) => [
            officer.officerName,
            officer.casesHandled,
            officer.hearingsAttended,
            `${officer.attendanceRate}%`,
          ]),
        ]
          .map((row) => row.join(","))
          .join("\n");
        filename = `officer_performance_${new Date().toISOString().split("T")[0]}.csv`;
        break;

      case "witnesses":
        csvContent = [
          ["Metric", "Value"],
          ["Total Witnesses", witnessCompliance.totalWitnesses],
          ["Compliant Witnesses", witnessCompliance.compliantWitnesses],
          ["Non-Compliant Witnesses", witnessCompliance.nonCompliantWitnesses],
          ["Average Attendance Rate", `${witnessCompliance.averageAttendanceRate}%`],
        ]
          .map((row) => row.join(","))
          .join("\n");
        filename = `witness_compliance_${new Date().toISOString().split("T")[0]}.csv`;
        break;

      default:
        toast.error("Invalid report type");
        return;
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    toast.success("Report exported successfully");
  };

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive system reports and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-green-900">
                  {attendanceReport.attendanceRate}%
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
                <p className="text-sm font-medium text-gray-600">Active Cases</p>
                <p className="text-2xl font-bold text-blue-900">{caseReport.activeCases}</p>
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
                <p className="text-sm font-medium text-gray-600">Total Witnesses</p>
                <p className="text-2xl font-bold text-purple-900">
                  {witnessCompliance.totalWitnesses}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-xl">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold text-orange-900">
                  {Math.round(
                    officerPerformance.reduce((acc, o) => acc + o.attendanceRate, 0) /
                      officerPerformance.length
                  )}
                  %
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="officers">Officer Performance</TabsTrigger>
          <TabsTrigger value="witnesses">Witness Compliance</TabsTrigger>
        </TabsList>

        {/* Attendance Report */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Attendance Report</CardTitle>
                  <CardDescription>Overall attendance statistics and trends</CardDescription>
                </div>
                <Button size="sm" onClick={() => handleExportReport("attendance")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <p className="font-medium text-green-900">Present</p>
                      </div>
                      <p className="text-2xl font-bold text-green-900">
                        {attendanceReport.presentCount}
                      </p>
                      <p className="text-xs text-green-700">
                        {Math.round(
                          (attendanceReport.presentCount / attendanceReport.totalHearings) * 100
                        )}
                        % of total
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <p className="font-medium text-red-900">Absent</p>
                      </div>
                      <p className="text-2xl font-bold text-red-900">
                        {attendanceReport.absentCount}
                      </p>
                      <p className="text-xs text-red-700">
                        {Math.round(
                          (attendanceReport.absentCount / attendanceReport.totalHearings) * 100
                        )}
                        % of total
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-amber-600" />
                        <p className="font-medium text-amber-900">Late</p>
                      </div>
                      <p className="text-2xl font-bold text-amber-900">
                        {attendanceReport.lateCount}
                      </p>
                      <p className="text-xs text-amber-700">
                        {Math.round(
                          (attendanceReport.lateCount / attendanceReport.totalHearings) * 100
                        )}
                        % of total
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        <p className="font-medium text-blue-900">Total Hearings</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        {attendanceReport.totalHearings}
                      </p>
                      <p className="text-xs text-blue-700">in selected period</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Case Report */}
        <TabsContent value="cases" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Case Statistics</CardTitle>
                  <CardDescription>Breakdown of cases by status and type</CardDescription>
                </div>
                <Button size="sm" onClick={() => handleExportReport("cases")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900 mb-2">Active Cases</p>
                    <p className="text-2xl font-bold text-blue-900">{caseReport.activeCases}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900 mb-2">Closed Cases</p>
                    <p className="text-2xl font-bold text-green-900">{caseReport.closedCases}</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <p className="font-medium text-amber-900 mb-2">Pending Cases</p>
                    <p className="text-2xl font-bold text-amber-900">{caseReport.pendingCases}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Cases by Type</h3>
                  <div className="space-y-2">
                    {Object.entries(caseReport.casesByType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{type}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(count / caseReport.totalCases) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="font-bold text-blue-900 w-12 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Officer Performance Report */}
        <TabsContent value="officers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Officer Performance</CardTitle>
                  <CardDescription>Individual officer statistics and metrics</CardDescription>
                </div>
                <Button size="sm" onClick={() => handleExportReport("officers")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {officerPerformance.map((officer) => (
                  <div key={officer.officerId} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">{officer.officerName}</h4>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {officer.attendanceRate}% Attendance
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Cases Handled</p>
                        <p className="font-bold text-lg">{officer.casesHandled}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Hearings Attended</p>
                        <p className="font-bold text-lg">{officer.hearingsAttended}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Performance</p>
                        <div className="flex items-center gap-2 mt-1">
                          {officer.attendanceRate >= 90 ? (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                          )}
                          <span className="font-bold">
                            {officer.attendanceRate >= 90 ? "Excellent" : "Good"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Witness Compliance Report */}
        <TabsContent value="witnesses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Witness Compliance</CardTitle>
                  <CardDescription>Witness attendance and compliance metrics</CardDescription>
                </div>
                <Button size="sm" onClick={() => handleExportReport("witnesses")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900 mb-2">Total Witnesses</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {witnessCompliance.totalWitnesses}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900 mb-2">Compliant</p>
                    <p className="text-2xl font-bold text-green-900">
                      {witnessCompliance.compliantWitnesses}
                    </p>
                    <p className="text-xs text-green-700">
                      {Math.round(
                        (witnessCompliance.compliantWitnesses /
                          witnessCompliance.totalWitnesses) *
                          100
                      )}
                      % of total
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="font-medium text-red-900 mb-2">Non-Compliant</p>
                    <p className="text-2xl font-bold text-red-900">
                      {witnessCompliance.nonCompliantWitnesses}
                    </p>
                    <p className="text-xs text-red-700">
                      {Math.round(
                        (witnessCompliance.nonCompliantWitnesses /
                          witnessCompliance.totalWitnesses) *
                          100
                      )}
                      % of total
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 mb-1">Average Attendance Rate</p>
                      <p className="text-4xl font-bold text-purple-900">
                        {witnessCompliance.averageAttendanceRate}%
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <Users className="h-12 w-12 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReports;
