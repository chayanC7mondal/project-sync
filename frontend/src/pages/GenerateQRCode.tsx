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
import { QrCode, Copy, Check, Calendar } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { Badge } from "@/components/ui/badge";
import QRCode from "qrcode";

interface HearingSession {
  _id: string;
  caseId: any;
  hearingDate: string;
  hearingTime: string;
  courtName: string;
  qrCode: string;
  qrCodeData: string;
  status: string;
}

const GenerateQRCode = () => {
  const [todayHearings, setTodayHearings] = useState<HearingSession[]>([]);
  const [selectedHearing, setSelectedHearing] = useState<HearingSession | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTodayHearings();
  }, []);

  const fetchTodayHearings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/liaison/hearings/today");
      if (response.data.success && response.data.data) {
        setTodayHearings(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching hearings:", error);
      toast.error("Failed to fetch today's hearings");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (hearingId: string) => {
    const hearing = todayHearings.find((h) => h._id === hearingId);
    if (!hearing) {
      toast.error("Hearing not found");
      return;
    }

    setSelectedHearing(hearing);

    try {
      // Generate QR code image from the qrCode string
      const qrImageUrl = await QRCode.toDataURL(hearing.qrCode, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeImage(qrImageUrl);
      toast.success("QR Code generated successfully");
    } catch (error) {
      console.error("QR generation error:", error);
      toast.error("Failed to generate QR code");
    }
  };

  const handleCopyCode = () => {
    if (selectedHearing) {
      navigator.clipboard.writeText(selectedHearing.qrCode);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrintQR = () => {
    if (!qrCodeImage) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Attendance QR Code</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 40px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                border: 2px solid #333;
                padding: 20px;
                border-radius: 8px;
              }
              h1 { color: #333; margin-bottom: 10px; }
              .code { 
                font-size: 18px; 
                font-weight: bold; 
                margin: 20px 0;
                padding: 15px;
                background: #f0f0f0;
                border-radius: 5px;
              }
              img { max-width: 400px; margin: 20px 0; }
              .info { text-align: left; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Hearing Attendance QR Code</h1>
              <img src="${qrCodeImage}" alt="QR Code" />
              <div class="code">Code: ${selectedHearing?.qrCode}</div>
              <div class="info">
                <p><strong>Case ID:</strong> ${selectedHearing?.caseId?.caseId || "N/A"}</p>
                <p><strong>Date:</strong> ${new Date(selectedHearing?.hearingDate || "").toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${selectedHearing?.hearingTime}</p>
                <p><strong>Court:</strong> ${selectedHearing?.courtName}</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Generate QR Code</h1>
        <p className="text-gray-600 mt-2">
          Generate QR codes for today's hearings to mark attendance
        </p>
      </div>

      {/* Select Hearing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Today's Hearing
          </CardTitle>
          <CardDescription>Choose a hearing session to generate its QR code</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Hearing Session</Label>
              <Select onValueChange={handleGenerateQR} disabled={loading || todayHearings.length === 0}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={loading ? "Loading..." : todayHearings.length === 0 ? "No hearings today" : "Select a hearing"} />
                </SelectTrigger>
                <SelectContent>
                  {todayHearings.map((hearing) => (
                    <SelectItem key={hearing._id} value={hearing._id}>
                      {hearing.caseId?.caseId || "Unknown Case"} - {hearing.hearingTime} - {hearing.courtName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {todayHearings.length === 0 && !loading && (
              <p className="text-sm text-amber-600">No hearings scheduled for today</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Display QR Code */}
      {selectedHearing && qrCodeImage && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Attendance QR Code
            </CardTitle>
            <CardDescription>
              Officers and witnesses can scan this QR code or enter the code manually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Case Info */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Case ID:</span>
                  <span className="text-sm">{selectedHearing.caseId?.caseId || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Hearing Date:</span>
                  <span className="text-sm">{new Date(selectedHearing.hearingDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Hearing Time:</span>
                  <span className="text-sm">{selectedHearing.hearingTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Court:</span>
                  <span className="text-sm">{selectedHearing.courtName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge>{selectedHearing.status}</Badge>
                </div>
              </div>

              {/* QR Code Image */}
              <div className="flex justify-center">
                <div className="border-4 border-gray-200 rounded-lg p-4 bg-white">
                  <img src={qrCodeImage} alt="QR Code" className="w-64 h-64" />
                </div>
              </div>

              {/* Manual Code */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <Label className="text-sm font-medium mb-2 block">Manual Attendance Code</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white p-3 rounded border font-mono text-sm break-all">
                    {selectedHearing.qrCode}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    className="flex-shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Officers and witnesses can enter this code manually if they cannot scan the QR code
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={handlePrintQR} className="flex-1">
                  Print QR Code
                </Button>
                <Button variant="outline" onClick={handleCopyCode} className="flex-1">
                  Copy Code
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GenerateQRCode;
