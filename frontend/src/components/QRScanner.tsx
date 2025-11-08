import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type QRScannerProps = {
  onDetected: (code: string) => void;
};

export default function QRScanner({ onDetected }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scanning, setScanning] = useState(false);
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    // Detect if BarcodeDetector is available
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const hasBarcode = typeof window !== "undefined" && (window as any).BarcodeDetector;
    setSupported(!!hasBarcode);
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let detector: any = null;
    let rafId: number | null = null;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) videoRef.current.srcObject = stream;
        await videoRef.current?.play();

        // Use BarcodeDetector if present
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if ((window as any).BarcodeDetector) {
          // @ts-ignore
          detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });

          const detect = async () => {
            try {
              if (!videoRef.current) return;
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const code = barcodes[0].rawValue || barcodes[0].rawData || "";
                if (code) {
                  stop();
                  onDetected(code);
                }
              }
            } catch (err) {
              // ignore per-frame detection errors
            }
            rafId = requestAnimationFrame(detect);
          };

          rafId = requestAnimationFrame(detect);
        } else {
          // BarcodeDetector not available; let user use manual input
          toast.info("Camera scanning not supported - use manual code entry.");
        }
      } catch (error) {
        console.error("Camera start error:", error);
        toast.error("Unable to access camera. Use manual code entry.");
      }
    };

    const stop = () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (videoRef.current) {
        try { videoRef.current.pause(); } catch {}
        videoRef.current.srcObject = null;
      }
      setScanning(false);
    };

    if (scanning) start();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={scanning ? "destructive" : "default"} onClick={() => setScanning((s) => !s)}>
          {scanning ? "Stop Camera" : "Start Camera"}
        </Button>
      </div>

      <div className="rounded-md overflow-hidden border">
        {scanning ? (
          <video ref={videoRef} className="w-full h-64 object-cover" muted playsInline />
        ) : (
          <div className="flex items-center justify-center h-64 bg-slate-50 text-sm text-muted-foreground">
            {supported === false
              ? "Camera scanning not supported — use manual code entry."
              : "Start camera to scan QR code or enter code below."}
          </div>
        )}
      </div>
    </div>
  );
}
