/**
 * Project Tree Component
 * 
 * 高级项目树组件，封装了所有复杂的逻辑
 */

import React from 'react';
import {
  Tree,
  UncontrolledTreeEnvironment,
  StaticTreeDataProvider,
} from 'react-complex-tree';
import { GripVertical, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import type { SelectedItem } from '~/shared/components/layouts/AppLayout/AppSidebar';
import { useProjectTreeState } from '../hooks/useProjectTreeState';
import { useProjectTreeDragDrop } from '../hooks/useProjectTreeDragDrop';
import { convertToRCTFormat, getNodeTitle, createTreeConfig } from '../utils/tree-utils';
import { ProjectTreeActions } from './ProjectTreeActions';
import { getIconByName } from '../utils/icons';
import type { EditProjectData } from '~/features/projects/components/dialogs/edit-project-dialog';
import 'react-complex-tree/lib/style-modern.css';
import { DeleteProjectDialog, EditProjectDialog } from '../..';
import { CreateProjectData, MoveProjectParams, Project } from '~/shared/types/project';

export interface ProjectTreeProps {
  /** 项目数据 */
  projects: Project[];
  
  /** 当前选中的项 */
  selected: SelectedItem;
  
  /** 选择回调 */
  onSelect: (selected: SelectedItem) => void;
  
  /** 创建项目回调 */
  onCreateProject?: (data: CreateProjectData) => Promise<void>;
  
  /** 编辑项目回调 */
  onEditProject?: (projectId: number, data: EditProjectData) => Promise<void>;
  
  /** 删除项目回调 */
  onDeleteProject?: (projectId: number) => Promise<void>;
  
  /** 移动项目回调 */
  onMoveProject?: (params: MoveProjectParams) => Promise<void>;
  
  /** 初始展开的项目 */
  initialExpanded?: string[];
  
  /** 是否启用拖拽 */
  enableDragAndDrop?: boolean;
  
  /** 是否显示操作菜单 */
  showActions?: boolean;
  
  /** 自定义树ID */
  treeId?: string;
  
  /** 自定义类名 */
  className?: string;
}

export function ProjectTree({
  projects,
  selected,
  onSelect,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  onMoveProject,
  initialExpanded = ['root'],
  enableDragAndDrop = true,
  showActions = true,
  treeId = 'project-tree',
  className,
}: ProjectTreeProps) {
  // 对话框状态管理
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  
  // 动态拖拽控制状态
  const [isDragEnabled, setIsDragEnabled] = React.useState(false);

  // 操作菜单状态管理
  const [dropdownOpen, setDropdownOpen] = React.useState<{[key: string]: boolean}>({});

  // 处理项目选择
  const handleSelectProject = React.useCallback((projectId: number) => {
    onSelect({ type: 'project', projectId });
  }, [onSelect]);

  // 处理编辑项目
  const handleEditProject = React.useCallback((project: Project) => {
    setSelectedProject(project);
    setEditDialogOpen(true);
    // 关闭下拉菜单
    setDropdownOpen({});
  }, []);

  // 处理删除项目
  const handleDeleteProject = React.useCallback((project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
    // 关闭下拉菜单
    setDropdownOpen({});
  }, []);

  // 处理拖拽按钮鼠标按下事件
  const handleDragStart = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    setIsDragEnabled(true);
  }, []);

  // 处理全局鼠标松开事件
  React.useEffect(() => {
    const handleMouseUp = () => {
      setIsDragEnabled(false);
    };

    if (isDragEnabled) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragEnabled]);

  // 根据项目ID查找项目对象
  const findProjectById = React.useCallback((projectId: number): Project | undefined => {
    const findInProjects = (projectList: Project[]): Project | undefined => {
      for (const project of projectList) {
        if (project.id === projectId) {
          return project;
        }
        if (project.children && project.children.length > 0) {
          const found = findInProjects(project.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return findInProjects(projects);
  }, [projects]);

  // 使用树状态管理 Hook
  const {
    treeNodes,
    nodeMap,
    treeState,
    handleSelectItems,
    handleExpandItem,
    handleCollapseItem,
    handleFocusItem,
    handleMoveNode,
    operationsManager,
  } = useProjectTreeState({
    projects,
    onMoveProject,
    onSelectProject: handleSelectProject,
    initialExpanded,
  });

  // 使用拖拽处理 Hook
  const { handleDrop, canDropAt } = useProjectTreeDragDrop({
    nodeMap,
    operationsManager,
    onMoveNode: handleMoveNode,
  });

  // 转换为 react-complex-tree 格式
  const treeData = React.useMemo(() => {
    console.log('Converting tree data, nodes count:', treeNodes.length);
    const data = convertToRCTFormat(treeNodes);
    console.log('Tree data converted:', Object.keys(data).map(key => ({ 
      id: key, 
      isFolder: data[key].isFolder, 
      children: data[key].children 
    })));
    return data;
  }, [treeNodes]);

  // 创建数据提供者，确保在数据变化时重新创建
  const dataProvider = React.useMemo(() => {
    return new StaticTreeDataProvider(treeData);
  }, [treeData]);

  // 树配置 - 动态控制拖拽
  const treeConfig = React.useMemo(() => {
    return createTreeConfig({
      enableDragAndDrop: enableDragAndDrop && isDragEnabled, // 只有在拖拽按钮按下时才启用拖拽
      canDropOnFolder: true,
      canDropOnNonFolder: true,
      canReorderItems: true,
      enableSearch: false,
    });
  }, [enableDragAndDrop, isDragEnabled]);

  // 创建一个基于树数据的key，确保在乐观更新时重新渲染
  const treeKey = React.useMemo(() => {
    const nodeStates = treeNodes.map(node => {
      // 包含节点的核心属性，确保任何变化都会触发重新渲染
      const project = node.project;
      const projectInfo = project ? `${project.name}:${project.icon}:${project.color}` : '';
      return `${node.id}:${node.isFolder}:${node.children.length}:${projectInfo}`;
    }).join(',');
    return `tree-${nodeStates}`;
  }, [treeNodes]);

  return (
    <div className={className}>
      {showActions && (
        <ProjectTreeActions onCreateProject={onCreateProject} />
      )}
      
      <UncontrolledTreeEnvironment
        key={treeKey}
        dataProvider={dataProvider}
        getItemTitle={getNodeTitle}
        viewState={{
          [treeId]: {
            focusedItem: treeState.focusedItem,
            expandedItems: treeState.expandedItems,
            selectedItems: treeState.selectedItems,
          },
        }}
        onFocusItem={(item) => handleFocusItem(item.index.toString())}
        onExpandItem={(item) => handleExpandItem(item.index.toString())}
        onCollapseItem={(item) => handleCollapseItem(item.index.toString())}
        onSelectItems={(items) => handleSelectItems(items.map(id => id.toString()))}
        onDrop={enableDragAndDrop ? handleDrop : undefined}
        canDragAndDrop={treeConfig.enableDragAndDrop}
        canDropOnFolder={treeConfig.canDropOnFolder}
        canReorderItems={treeConfig.canReorderItems}
        canDropOnNonFolder={treeConfig.canDropOnNonFolder}
        canSearch={treeConfig.enableSearch}
        renderItemTitle={({ title, item, context }) => {
          // 自定义渲染项目标题，包含图标、拖拽区域和操作按钮
          const treeItem = treeData[item.index];
          const project = treeItem?.data?.project;
          
          // 如果是根节点，只显示标题
          if (item.index === 'root') {
            return <span>{title}</span>;
          }
          
          // 如果有项目数据，渲染完整的项目项
          if (project) {
            let IconComponent = null;
            let iconColor = '#6B7280'; // 默认灰色
            
            // 尝试获取图标组件和颜色
            if (project.icon && project.color) {
              const iconData = getIconByName(project.icon);
              if (iconData) {
                IconComponent = iconData.component;
                iconColor = project.color;
              }
            }
            
            return (
              <div className="flex items-center justify-between w-full group">
                {/* 左侧：图标和标题 */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {IconComponent ? (
                    <IconComponent 
                      size={16} 
                      style={{ color: iconColor }}
                    />
                  ) : (
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: iconColor }}
                    />
                  )}
                  <span className="truncate">{title}</span>
                </div>
                
                {/* 右侧：拖拽区域和操作按钮 */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* 拖拽区域 */}
                  {enableDragAndDrop && (
                    <div 
                      className="p-1 hover:bg-gray-200 rounded cursor-grab active:cursor-grabbing"
                      onMouseDown={handleDragStart}
                      title="拖拽排序"
                    >
                      <GripVertical size={14} className="text-gray-400" />
                    </div>
                  )}
                  
                  {/* 操作菜单 */}
                  <div className="relative">
                    <div 
                      className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const itemKey = `project-${project.id}`;
                        setDropdownOpen(prev => ({
                          ...prev,
                          [itemKey]: !prev[itemKey]
                        }));
                      }}
                      title="更多操作"
                    >
                      <MoreHorizontal size={14} className="text-gray-400" />
                    </div>
                    
                    {/* 自定义下拉菜单 */}
                    {dropdownOpen[`project-${project.id}`] && (
                      <>
                        {/* 背景遮罩 */}
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpen({});
                          }}
                        />
                        
                        {/* 菜单内容 */}
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-md shadow-lg border z-50">
                          <div className="py-1">
                            <div
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProject(project);
                              }}
                            >
                              <Edit size={14} />
                              编辑项目
                            </div>
                            <div className="border-t border-gray-100" />
                            <div
                              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(project);
                              }}
                            >
                              <Trash2 size={14} />
                              删除项目
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          }
          
          return <span>{title}</span>;
        }}
      >
        <Tree
          treeId={treeId}
          rootItem="root"
          treeLabel="项目树"
        />
      </UncontrolledTreeEnvironment>

      {/* 编辑项目对话框 */}
      <EditProjectDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        project={selectedProject}
        onEditProject={onEditProject}
      />

      {/* 删除项目对话框 */}
      <DeleteProjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        project={selectedProject}
        onDeleteProject={onDeleteProject}
      />
    </div>
  );
}
