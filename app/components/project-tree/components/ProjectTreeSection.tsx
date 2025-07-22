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
} from '~/components/ui/sidebar';
import { ProjectTree } from './ProjectTree';
import type { Project, CreateProjectData, MoveProjectParams } from '~/types/api';
import type { SelectedItem } from '../../layout/AppSidebar';

interface ProjectTreeSectionProps {
  projects: Project[];
  selected: SelectedItem;
  onSelect: (selected: SelectedItem) => void;
  onCreateProject?: (data: CreateProjectData) => Promise<void>;
  onMoveProject?: (params: MoveProjectParams) => Promise<void>;
}

export function ProjectTreeSection({
  projects,
  selected,
  onSelect,
  onCreateProject,
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
          onMoveProject={onMoveProject}
          enableDragAndDrop={true}
          showActions={true}
          treeId="projects-tree"
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
