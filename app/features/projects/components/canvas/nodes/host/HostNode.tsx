// HostNode.tsx - 主机节点组件
import { memo } from 'react';
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

import { Host } from '~/shared/types/host';
import { HostNodeData } from './types';
import { useTerminalStore } from '~/shared/store/terminalStore';

/**
 * 主机节点组件
 */
export const HostNode = memo(function HostNode({ data }: NodeProps) {
  const { 
    host,
    projectId,
    sessions = [],
    isExpanded = true,
    onEdit,
    onDelete,
    onConnect,
    onDisconnect,
    onOpenTerminal,
    onShowSessions
  } = data as unknown as HostNodeData;

  const { openTerminal } = useTerminalStore();

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
      onDisconnect?.(host.id);
    } else {
      onConnect?.(host.id);
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
    
    // 使用终端存储打开终端标签页
    openTerminal(host, projectId);
    onOpenTerminal?.(host.id);
  };

  // 处理终端状态变化 - 已移除本地状态管理，使用全局终端存储

  const activeSessions = sessions.filter(s => s.status === 'active');

  return (
    <>
      <div className="min-w-[280px] max-w-[320px]">
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
              <div className="flex items-center justify-between">
                <span>{host.username}@{host.hostname}:{host.port}</span>
                <Badge variant="secondary" className="text-xs">
                  {getAuthMethodText()}
                </Badge>
              </div>
              
              {host.description && (
                <div className="text-xs text-muted-foreground truncate">
                  {host.description}
                </div>
              )}
            </div>
          </CardHeader>

          {isExpanded && (
            <CardContent className="pt-0 space-y-3">
              {/* 统计信息 */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-muted/50 p-2 rounded">
                  <div className="font-medium">连接次数</div>
                  <div className="text-muted-foreground">{host.connection_count}</div>
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <div className="font-medium">活动会话</div>
                  <div className="text-muted-foreground">{activeSessions.length}</div>
                </div>
              </div>

              {/* 最近连接时间 */}
              {host.last_connected && (
                <div className="text-xs text-muted-foreground">
                  最近连接: {new Date(host.last_connected).toLocaleString()}
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-2">
                {/* 连接/断开按钮 */}
                <Button
                  variant={host.status === 'connected' ? 'destructive' : 'default'}
                  size="sm"
                  onClick={handleToggleConnection}
                  disabled={host.status === 'connecting'}
                  className="flex-1"
                >
                  {host.status === 'connected' ? (
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

                {/* 终端按钮 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenTerminal}
                  className="flex-1"
                  disabled={host.status === 'error'}
                >
                  <Terminal className="h-3 w-3 mr-1" />
                  终端
                </Button>
              </div>

              {/* 第二行按钮 */}
              <div className="flex gap-2">
                {/* 会话信息 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onShowSessions?.(host.id)}
                  className="flex-1"
                >
                  <Activity className="h-3 w-3 mr-1" />
                  会话
                </Button>

                {/* 编辑按钮 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit?.(host)}
                  className="h-8 px-2"
                >
                  <Edit className="h-3 w-3" />
                </Button>

                {/* 删除按钮 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(host.id)}
                  className="h-8 px-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              {/* 终端状态指示 - 现在由全局终端存储管理 */}
              {/* 可以从 useTerminalStore 获取当前主机的终端状态 */}

              {/* 错误信息 */}
              {host.status === 'error' && (
                <div className="bg-destructive/10 text-destructive p-2 rounded text-xs">
                  <div className="flex items-center gap-2">
                    <Info className="h-3 w-3" />
                    <span>连接失败，请检查主机配置</span>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>

      {/* SSH 终端现在由全局 TerminalPanel 管理，不需要在这里渲染 */}
    </>
  );
});

export default HostNode;
