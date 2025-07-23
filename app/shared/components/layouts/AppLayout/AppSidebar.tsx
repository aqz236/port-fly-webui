import {
  Sidebar,
  SidebarContent,
} from "~/shared/components/ui/sidebar";
import type { EditProjectData } from "~/features/projects/components/dialogs/edit-project-dialog";
import {
  SidebarHeader,
  SidebarOverview,
  SidebarFooter,
  ProjectTreeSection,
} from "./AppSidebar/index";
import { Project, CreateProjectData, MoveProjectParams } from "~/shared/types/project";

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
  onEditProject?: (projectId: number, data: EditProjectData) => Promise<void>;
  onDeleteProject?: (projectId: number) => Promise<void>;
  onMoveProject?: (params: MoveProjectParams) => Promise<void>;
}

export function AppSidebar({ 
  projects, 
  selected, 
  onSelect, 
  onCreateProject,
  onEditProject,
  onDeleteProject,
  onMoveProject 
}: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        {/* <SidebarHeader /> */}
        
        <SidebarOverview 
          selected={selected}
          onSelect={onSelect}
        />
        
        <ProjectTreeSection
          projects={projects}
          selected={selected}
          onSelect={onSelect}
          onCreateProject={onCreateProject}
          onEditProject={onEditProject}
          onDeleteProject={onDeleteProject}
          onMoveProject={onMoveProject}
        />
        
        <SidebarFooter />
      </SidebarContent>
    </Sidebar>
  );
}
