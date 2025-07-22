import { useState } from "react"
import { Plus, Server, Settings, FolderOpen, Globe } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenu,
} from "~/components/ui/sidebar"
import { CreateHostGroupDialog } from "~/components/dashboard/create-host-group-dialog"
import { CreatePortGroupDialog } from "~/components/dashboard/create-port-group-dialog"

// 模拟数据
const hostGroups = [
  { id: 1, name: "生产", color: "#ef4444", hosts: 5 },
  { id: 2, name: "开发环境", color: "#3b82f6", hosts: 3 },
  { id: 3, name: "测试", color: "#10b981", hosts: 2 },
  { id: 4, name: "运维", color: "#f59e0b", hosts: 4 },
  { id: 5, name: "WF", color: "#8b5cf6", hosts: 1 },
  { id: 6, name: "开发主机集群", color: "#06b6d4", hosts: 8 },
]

const portGroups = [
  { id: 1, name: "Web服务", color: "#ef4444", ports: 3 },
  { id: 2, name: "数据库", color: "#3b82f6", ports: 2 },
  { id: 3, name: "缓存服务", color: "#10b981", ports: 1 },
]

export default function DashboardLayout() {
  const [showCreateHostGroup, setShowCreateHostGroup] = useState(false)
  const [showCreatePortGroup, setShowCreatePortGroup] = useState(false)
  const [selectedHostGroup, setSelectedHostGroup] = useState<number | null>(1)
  const [selectedPortGroup, setSelectedPortGroup] = useState<number | null>(null)

  return (
    <div className="flex h-screen bg-background">
      {/* 侧边栏 */}
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Globe className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">PortFly</span>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          {/* 主机分组 */}
          <SidebarGroup>
            <SidebarGroupLabel>
              <span>主机分组</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowCreateHostGroup(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {hostGroups.map((group) => (
                  <SidebarMenuItem key={group.id}>
                    <SidebarMenuButton
                      isActive={selectedHostGroup === group.id}
                      onClick={() => setSelectedHostGroup(group.id)}
                    >
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="flex-1">{group.name}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {group.hosts}
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* 端口分组 */}
          <SidebarGroup>
            <SidebarGroupLabel>
              <span>端口分组</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowCreatePortGroup(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {portGroups.map((group) => (
                  <SidebarMenuItem key={group.id}>
                    <SidebarMenuButton
                      isActive={selectedPortGroup === group.id}
                      onClick={() => setSelectedPortGroup(group.id)}
                    >
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="flex-1">{group.name}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {group.ports}
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* 设置 */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Settings className="h-4 w-4" />
                    <span>设置</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部栏 */}
        <header className="h-14 border-b bg-background flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">
              {selectedHostGroup && hostGroups.find(g => g.id === selectedHostGroup)?.name}
              {selectedPortGroup && portGroups.find(g => g.id === selectedPortGroup)?.name}
              {!selectedHostGroup && !selectedPortGroup && "PortFly 控制台"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <FolderOpen className="h-4 w-4 mr-2" />
              导入配置
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              新建隧道
            </Button>
          </div>
        </header>

        {/* 内容区域 */}
        <main className="flex-1 overflow-auto p-6">
          {selectedHostGroup && (
            <HostGroupContent 
              group={hostGroups.find(g => g.id === selectedHostGroup)!} 
            />
          )}
          {selectedPortGroup && (
            <PortGroupContent 
              group={portGroups.find(g => g.id === selectedPortGroup)!} 
            />
          )}
          {!selectedHostGroup && !selectedPortGroup && <DashboardOverview />}
        </main>
      </div>

      {/* 对话框 */}
      <CreateHostGroupDialog
        open={showCreateHostGroup}
        onOpenChange={setShowCreateHostGroup}
        onSubmit={(data) => {
          console.log('创建主机分组:', data)
          // TODO: 实际的创建逻辑
        }}
      />
      <CreatePortGroupDialog
        open={showCreatePortGroup}
        onOpenChange={setShowCreatePortGroup}
        onSubmit={(data) => {
          console.log('创建端口分组:', data)
          // TODO: 实际的创建逻辑
        }}
      />
    </div>
  )
}

// 主机分组内容
function HostGroupContent({ group }: { group: typeof hostGroups[0] }) {
  const hosts = [
    { id: 1, name: "Web服务器01", hostname: "web01.prod.com", status: "connected" },
    { id: 2, name: "Web服务器02", hostname: "web02.prod.com", status: "disconnected" },
    { id: 3, name: "数据库主服务器", hostname: "db-master.prod.com", status: "connected" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{group.name}</h2>
          <p className="text-muted-foreground">管理 {group.name} 环境下的主机</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          添加主机
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {hosts.map((host) => (
          <Card key={host.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{host.name}</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">{host.hostname}</div>
              <div className="flex items-center pt-2">
                <Badge 
                  variant={host.status === "connected" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {host.status === "connected" ? "已连接" : "未连接"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// 端口分组内容
function PortGroupContent({ group }: { group: typeof portGroups[0] }) {
  const ports = [
    { id: 1, name: "Nginx代理", localPort: 8080, remotePort: 80, status: "active" },
    { id: 2, name: "API服务", localPort: 3000, remotePort: 3000, status: "inactive" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{group.name}</h2>
          <p className="text-muted-foreground">管理 {group.name} 相关的端口转发</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          添加端口转发
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ports.map((port) => (
          <Card key={port.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{port.name}</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {port.localPort} → {port.remotePort}
              </div>
              <div className="flex items-center pt-2">
                <Badge 
                  variant={port.status === "active" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {port.status === "active" ? "运行中" : "已停止"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// 总览页面
function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">控制台总览</h2>
        <p className="text-muted-foreground">
          管理你的SSH隧道和端口转发
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总主机数</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              6个分组
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃隧道</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              3个端口分组
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">连接状态</CardTitle>
            <Badge className="h-4" variant="default">正常</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">
              连接成功率
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">流量统计</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4GB</div>
            <p className="text-xs text-muted-foreground">
              今日传输
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
