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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
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
  FolderOpen,
  Folder,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Play,
  Square,
  Edit,
  Trash2,
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "PortFly - SSH隧道管理器" },
    { name: "description", content: "现代化的SSH隧道管理工具" },
  ];
};

// 模拟数据
const mockProjects = [
  {
    id: 1,
    name: "生产环境",
    description: "生产服务器和服务",
    color: "#ef4444",
    icon: "server",
    is_default: true,
    groups: [
      {
        id: 1,
        name: "Web服务器",
        description: "前端和API服务器",
        color: "#10b981",
        icon: "server",
        hosts: [
          { id: 1, name: "web-01", hostname: "192.168.1.10", status: "connected" },
          { id: 2, name: "web-02", hostname: "192.168.1.11", status: "disconnected" },
        ],
        port_forwards: [
          { id: 1, name: "HTTP", type: "local", local_port: 8080, remote_port: 80, status: "active" },
          { id: 2, name: "HTTPS", type: "local", local_port: 8443, remote_port: 443, status: "inactive" },
        ]
      },
      {
        id: 2,
        name: "数据库",
        description: "数据库服务器",
        color: "#6366f1",
        icon: "database",
        hosts: [
          { id: 3, name: "db-master", hostname: "192.168.1.20", status: "connected" },
        ],
        port_forwards: [
          { id: 3, name: "MySQL", type: "local", local_port: 3306, remote_port: 3306, status: "active" },
        ]
      }
    ]
  },
  {
    id: 2,
    name: "开发环境",
    description: "开发和测试环境",
    color: "#6366f1",
    icon: "code",
    is_default: false,
    groups: [
      {
        id: 3,
        name: "测试服务器",
        description: "测试环境服务器",
        color: "#f59e0b",
        icon: "server",
        hosts: [
          { id: 4, name: "test-01", hostname: "192.168.2.10", status: "connected" },
        ],
        port_forwards: [
          { id: 4, name: "API", type: "local", local_port: 3000, remote_port: 3000, status: "active" },
        ]
      }
    ]
  }
];

type ViewType = 'overview' | 'project' | 'group';

interface SelectedItem {
  type: ViewType;
  projectId?: number;
  groupId?: number;
}

