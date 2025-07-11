"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NeedConsiderationProps {
  processNames: string[];
  isLoading: boolean;
}

export default function NeedConsideration({ processNames, isLoading }: NeedConsiderationProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>
          Need Consideration
          <Badge className="ml-2" variant="destructive">{processNames.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 w-32 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : processNames.length === 0 ? (
          <div className="text-muted-foreground">No processes need consideration.</div>
        ) : (
          <ul className="list-disc list-inside space-y-1 text-destructive">
            {processNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
