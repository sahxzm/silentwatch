"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Process, WindowInfo } from "@/lib/types";
import { useMemo } from "react";
import { ShieldAlert, CheckCircle } from "lucide-react";

type ReportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  processes: Process[];
  windows: WindowInfo[];
};

export default function ReportDialog({ isOpen, onClose, processes, windows }: ReportDialogProps) {
  const summary = useMemo(() => {
    const suspiciousProcesses = processes.filter(p => p.risk === 'High' || p.risk === 'Medium');
    const suspiciousWindows = windows.filter(w => w.isSuspicious);
    return {
      totalProcesses: processes.length,
      suspiciousProcesses: suspiciousProcesses.length,
      highRiskProcesses: processes.filter(p => p.risk === 'High').length,
      totalWindows: windows.length,
      suspiciousWindows: suspiciousWindows.length,
    };
  }, [processes, windows]);

  const isSecure = summary.suspiciousProcesses === 0 && summary.suspiciousWindows === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>System Security Report</DialogTitle>
          <DialogDescription>
            A summary of the security scan performed on {new Date().toLocaleString()}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className={`flex items-center p-4 rounded-lg ${isSecure ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
            {isSecure ? (
              <CheckCircle className="h-8 w-8 mr-4 text-green-600 dark:text-green-400" />
            ) : (
              <ShieldAlert className="h-8 w-8 mr-4 text-destructive" />
            )}
            <div>
              <h3 className={`font-bold ${isSecure ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                {isSecure ? "System Appears Secure" : "Potential Threats Detected"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isSecure ? "No high-risk items found." : "Review the details below."}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Process Analysis</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Total processes scanned: <span className="font-bold text-foreground">{summary.totalProcesses}</span></li>
              <li>Suspicious processes found: <span className="font-bold text-destructive">{summary.suspiciousProcesses}</span></li>
              <li>High-risk processes: <span className="font-bold text-destructive">{summary.highRiskProcesses}</span></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Window & Overlay Analysis</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Total windows scanned: <span className="font-bold text-foreground">{summary.totalWindows}</span></li>
              <li>Suspicious windows/overlays found: <span className="font-bold text-destructive">{summary.suspiciousWindows}</span></li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
