import { Badge } from "~/components/ui/badge";

export type StatusType = 'connected' | 'disconnected' | 'active' | 'inactive';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig = {
  connected: { variant: 'default' as const, label: '已连接' },
  disconnected: { variant: 'secondary' as const, label: '未连接' },
  active: { variant: 'default' as const, label: '活跃' },
  inactive: { variant: 'secondary' as const, label: '非活跃' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant={config.variant}
      className={`text-xs ${className}`}
    >
      {config.label}
    </Badge>
  );
}
