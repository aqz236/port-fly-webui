import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { HostGroupCard, AddHostGroupCard } from "~/components/dashboard/host-group-card";
import { PortGroupCard, AddPortGroupCard } from "~/components/dashboard/port-group-card";
import { CreateHostGroupDialog } from "~/components/dashboard/create-host-group-dialog";
import { CreatePortGroupDialog } from "~/components/dashboard/create-port-group-dialog";
import {
  Home,
  Server,
  Zap,
  Settings,
  Activity,
  Plus,
  Search,
  Bell,
  User,
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "PortFly - SSH隧道管理器" },
    { name: "description", content: "现代化的SSH隧道管理工具" },
  ];
};

// 模拟数据
const mockHostGroups = [
  { id: 1, name: "生产环境", description: "生产服务器集群", color: "#ef4444", hostCount: 8 },
  { id: 2, name: "开发环境", description: "开发测试服务器", color: "#6366f1", hostCount: 5 },
  { id: 3, name: "运维", description: "监控和日志服务器", color: "#10b981", hostCount: 3 },
  { id: 4, name: "WF", description: "工作流服务器", color: "#f59e0b", hostCount: 2 },
];

const mockPortGroups = [
  { id: 1, name: "Web服务", description: "HTTP/HTTPS端口转发", color: "#10b981", portCount: 12, activeCount: 8 },
  { id: 2, name: "数据库", description: "数据库连接端口", color: "#6366f1", portCount: 6, activeCount: 4 },
  { id: 3, name: "缓存服务", description: "Redis/Memcached", color: "#f59e0b", portCount: 4, activeCount: 2 },
  { id: 4, name: "监控", description: "监控和指标收集", color: "#8b5cf6", portCount: 8, activeCount: 6 },
];

export default function Index() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [hostGroupDialogOpen, setHostGroupDialogOpen] = useState(false);
  const [portGroupDialogOpen, setPortGroupDialogOpen] = useState(false);
  const [hostGroups, setHostGroups] = useState(mockHostGroups);
  const [portGroups, setPortGroups] = useState(mockPortGroups);

  const handleCreateHostGroup = (data: { name: string; description: string; color: string }) => {
    const newGroup = {
      id: Date.now(),
      ...data,
      hostCount: 0,
    };
    setHostGroups([...hostGroups, newGroup]);
  };

  const handleCreatePortGroup = (data: { name: string; description: string; color: string; maxConcurrent: number }) => {
    const newGroup = {
      id: Date.now(),
      name: data.name,
      description: data.description,
      color: data.color,
      portCount: 0,
      activeCount: 0,
    };
    setPortGroups([...portGroups, newGroup]);
  };

  const sidebarItems = [
    { id: "dashboard", label: "仪表板", icon: Home },
    { id: "hosts", label: "主机管理", icon: Server },
    { id: "ports", label: "端口转发", icon: Zap },
    { id: "sessions", label: "活跃会话", icon: Activity },
    { id: "settings", label: "设置", icon: Settings },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* 侧边栏 */}
        <Sidebar className="border-r">
          <SidebarContent>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold">PortFly</span>
              </div>
            </div>
            
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.id)}
                        isActive={activeTab === item.id}
                        className="w-full"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* 主内容区域 */}
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-semibold">
              {sidebarItems.find(item => item.id === activeTab)?.label || "仪表板"}
            </h1>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-6">
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                {/* 概览卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">总主机数</CardTitle>
                      <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {hostGroups.reduce((sum, group) => sum + group.hostCount, 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">+2 较上周</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">端口转发</CardTitle>
                      <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {portGroups.reduce((sum, group) => sum + group.portCount, 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">+5 较上周</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">活跃连接</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {portGroups.reduce((sum, group) => sum + group.activeCount, 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">实时数据</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">主机分组</CardTitle>
                      <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{hostGroups.length}</div>
                      <p className="text-xs text-muted-foreground">分组管理</p>
                    </CardContent>
                  </Card>
                </div>

                {/* 主机分组 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">主机分组</h2>
                    <Button 
                      onClick={() => setHostGroupDialogOpen(true)}
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      添加分组
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {hostGroups.map((group) => (
                      <HostGroupCard key={group.id} {...group} />
                    ))}
                    <AddHostGroupCard onClick={() => setHostGroupDialogOpen(true)} />
                  </div>
                </div>

                {/* 端口分组 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">端口分组</h2>
                    <Button 
                      onClick={() => setPortGroupDialogOpen(true)}
                      size="sm" 
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      添加分组
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {portGroups.map((group) => (
                      <PortGroupCard key={group.id} {...group} />
                    ))}
                    <AddPortGroupCard onClick={() => setPortGroupDialogOpen(true)} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "hosts" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">主机管理</h2>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    添加主机
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                      主机管理功能开发中...
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "ports" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">端口转发</h2>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    添加转发规则
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                      端口转发管理功能开发中...
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "sessions" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">活跃会话</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                      会话监控功能开发中...
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">设置</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                      设置功能开发中...
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>

      {/* 对话框 */}
      <CreateHostGroupDialog
        open={hostGroupDialogOpen}
        onOpenChange={setHostGroupDialogOpen}
        onSubmit={handleCreateHostGroup}
      />
      <CreatePortGroupDialog
        open={portGroupDialogOpen}
        onOpenChange={setPortGroupDialogOpen}
        onSubmit={handleCreatePortGroup}
      />
    </SidebarProvider>
  );
}
