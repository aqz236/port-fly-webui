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
import { Input } from "~/shared/components/ui/input"
import { Label } from "~/shared/components/ui/label"
import { Textarea } from "~/shared/components/ui/textarea"
import { Badge } from "~/shared/components/ui/badge"
import { Alert, AlertDescription } from "~/shared/components/ui/alert"
import { AlertCircle, MoreHorizontal } from "lucide-react"
import { IconPicker } from "../project-tree/components/IconPicker"
import { getIconByName, getRandomIcon, getRandomColor, ICON_COLORS } from "../project-tree/utils/icons"
import { CreateProjectData } from "~/shared/types/project"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateProject?: (data: CreateProjectData) => Promise<void>
}

export function CreateProjectDialog({ 
  open, 
  onOpenChange, 
  onCreateProject 
}: CreateProjectDialogProps) {
  // 获取随机的默认图标和颜色
  const defaultIcon = getRandomIcon();
  const defaultColor = getRandomColor();
  
  const [formData, setFormData] = useState<CreateProjectData>({
    name: "",
    description: "",
    color: defaultColor,
    icon: defaultIcon.name,
    is_default: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showIconPicker, setShowIconPicker] = useState(false)

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
    const newDefaultIcon = getRandomIcon();
    const newDefaultColor = getRandomColor();
    setFormData({
      name: "",
      description: "",
      color: newDefaultColor,
      icon: newDefaultIcon.name,
      is_default: false,
    })
    setError(null)
    setShowIconPicker(false)
  }

  const updateFormData = (field: keyof CreateProjectData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <>
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
              {isLoading ? "创建中..." : "创建项目"}
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
