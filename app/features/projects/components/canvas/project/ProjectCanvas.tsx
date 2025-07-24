//重构后的项目画布组件
import { useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  ReactFlowProvider,
  Node,
  Edge,
} from '@xyflow/react';

// 导入自定义节点 - 移除 GroupNode
import { HostNode } from '../nodes/host/HostNode';
import { HostNodeV2 } from '../nodes/host_v2';
import EmptyProjectNode from '../nodes/EmptyProjectNode';
import { LocalPortNodeV2 } from '../nodes/local_port_v2';
import { RemotePortNodeV2 } from '../nodes/remote_port_v2';

// 导入节点管理器
import { useNodeManagerStore, NodeManagerDialog } from '../nodes/manager';

// 导入模块化组件
import { CanvasToolbar } from './components/CanvasToolbar';
import { CanvasInfoPanel } from './components/CanvasInfoPanel';
import { CanvasEmptyWithManager } from './components/CanvasEmptyWithManager';

// 导入Hooks
import { useCanvasHandlers } from './hooks/useCanvasHandlers';
import { useNodeGenerator } from './hooks/useNodeGenerator'; // 使用新版本

// 导入工具函数
import { exportLayoutData, importLayoutData } from './utils/export';

// 导入类型
import { ProjectCanvasProps } from './types';

// 导入样式
import '@xyflow/react/dist/style.css';

// 自定义节点类型映射
const nodeTypes = {
  hostNode: HostNode,
  hostV2: HostNodeV2,
  emptyProjectNode: EmptyProjectNode,
  localPortV2: LocalPortNodeV2,
  remotePortV2: RemotePortNodeV2,
};

// 扩展的件属性，包含创建画布的功能
interface ExtendedProjectCanvasProps extends ProjectCanvasProps {
  onCreateGroup?: (projectId: number) => void;
}

/**
 * 项目画布核心组件
 */
