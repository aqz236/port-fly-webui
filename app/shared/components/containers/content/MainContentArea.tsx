import { Button } from "~/shared/components/ui/button"
import { DashboardPage } from "~/pages"
import { mockGroups } from "~/lib/mock-data"
import { useLayoutStore } from "~/store/slices/layoutStore"
import type { Project } from "~/shared/types/api"

interface MainContentAreaProps {
  projects: Project[]
}

export function MainContentArea({ projects }: MainContentAreaProps) {
  const { 
    tabs, 
    activeTab, 
    selected, 
    openProjectTab, 
    openGroupTab 
  } = useLayoutStore()

  // 渲染主要内容（当没有标签页时）
  const renderMainContent = () => {
    switch (selected.type) {
      case 'overview':
        return (
          <DashboardPage
            projects={projects}
            onProjectClick={openProjectTab}
          />
        )
      default:
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">欢迎使用 PortFly</h2>
            <p className="text-muted-foreground mb-8">
              从侧边栏选择项目或组来开始使用标签页功能
            </p>
          </div>
        )
    }
  }

  // 渲染测试按钮区域
  const renderTestButtons = () => (
    <div className="p-4 border-b bg-muted/30">
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground mr-4">测试项目标签页:</span>
          {projects.slice(0, 3).map((project) => (
            <Button
              key={project.id}
              variant="outline"
              size="sm"
              onClick={() => openProjectTab(project)}
              className="flex items-center gap-2"
            >
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: project.color }}
              />
              打开项目 {project.name}
            </Button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground mr-4">测试组标签页:</span>
          {mockGroups.slice(0, 3).map((group) => (
            <Button
              key={group.id}
              variant="outline"
              size="sm"
              onClick={() => openGroupTab(group)}
              className="flex items-center gap-2"
            >
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: group.color }}
              />
              打开组 {group.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex-1 overflow-hidden">
      {tabs.length === 0 ? (
        // 没有打开标签页时显示选中的内容
        <div className="h-full flex flex-col">
          {renderTestButtons()}
          <div className="flex-1 overflow-auto p-6">
            {renderMainContent()}
          </div>
        </div>
      ) : (
        // 有标签页时内容由TabsContent管理
        <div className="h-full overflow-auto">
          {/* 标签页内容已经在AppHeader的children中渲染 */}
        </div>
      )}
    </div>
  )
}