export default function IndexV3() {
  const [projects] = useState(mockProjects);
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set([1]));
  const [selected, setSelected] = useState<SelectedItem>({ type: 'overview' });

  const toggleProject = (projectId: number) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const handleSelectProject = (projectId: number) => {
    setSelected({ type: 'project', projectId });
  };

  const handleSelectGroup = (projectId: number, groupId: number) => {
    setSelected({ type: 'group', projectId, groupId });
  };

  const getSelectedProject = () => {
    if (selected.projectId) {
      return projects.find(p => p.id === selected.projectId);
    }
    return null;
  };

  const getSelectedGroup = () => {
    const project = getSelectedProject();
    if (project && selected.groupId) {
      return project.groups.find(g => g.id === selected.groupId);
    }
    return null;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">概览</h2>
        <p className="text-muted-foreground">管理你的SSH隧道和端口转发</p>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">项目总数</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">工作空间</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总主机数</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.reduce((sum, p) => sum + p.groups.reduce((gSum, g) => gSum + g.hosts.length, 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">SSH连接</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">端口转发</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.reduce((sum, p) => sum + p.groups.reduce((gSum, g) => gSum + g.port_forwards.length, 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">隧道规则</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃连接</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.reduce((sum, p) => sum + p.groups.reduce((gSum, g) => 
                gSum + g.port_forwards.filter(pf => pf.status === 'active').length, 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">实时数据</p>
          </CardContent>
        </Card>
      </div>
      
      {/* 项目列表 */}
      <div>
        <h3 className="text-lg font-medium mb-4">最近项目</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSelectProject(project.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: project.color }}
                  />
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  {project.is_default && (
                    <Badge variant="secondary" className="text-xs">默认</Badge>
                  )}
                </div>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{project.groups.length} 个组</span>
                  <span>
                    {project.groups.reduce((sum, g) => sum + g.hosts.length, 0)} 主机
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProject = () => {
    const project = getSelectedProject();
    if (!project) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: project.color }}
              />
              {project.name}
            </h2>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            添加组
          </Button>
        </div>
        
        {/* 项目统计 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">组数量</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.groups.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">主机数量</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project.groups.reduce((sum, g) => sum + g.hosts.length, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">端口转发</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project.groups.reduce((sum, g) => sum + g.port_forwards.length, 0)}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 组列表 */}
        <div>
          <h3 className="text-lg font-medium mb-4">组列表</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.groups.map((group) => (
              <Card 
                key={group.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSelectGroup(project.id, group.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: group.color }}
                    />
                    <CardTitle className="text-base">{group.name}</CardTitle>
                  </div>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Server className="h-4 w-4" />
                    <span>{group.hosts.length} 主机</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span>{group.port_forwards.length} 端口转发</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGroup = () => {
    const group = getSelectedGroup();
    if (!group) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: group.color }}
              />
              {group.name}
            </h2>
            <p className="text-muted-foreground">{group.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              添加主机
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              添加端口转发
            </Button>
          </div>
        </div>
        
        {/* 主机列表 */}
        <div>
          <h3 className="text-lg font-medium mb-4">主机 ({group.hosts.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.hosts.map((host) => (
              <Card key={host.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{host.name}</CardTitle>
                    <Badge 
                      variant={host.status === 'connected' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {host.status === 'connected' ? '已连接' : '未连接'}
                    </Badge>
                  </div>
                  <CardDescription>{host.hostname}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      编辑
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={host.status === 'connected' ? 'text-green-600' : ''}
                    >
                      {host.status === 'connected' ? (
                        <>
                          <Square className="w-4 h-4 mr-1" />
                          断开
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          连接
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* 端口转发列表 */}
        <div>
          <h3 className="text-lg font-medium mb-4">端口转发 ({group.port_forwards.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.port_forwards.map((port) => (
              <Card key={port.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{port.name}</CardTitle>
                    <Badge 
                      variant={port.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {port.status === 'active' ? '活跃' : '非活跃'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {port.type} | {port.local_port} → {port.remote_port}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      编辑
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={port.status === 'active' ? 'text-red-600' : 'text-green-600'}
                    >
                      {port.status === 'active' ? (
                        <>
                          <Square className="w-4 h-4 mr-1" />
                          停止
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          启动
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    switch (selected.type) {
      case 'project':
        return renderProject();
      case 'group':
        return renderGroup();
      default:
        return renderOverview();
    }
  };

  const getPageTitle = () => {
    switch (selected.type) {
      case 'project':
        return getSelectedProject()?.name || '项目';
      case 'group':
        return getSelectedGroup()?.name || '组';
      default:
        return '概览';
    }
  };

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
            
            {/* 概览 */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setSelected({ type: 'overview' })}
                      isActive={selected.type === 'overview'}
                      className="w-full"
                    >
                      <Home className="w-4 h-4" />
                      <span>概览</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            {/* 项目列表 */}
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center justify-between">
                <span>项目</span>
                <Button variant="ghost" size="icon" className="h-4 w-4">
                  <Plus className="h-3 w-3" />
                </Button>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {projects.map((project) => (
                    <Collapsible
                      key={project.id}
                      open={expandedProjects.has(project.id)}
                      onOpenChange={() => toggleProject(project.id)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="w-full justify-between">
                            <div className="flex items-center gap-2">
                              {expandedProjects.has(project.id) ? (
                                <FolderOpen className="w-4 h-4" />
                              ) : (
                                <Folder className="w-4 h-4" />
                              )}
                              <span>{project.name}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 transition-transform data-[state=open]:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                onClick={() => handleSelectProject(project.id)}
                                isActive={selected.type === 'project' && selected.projectId === project.id}
                              >
                                <FolderOpen className="w-4 h-4" />
                                <span>项目概览</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            {project.groups.map((group) => (
                              <SidebarMenuSubItem key={group.id}>
                                <SidebarMenuSubButton
                                  onClick={() => handleSelectGroup(project.id, group.id)}
                                  isActive={
                                    selected.type === 'group' && 
                                    selected.projectId === project.id && 
                                    selected.groupId === group.id
                                  }
                                >
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-2 h-2 rounded-full" 
                                      style={{ backgroundColor: group.color }}
                                    />
                                    <span>{group.name}</span>
                                  </div>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            {/* 底部菜单 */}
            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Activity className="w-4 h-4" />
                      <span>活跃会话</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Settings className="w-4 h-4" />
                      <span>设置</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
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
            <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
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
            {renderMainContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