function ProjectCanvasCore({ project, onCreateGroup, ...handlers }: ExtendedProjectCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  // 节点管理器状态
  const { 
    dialog, 
    openDialog, 
    closeDialog, 
    addNode, 
    setNodes: setManagerNodes,
    nodes: managerNodes,
    discoverNodesFromTypes
  } = useNodeManagerStore();

  // 初始化节点发现 - 将nodeTypes传递给manager进行解析
  useEffect(() => {
    discoverNodesFromTypes(nodeTypes);
    console.log('节点发现完成，已纳管的节点类型:', Object.keys(nodeTypes));
  }, [discoverNodesFromTypes]);

  // 操作处理器
  const canvasHandlers = useCanvasHandlers({ project, ...handlers });

  // 节点生成 - 使用新架构
  const flowNodes = useNodeGenerator(
    project,
    canvasHandlers // 只传递必要的处理器
  );

  // 同步ReactFlow节点到节点管理器
  useEffect(() => {
    setManagerNodes(nodes);
  }, [nodes, setManagerNodes]);

  // 更新节点
  useEffect(() => {
    setNodes(flowNodes);
  }, [flowNodes, setNodes]);

  // 导出布局处理（简化版）
  const handleExportLayout = () => {
    const layoutData = {
      projectId: project.id,
      projectName: project.name,
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
      })),
      timestamp: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(layoutData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name}_layout.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 导入布局处理（简化版）
  const handleImportLayout = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const layoutData = JSON.parse(e.target?.result as string);
            if (layoutData.nodes) {
              // 应用布局到现有节点
              const updatedNodes = nodes.map(node => {
                const layoutNode = layoutData.nodes.find((n: any) => n.id === node.id);
                return layoutNode ? { ...node, position: layoutNode.position } : node;
              });
              setNodes(updatedNodes);
            }
          } catch (error) {
            console.error('导入布局失败:', error);
            alert('导入布局失败，请检查文件格式');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // 自动布局（简化版）
  const applyAutoLayout = () => {
    const spacing = { x: 300, y: 200 };
    const updatedNodes = nodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % 3) * spacing.x + 100,
        y: Math.floor(index / 3) * spacing.y + 100,
      },
    }));
    setNodes(updatedNodes);
  };

  // 网格布局
  const applyGridLayout = () => {
    const spacing = { x: 250, y: 150 };
    const updatedNodes = nodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % 4) * spacing.x + 50,
        y: Math.floor(index / 4) * spacing.y + 50,
      },
    }));
    setNodes(updatedNodes);
  };

  // 圆形布局
  const applyCircularLayout = () => {
    const center = { x: 400, y: 300 };
    const radius = 200;
    const updatedNodes = nodes.map((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      return {
        ...node,
        position: {
          x: center.x + radius * Math.cos(angle),
          y: center.y + radius * Math.sin(angle),
        },
      };
    });
    setNodes(updatedNodes);
  };

  // 适应视图
  const fitToView = () => {
    const reactFlowInstance = (window as any).reactFlowInstance;
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
    }
  };

  // 创建画布处理
  const handleCreateGroup = () => {
    onCreateGroup?.(project.id);
  };

  // 打开节点管理器
  const handleOpenNodeManager = () => {
    openDialog('create');
  };

  // 节点创建处理
  const handleNodeCreate = (type: string, position: { x: number; y: number }) => {
    // 如果没有group，需要先创建一个默认group（画布）
    if (!hasGroups) {
      console.log('没有画布，需要先创建默认画布再创建节点');
      // 先创建group（画布）
      onCreateGroup?.(project.id);
      // TODO: 这里需要等待group创建完成的回调来创建节点
      // 暂时直接创建节点，假设会有默认group
      setTimeout(() => {
        createNodeInGroup(type, position);
      }, 100);
    } else {
      // 已有group（画布），直接创建节点
      createNodeInGroup(type, position);
    }
    
    // 关闭节点管理器对话框
    closeDialog();
  };

  // 在指定group（画布）中创建节点
  const createNodeInGroup = (type: string, position: { x: number; y: number }, groupId?: number) => {
    const targetGroupId = groupId || (project.groups?.[0]?.id);
    
    if (!targetGroupId) {
      console.error('无法创建节点：没有可用的画布(group)');
      return;
    }

    // 根据节点类型调用对应的后端API
    switch (type) {
      case 'hostV2':
      case 'hostNode':
        // 调用创建主机的回调，这会触发后端API并刷新数据
        console.log('调用创建主机API，groupId:', targetGroupId);
        handlers.onCreateHost?.(targetGroupId);
        break;

      case 'localPortV2':
        // 创建本地端口节点
        console.log('调用创建本地端口API，groupId:', targetGroupId);
        handlers.onCreatePortV2?.(targetGroupId, 'local');
        break;

      case 'remotePortV2':
        // 创建远程端口节点
        console.log('调用创建远程端口API，groupId:', targetGroupId);
        handlers.onCreatePortV2?.(targetGroupId, 'remote');
        break;
        
      case 'emptyProjectNode':
        // 空项目节点暂时只在前端创建
        const emptyNodeData = {
          label: '空项目节点',
          description: '项目占位节点',
          projectId: project.id,
          groupId: targetGroupId,
        };
        
        const emptyNodeParams = {
          type,
          position,
          data: emptyNodeData,
        };
        
        const emptyNode = addNode(emptyNodeParams);
        if (emptyNode) {
          console.log('空项目节点已创建:', emptyNode);
        }
        break;
        
      default:
        // 其他类型节点的默认处理
        console.log(`暂不支持创建 ${type} 类型的节点`);
    }
  };

  const hasGroups = project.groups && project.groups.length > 0;

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        onInit={(reactFlowInstance) => {
          (window as any).reactFlowInstance = reactFlowInstance;
        }}
        className="bg-background"
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
        <MiniMap 
          className="!bg-background"
          maskColor="rgb(240, 240, 240, 0.6)"
        />
        
        {/* 工具栏 */}
        <CanvasToolbar
          onCreateGroup={handleCreateGroup}
          onAutoLayout={applyAutoLayout}
          onGridLayout={applyGridLayout}
          onCircularLayout={applyCircularLayout}
          onFitView={fitToView}
          onExportLayout={handleExportLayout}
          onImportLayout={handleImportLayout}
          onOpenNodeManager={handleOpenNodeManager}
        />

        {/* 信息面板 */}
        {hasGroups && <CanvasInfoPanel project={project} />}
      </ReactFlow>

      {/* 空状态提示 - 当没有groups时显示内嵌节点管理器 */}
      {!hasGroups && (
        <CanvasEmptyWithManager
          projectName={project.name}
          onNodeCreate={handleNodeCreate}
          onCreateGroup={handleCreateGroup}
        />
      )}

      {/* 节点管理器对话框 */}
      <NodeManagerDialog
        open={dialog.isOpen}
        onOpenChange={(open) => open ? openDialog('create') : closeDialog()}
        onNodeCreate={handleNodeCreate}
      />
    </div>
  );
}

/**
 * 带Provider的项目画布组件
 */
export function ProjectCanvas(props: ExtendedProjectCanvasProps) {
  return (
    <ReactFlowProvider>
      <ProjectCanvasCore {...props} />
    </ReactFlowProvider>
  );
}
