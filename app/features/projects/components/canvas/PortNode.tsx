// Port 节点组件
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader } from "~/shared/components/ui/card";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import { 
  Network, 
  Settings,
  MoreHorizontal,
  Play,
  Square,
  ArrowRightLeft,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { PortNodeData } from './types';

interface PortNodeProps {
  data: PortNodeData;
  selected?: boolean;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'local':
      return <ArrowRight className="h-3 w-3" />;
    case 'remote':
      return <ArrowLeft className="h-3 w-3" />;
    case 'dynamic':
      return <ArrowRightLeft className="h-3 w-3" />;
    default:
      return <Network className="h-3 w-3" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'local':
      return '本地转发';
    case 'remote':
      return '远程转发';
    case 'dynamic':
      return '动态转发';
    default:
      return '未知';
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'error':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const PortNode = memo(({ data, selected }: PortNodeProps) => {
  const { port, status } = data;

  return (
    <div className="port-node">
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-1 !h-1" />
      
      <Card className={`min-w-[220px] transition-all duration-200 border-2 ${
        selected 
          ? 'border-blue-500 shadow-lg' 
          : 'border-border hover:shadow-md hover:border-blue-300'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-purple-100 flex items-center justify-center">
                <Network className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{port.name}</h3>
                <p className="text-xs text-muted-foreground truncate">
                  {port.local_port} → {port.remote_host}:{port.remote_port}
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
          {/* 端口转发类型和状态 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {getTypeIcon(port.type)}
              <span className="text-xs text-muted-foreground">
                {getTypeLabel(port.type)}
              </span>
            </div>
            <Badge variant={getStatusBadgeVariant(status) as any} className="text-xs">
              {status === 'active' && '活跃'}
              {status === 'inactive' && '未激活'}
              {status === 'error' && '错误'}
            </Badge>
          </div>
          
          {/* 端口信息 */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">本地端口:</span>
              <code className="bg-muted px-1 rounded">{port.local_port}</code>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">远程地址:</span>
              <code className="bg-muted px-1 rounded text-xs">
                {port.remote_host}:{port.remote_port}
              </code>
            </div>
          </div>
          
          {/* 自动启动标识 */}
          {port.auto_start && (
            <div className="flex items-center gap-1">
              <Play className="h-3 w-3 text-green-500" />
              <span className="text-xs text-muted-foreground">自动启动</span>
            </div>
          )}
          
          {/* 标签 */}
          {port.tags && port.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {port.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {port.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{port.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
          
          {/* 控制按钮 */}
          <div className="flex gap-1">
            {status === 'active' ? (
              <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
                <Square className="h-3 w-3 mr-1" />
                停止
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
                <Play className="h-3 w-3 mr-1" />
                启动
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-1 !h-1" />
    </div>
  );
});

PortNode.displayName = 'PortNode';
