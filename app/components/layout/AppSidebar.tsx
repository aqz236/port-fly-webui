import {
  CustomSidebar,
  CustomSidebarContent,
} from "./sidebar/CustomSidebar";
import type { CreateProjectData, MoveProjectParams, Project } from "~/types/api";
import {
  SidebarHeader,
  SidebarOverview,
  SidebarFooter,
  ProjectTreeSection,
} from "./sidebar/index";

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

export function AppSidebar({ 
  projects, 
  selected, 
  onSelect, 
  onCreateProject, 
  onMoveProject 
}: AppSidebarProps) {
  return (
    <CustomSidebar>
      <CustomSidebarContent>
        <SidebarHeader />
        
        <SidebarOverview 
          selected={selected}
          onSelect={onSelect}
        />
        
        <ProjectTreeSection
          projects={projects}
          selected={selected}
          onSelect={onSelect}
          onCreateProject={onCreateProject}
          onMoveProject={onMoveProject}
        />
        
        <SidebarFooter />
      </CustomSidebarContent>
    </CustomSidebar>
  );
}
