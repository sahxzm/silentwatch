"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Process } from '@/lib/types';

type ProcessMonitorProps = {
  processes: Process[];
  isLoading: boolean;
};

export default function ProcessMonitor({ processes, isLoading }: ProcessMonitorProps) {

  const getRiskBadge = (risk: Process['risk']) => {
    switch (risk) {
      case 'High':
        return <Badge variant="destructive">High</Badge>;
      case 'Medium':
        return <Badge className="bg-yellow-400 text-yellow-950 hover:bg-yellow-400/80 border-transparent">Medium</Badge>;
      case 'Low':
        return <Badge variant="outline" className="text-green-600 border-green-600">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Process Monitor</CardTitle>
        <CardDescription>
          Real-time list of running processes and their AI-powered risk analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[450px]">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>PID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead className="hidden md:table-cell">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-64" /></TableCell>
                  </TableRow>
                ))
              ) : (
                processes.map((process) => (
                  <TableRow key={process.pid} className={process.risk === 'High' ? 'bg-destructive/10' : process.risk === 'Medium' ? 'bg-yellow-400/10' : ''}>
                    <TableCell className="font-medium">{process.pid}</TableCell>
                    <TableCell>{process.name}</TableCell>
                    <TableCell>{getRiskBadge(process.risk)}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{process.details}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
