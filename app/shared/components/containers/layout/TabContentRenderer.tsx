import { TabsContent } from "~/shared/components/ui/tabs"
import { GroupDetail } from "~/features/groups/components/GroupDetail"
import { ProjectDetailV2 } from "~/features/projects/components/ProjectDetail.v2"
import { useLayoutStore } from "~/store/slices/layoutStore"
import type { Tab } from "~/store/slices/layoutStore"

interface TabContentRendererProps {
  tabs: Tab[]
  onGroupClick: (group: any) => void
  onAddGroup: (projectId: number) => void
}

export function TabContentRenderer({ 
  tabs, 
  onGroupClick, 
  onAddGroup 
}: TabContentRendererProps) {
  const { 
    getProjectById, 
    getGroupById, 
    getGroupStats, 
    getProjectStats 
  } = useLayoutStore()

  return (
    <>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-0">
          {tab.type === 'group' ? (
            (() => {
              const group = getGroupById(tab.groupId!)
              return group ? (
                <GroupDetail 
                  group={group} 
                  stats={getGroupStats(tab.groupId!)}
                />
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  组数据未找到
                </div>
              )
            })()
          ) : (
            (() => {
              const project = getProjectById(tab.projectId)
              return project ? (
                <ProjectDetailV2 
                  project={project}
                  stats={getProjectStats(tab.projectId)}
                  onGroupClick={onGroupClick}
                />
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  项目数据未找到
                </div>
              )
            })()
          )}
        </TabsContent>
      ))}
    </>
  )
}
