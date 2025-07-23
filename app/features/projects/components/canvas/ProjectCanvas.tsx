// 项目画布组件 - 使用 ReactFlow 实现可视化管理
import { useCallback, useMemo, useState, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  useReactFlow,
  ReactFlowInstance,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from "~/shared/components/ui/button";
import { Badge } from "~/shared/components/ui/badge";
import { 
  Plus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Upload,
  Layout,
  Database,
  Server,
  Network
} from "lucide-react";

import { GroupNode } from './GroupNode';
import { HostNode } from './HostNode';
import { PortNode } from './PortNode';
import { CanvasContextMenu } from './CanvasContextMenu';
import { 
  CanvasAction, 
  CanvasContextMenuData,
  GroupNodeData,
  HostNodeData,
  PortNodeData
} from './types';

import { Project } from '~/shared/types/project';
import { Group } from '~/shared/types/group';
import { Host } from '~/shared/types/host';
import { PortForward } from '~/shared/types/port-forward';

// 节点类型映射
const nodeTypes = {
  group: GroupNode,
  host: HostNode,
  port: PortNode,
};

interface ProjectCanvasProps {
  project: Project;
  onCreateGroup?: (data: any) => void;
  onCreateHost?: (groupId: number, data: any) => void;
  onCreatePort?: (groupId: number, hostId: number, data: any) => void;
  onEditNode?: (nodeType: string, nodeId: number, data: any) => void;
  onDeleteNode?: (nodeType: string, nodeId: number) => void;
  onConnectHost?: (hostId: number) => void;
  onStartPortForward?: (portId: number) => void;
  onStopPortForward?: (portId: number) => void;
}

const ProjectCanvasContent = ({ 
  project,
  onCreateGroup,
  onCreateHost,
  onCreatePort,
  onEditNode,
  onDeleteNode,
  onConnectHost,
  onStartPortForward,
  onStopPortForward,
}: ProjectCanvasProps) => {
  const [contextMenu, setContextMenu] = useState<CanvasContextMenuData | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, setViewport, getViewport } = useReactFlow();

  // 根据项目数据生成节点和边
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    if (!project.groups) return { initialNodes: nodes, initialEdges: edges };

    let yOffset = 0;
    const groupSpacing = 400;
    const nodeSpacing = 200;

    project.groups.forEach((group, groupIndex) => {
      const groupX = 50;
      const groupY = yOffset;
      
      // 创建组节点
      const groupNodeData: GroupNodeData = {
        id: group.id,
        name: group.name,
        description: group.description,
        color: group.color,
        type: 'group',
        group,
        stats: {
          hostCount: group.hosts?.length || 0,
          portCount: group.port_forwards?.length || 0,
          activeConnections: 0, // 需要从实际数据获取
        }
      };

      nodes.push({
        id: `group-${group.id}`,
        type: 'group',
        position: { x: groupX, y: groupY },
        data: groupNodeData,
      });

      let hostY = groupY + 150;
      
      // 创建主机节点
      if (group.hosts) {
        group.hosts.forEach((host, hostIndex) => {
          const hostX = groupX + 300 + (hostIndex % 2) * 280;
          if (hostIndex > 0 && hostIndex % 2 === 0) {
            hostY += 180;
          }

          const hostNodeData: HostNodeData = {
            id: host.id,
            name: host.name,
            description: host.description,
            color: '#6b7280',
            type: 'host',
            host,
            groupId: group.id,
            status: (host.status === 'unknown' ? 'disconnected' : host.status) || 'disconnected',
          };

          nodes.push({
            id: `host-${host.id}`,
            type: 'host',
            position: { x: hostX, y: hostY },
            data: hostNodeData,
          });

          // 连接组到主机
          edges.push({
            id: `group-${group.id}-host-${host.id}`,
            source: `group-${group.id}`,
            target: `host-${host.id}`,
            type: 'smoothstep',
            animated: host.status === 'connected',
            style: { 
              stroke: host.status === 'connected' ? '#10b981' : '#d1d5db',
              strokeWidth: 2 
            },
          });
        });
      }

      // 创建端口转发节点
      if (group.port_forwards) {
        let portY = hostY + 150;
        group.port_forwards.forEach((port, portIndex) => {
          const portX = groupX + 600 + (portIndex % 3) * 240;
          if (portIndex > 0 && portIndex % 3 === 0) {
            portY += 180;
          }

          const portNodeData: PortNodeData = {
            id: port.id,
            name: port.name,
            description: port.description,
            color: '#8b5cf6',
            type: 'port',
            port,
            groupId: group.id,
            hostId: port.host_id,
            status: port.status || 'inactive',
          };

          nodes.push({
            id: `port-${port.id}`,
            type: 'port',
            position: { x: portX, y: portY },
            data: portNodeData,
          });

          // 连接主机到端口转发
          if (port.host_id) {
            edges.push({
              id: `host-${port.host_id}-port-${port.id}`,
              source: `host-${port.host_id}`,
              target: `port-${port.id}`,
              type: 'smoothstep',
              animated: port.status === 'active',
              style: { 
                stroke: port.status === 'active' ? '#8b5cf6' : '#d1d5db',
                strokeWidth: 2 
              },
            });
          }
        });
      }

      yOffset += groupSpacing;
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [project]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 初始化节点和边
  useState(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  });

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleCanvasAction = useCallback((action: CanvasAction, nodeId?: string) => {
    const node = nodeId ? nodes.find(n => n.id === nodeId) : null;
    const nodeData = node?.data as any;
    
    switch (action) {
      case 'create-group':
        onCreateGroup?.({});
        break;
      case 'create-host':
        if (nodeData?.type === 'group') {
          onCreateHost?.(nodeData.group.id, {});
        }
        break;
      case 'create-port':
        if (nodeData?.type === 'host') {
          onCreatePort?.(nodeData.groupId, nodeData.host.id, {});
        } else if (nodeData?.type === 'group') {
          // 需要选择主机
          onCreatePort?.(nodeData.group.id, 0, {});
        }
        break;
      case 'edit':
        if (nodeData) {
          onEditNode?.(nodeData.type, nodeData.id, nodeData);
        }
        break;
      case 'delete':
        if (nodeData) {
          onDeleteNode?.(nodeData.type, nodeData.id);
        }
        break;
      case 'connect':
        if (nodeData?.type === 'host') {
          onConnectHost?.(nodeData.host.id);
        } else if (nodeData?.type === 'port') {
          onStartPortForward?.(nodeData.port.id);
        }
        break;
      case 'disconnect':
        if (nodeData?.type === 'port') {
          onStopPortForward?.(nodeData.port.id);
        }
        break;
    }
    setContextMenu(null);
  }, [nodes, onCreateGroup, onCreateHost, onCreatePort, onEditNode, onDeleteNode, onConnectHost, onStartPortForward, onStopPortForward]);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    // 简化右键菜单，暂时只在空白区域显示创建菜单
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      actions: ['create-group', 'create-host', 'create-port'],
    });
  }, []);

  const resetView = useCallback(() => {
    fitView({ duration: 800 });
  }, [fitView]);

  const autoLayout = useCallback(() => {
    // 重新计算布局
    setNodes(initialNodes);
    setEdges(initialEdges);
    setTimeout(() => fitView({ duration: 800 }), 100);
  }, [initialNodes, initialEdges, setNodes, setEdges, fitView]);

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <CanvasContextMenu onAction={handleCanvasAction} contextData={contextMenu || undefined}>
        <div className="h-full w-full" onContextMenu={handleContextMenu}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
            className="bg-slate-50"
          >
            <Background gap={20} size={1} color="#e2e8f0" />
            <Controls position="top-left" />
            <MiniMap 
              position="bottom-right"
              nodeColor={(node: Node) => {
                const data = node.data as any;
                if (data.type === 'group') return data.color;
                if (data.type === 'host') return '#6b7280';
                return '#8b5cf6';
              }}
            />
            
            {/* 顶部工具栏 */}
            <Panel position="top-center">
              <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border p-2">
                <Button variant="outline" size="sm" onClick={() => handleCanvasAction('create-group')}>
                  <Database className="h-4 w-4 mr-2" />
                  创建组
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleCanvasAction('create-host')}>
                  <Server className="h-4 w-4 mr-2" />
                  创建主机
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleCanvasAction('create-port')}>
                  <Network className="h-4 w-4 mr-2" />
                  创建端口
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button variant="outline" size="sm" onClick={autoLayout}>
                  <Layout className="h-4 w-4 mr-2" />
                  自动布局
                </Button>
                <Button variant="outline" size="sm" onClick={resetView}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  重置视图
                </Button>
              </div>
            </Panel>

            {/* 统计信息面板 */}
            <Panel position="top-right">
              <div className="bg-white rounded-lg shadow-sm border p-3 space-y-2">
                <div className="text-sm font-medium text-center">资源统计</div>
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">组:</span>
                    <Badge variant="secondary">{project.groups?.length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">主机:</span>
                    <Badge variant="secondary">
                      {project.groups?.reduce((acc, g) => acc + (g.hosts?.length || 0), 0) || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">端口:</span>
                    <Badge variant="secondary">
                      {project.groups?.reduce((acc, g) => acc + (g.port_forwards?.length || 0), 0) || 0}
                    </Badge>
                  </div>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </CanvasContextMenu>
    </div>
  );
};

export const ProjectCanvas = (props: ProjectCanvasProps) => {
  return (
    <ReactFlowProvider>
      <ProjectCanvasContent {...props} />
    </ReactFlowProvider>
  );
};
