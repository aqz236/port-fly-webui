// 重构后的项目画布组件
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

// 导入自定义节点
import GroupNode from '../nodes/GroupNode';
import EmptyProjectNode from '../nodes/EmptyProjectNode';

// 导入模块化组件
import { CanvasToolbar } from './components/CanvasToolbar';
import { CanvasInfoPanel } from './components/CanvasInfoPanel';
import { CanvasEmptyState } from './components/CanvasEmptyState';

// 导入Hooks
import { useCanvasHandlers } from './hooks/useCanvasHandlers';
import { useGroupStates } from './hooks/useGroupStates';
import { useLayoutManager } from './hooks/useLayoutManager';
import { useNodeGenerator } from './hooks/useNodeGenerator';

// 导入工具函数
import { exportLayoutData, importLayoutData } from './utils/export';

// 导入类型
import { ProjectCanvasProps } from './types';

// 导入样式
import '@xyflow/react/dist/style.css';

// 自定义节点类型映射
const nodeTypes = {
  groupNode: GroupNode,
  emptyProjectNode: EmptyProjectNode,
};

/**
 * 项目画布核心组件
 */
function ProjectCanvasCore({ project, ...handlers }: ProjectCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  // 组状态管理
  const {
    groupStates,
    handleToggleExpand,
    updateGroupStates,
  } = useGroupStates();

  // 操作处理器
  const canvasHandlers = useCanvasHandlers({ project, ...handlers });

  // 布局管理
  const {
    applyAutoLayout,
    applyGridLayout,
    applyCircularLayout,
    fitToView,
  } = useLayoutManager(
    project.groups || [],
    groupStates,
    updateGroupStates
  );

  // 节点生成
  const flowNodes = useNodeGenerator(
    project,
    groupStates,
    canvasHandlers,
    handleToggleExpand
  );

  // 更新节点
  useEffect(() => {
    setNodes(flowNodes);
  }, [flowNodes, setNodes]);

  // 导出布局处理
  const handleExportLayout = () => {
    exportLayoutData(project.id, project.name, groupStates);
  };

  // 导入布局处理
  const handleImportLayout = () => {
    importLayoutData(
      (importedStates) => {
        updateGroupStates(importedStates);
      },
      (error) => {
        console.error('导入失败:', error);
        // 这里可以添加错误提示UI
      }
    );
  };

  // 创建组处理
  const handleCreateGroup = () => {
    handlers.onCreateGroup?.(project.id);
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
        />

        {/* 信息面板 */}
        {hasGroups && <CanvasInfoPanel project={project} />}
      </ReactFlow>

      {/* 空状态 */}
      {!hasGroups && (
        <CanvasEmptyState
          projectName={project.name}
          onCreateGroup={handleCreateGroup}
        />
      )}
    </div>
  );
}

/**
 * 带Provider的项目画布组件
 */
export function ProjectCanvas(props: ProjectCanvasProps) {
  return (
    <ReactFlowProvider>
      <ProjectCanvasCore {...props} />
    </ReactFlowProvider>
  );
}
