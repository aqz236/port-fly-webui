/**
 * Project Tree Section (Adapter)
 * 
 * 适配器组件，使新的项目树组件兼容现有的 Sidebar 接口
 */

import React from 'react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '~/shared/components/ui/sidebar';
import { ProjectTree } from './ProjectTree';
import type { SelectedItem } from '../../../../../shared/components/layouts/AppLayout/AppSidebar';
import type { EditProjectData } from '~/features/projects/components/dialogs/edit-project-dialog';
import { Project, CreateProjectData, MoveProjectParams } from '~/shared/types/project';

interface ProjectTreeSectionProps {
  projects: Project[];
  selected: SelectedItem;
  onSelect: (selected: SelectedItem) => void;
  onCreateProject?: (data: CreateProjectData) => Promise<void>;
  onEditProject?: (projectId: number, data: EditProjectData) => Promise<void>;
  onDeleteProject?: (projectId: number) => Promise<void>;
  onMoveProject?: (params: MoveProjectParams) => Promise<void>;
}

export function ProjectTreeSection({
  projects,
  selected,
  onSelect,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  onMoveProject,
}: ProjectTreeSectionProps) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <ProjectTree
          projects={projects}
          selected={selected}
          onSelect={onSelect}
          onCreateProject={onCreateProject}
          onEditProject={onEditProject}
          onDeleteProject={onDeleteProject}
          onMoveProject={onMoveProject}
          enableDragAndDrop={true}
          showActions={true}
          treeId="projects-tree"
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
