import { useState } from "react"
import { Button } from "~/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/shared/components/ui/dialog"
import { Alert, AlertDescription } from "~/shared/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { getIconByName } from "../project-tree/utils/icons"
import { Project } from "~/shared/types/project"

interface DeleteProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  onDeleteProject?: (projectId: number) => Promise<void>
}

export function DeleteProjectDialog({ 
  open, 
  onOpenChange, 
  project,
  onDeleteProject 
}: DeleteProjectDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!project) {
      setError('未找到项目信息')
      return
    }

    setError(null)
    setIsLoading(true)
    
    try {
      if (onDeleteProject) {
        await onDeleteProject(project.id)
        handleClose()
      } else {
        setError('删除项目功能未正确配置')
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
      setError(error instanceof Error ? error.message : '删除项目失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setError(null)
  }

  if (!project) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            删除项目
          </DialogTitle>
          <DialogDescription>
            此操作无法撤销。请确认您要删除以下项目：
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="py-4">
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="flex items-center gap-3">
              {project.icon && project.color && (
                <div className="flex items-center justify-center">
                  {(() => {
                    const iconData = getIconByName(project.icon);
                    if (iconData) {
                      const IconComponent = iconData.component;
                      return (
                        <IconComponent 
                          size={20} 
                          style={{ color: project.color }}
                        />
                      );
                    }
                    return (
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: project.color }}
                      >
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                    );
                  })()}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{project.name}</h3>
                {project.description && (
                  <p className="text-sm text-gray-600">{project.description}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>删除项目将会：</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>永久删除项目及其所有配置</li>
              <li>删除项目下的所有主机组和端口组</li>
              <li>停止所有相关的端口转发会话</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "删除中..." : "确认删除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
