import React, { useRef } from 'react'
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar"
import {
  FolderOpen,
  Folder,
  ChevronRight,
  GripVertical,
} from "lucide-react"
import type { Project, Group } from "~/types/api";
import type { SelectedItem } from "./AppSidebar"

const ITEM_TYPE = 'PROJECT_NODE'

interface DragItem {
  type: string
  id: number
  parentId?: number
  level: number
}

interface DropResult {
  targetId: number
  targetParentId?: number
  position: 'before' | 'after' | 'inside'
}

interface DraggableProjectNodeProps {
  project: Project
  level: number
  isExpanded: boolean
  onToggle: (projectId: number) => void
  onSelect: (selected: SelectedItem) => void
  selected: SelectedItem
  onMoveProject: (dragItem: DragItem, dropResult: DropResult) => void
}

export function DraggableProjectNode({
  project,
  level,
  isExpanded,
  onToggle,
  onSelect,
  selected,
  onMoveProject,
}: DraggableProjectNodeProps) {
  const ref = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: (): DragItem => ({
      type: ITEM_TYPE,
      id: project.id,
      parentId: project.parent_id,
      level: project.level,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: DragItem, monitor: DropTargetMonitor): DropResult => {
      if (item.id === project.id) {
        return { targetId: project.id, position: 'after' } // 阻止自己拖拽到自己
      }

      const targetRect = ref.current?.getBoundingClientRect()
      const clientOffset = monitor.getClientOffset()
      
      if (!targetRect || !clientOffset) {
        return { targetId: project.id, position: 'after' }
      }

      const hoverClientY = clientOffset.y - targetRect.top
      const hoverMiddleY = targetRect.height / 2

      let position: 'before' | 'after' | 'inside' = 'after'
      
      if (hoverClientY < hoverMiddleY / 2) {
        position = 'before'
      } else if (hoverClientY > hoverMiddleY && hoverClientY < targetRect.height - 10) {
        position = 'inside'
      } else {
        position = 'after'
      }

      return {
        targetId: project.id,
        targetParentId: project.parent_id,
        position,
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  })

  // 处理drop事件
  const handleDrop = (item: DragItem, dropResult: DropResult) => {
    if (item.id !== project.id) {
      onMoveProject(item, dropResult)
    }
  }

  // 合并refs
  preview(drop(ref))

  const hasChildren = project.children && project.children.length > 0

  return (
    <div
      ref={ref}
      className={`
        relative transition-all duration-200
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        ${isOver && canDrop ? 'bg-accent/50' : ''}
      `}
      style={{ paddingLeft: `${level * 12}px` }}
    >
      {/* 拖拽指示器 */}
      {isOver && canDrop && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
        </div>
      )}

      <Collapsible open={isExpanded} onOpenChange={() => onToggle(project.id)}>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="w-full justify-between group">
              <div className="flex items-center gap-2">
                {/* 拖拽手柄 */}
                <div
                  ref={drag}
                  className="opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
                >
                  <GripVertical className="w-3 h-3 text-muted-foreground" />
                </div>
                
                {hasChildren ? (
                  isExpanded ? (
                    <FolderOpen className="w-4 h-4" />
                  ) : (
                    <Folder className="w-4 h-4" />
                  )
                ) : (
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: project.color }}
                  />
                )}
                <span>{project.name}</span>
              </div>
              {hasChildren && (
                <ChevronRight className="w-4 h-4 transition-transform data-[state=open]:rotate-90" />
              )}
            </SidebarMenuButton>
          </CollapsibleTrigger>
          
          {hasChildren && (
            <CollapsibleContent>
              <SidebarMenuSub>
                {/* 项目概览 */}
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    onClick={() => onSelect({ type: 'project', projectId: project.id })}
                    isActive={selected.type === 'project' && selected.projectId === project.id}
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>项目概览</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                
                {/* 子项目 */}
                {project.children?.map((child: Project) => (
                  <DraggableProjectNode
                    key={child.id}
                    project={child}
                    level={level + 1}
                    isExpanded={isExpanded}
                    onToggle={onToggle}
                    onSelect={onSelect}
                    selected={selected}
                    onMoveProject={onMoveProject}
                  />
                ))}
                
                {/* 组 */}
                {project.groups?.map((group) => (
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
          )}
        </SidebarMenuItem>
      </Collapsible>
    </div>
  )
}
