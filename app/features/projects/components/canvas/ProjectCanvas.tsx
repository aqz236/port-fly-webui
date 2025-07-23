// 项目画布组件 - 简化版本用于测试
import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { GroupNode } from './GroupNode';
import { Project } from '~/shared/types/project';

// 节点类型映射
const nodeTypes = {
  group: GroupNode,
};

interface ProjectCanvasProps {
  project: Project;
}

const ProjectCanvasContent = ({ project }: ProjectCanvasProps) => {
  // 创建简单的测试节点
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];
    
    // 添加一个测试组节点
    if (project.groups && project.groups.length > 0) {
      const group = project.groups[0];
      nodes.push({
        id: `group-${group.id}`,
        type: 'group',
        position: { x: 100, y: 100 },
        data: {
          id: group.id,
          name: group.name,
          description: group.description,
          color: group.color,
          type: 'group',
          group,
          stats: {
            hostCount: 0,
            portCount: 0,
            activeConnections: 0,
          }
        },
      });
    } else {
      // 如果没有组，创建一个测试节点
      nodes.push({
        id: 'test-group-1',
        type: 'group',
        position: { x: 100, y: 100 },
        data: {
          id: 1,
          name: '测试组',
          description: '这是一个测试组',
          color: '#10b981',
          type: 'group',
          group: {
            id: 1,
            name: '测试组',
            description: '这是一个测试组',
            color: '#10b981',
            icon: 'folder',
            project_id: project.id,
            tags: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          stats: {
            hostCount: 0,
            portCount: 0,
            activeConnections: 0,
          }
        },
      });
    }
    
    return nodes;
  }, [project]);

  const initialEdges: Edge[] = [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 50 }}
        attributionPosition="bottom-left"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        className="bg-gray-50"
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor="#fff"
          nodeStrokeColor="#374151"
          nodeBorderRadius={8}
          className="!bg-white !border !border-gray-300"
        />
      </ReactFlow>
    </div>
  );
};

export function ProjectCanvas({ project }: ProjectCanvasProps) {
  return (
    <ReactFlowProvider>
      <ProjectCanvasContent project={project} />
    </ReactFlowProvider>
  );
}
