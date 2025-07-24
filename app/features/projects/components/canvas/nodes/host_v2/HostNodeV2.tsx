// HostNodeV2.tsx - 基于节点管理器的主机节点组件
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '~/shared/components/ui/card';
import { Button } from '~/shared/components/ui/button';
import { Badge } from '~/shared/components/ui/badge';
import { 
  Server, 
  Terminal, 
  Edit, 
  Trash2, 
  Play, 
  Square, 
  Activity,
  Info
} from 'lucide-react';
import { useNavigate } from "@remix-run/react";

import { registerNode, createNodeConfig, withNodeBase, useNodeLifecycle, attachNodeConfig } from '../manager';
import { BaseNodeData } from '../manager/types';
import { Host } from '~/shared/types/host';
import { TunnelSession } from '~/shared/types/session';
import { useTerminalStore } from '~/shared/store/terminalStore';

// 扩展基础节点数据，添加主机特定数据
export interface HostNodeV2Data extends BaseNodeData {
  host: Host;
  projectId: number;
  sessions?: TunnelSession[];
  isExpanded?: boolean;
}

/**
 * 主机节点V2组件
 */
const HostNodeV2Component = memo(function HostNodeV2({ id, data, selected }: NodeProps) {
  const {
    host,
    projectId,
    sessions = [],
    isExpanded = true,
    onEdit,
    onDelete,
    onConnect,
    onDisconnect,
  } = data as HostNodeV2Data;

  const { openTerminal } = useTerminalStore();
  const navigate = useNavigate();

  // 使用节点生命周期钩子
  useNodeLifecycle(id, data, {
    onMount: (nodeId, data) => {
      console.log(`主机节点 ${nodeId} 已挂载`, data);
    },
    onUpdate: (nodeId, oldData, newData) => {
      console.log(`主机节点 ${nodeId} 数据已更新`, { oldData, newData });
    },
    onUnmount: (nodeId) => {
      console.log(`主机节点 ${nodeId} 已卸载`);
    }
  });

  // 获取状态颜色
  const getStatusColor = () => {
    switch (host.status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  // 获取状态文本
  const getStatusText = () => {
    switch (host.status) {
      case 'connected': return '已连接';
      case 'connecting': return '连接中';
      case 'disconnected': return '已断开';
      case 'error': return '错误';
      default: return '未知';
    }
  };

  // 获取认证方式文本
  const getAuthMethodText = () => {
    switch (host.auth_method) {
      case 'password': return '密码';
      case 'key': return '密钥';
      case 'agent': return 'SSH Agent';
      default: return host.auth_method;
    }
  };

  // 处理连接/断开
  const handleToggleConnection = () => {
    if (host.status === 'connected') {
      onDisconnect?.(String(host.id));
    } else {
      onConnect?.(String(host.id));
    }
  };

  // 处理打开终端
  const handleOpenTerminal = () => {
    // 检查主机状态
    if (host.status === 'error') {
      alert('主机连接有错误，请先修复连接问题');
      return;
    }
    
    if (host.status !== 'connected') {
      alert('请先连接主机');
      return;
    }
    
    // 使用终端存储打开终端会话
    openTerminal(host, projectId);
    
    // 使用路由导航到终端页面
    navigate(`/app/terminal/${host.id}`);
  };

  // 处理编辑
  const handleEdit = () => {
    onEdit?.(id);
  };

  // 处理删除
  const handleDelete = () => {
    onDelete?.(id);
  };

  const activeSessions = sessions.filter(s => s.status === 'active');

  return (
    <div className={`min-w-[280px] max-w-[320px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      {/* 连接点 */}
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
        style={{ width: '12px', height: '12px' }}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
        style={{ width: '12px', height: '12px' }}
      />

      <Card className="shadow-lg border-2 hover:border-primary/20 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-sm font-medium">
                {host.name}
              </CardTitle>
            </div>
            
            <div className="flex items-center gap-1">
              {/* 状态指示器 */}
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
              <Badge variant="outline" className="text-xs">
                {getStatusText()}
              </Badge>
            </div>
          </div>
          
          {/* 主机信息 */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>地址:</span>
              <span className="text-foreground">{host.hostname}:{host.port}</span>
            </div>
            <div className="flex justify-between">
              <span>用户:</span>
              <span className="text-foreground">{host.username}</span>
            </div>
            <div className="flex justify-between">
              <span>认证:</span>
              <span className="text-foreground">{getAuthMethodText()}</span>
            </div>
            {host.description && (
              <div className="flex justify-between">
                <span>描述:</span>
                <span className="text-foreground truncate max-w-[150px]" title={host.description}>
                  {host.description}
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* 连接控制 */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={host.status === 'connected' ? 'destructive' : 'default'}
              className="flex-1"
              onClick={handleToggleConnection}
              disabled={host.status === 'connecting'}
            >
              {host.status === 'connecting' ? (
                <>
                  <Activity className="h-3 w-3 mr-1 animate-spin" />
                  连接中...
                </>
              ) : host.status === 'connected' ? (
                <>
                  <Square className="h-3 w-3 mr-1" />
                  断开
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  连接
                </>
              )}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenTerminal}
              disabled={host.status !== 'connected'}
              title="打开终端"
            >
              <Terminal className="h-3 w-3" />
            </Button>
          </div>

          {/* 会话信息 */}
          {activeSessions.length > 0 && (
            <div className="border-t pt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>活跃会话</span>
                <Badge variant="secondary" className="text-xs">
                  {activeSessions.length}
                </Badge>
              </div>
              <div className="space-y-1">
                {activeSessions.slice(0, 2).map((session) => (
                  <div key={session.id} className="text-xs flex justify-between items-center">
                    <span className="truncate">会话 {session.id}</span>
                    <Badge variant="outline" className="text-xs">
                      隧道
                    </Badge>
                  </div>
                ))}
                {activeSessions.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    还有 {activeSessions.length - 2} 个会话...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-1 border-t">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEdit}
              className="flex-1"
            >
              <Edit className="h-3 w-3 mr-1" />
              编辑
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

// 创建节点配置并附加到组件
const hostNodeV2Config = createNodeConfig({
  type: 'hostV2',
  displayName: 'SSH主机 V2',
  description: '基于新架构的SSH主机连接节点，支持终端连接和会话管理',
  icon: React.createElement(Server, { className: "w-4 h-4" }),
  categoryId: 'host',
  version: '2.0.0',
  tags: ['ssh', '主机', '终端', '连接'],
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
    host: Host;
    projectId: number;
    label?: string;
    description?: string;
    sessions?: TunnelSession[];
    onEdit?: (nodeId: string) => void;
    onDelete?: (nodeId: string) => void;
    onConnect?: (nodeId: string) => void;
    onDisconnect?: (nodeId: string) => void;
  }) => ({
    id: params.id || '',
    type: 'hostV2',
    label: params.label || params.host.name,
    description: params.description || params.host.description || '主机节点',
    status: 'inactive' as const,
    host: params.host,
    projectId: params.projectId,
    sessions: params.sessions || [],
    isExpanded: true,
    onEdit: params.onEdit,
    onDelete: params.onDelete,
    onConnect: params.onConnect,
    onDisconnect: params.onDisconnect,
    metadata: {
      hostId: params.host.id,
      projectId: params.projectId,
      nodeVersion: '2.0.0'
    }
  }),
  validateNodeData: (data: any) => {
    return !!(
      data &&
      data.id &&
      data.type === 'hostV2' &&
      data.host &&
      data.host.id &&
      data.host.name &&
      data.projectId
    );
  }
});

// 导出带包装器的组件，并附加配置元数据
export const HostNodeV2 = attachNodeConfig(
  withNodeBase(HostNodeV2Component),
  hostNodeV2Config
);

// 使用装饰器注册节点（用于主动注册）
registerNode({
  ...hostNodeV2Config,
  component: HostNodeV2
});

export default HostNodeV2;
