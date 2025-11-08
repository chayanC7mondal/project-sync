import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import QRScanner from "@/components/QRScanner";
import { CheckCircle2, XCircle, Scan, KeyRound } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { Badge } from "@/components/ui/badge";

const VerifyAttendance = () => {
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    // Get user info from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserInfo(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleVerifyCode = async (code: string) => {
    if (!code || !userInfo) {
      toast.error("Invalid code or user not logged in");
      return;
    }

    try {
      setLoading(true);
      setVerificationResult(null);

      // Determine userId based on role
      let userId = userInfo.id || userInfo._id;
      let userType = userInfo.role === "io" ? "officer" : "witness";

      const response = await apiClient.post("/api/hearings/scan-qr", {
        qrCode: code,
        userId,
        userType,
      });

      if (response.data.success) {
        setVerificationResult({
          success: true,
          message: response.data.data.message || "Attendance marked successfully",
          attendance: response.data.data.attendance,
        });
        toast.success("Attendance marked successfully!");
      } else {
        setVerificationResult({
          success: false,
          message: response.data.message || "Verification failed",
        });
        toast.error(response.data.message || "Verification failed");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      const errorMsg = error.response?.data?.message || "Failed to verify attendance";
      setVerificationResult({
        success: false,
        message: errorMsg,
      });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      toast.error("Please enter a code");
      return;
    }
    handleVerifyCode(manualCode.trim());
  };

  const handleQRDetected = (code: string) => {
    toast.info(`QR Code detected: ${code}`);
    handleVerifyCode(code);
  };

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-600 mt-2">
          Scan QR code or enter the code manually to mark your attendance
        </p>
      </div>

      {/* User Info */}
      {userInfo && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Logged in as</p>
                <p className="text-lg font-semibold">{userInfo.username || userInfo.name}</p>
                <Badge variant="outline" className="mt-1">
                  {userInfo.role === "io" ? "Investigating Officer" : "Witness"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Scan QR Code
          </CardTitle>
          <CardDescription>Use your camera to scan the hearing QR code</CardDescription>
        </CardHeader>
        <CardContent>
          <QRScanner onDetected={handleQRDetected} />
        </CardContent>
      </Card>

      {/* Manual Code Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Enter Code Manually
          </CardTitle>
          <CardDescription>
            If you can't scan the QR code, enter the code provided by the liaison officer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code">Attendance Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="e.g., HS-CR001-2025-11-09-abc123"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Mark Attendance"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Verification Result */}
      {verificationResult && (
        <Card className={verificationResult.success ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {verificationResult.success ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              {verificationResult.success ? "Success" : "Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{verificationResult.message}</p>
            {verificationResult.attendance && (
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge>{verificationResult.attendance.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Arrival Time:</span>
                  <span className="text-sm">
                    {new Date(verificationResult.attendance.arrivalTime).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Marked Via QR:</span>
                  <span className="text-sm">
                    {verificationResult.attendance.markedViaQR ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VerifyAttendance;
