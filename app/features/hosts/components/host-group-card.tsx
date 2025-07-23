import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/shared/components/ui/card"
import { Button } from "~/shared/components/ui/button"
import { Badge } from "~/shared/components/ui/badge"
import { MoreHorizontal, Server, Users, Plus } from "lucide-react"

interface HostGroupCardProps {
  id: number
  name: string
  description?: string
  color?: string
  hostCount: number
  onClick?: () => void
}

export function HostGroupCard({ id, name, description, color = "#6366f1", hostCount, onClick }: HostGroupCardProps) {
  return (
    <Card className="group cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: color }}
            />
            <CardTitle className="text-base font-medium">{name}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        {description && (
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Server className="h-4 w-4" />
            <span>{hostCount} 主机</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            环境
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export function AddHostGroupCard({ onClick }: { onClick?: () => void }) {
  return (
    <Card className="border-dashed border-2 cursor-pointer hover:border-primary/50 transition-colors group" onClick={onClick}>
      <CardContent className="flex flex-col items-center justify-center h-32 text-muted-foreground">
        <Plus className="h-8 w-8 mb-2 group-hover:text-primary transition-colors" />
        <span className="text-sm font-medium group-hover:text-primary transition-colors">添加主机分组</span>
      </CardContent>
    </Card>
  )
}
