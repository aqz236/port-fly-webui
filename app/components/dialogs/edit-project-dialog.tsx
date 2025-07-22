import { useState, useEffect } from "react"
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
import { Alert, AlertDescription } from "~/components/ui/alert"
import { AlertCircle, MoreHorizontal } from "lucide-react"
import { IconPicker } from "../project-tree/components/IconPicker"
import { getIconByName, ICON_COLORS } from "../project-tree/utils/icons"
import type { Project } from "~/types/api"

export interface EditProjectData {
  name: string;
  description: string;
  color: string;
  icon: string;
  is_default: boolean;
}

interface EditProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  onEditProject?: (projectId: number, data: EditProjectData) => Promise<void>
}

export function EditProjectDialog({ 
  open, 
  onOpenChange, 
  project,
  onEditProject 
}: EditProjectDialogProps) {
  const [formData, setFormData] = useState<EditProjectData>({
    name: "",
    description: "",
    color: ICON_COLORS[0],
    icon: "",
    is_default: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showIconPicker, setShowIconPicker] = useState(false)

  // 当项目数据变化时，更新表单数据
  useEffect(() => {
    if (project && open) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        color: project.color || ICON_COLORS[0],
        icon: project.icon || "",
        is_default: project.is_default || false,
      })
      setError(null)
    }
  }, [project, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!project) {
      setError('未找到项目信息')
      return
    }
    
    if (!formData.name.trim()) {
      setError('项目名称不能为空')
      return
    }

    setError(null)
    setIsLoading(true)
    
    try {
      if (onEditProject) {
        await onEditProject(project.id, formData)
        handleClose()
      } else {
        setError('编辑项目功能未正确配置')
      }
    } catch (error) {
      console.error('Failed to edit project:', error)
      setError(error instanceof Error ? error.message : '编辑项目失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setError(null)
    setShowIconPicker(false)
  }

  const updateFormData = (field: keyof EditProjectData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!project) {
    return null
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>编辑项目</DialogTitle>
            <DialogDescription>
              修改项目的名称、描述、颜色和图标
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
                <Label htmlFor="edit-name" className="text-right">
                  名称 *
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="col-span-3"
                  placeholder="输入项目名称"
                  required
                />
              </div>

              {/* 项目描述 */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-description" className="text-right pt-2">
                  描述
                </Label>
                <Textarea
                  id="edit-description"
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
                  {ICON_COLORS.map((color: string) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.color === color
                          ? 'border-gray-600 scale-110'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateFormData('color', color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* 项目图标 */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">图标</Label>
                <div className="col-span-3 flex items-center gap-2">
                  {/* 当前选中的图标预览 */}
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    {(() => {
                      const selectedIconData = formData.icon ? getIconByName(formData.icon) : null;
                      if (selectedIconData) {
                        const IconComponent = selectedIconData.component;
                        return (
                          <IconComponent 
                            size={20} 
                            style={{ color: formData.color }}
                          />
                        );
                      }
                      return <div className="w-5 h-5 bg-gray-300 rounded" />;
                    })()}
                    <span className="text-sm text-gray-600">{formData.icon}</span>
                  </div>
                  
                  {/* 更多图标按钮 */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowIconPicker(true)}
                  >
                    <MoreHorizontal className="h-4 w-4 mr-1" />
                    更多图标
                  </Button>
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
                {isLoading ? "保存中..." : "保存更改"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 图标选择器对话框 */}
      <Dialog open={showIconPicker} onOpenChange={setShowIconPicker}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>选择项目图标</DialogTitle>
            <DialogDescription>
              为您的项目选择一个图标
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <IconPicker 
              open={true}
              onOpenChange={() => {}}
              selectedIcon={formData.icon || ''}
              selectedColor={formData.color || ICON_COLORS[0]}
              onSelect={(iconName: string, color: string) => {
                updateFormData('icon', iconName);
                updateFormData('color', color);
                setShowIconPicker(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
