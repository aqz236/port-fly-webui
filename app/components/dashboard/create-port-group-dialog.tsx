import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { useState } from "react"

interface CreatePortGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; description: string; color: string; maxConcurrent: number }) => void
}

const colors = [
  { name: "绿色", value: "#10b981" },
  { name: "蓝色", value: "#6366f1" },
  { name: "紫色", value: "#8b5cf6" },
  { name: "橙色", value: "#f59e0b" },
  { name: "红色", value: "#ef4444" },
  { name: "粉色", value: "#ec4899" },
  { name: "青色", value: "#06b6d4" },
  { name: "石墨色", value: "#6b7280" },
]

export function CreatePortGroupDialog({ open, onOpenChange, onSubmit }: CreatePortGroupDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState(colors[0].value)
  const [maxConcurrent, setMaxConcurrent] = useState(10)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit({ 
        name: name.trim(), 
        description: description.trim(), 
        color,
        maxConcurrent 
      })
      setName("")
      setDescription("")
      setColor(colors[0].value)
      setMaxConcurrent(10)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>创建端口分组</DialogTitle>
          <DialogDescription>
            为你的端口转发创建一个新的分组来更好地组织管理。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">分组名称</Label>
            <Input
              id="name"
              placeholder="例如：Web服务"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">描述 (可选)</Label>
            <Input
              id="description"
              placeholder="分组描述"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">颜色</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colors.map((colorOption) => (
                  <SelectItem key={colorOption.value} value={colorOption.value}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: colorOption.value }}
                      />
                      {colorOption.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxConcurrent">最大并发连接数</Label>
            <Input
              id="maxConcurrent"
              type="number"
              min="1"
              max="100"
              value={maxConcurrent}
              onChange={(e) => setMaxConcurrent(parseInt(e.target.value) || 10)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">创建分组</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
