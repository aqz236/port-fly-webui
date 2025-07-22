import { useState } from "react";
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
} from "lucide-react";
import { Project } from "~/components/features/projects";

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
}

export function AppSidebar({ projects, selected, onSelect }: AppSidebarProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set([1]));

  const toggleProject = (projectId: number) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  return (
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
            <Button variant="ghost" size="icon" className="h-4 w-4">
              <Plus className="h-3 w-3" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => (
                <Collapsible
                  key={project.id}
                  open={expandedProjects.has(project.id)}
                  onOpenChange={() => toggleProject(project.id)}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="w-full justify-between">
                        <div className="flex items-center gap-2">
                          {expandedProjects.has(project.id) ? (
                            <FolderOpen className="w-4 h-4" />
                          ) : (
                            <Folder className="w-4 h-4" />
                          )}
                          <span>{project.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 transition-transform data-[state=open]:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => onSelect({ type: 'project', projectId: project.id })}
                            isActive={selected.type === 'project' && selected.projectId === project.id}
                          >
                            <FolderOpen className="w-4 h-4" />
                            <span>项目概览</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        {project.groups.map((group) => (
                          <SidebarMenuSubItem key={group.id}>
                            <SidebarMenuSubButton
                              onClick={() => onSelect({ 
                                type: 'group', 
                                projectId: project.id, 
                                groupId: group.id 
                              })}
                              isActive={
                                selected.type === 'group' && 
                                selected.projectId === project.id && 
                                selected.groupId === group.id
                              }
                            >
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: group.color }}
                                />
                                <span>{group.name}</span>
                              </div>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
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
    </Sidebar>
  );
}
