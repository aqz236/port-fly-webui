import { useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Badge } from "~/components/ui/badge"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Folder, FolderOpen, Star, Database, Globe, Code, AlertCircle } from "lucide-react"
import type { CreateProjectData } from "~/types/api"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateProject?: (data: CreateProjectData) => Promise<void>
}

const defaultColors = [
  "#6366f1", // indigo
  "#8b5cf6", // violet  
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#84cc16", // lime
]

const defaultIcons = [
  { icon: Folder, name: "folder" },
  { icon: FolderOpen, name: "folder-open" },
  { icon: Star, name: "star" },
  { icon: Database, name: "database" },
  { icon: Globe, name: "globe" },
  { icon: Code, name: "code" },
]

export function CreateProjectDialog({ 
  open, 
  onOpenChange, 
  onCreateProject 
}: CreateProjectDialogProps) {
  const [formData, setFormData] = useState<CreateProjectData>({
    name: "",
    description: "",
    color: defaultColors[0],
    icon: "folder",
    is_default: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submitted with data:', formData)
    console.log('onCreateProject function exists:', !!onCreateProject)
    
    if (!formData.name.trim()) {
      setError('项目名称不能为空')
      return
    }

    setError(null)
    setIsLoading(true)
    
    try {
      if (onCreateProject) {
        console.log('Calling onCreateProject with data:', formData)
        await onCreateProject(formData)
        console.log('Project created successfully')
        handleClose()
      } else {
        console.warn('onCreateProject function not provided')
        setError('创建项目功能未正确配置')
      }
    } catch (error) {
      console.error('Failed to create project:', error)
      setError(error instanceof Error ? error.message : '创建项目失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setFormData({
      name: "",
      description: "",
      color: defaultColors[0],
      icon: "folder",
      is_default: false,
    })
    setError(null)
  }

  const updateFormData = (field: keyof CreateProjectData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>创建项目</DialogTitle>
          <DialogDescription>
            创建一个新的项目来组织你的主机和端口转发资源
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4 py-4">
            {/* 项目名称 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                名称 *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                className="col-span-3"
                placeholder="输入项目名称"
                required
              />
            </div>

            {/* 项目描述 */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                描述
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                className="col-span-3"
                placeholder="项目描述（可选）"
                rows={3}
              />
            </div>

            {/* 项目颜色 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">颜色</Label>
              <div className="col-span-3 flex gap-2 flex-wrap">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color
                        ? 'border-foreground'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateFormData('color', color)}
                  />
                ))}
              </div>
            </div>

            {/* 项目图标 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">图标</Label>
              <div className="col-span-3 flex gap-2 flex-wrap">
                {defaultIcons.map(({ icon: Icon, name }) => (
                  <button
                    key={name}
                    type="button"
                    className={`w-10 h-10 rounded-md border-2 flex items-center justify-center ${
                      formData.icon === name
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => updateFormData('icon', name)}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* 默认项目 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">选项</Label>
              <div className="col-span-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => updateFormData('is_default', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">设为默认项目</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              取消
            </Button>
            <Button type="submit" disabled={!formData.name.trim() || isLoading}>
              {isLoading ? "创建中..." : "创建项目"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
