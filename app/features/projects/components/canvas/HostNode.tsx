// Host 节点组件
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader } from "~/shared/components/ui/card";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import { 
  Server, 
  Settings,
  MoreHorizontal,
  Wifi,
  WifiOff,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { HostNodeData } from './types';

interface HostNodeProps {
  data: HostNodeData;
  selected?: boolean;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'connected':
      return <Wifi className="h-3 w-3 text-green-500" />;
    case 'disconnected':
      return <WifiOff className="h-3 w-3 text-gray-400" />;
    case 'connecting':
      return <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />;
    case 'error':
      return <AlertTriangle className="h-3 w-3 text-red-500" />;
    default:
      return <WifiOff className="h-3 w-3 text-gray-400" />;
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'connected':
      return 'default';
    case 'connecting':
      return 'secondary';
    case 'error':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const HostNode = memo(({ data, selected }: HostNodeProps) => {
  const { host, status } = data;

  return (
    <div className="host-node">
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-1 !h-1" />
      
      <Card className={`min-w-[240px] transition-all duration-200 border-2 ${
        selected 
          ? 'border-blue-500 shadow-lg' 
          : 'border-border hover:shadow-md hover:border-blue-300'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">
                <Server className="h-4 w-4 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{host.name}</h3>
                <p className="text-xs text-muted-foreground truncate">
                  {host.username}@{host.hostname}:{host.port}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Settings className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-3">
          {/* 连接状态 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status)}
              <Badge variant={getStatusBadgeVariant(status) as any} className="text-xs">
                {status === 'connected' && '已连接'}
                {status === 'disconnected' && '未连接'}
                {status === 'connecting' && '连接中'}
                {status === 'error' && '连接错误'}
              </Badge>
            </div>
            {host.last_connected && (
              <span className="text-xs text-muted-foreground">
                {new Date(host.last_connected).toLocaleDateString()}
              </span>
            )}
          </div>
          
          {/* 认证方式 */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">认证方式:</span>
            <Badge variant="outline" className="text-xs">
              {host.auth_method === 'password' && '密码'}
              {host.auth_method === 'key' && '密钥'}
              {host.auth_method === 'agent' && '代理'}
            </Badge>
          </div>
          
          {/* 标签 */}
          {host.tags && host.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {host.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {host.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{host.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
          
          {/* 连接次数 */}
          {host.connection_count > 0 && (
            <div className="text-xs text-muted-foreground text-center">
              连接次数: {host.connection_count}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-1 !h-1" />
    </div>
  );
});

HostNode.displayName = 'HostNode';
