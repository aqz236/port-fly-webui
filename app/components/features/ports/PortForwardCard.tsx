import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { StatusBadge, StatusType } from "~/components/common/StatusBadge";
import { ActionButton } from "~/components/common/ActionButton";

export interface PortForward {
  id: number;
  name: string;
  type: string;
  local_port: number;
  remote_port: number;
  status: 'active' | 'inactive';
}

interface PortForwardCardProps {
  port: PortForward;
  onEdit?: (port: PortForward) => void;
  onToggleStatus?: (port: PortForward) => void;
}

export function PortForwardCard({ port, onEdit, onToggleStatus }: PortForwardCardProps) {
  const isActive = port.status === 'active';
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{port.name}</CardTitle>
          <StatusBadge status={port.status as StatusType} />
        </div>
        <CardDescription>
          {port.type} | {port.local_port} → {port.remote_port}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between">
          <ActionButton 
            type="edit"
            onClick={() => onEdit?.(port)}
          />
          <ActionButton 
            type={isActive ? 'stop' : 'start'}
            onClick={() => onToggleStatus?.(port)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
