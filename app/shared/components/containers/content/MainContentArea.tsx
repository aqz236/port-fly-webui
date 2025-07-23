import { useNavigate } from "@remix-run/react"
import { Button } from "~/shared/components/ui/button"
import { DashboardPage } from "~/pages"
import { mockGroups } from "~/shared/utils/mock-data"
import { useLayoutStore } from "~/store/slices/layoutStore"
import { Project } from "~/shared/types/project"

interface MainContentAreaProps {
  projects: Project[]
}

export function MainContentArea({ projects }: MainContentAreaProps) {
  const navigate = useNavigate()
  const { selected } = useLayoutStore()

  // 渲染主要内容
  const renderMainContent = () => {
    switch (selected.type) {
      case 'overview':
        return (
          <DashboardPage
            projects={projects}
            onProjectClick={(project) => navigate(`/app/project/${project.id}`)}
          />
        )
      default:
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">欢迎使用 PortFly</h2>
            <p className="text-muted-foreground mb-8">
              从侧边栏选择项目或组来开始使用
            </p>
          </div>
        )
    }
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-auto p-6">
          {renderMainContent()}
        </div>
      </div>
    </div>
  )
}
