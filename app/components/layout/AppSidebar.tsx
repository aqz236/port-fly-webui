import { useState } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import {
  Home,
  Activity,
  Settings,
  Plus,
  Zap,
  FolderOpen,
  Folder,
  ChevronRight,
  FileText,
  Upload,
  Download,
} from "lucide-react";
import { CreateProjectDialog } from "~/components/dialogs";
import type { CreateProjectData, MoveProjectParams, Project } from "~/types/api";
import { DraggableProjectNode } from "./DraggableProjectNode";

export type ViewType = 'overview' | 'project' | 'group';

export interface SelectedItem {
  type: ViewType;
  projectId?: number;
  groupId?: number;
}

interface AppSidebarProps {
  projects: Project[];
  selected: SelectedItem;
  onSelect: (selected: SelectedItem) => void;
  onCreateProject?: (data: CreateProjectData) => Promise<void>;
  onMoveProject?: (params: MoveProjectParams) => Promise<void>;
}

export function AppSidebar({ projects, selected, onSelect, onCreateProject, onMoveProject }: AppSidebarProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set([1]));
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);

  const toggleProject = (projectId: number) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const handleCreateProject = () => {
    setShowCreateProjectDialog(true);
  };

  const handleImportProject = () => {
    // TODO: 实现导入项目功能
    console.log('Import project');
  };

  const handleImportFromToby = () => {
    // TODO: 实现从Toby导入功能
    console.log('Import from Toby');
  };

  const handleMoveProject = async (dragItem: any, dropResult: any) => {
    if (!onMoveProject) return;
    
    try {
      let newParentId: number | undefined;
      let position = 0;

      switch (dropResult.position) {
        case 'inside':
          newParentId = dropResult.targetId;
          break;
        case 'before':
        case 'after':
          newParentId = dropResult.targetParentId;
          // TODO: 计算具体位置
          break;
      }

      const params: MoveProjectParams = {
        project_id: dragItem.id,
        parent_id: newParentId,
        position,
      };

      await onMoveProject(params);
      console.log('Project moved successfully');
    } catch (error) {
      console.error('Failed to move project:', error);
    }
  };

  // 构建项目树结构
  const buildProjectTree = (projects: Project[]): Project[] => {
    const projectMap = new Map<number, Project>();
    const rootProjects: Project[] = [];

    // 先创建所有项目的映射
    projects.forEach(project => {
      projectMap.set(project.id, { ...project, children: [] });
    });

    // 构建树状结构
    projects.forEach(project => {
      const projectNode = projectMap.get(project.id)!;
      
      if (project.parent_id) {
        const parent = projectMap.get(project.parent_id);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(projectNode);
        }
      } else {
        rootProjects.push(projectNode);
      }
    });

    return rootProjects;
  };

  const projectTree = buildProjectTree(projects);

  return (
    <DndProvider backend={HTML5Backend}>
      <Sidebar className="border-r">
        <SidebarContent>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">PortFly</span>
          </div>
        </div>
        
        {/* 概览 */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onSelect({ type: 'overview' })}
                  isActive={selected.type === 'overview'}
                  className="w-full"
                >
                  <Home className="w-4 h-4" />
                  <span>概览</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* 项目列表 */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>项目</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-4 w-4">
                  <Plus className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48"  side="right">
                <DropdownMenuItem onClick={handleCreateProject}>
                  <FileText className="h-4 w-4 mr-2" />
                  创建项目
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleImportProject}>
                  <Upload className="h-4 w-4 mr-2" />
                  导入项目
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleImportFromToby}>
                  <Download className="h-4 w-4 mr-2" />
                  从 Toby 导入
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectTree.map((project) => (
                <DraggableProjectNode
                  key={project.id}
                  project={project}
                  level={project.level || 0}
                  isExpanded={expandedProjects.has(project.id)}
                  onToggle={toggleProject}
                  onSelect={onSelect}
                  selected={selected}
                  onMoveProject={handleMoveProject}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* 底部菜单 */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Activity className="w-4 h-4" />
                  <span>活跃会话</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="w-4 h-4" />
                  <span>设置</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 创建项目对话框 */}
      <CreateProjectDialog
        open={showCreateProjectDialog}
        onOpenChange={setShowCreateProjectDialog}
        onCreateProject={onCreateProject}
      />
    </Sidebar>
    </DndProvider>
  );
}
