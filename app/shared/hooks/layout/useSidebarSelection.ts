import { useCallback } from "react"
import { useLayoutStore } from "~/store/slices/layoutStore"
import { mockGroups } from "~/shared/utils/mock-data"
import type { SelectedItem } from "~/store/slices/layoutStore"
import type { Project, Group } from "~/shared/types/api"

interface UseSidebarSelectionProps {
  projects: Project[]
}

export function useSidebarSelection({ projects }: UseSidebarSelectionProps) {
  const { 
    setSelected, 
    openGroupTab, 
    openProjectTab 
  } = useLayoutStore()

  const handleSidebarSelect = useCallback((selectedItem: SelectedItem) => {
    if (selectedItem.type === 'group' && selectedItem.projectId && selectedItem.groupId) {
      // 查找对应的组数据
      const project = projects.find(p => p.id === selectedItem.projectId)
      if (project && project.groups) {
        const group = project.groups.find((g: any) => g.id === selectedItem.groupId)
        if (group) {
          openGroupTab(group as Group)
          return
        }
      }
      
      // 如果找不到真实数据，使用模拟数据
      const mockGroup = mockGroups.find(g => g.id === selectedItem.groupId)
      if (mockGroup) {
        openGroupTab(mockGroup)
        return
      }
    }
    
    if (selectedItem.type === 'project' && selectedItem.projectId) {
      // 查找对应的项目数据并打开标签页
      const project = projects.find(p => p.id === selectedItem.projectId)
      if (project) {
        openProjectTab(project)
        return
      }
    }
    
    // 其他情况更新选择状态（比如概览）
    setSelected(selectedItem)
  }, [projects, openGroupTab, openProjectTab, setSelected])

  return { handleSidebarSelect }
}
