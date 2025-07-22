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

interface CreatePortGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePortGroupDialog({ open, onOpenChange }: CreatePortGroupDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("#10b981")
  const [autoStart, setAutoStart] = useState(false)
  const [maxConcurrent, setMaxConcurrent] = useState("5")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 实现创建端口分组的逻辑
    console.log({ name, description, color, autoStart, maxConcurrent })
    onOpenChange(false)
    setName("")
    setDescription("")
    setColor("#10b981")
    setAutoStart(false)
    setMaxConcurrent("5")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>创建端口分组</DialogTitle>
          <DialogDescription>
            创建一个新的端口分组来组织你的端口转发规则
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                名称
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="例如：Web服务"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                描述
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="分组描述..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                颜色
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <input
                  type="color"
                  id="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-16 rounded border border-input"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1"
                  placeholder="#10b981"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxConcurrent" className="text-right">
                最大并发
              </Label>
              <Input
                id="maxConcurrent"
                type="number"
                value={maxConcurrent}
                onChange={(e) => setMaxConcurrent(e.target.value)}
                className="col-span-3"
                placeholder="5"
                min="1"
                max="100"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="autoStart" className="text-right">
                自动启动
              </Label>
              <div className="col-span-3">
                <input
                  type="checkbox"
                  id="autoStart"
                  checked={autoStart}
                  onChange={(e) => setAutoStart(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="autoStart" className="ml-2 text-sm">
                  启动时自动连接此分组的端口转发
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">创建分组</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
