import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { StatusBadge, StatusType } from "~/components/common/StatusBadge";
import { ActionButton } from "~/components/common/ActionButton";

export interface Host {
  id: number;
  name: string;
  hostname: string;
  status: 'connected' | 'disconnected';
}

interface HostCardProps {
  host: Host;
  onEdit?: (host: Host) => void;
  onToggleConnection?: (host: Host) => void;
}

export function HostCard({ host, onEdit, onToggleConnection }: HostCardProps) {
  const isConnected = host.status === 'connected';
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{host.name}</CardTitle>
          <StatusBadge status={host.status as StatusType} />
        </div>
        <CardDescription>{host.hostname}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between">
          <ActionButton 
            type="edit"
            onClick={() => onEdit?.(host)}
          />
          <ActionButton 
            type={isConnected ? 'disconnect' : 'connect'}
            onClick={() => onToggleConnection?.(host)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
