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
import type { Project, CreateProjectData, MoveProjectParams } from '~/types/api';
import type { SelectedItem } from '../../layout/AppSidebar';
import { useProjectTreeState } from '../hooks/useProjectTreeState';
import { useProjectTreeDragDrop } from '../hooks/useProjectTreeDragDrop';
import { convertToRCTFormat, getNodeTitle, createTreeConfig } from '../utils/tree-utils';
import { ProjectTreeActions } from '../components/ProjectTreeActions';
import { getIconByName } from '../utils/icons';
import 'react-complex-tree/lib/style-modern.css';

export interface ProjectTreeProps {
  /** 项目数据 */
  projects: Project[];
  
  /** 当前选中的项 */
  selected: SelectedItem;
  
  /** 选择回调 */
  onSelect: (selected: SelectedItem) => void;
  
  /** 创建项目回调 */
  onCreateProject?: (data: CreateProjectData) => Promise<void>;
  
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
  onMoveProject,
  initialExpanded = ['root'],
  enableDragAndDrop = true,
  showActions = true,
  treeId = 'project-tree',
  className,
}: ProjectTreeProps) {
  // 处理项目选择
  const handleSelectProject = React.useCallback((projectId: number) => {
    onSelect({ type: 'project', projectId });
  }, [onSelect]);

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

  // 树配置
  const treeConfig = React.useMemo(() => {
    return createTreeConfig({
      enableDragAndDrop,
      canDropOnFolder: true,
      canDropOnNonFolder: true,
      canReorderItems: true,
      enableSearch: false,
    });
  }, [enableDragAndDrop]);

  // 创建一个基于树数据的key，确保在乐观更新时重新渲染
  const treeKey = React.useMemo(() => {
    const nodeStates = treeNodes.map(node => `${node.id}:${node.isFolder}:${node.children.length}`).join(',');
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
          // 自定义渲染项目标题，包含图标
          const treeItem = treeData[item.index];
          const project = treeItem?.data?.project;
          
          if (project?.icon && project?.color) {
            const iconData = getIconByName(project.icon);
            if (iconData) {
              const IconComponent = iconData.component;
              return (
                <div className="flex items-center gap-2">
                  <IconComponent 
                    size={16} 
                    style={{ color: project.color }}
                  />
                  <span>{title}</span>
                </div>
              );
            }
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
    </div>
  );
}
