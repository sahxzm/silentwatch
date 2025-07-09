"use client";

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import type { LogEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

type LogPanelProps = {
    logs: LogEntry[];
}

export default function LogPanel({ logs }: LogPanelProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // A bit of a hack to get the viewport. The actual viewport is a child of the ref.
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if(viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [logs]);

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'Alert':
        return <ShieldAlert className="h-4 w-4 text-destructive" />;
      case 'Warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'Info':
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Event Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[525px]" ref={scrollAreaRef}>
          <div className="space-y-4 pr-4">
            {logs.map(log => (
              <div key={log.id} className="flex items-start gap-3">
                <div>{getLogIcon(log.type)}</div>
                <div className="flex-1">
                  <p className={cn("text-sm font-medium", {
                    "text-destructive": log.type === 'Alert',
                    "text-yellow-600": log.type === 'Warning',
                  })}>
                    {log.message}
                  </p>
                  <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
