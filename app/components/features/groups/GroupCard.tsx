import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Server, Zap } from "lucide-react";
import type { Group } from "~/types/api";

interface GroupCardProps {
  group: Group;
  onClick?: () => void;
  className?: string;
}

export function GroupCard({ group, onClick, className }: GroupCardProps) {
  return (
    <Card 
      className={`hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: group.color }}
          />
          <CardTitle className="text-base">{group.name}</CardTitle>
        </div>
        <CardDescription>{group.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Server className="h-4 w-4" />
          <span>{group.hosts?.length || 0} 主机</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="h-4 w-4" />
          <span>{group.port_forwards?.length || 0} 端口转发</span>
        </div>
      </CardContent>
    </Card>
  );
}
