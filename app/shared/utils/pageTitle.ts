import type { SelectedItem } from "~/store/slices/layoutStore"
import { Project } from "../types/project"

export function getPageTitle(selected: SelectedItem, projects: Project[]): string {
  switch (selected.type) {
    case 'project':
      const selectedProject = projects.find(p => p.id === selected.projectId)
      return selectedProject?.name || '项目'
    case 'group':
      return '组'
    default:
      return '概览'
  }
}
