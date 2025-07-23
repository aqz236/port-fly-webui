import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/shared/components/ui/card";
import { Badge } from "~/shared/components/ui/badge";
import { ActionButton } from "~/shared/components/common/ActionButton";
import type { PortForward } from "~/shared/";

interface PortForwardCardProps {
  port: PortForward;
  onEdit?: (port: PortForward) => void;
  onToggleStatus?: (port: PortForward) => void;
}

export function PortForwardCard({ port, onEdit, onToggleStatus }: PortForwardCardProps) {
  const isActive = port.status === 'active';
  const getStatusText = () => {
    switch (port.status) {
      case 'active': return '活跃';
      case 'inactive': return '非活跃';
      case 'error': return '错误';
      default: return port.status;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{port.name}</CardTitle>
          <Badge variant={isActive ? "default" : "secondary"}>
            {getStatusText()}
          </Badge>
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
