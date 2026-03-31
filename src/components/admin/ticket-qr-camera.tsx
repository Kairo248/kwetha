"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { normalizeTicketScanInput } from "@/lib/ticket-scan";

type TicketQrCameraProps = {
  onDecoded: (ticketReference: string) => void;
};

export function TicketQrCamera({ onDecoded }: TicketQrCameraProps) {
  const [regionId] = useState(() => `ticket-qr-${crypto.randomUUID()}`);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [running, setRunning] = useState(false);

  const stop = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) {
      try {
        await scanner.stop();
      } catch {
        /* already stopped */
      }
      try {
        scanner.clear();
      } catch {
        /* ignore */
      }
    }
    setRunning(false);
  }, []);

  useEffect(() => {
    return () => {
      void stop();
    };
  }, [stop]);

  const start = async () => {
    await stop();
    const scanner = new Html5Qrcode(regionId);
    scannerRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (decodedText) => {
          const normalized = normalizeTicketScanInput(decodedText);
          if (normalized.length < 6) {
            toast.error("Invalid QR", { description: "Could not read a ticket reference from this code." });
            return;
          }
          void stop();
          onDecoded(normalized);
          toast.success("Ticket code captured");
        },
        () => {},
      );
      setRunning(true);
    } catch (error) {
      scannerRef.current = null;
      toast.error("Camera unavailable", {
        description: error instanceof Error ? error.message : "Allow camera access or use manual entry below.",
      });
    }
  };

  return (
    <div className="space-y-3">
      <div
        id={regionId}
        className="mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl border border-card-border bg-black/5 dark:bg-black/40"
      />
      <div className="flex flex-wrap gap-2">
        {!running ? (
          <Button type="button" variant="secondary" onClick={() => void start()}>
            Scan QR with camera
          </Button>
        ) : (
          <Button type="button" variant="ghost" onClick={() => void stop()}>
            Stop camera
          </Button>
        )}
      </div>
    </div>
  );
}
