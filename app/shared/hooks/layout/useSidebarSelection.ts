import { useCallback } from "react"
import { useNavigate } from "@remix-run/react"
import { useLayoutStore } from "~/store/slices/layoutStore"
import type { SelectedItem } from "~/store/slices/layoutStore"
import { Project } from "~/shared/types/project"

interface UseSidebarSelectionProps {
  projects: Project[]
}

export function useSidebarSelection({ projects }: UseSidebarSelectionProps) {
  const navigate = useNavigate()
  const { setSelected } = useLayoutStore()

  const handleSidebarSelect = useCallback((selectedItem: SelectedItem) => {
    if (selectedItem.type === 'group' && selectedItem.groupId) {
      navigate(`/app/group/${selectedItem.groupId}`)
      return
    }
    
    if (selectedItem.type === 'project' && selectedItem.projectId) {
      navigate(`/app/project/${selectedItem.projectId}`)
      return
    }
    
    if (selectedItem.type === 'overview') {
      navigate('/app')
      return
    }
    
    // 更新选择状态
    setSelected(selectedItem)
  }, [navigate, setSelected])

  return { handleSidebarSelect }
}
