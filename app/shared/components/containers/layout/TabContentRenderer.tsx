import { TabsContent } from "~/shared/components/ui/tabs"
import { GroupDetail } from "~/features/groups/components/GroupDetail"
import { ProjectDetail } from "~/features/projects/components/ProjectDetail"
import { SSHTerminal } from "~/features/projects/components/canvas/nodes/host"
import { useLayoutStore } from "~/store/slices/layoutStore"
import { useTerminalStore } from "~/shared/store/terminalStore"
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
  
  const { getTerminalSession } = useTerminalStore()

  return (
    <>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-0">
          {tab.type === 'terminal' ? (
            (() => {
              const session = getTerminalSession(tab.hostId!)
              return session ? (
                <div className="h-full p-0">
                  <SSHTerminal 
                    host={session.host}
                    isOpen={true}
                    embedded={true}
                    onClose={() => {}}
                  />
                </div>
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  终端会话未找到
                </div>
              )
            })()
          ) : tab.type === 'group' ? (
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
                <ProjectDetail 
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
