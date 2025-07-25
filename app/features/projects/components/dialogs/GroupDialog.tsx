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
import { AlertCircle, MoreHorizontal, X, Plus } from "lucide-react"
import { IconPicker } from "../project-tree/components/IconPicker"
import { getIconByName, getRandomIcon, getRandomColor, ICON_COLORS } from "../project-tree/utils/icons"
import { CreateGroupData, UpdateGroupData, Group } from "~/shared/types/group"

interface GroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: number
  group?: Group // 如果提供了 group，则为编辑模式
  onSave?: (data: CreateGroupData | UpdateGroupData) => Promise<void>
  loading?: boolean
}

export function GroupDialog({ 
  open, 
  onOpenChange, 
  projectId,
  group,
  onSave,
  loading = false
}: GroupDialogProps) {
  const isEditMode = !!group;
  

  
  // 获取随机的默认图标和颜色（仅用于创建模式）
  const defaultIcon = getRandomIcon();
  const defaultColor = getRandomColor();
  
  const [formData, setFormData] = useState<CreateGroupData | UpdateGroupData>({
    name: group?.name || "",
    description: group?.description || "",
    color: group?.color || defaultColor,
    icon: group?.icon || defaultIcon.name,
    project_id: projectId,
    tags: group?.tags || [],
  })
  const [tagInput, setTagInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showIconPicker, setShowIconPicker] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    
    if (!formData.name?.trim()) {
      setError('画布名称不能为空')
      return
    }

    setError(null)
    setIsLoading(true)
    
    try {
      if (onSave) {
        await onSave(formData)
        handleClose()
      } else {
        setError('保存画布功能未正确配置')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : (isEditMode ? '更新画布失败' : '创建画布失败'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    if (!isEditMode) {
      // 只在创建模式下重置表单
      const newDefaultIcon = getRandomIcon();
      const newDefaultColor = getRandomColor();
      setFormData({
        name: "",
        description: "",
        color: newDefaultColor,
        icon: newDefaultIcon.name,
        project_id: projectId,
        tags: [],
      })
    }
    setTagInput("")
    setError(null)
    setShowIconPicker(false)
  }

  const updateFormData = (field: keyof (CreateGroupData | UpdateGroupData), value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? '编辑画布' : '创建画布'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? '修改画布的信息' : '创建一个新的画布来组织主机和端口转发资源'}
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
            {/* 画布名称 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                名称 *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                className="col-span-3"
                placeholder="输入画布名称"
                required
              />
            </div>

            {/* 画布描述 */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                描述
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                className="col-span-3"
                placeholder="画布描述（可选）"
                rows={3}
              />
            </div>

            {/* 画布颜色 */}
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

            {/* 画布图标 */}
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

            {/* 标签 */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">标签</Label>
              <div className="col-span-3 space-y-2">
                {/* 标签输入 */}
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入标签按回车添加"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTag}
                    disabled={!tagInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* 已添加的标签 */}
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              取消
            </Button>
            <Button type="submit" disabled={!formData.name?.trim() || isLoading || loading}>
              {isLoading || loading ? (isEditMode ? "保存中..." : "创建中...") : (isEditMode ? "保存" : "创建画布")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {/* 图标选择器对话框 */}
    <Dialog open={showIconPicker} onOpenChange={setShowIconPicker}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>选择画布图标</DialogTitle>
          <DialogDescription>
            为您的画布选择一个图标
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
