import { useState, useMemo, useCallback } from "react";
import {
  Tree,
  UncontrolledTreeEnvironment,
  StaticTreeDataProvider,
  TreeItemIndex,
  TreeItem as RCTTreeItem,
  DraggingPosition,
} from "react-complex-tree";
import { Folder, FolderOpen, FileText, ChevronRight } from "lucide-react";
import {
  CustomSidebarGroup,
  CustomSidebarGroupContent,
  CustomSidebarGroupLabel,
} from "./CustomSidebar";
import type { Project, CreateProjectData, MoveProjectParams } from "~/types/api";
import type { SelectedItem } from "../AppSidebar";
import { ProjectActionsMenu } from "./ProjectActionsMenu";
import "react-complex-tree/lib/style-modern.css";

interface ProjectTreeSectionProps {
  projects: Project[];
  selected: SelectedItem;
  onSelect: (selected: SelectedItem) => void;
  onCreateProject?: (data: CreateProjectData) => Promise<void>;
  onMoveProject?: (params: MoveProjectParams) => Promise<void>;
}

interface ProjectTreeItem {
  index: TreeItemIndex;
  canMove: boolean;
  canRename: boolean;
  data: string; // react-complex-tree 需要这是一个简单的字符串
  children?: TreeItemIndex[];
  isFolder?: boolean;
}

// 项目元数据映射
interface ProjectMetadata {
  [key: TreeItemIndex]: Project;
}

type TreeData = Record<TreeItemIndex, ProjectTreeItem>;

export function ProjectTreeSection({
  projects,
  selected,
  onSelect,
  onCreateProject,
  onMoveProject,
}: ProjectTreeSectionProps) {
  const [focusedItem, setFocusedItem] = useState<TreeItemIndex>();
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>(['root', '1']);
  const [selectedItems, setSelectedItems] = useState<TreeItemIndex[]>([]);

  // 项目元数据映射
  const projectMetadata = useMemo((): ProjectMetadata => {
    const metadata: ProjectMetadata = {};
    projects.forEach(project => {
      metadata[project.id.toString()] = project;
    });
    return metadata;
  }, [projects]);

  // 构建树形数据结构
  const treeData = useMemo((): TreeData => {
    const data: TreeData = {
      root: {
        index: 'root',
        data: 'Projects',
        children: [],
        isFolder: true,
        canMove: false,
        canRename: false,
      },
    };

    // 第一步：创建所有项目节点
    projects.forEach(project => {
      const itemId = project.id.toString();
      const hasChildren = projects.some(p => p.parent_id === project.id);
      
      data[itemId] = {
        index: itemId,
        data: project.name,
        children: [],
        isFolder: hasChildren,
        canMove: true,
        canRename: true,
      };
    });

    // 第二步：构建父子关系
    projects.forEach(project => {
      const itemId = project.id.toString();
      
      if (project.parent_id) {
        const parentId = project.parent_id.toString();
        if (data[parentId]) {
          data[parentId].children!.push(itemId);
        }
      } else {
        // 根级项目
        data.root.children!.push(itemId);
      }
    });

    // 第三步：对所有子项按 sort 排序
    Object.values(data).forEach(item => {
      if (item.children && item.children.length > 0) {
        item.children.sort((a, b) => {
          const projectA = projects.find(p => p.id.toString() === a);
          const projectB = projects.find(p => p.id.toString() === b);
          return (projectA?.sort || 0) - (projectB?.sort || 0);
        });
      }
    });

    return data;
  }, [projects]);

  const handleSelectItems = useCallback((items: TreeItemIndex[]) => {
    setSelectedItems(items);
    
    if (items.length === 1 && items[0] !== 'root') {
      const projectId = parseInt(items[0].toString());
      onSelect({ type: 'project', projectId });
    }
  }, [onSelect]);

  const handleExpandItem = useCallback((item: RCTTreeItem<any>) => {
    setExpandedItems(prev => [...prev, item.index]);
  }, []);

  const handleCollapseItem = useCallback((item: RCTTreeItem<any>) => {
    setExpandedItems(prev => prev.filter(id => id !== item.index));
  }, []);

  const handleFocusItem = useCallback((item: RCTTreeItem<any>) => {
    setFocusedItem(item.index);
  }, []);

  const handleDrop = useCallback(async (items: RCTTreeItem<any>[], target: DraggingPosition) => {
    if (!onMoveProject || items.length !== 1) return;

    const draggedItem = items[0];
    const draggedItemId = parseInt(draggedItem.index.toString());
    
    let newParentId: number | undefined;
    let position = 0;

    console.log('Drop target:', target);

    if (target.targetType === 'item' && target.targetItem && target.targetItem !== 'root') {
      // 放到另一个项目上 - 移动到该项目下
      newParentId = parseInt(target.targetItem.toString());
    } else if (target.targetType === 'between-items') {
      // 在两个项目之间 - 获取父级
      if (target.parentItem && target.parentItem !== 'root') {
        newParentId = parseInt(target.parentItem.toString());
      } else {
        newParentId = undefined; // 根级别
      }
      position = target.childIndex || 0;
    } else {
      // 默认到根级别
      newParentId = undefined;
    }

    try {
      const params: MoveProjectParams = {
        project_id: draggedItemId,
        parent_id: newParentId,
        position,
      };

      console.log('Moving project:', params);
      await onMoveProject(params);
    } catch (error) {
      console.error('Failed to move project:', error);
    }
  }, [onMoveProject]);

  return (
    <CustomSidebarGroup>
      <CustomSidebarGroupLabel className="flex items-center justify-between">
        <span>项目</span>
        <ProjectActionsMenu onCreateProject={onCreateProject} />
      </CustomSidebarGroupLabel>
      <CustomSidebarGroupContent>
        <div className="rct-tree-wrapper">
          <UncontrolledTreeEnvironment
            dataProvider={new StaticTreeDataProvider(treeData)}
            getItemTitle={(item) => item.data || 'Untitled'}
            viewState={{
              'projects-tree': {
                focusedItem,
                expandedItems,
                selectedItems,
              },
            }}
            onFocusItem={handleFocusItem}
            onExpandItem={handleExpandItem}
            onCollapseItem={handleCollapseItem}
            onSelectItems={handleSelectItems}
            onDrop={handleDrop}
            canDragAndDrop={true}
            canDropOnFolder={true}
            canReorderItems={true}
            canDropOnNonFolder={true}
            canSearch={false}
          >
            <Tree
              treeId="projects-tree"
              rootItem="root"
              treeLabel="项目树"
            />
          </UncontrolledTreeEnvironment>
        </div>
      </CustomSidebarGroupContent>
    </CustomSidebarGroup>
  );
}
