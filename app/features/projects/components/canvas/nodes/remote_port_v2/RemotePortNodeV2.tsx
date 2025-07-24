// RemotePortNodeV2.tsx - 基于节点管理器的远程端口节点组件
import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '~/shared/components/ui/card';
import { Button } from '~/shared/components/ui/button';
import { Badge } from '~/shared/components/ui/badge';
import { 
  Network,
  Edit3, 
  Trash2, 
  Play, 
  Square, 
  RotateCcw,
  Wifi,
  WifiOff,
  AlertCircle,
  Activity
} from 'lucide-react';

import { registerNode, createNodeConfig, withNodeBase, useNodeLifecycle, attachNodeConfig } from '../manager';
import { BaseNodeData } from '../manager/types';
import { Port } from '~/shared/types/port';
import { useStartPort, useStopPort, useRestartPort } from '~/shared/hooks/use-ports';
import { cn } from '~/lib/utils';

// 扩展基础节点数据，添加远程端口特定数据
export interface RemotePortNodeV2Data extends BaseNodeData {
  port: Port;
  projectId: number;
  groupId: number;
  isExpanded?: boolean;
  // 生命周期回调
  onEdit?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
  onStart?: (portId: number) => void;
  onStop?: (portId: number) => void;
  onRestart?: (portId: number) => void;
}

// 状态映射：将 PortStatus 映射到 BaseNodeData.status
const mapPortStatusToNodeStatus = (portStatus: Port['status']): BaseNodeData['status'] => {
  switch (portStatus) {
    case 'active':
      return 'active';
    case 'inactive':
      return 'inactive';
    case 'error':
      return 'error';
    case 'connecting':
      return 'pending'; // 将 connecting 映射到 pending
    default:
      return 'inactive';
  }
};

// 状态图标映射
const statusIcons = {
  active: Wifi,
  inactive: WifiOff,
  error: AlertCircle,
  connecting: Network,
};

// 状态颜色映射
const statusColors = {
  active: 'bg-green-100 text-green-700 border-green-200',
  inactive: 'bg-gray-100 text-gray-700 border-gray-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  connecting: 'bg-orange-100 text-orange-700 border-orange-200',
};

/**
 * 远程端口节点V2组件
 */
