import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/shared/components/ui/card";
import { Badge } from "~/shared/components/ui/badge";
import { StatusBadge, StatusType } from "~/shared/components/common/StatusBadge";
import { ActionButton } from "~/shared/components/common/ActionButton";
import type { Host } from "~/shared/types/api";

interface HostCardProps {
  host: Host;
  onEdit?: (host: Host) => void;
  onToggleConnection?: (host: Host) => void;
}

export function HostCard({ host, onEdit, onToggleConnection }: HostCardProps) {
  const isConnected = host.status === 'connected';
  const getStatusText = () => {
    switch (host.status) {
      case 'connected': return '已连接';
      case 'disconnected': return '已断开';
      case 'connecting': return '连接中';
      case 'error': return '错误';
      case 'unknown': return '未知';
      default: return host.status;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{host.name}</CardTitle>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {getStatusText()}
          </Badge>
        </div>
        <CardDescription>{host.hostname}:{host.port}</CardDescription>
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
