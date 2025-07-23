/**
 * Project Tree Usage Examples
 * 
 * 展示如何使用新的项目树组件
 */

import React from 'react';
import { ProjectTree, ProjectTreeSection, useProjectTreeState } from '~/features/projects/components/project-tree';
import type { Project, CreateProjectData, MoveProjectParams } from '~/shared/types/api';
import type { SelectedItem } from '~/shared/components/layouts/AppLayout/AppSidebar';

// 示例项目数据
const sampleProjects: Project[] = [
  {
    id: 1,
    name: '前端项目',
    description: 'React 前端应用',
    color: '#6366f1',
    icon: 'folder',
    is_default: false,
    parent_id: undefined,
    level: 0,
    sort: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: '后端服务',
    description: 'Go 后端服务',
    color: '#10b981',
    icon: 'server',
    is_default: false,
    parent_id: 1,
    level: 1,
    sort: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: '数据库',
    description: 'PostgreSQL 数据库',
    color: '#8b5cf6',
    icon: 'database',
    is_default: false,
    parent_id: 1,
    level: 1,
    sort: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// 示例1: 基本使用
export function BasicUsageExample() {
  const [selected, setSelected] = React.useState<SelectedItem>({ type: 'overview' });

  const handleCreateProject = async (data: CreateProjectData) => {
    console.log('创建项目:', data);
    // 实际的创建逻辑
  };

  const handleMoveProject = async (params: MoveProjectParams) => {
    console.log('移动项目:', params);
    // 实际的移动逻辑
  };

  return (
    <div className="w-80 h-96 border rounded-lg p-4">
      <ProjectTree
        projects={sampleProjects}
        selected={selected}
        onSelect={setSelected}
        onCreateProject={handleCreateProject}
        onMoveProject={handleMoveProject}
      />
    </div>
  );
}

// 示例2: 兼容模式（替换旧组件）
export function CompatibilityExample() {
  const [selected, setSelected] = React.useState<SelectedItem>({ type: 'overview' });

  const handleCreateProject = async (data: CreateProjectData) => {
    console.log('创建项目:', data);
  };

  const handleMoveProject = async (params: MoveProjectParams) => {
    console.log('移动项目:', params);
  };

  return (
    <div className="w-80 h-96 border rounded-lg">
      <ProjectTreeSection
        projects={sampleProjects}
        selected={selected}
        onSelect={setSelected}
        onCreateProject={handleCreateProject}
        onMoveProject={handleMoveProject}
      />
    </div>
  );
}

// 示例3: 自定义配置
export function CustomConfigExample() {
  const [selected, setSelected] = React.useState<SelectedItem>({ type: 'overview' });

  return (
    <div className="w-80 h-96 border rounded-lg p-4">
      <ProjectTree
        projects={sampleProjects}
        selected={selected}
        onSelect={setSelected}
        enableDragAndDrop={false}  // 禁用拖拽
        showActions={false}        // 隐藏操作按钮
        treeId="custom-tree"       // 自定义树ID
        className="custom-tree-style"
      />
    </div>
  );
}

// 示例4: 使用Hook进行高级定制
export function AdvancedCustomizationExample() {
  const [selected, setSelected] = React.useState<SelectedItem>({ type: 'overview' });

  const {
    treeNodes,
    nodeMap,
    treeState,
    handleSelectItems,
    selectProject,
    expandToNode,
  } = useProjectTreeState({
    projects: sampleProjects,
    onSelectProject: (projectId) => {
      setSelected({ type: 'project', projectId });
    },
  });

  // 自定义操作
  const handleCustomAction = () => {
    // 选择第一个项目并展开到它
    if (sampleProjects.length > 0) {
      selectProject(sampleProjects[0].id);
    }
  };

  const handleExpandAll = () => {
    // 展开所有节点
    const allNodeIds = Array.from(nodeMap.keys());
    expandToNode(allNodeIds[allNodeIds.length - 1]);
  };

  return (
    <div className="w-80 h-96 border rounded-lg p-4">
      <div className="mb-4 space-x-2">
        <button 
          onClick={handleCustomAction}
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
        >
          选择第一个项目
        </button>
        <button 
          onClick={handleExpandAll}
          className="px-2 py-1 bg-green-500 text-white rounded text-xs"
        >
          展开全部
        </button>
      </div>
      
      <div className="mb-2 text-sm text-gray-600">
        <div>选中项: {treeState.selectedItems.join(', ') || '无'}</div>
        <div>展开项: {treeState.expandedItems.length} 个</div>
        <div>总节点: {treeNodes.length} 个</div>
      </div>

      <ProjectTree
        projects={sampleProjects}
        selected={selected}
        onSelect={setSelected}
        initialExpanded={treeState.expandedItems}
      />
    </div>
  );
}

// 示例5: 错误处理和验证
export function ErrorHandlingExample() {
  const [selected, setSelected] = React.useState<SelectedItem>({ type: 'overview' });
  const [error, setError] = React.useState<string | null>(null);

  const handleMoveProject = async (params: MoveProjectParams) => {
    try {
      setError(null);
      
      // 模拟可能失败的操作
      if (params.parent_id === params.project_id) {
        throw new Error('不能将项目移动到自己下面');
      }
      
      console.log('移动项目成功:', params);
    } catch (err) {
      setError(err instanceof Error ? err.message : '移动失败');
    }
  };

  return (
    <div className="w-80 h-96 border rounded-lg p-4">
      {error && (
        <div className="mb-4 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <ProjectTree
        projects={sampleProjects}
        selected={selected}
        onSelect={setSelected}
        onMoveProject={handleMoveProject}
      />
    </div>
  );
}

// 组合所有示例
export function ProjectTreeExamples() {
  const [activeExample, setActiveExample] = React.useState(0);

  const examples = [
    { name: '基本使用', component: BasicUsageExample },
    { name: '兼容模式', component: CompatibilityExample },
    { name: '自定义配置', component: CustomConfigExample },
    { name: '高级定制', component: AdvancedCustomizationExample },
    { name: '错误处理', component: ErrorHandlingExample },
  ];

  const ActiveComponent = examples[activeExample].component;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">项目树组件示例</h1>
      
      <div className="mb-6">
        <div className="flex space-x-2">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => setActiveExample(index)}
              className={`px-4 py-2 rounded ${
                activeExample === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {example.name}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold mb-4">{examples[activeExample].name}</h2>
        <ActiveComponent />
      </div>
    </div>
  );
}
