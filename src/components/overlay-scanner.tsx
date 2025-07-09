"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { WindowInfo } from '@/lib/types';
import { AlertTriangle } from 'lucide-react';

type OverlayScannerProps = {
  windows: WindowInfo[];
  isLoading: boolean;
};

export default function OverlayScanner({ windows, isLoading }: OverlayScannerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overlay & Window Scanner</CardTitle>
        <CardDescription>
          Detects hidden, transparent, or suspicious windows that could be cheating tools.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[450px]">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Window Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Properties</TableHead>
                <TableHead>Suspicious</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  </TableRow>
                ))
              ) : (
                windows.map((window) => (
                  <TableRow key={window.id} className={window.isSuspicious ? 'bg-destructive/10' : ''}>
                    <TableCell className="font-medium">{window.name}</TableCell>
                    <TableCell>
                      <Badge variant={window.isSuspicious ? "destructive" : "secondary"}>
                        {window.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{window.properties.join(', ')}</TableCell>
                    <TableCell>
                      {window.isSuspicious && (
                        <div className="flex items-center text-destructive">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          <span>Yes</span>
                        </div>
                      )}
                    </TableCell>
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
