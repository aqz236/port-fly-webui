// GroupNode.tsx - ReactFlow 组节点组件
import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '~/shared/components/ui/card';
import { Button } from '~/shared/components/ui/button';
import { Badge } from '~/shared/components/ui/badge';
import { 
  Folder, 
  Plus, 
  Server, 
  Network,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Group } from '~/shared/types/group';
import { Host } from '~/shared/types/host';
import { PortForward } from '~/shared/types/port-forward';

export interface GroupNodeData {
  group: Group;
  hosts: Host[];
  portForwards: PortForward[];
  isExpanded?: boolean;
  onEdit: (group: Group) => void;
  onDelete: (groupId: number) => void;
  onAddHost: (groupId: number) => void;
  onAddPort: (groupId: number) => void;
  onToggleExpand: (groupId: number) => void;
  onHostEdit: (host: Host) => void;
  onHostDelete: (hostId: number) => void;
  onHostConnect: (hostId: number) => void;
  onPortEdit: (port: PortForward) => void;
  onPortDelete: (portId: number) => void;
  onPortToggle: (portId: number) => void;
}

export default memo(function GroupNode({ data }: NodeProps) {
  const { 
    group, 
    hosts, 
    portForwards, 
    isExpanded = true,
    onEdit,
    onDelete,
    onAddHost,
    onAddPort,
    onToggleExpand,
    onHostEdit,
    onHostDelete,
    onHostConnect,
    onPortEdit,
    onPortDelete,
    onPortToggle
  } = data as unknown as GroupNodeData;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(group);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(group.id);
  };

  const handleAddHost = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddHost(group.id);
  };

  const handleAddPort = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddPort(group.id);
  };

  const handleToggleExpand = () => {
    onToggleExpand(group.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="min-w-[320px] max-w-[400px]">
      {/* 连接点 */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />

      <Card className="shadow-lg border-2 hover:border-primary/20 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                style={{ backgroundColor: group.color }}
              >
                <Folder className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{group.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleExpand}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* 统计信息 */}
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              <Server className="h-3 w-3 mr-1" />
              {hosts.length} 主机
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Network className="h-3 w-3 mr-1" />
              {portForwards.length} 端口
            </Badge>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0 space-y-3">
            {/* 主机列表 */}
            {hosts.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-muted-foreground">主机</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddHost}
                    className="h-6 px-2 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    添加
                  </Button>
                </div>
                <div className="space-y-1">
                  {hosts.map((host) => (
                    <div 
                      key={host.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(host.status)}`} />
                        <span className="font-medium">{host.name}</span>
                        <span className="text-muted-foreground">
                          {host.username}@{host.hostname}:{host.port}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onHostConnect(host.id);
                          }}
                          className="h-6 w-6 p-0"
                          disabled={host.status === 'connecting'}
                        >
                          <Server className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onHostEdit(host);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onHostDelete(host.id);
                          }}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 端口转发列表 */}
            {portForwards.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-muted-foreground">端口转发</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddPort}
                    className="h-6 px-2 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    添加
                  </Button>
                </div>
                <div className="space-y-1">
                  {portForwards.map((port) => (
                    <div 
                      key={port.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(port.status)}`} />
                        <span className="font-medium">{port.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {port.type.toUpperCase()}
                        </Badge>
                        <span className="text-muted-foreground font-mono">
                          :{port.local_port} → {port.remote_host}:{port.remote_port}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPortToggle(port.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Network className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPortEdit(port);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPortDelete(port.id);
                          }}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 空状态和添加按钮 */}
            {hosts.length === 0 && portForwards.length === 0 && (
              <div className="text-center py-4 space-y-2">
                <p className="text-sm text-muted-foreground">暂无资源</p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddHost}
                    className="h-8 px-3 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    添加主机
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddPort}
                    className="h-8 px-3 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    添加端口
                  </Button>
                </div>
              </div>
            )}

            {/* 只有其中一种资源时的快速添加 */}
            {hosts.length === 0 && portForwards.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddHost}
                className="w-full h-8 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                添加主机
              </Button>
            )}

            {portForwards.length === 0 && hosts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddPort}
                className="w-full h-8 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                添加端口转发
              </Button>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
});