const RemotePortNodeV2Component = memo(function RemotePortNodeV2({ id, data, selected }: NodeProps) {
  const {
    port,
    projectId,
    groupId,
    isExpanded = true,
    onEdit,
    onDelete,
    onStart,
    onStop,
    onRestart,
  } = data as RemotePortNodeV2Data;

  // 使用节点生命周期钩子
  useNodeLifecycle(id, data, {
    onMount: (nodeId, data) => {
      console.log(`远程端口节点 ${nodeId} 已挂载`, data);
    },
    onUpdate: (nodeId, oldData, newData) => {
      console.log(`远程端口节点 ${nodeId} 数据已更新`, { oldData, newData });
    },
    onUnmount: (nodeId) => {
      console.log(`远程端口节点 ${nodeId} 已卸载`);
    },
  });

  // Port 控制 hooks
  const { mutate: startPort, isPending: isStarting } = useStartPort();
  const { mutate: stopPort, isPending: isStopping } = useStopPort();
  const { mutate: restartPort, isPending: isRestarting } = useRestartPort();

  // 状态图标
  const StatusIcon = statusIcons[port.status];

  // 控制操作
  const handleStart = useCallback(() => {
    if (onStart) {
      onStart(port.id);
    } else {
      startPort(port.id, {
        onSuccess: () => {
          console.log('端口启动成功');
        },
        onError: (error) => {
          console.error('启动端口失败:', error);
        }
      });
    }
  }, [onStart, port.id, startPort]);

  const handleStop = useCallback(() => {
    if (onStop) {
      onStop(port.id);
    } else {
      stopPort(port.id, {
        onSuccess: () => {
          console.log('端口停止成功');
        },
        onError: (error) => {
          console.error('停止端口失败:', error);
        }
      });
    }
  }, [onStop, port.id, stopPort]);

  const handleRestart = useCallback(() => {
    if (onRestart) {
      onRestart(port.id);
    } else {
      restartPort(port.id, {
        onSuccess: () => {
          console.log('端口重启成功');
        },
        onError: (error) => {
          console.error('重启端口失败:', error);
        }
      });
    }
  }, [onRestart, port.id, restartPort]);

  const handleEdit = useCallback(() => {
    onEdit?.(id);
  }, [onEdit, id]);

  const handleDelete = useCallback(() => {
    onDelete?.(id);
  }, [onDelete, id]);

  // 端口信息
  const portInfo = React.useMemo(() => {
    const info = [`远程端口: ${port.port}`];
    if (port.target_host && port.target_port) {
      info.push(`目标: ${port.target_host}:${port.target_port}`);
    }
    return info;
  }, [port]);

  // 控制按钮
  const controlButtons = React.useMemo(() => {
    const buttons = [];
    const isLoading = isStarting || isStopping || isRestarting;
    
    if (port.status === 'inactive' || port.status === 'error') {
      buttons.push(
        <Button
          key="start"
          variant="outline"
          size="sm"
          onClick={handleStart}
          disabled={isLoading}
          className="h-8 px-2"
        >
          <Play className="w-3 h-3" />
        </Button>
      );
    }
    
    if (port.status === 'active' || port.status === 'connecting') {
      buttons.push(
        <Button
          key="stop"
          variant="outline"
          size="sm"
          onClick={handleStop}
          disabled={isLoading}
          className="h-8 px-2"
        >
          <Square className="w-3 h-3" />
        </Button>
      );
    }
    
    if (port.status !== 'connecting') {
      buttons.push(
        <Button
          key="restart"
          variant="outline"
          size="sm"
          onClick={handleRestart}
          disabled={isLoading}
          className="h-8 px-2"
        >
          <RotateCcw className="w-3 h-3" />
        </Button>
      );
    }

    return buttons;
  }, [port.status, handleStart, handleStop, handleRestart, isStarting, isStopping, isRestarting]);

  return (
    <div className="remote-port-node-v2">
      {/* 输入连接点 */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ 
          background: port.color || '#ef4444',
          border: '2px solid white',
          width: 12,
          height: 12,
        }}
        isConnectable={true}
      />

      <Card 
        className={cn(
          'min-w-[280px] transition-all duration-200',
          selected && 'ring-2 ring-red-500 ring-offset-2',
          'hover:shadow-lg'
        )}
        style={{ 
          borderTopColor: port.color || '#ef4444',
          borderTopWidth: '3px',
        }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {port.icon && <span className="text-lg">{port.icon}</span>}
              <Network className="w-4 h-4 text-red-600" />
              <span className="font-semibold text-sm truncate">
                {port.name}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <Badge 
                variant="outline" 
                className={cn("text-xs", statusColors[port.status])}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {port.status === 'active' ? '运行中' : 
                 port.status === 'inactive' ? '已停止' :
                 port.status === 'error' ? '错误' : '连接中'}
              </Badge>
            </div>
          </CardTitle>
          
          {port.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {port.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          {/* 端口信息 */}
          <div className="space-y-1 mb-3">
            {portInfo.map((info, index) => (
              <div key={index} className="text-xs text-muted-foreground font-mono">
                {info}
              </div>
            ))}
          </div>

          {/* 展开的详细信息 */}
          {isExpanded && (
            <div className="space-y-2 mb-3 p-2 bg-muted/30 rounded">
              <div className="text-xs">
                <strong>自动启动:</strong> {port.auto_start ? '是' : '否'}
              </div>
              <div className="text-xs">
                <strong>端口类型:</strong> 远程端口
              </div>
              <div className="text-xs">
                <strong>可见性:</strong> {port.is_visible ? '可见' : '隐藏'}
              </div>
              {port.tags.length > 0 && (
                <div className="text-xs">
                  <strong>标签:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {port.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 控制按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {controlButtons}
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 px-2"
              >
                <Edit3 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 px-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 输出连接点 */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ 
          background: port.color || '#ef4444',
          border: '2px solid white',
          width: 12,
          height: 12,
        }}
        isConnectable={true}
      />
    </div>
  );
});

// 创建节点配置
const remotePortNodeV2Config = createNodeConfig({
  type: 'remotePortV2',
  displayName: '远程端口 V2',
  description: '远程端口转发节点，支持远程端口映射和管理',
  icon: React.createElement(Network, { className: "w-4 h-4" }),
  categoryId: 'network',
  version: '2.0.0',
  tags: ['port', 'remote', 'tunnel', 'forward'],
  resizable: true,
  connectable: true,
  deletable: true,
  draggable: true,
  selectable: true,
  defaultStyle: {
    width: 300,
    height: 200,
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderWidth: 2,
    borderRadius: 8
  },
  createNodeData: (params: {
    id?: string;
    port: Port;
    projectId: number;
    groupId: number;
    label?: string;
    description?: string;
    onEdit?: (nodeId: string) => void;
    onDelete?: (nodeId: string) => void;
    onStart?: (portId: number) => void;
    onStop?: (portId: number) => void;
    onRestart?: (portId: number) => void;
  }) => ({
    id: params.id || '',
    type: 'remotePortV2',
    label: params.label || params.port.name,
    description: params.description || params.port.description || '远程端口节点',
    status: mapPortStatusToNodeStatus(params.port.status) || 'inactive',
    port: params.port,
    projectId: params.projectId,
    groupId: params.groupId,
    isExpanded: true,
    onEdit: params.onEdit,
    onDelete: params.onDelete,
    onStart: params.onStart,
    onStop: params.onStop,
    onRestart: params.onRestart,
    metadata: {
      portId: params.port.id,
      projectId: params.projectId,
      groupId: params.groupId,
      nodeVersion: '2.0.0'
    }
  }),
  validateNodeData: (data: any) => {
    return !!(
      data &&
      data.id &&
      data.type === 'remotePortV2' &&
      data.port &&
      data.port.id &&
      data.port.name &&
      data.port.type === 'remote' &&
      data.projectId &&
      data.groupId
    );
  }
});

// 导出带包装器的组件，并附加配置元数据
export const RemotePortNodeV2 = attachNodeConfig(
  withNodeBase(RemotePortNodeV2Component),
  remotePortNodeV2Config
);

// 使用装饰器注册节点（用于主动注册）
registerNode({
  ...remotePortNodeV2Config,
  component: RemotePortNodeV2
});

export default RemotePortNodeV2;
