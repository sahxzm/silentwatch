"use client";

import { useState, useEffect, useCallback } from 'react';
import { Shield, FileText, RefreshCw, Layers, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProcessMonitor from '@/components/process-monitor';
import OverlayScanner from '@/components/overlay-scanner';
import LogPanel from '@/components/log-panel';
import ReportDialog from '@/components/report-dialog';
import { mockProcesses, mockWindows, initialLogs } from '@/lib/mock-data';
import type { Process, WindowInfo, LogEntry } from '@/lib/types';
import { analyzeProcesses } from '@/ai/flows/process-flow';
import { analyzeWindows } from '@/ai/flows/window-analysis-flow';
import { useToast } from '@/hooks/use-toast';


export default function Home() {
  const [isReportOpen, setReportOpen] = useState(false);
  const [analyzedProcesses, setAnalyzedProcesses] = useState<Process[]>([]);
  const [analyzedWindows, setAnalyzedWindows] = useState<WindowInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);

  const { toast } = useToast();

  const addLog = (type: LogEntry['type'], message: string) => {
    const newLog: LogEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs(prev => [...prev, newLog]);
  };
  
  const runAnalysis = useCallback(async () => {
    setIsLoading(true);
    setAnalyzedProcesses([]);
    setAnalyzedWindows([]);
    addLog('Info', 'Starting AI-powered system scan...');
    try {
      const [processResults, windowResults] = await Promise.all([
        analyzeProcesses(mockProcesses),
        analyzeWindows(mockWindows),
      ]);
      
      setAnalyzedProcesses(processResults);
      addLog('Info', `Process scan complete. Analyzed ${processResults.length} processes.`);
      const highRisk = processResults.filter(p => p.risk === 'High');
      const mediumRisk = processResults.filter(p => p.risk === 'Medium');

      if (highRisk.length > 0) {
        addLog('Alert', `Detected ${highRisk.length} high-risk process(es): ${highRisk.map(p => p.name).join(', ')}.`);
      }
      if (mediumRisk.length > 0) {
        addLog('Warning', `Detected ${mediumRisk.length} medium-risk process(es): ${mediumRisk.map(p => p.name).join(', ')}.`);
      }
      
      setAnalyzedWindows(windowResults);
      addLog('Info', `Window scan complete. Analyzed ${windowResults.length} windows.`);
      const suspiciousWindows = windowResults.filter(w => w.isSuspicious);
      if (suspiciousWindows.length > 0) {
        addLog('Alert', `Detected ${suspiciousWindows.length} suspicious window(s): ${suspiciousWindows.map(w => w.name).join(', ')}.`);
      }

    } catch (error) {
      console.error("Analysis failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      addLog('Alert', `The AI analysis failed to complete. Details: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not complete the scan. Please check your API key and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  const handleRefresh = () => {
    setLogs(initialLogs); 
    runAnalysis();
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold font-headline text-foreground">
                Overwatch
              </h1>
            </div>
            <Button onClick={() => setReportOpen(true)} disabled={isLoading}>
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Tabs defaultValue="processes">
                <div className='flex justify-between items-center mb-4'>
                  <TabsList>
                    <TabsTrigger value="processes">
                      <ListChecks className="mr-2 h-4 w-4" />
                      Process Monitor
                    </TabsTrigger>
                    <TabsTrigger value="overlays">
                      <Layers className="mr-2 h-4 w-4" />
                      Overlay Scanner
                    </TabsTrigger>
                  </TabsList>
                   <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>

                <TabsContent value="processes">
                  <ProcessMonitor processes={analyzedProcesses} isLoading={isLoading} />
                </TabsContent>
                <TabsContent value="overlays">
                  <OverlayScanner windows={analyzedWindows} isLoading={isLoading} />
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="lg:col-span-1">
              <LogPanel logs={logs} />
            </div>
          </div>
        </div>
      </main>
      <ReportDialog 
        isOpen={isReportOpen} 
        onClose={() => setReportOpen(false)} 
        processes={analyzedProcesses} 
        windows={analyzedWindows} 
      />
    </div>
  );
}
