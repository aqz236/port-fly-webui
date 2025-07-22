import { useState } from "react";
import { Link, useLocation } from "@remix-run/react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Server,
  Folder,
  FolderOpen,
  Plus,
  MoreHorizontal,
  Settings,
  Network,
  Globe,
  Shield,
  Database,
  Terminal,
  Activity,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface SidebarGroup {
  id: string;
  name: string;
  type: "host" | "port";
  icon?: string;
  color?: string;
  count?: number;
  isExpanded?: boolean;
  items?: SidebarItem[];
}

interface SidebarItem {
  id: string;
  name: string;
  status?: "online" | "offline" | "connecting";
  type?: string;
}

export function Sidebar() {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["dev", "prod"]));

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // 模拟数据 - 在实际应用中这些数据来自API
  const hostGroups: SidebarGroup[] = [
    {
      id: "dev",
      name: "开发环境",
      type: "host",
      color: "#10b981",
      count: 3,
      items: [
        { id: "dev-web", name: "Web 服务器", status: "online" },
        { id: "dev-db", name: "数据库", status: "online" },
        { id: "dev-cache", name: "Redis", status: "offline" },
      ],
    },
    {
      id: "prod",
      name: "生产环境",
      type: "host",
      color: "#ef4444",
      count: 5,
      items: [
        { id: "prod-web1", name: "Web-01", status: "online" },
        { id: "prod-web2", name: "Web-02", status: "online" },
        { id: "prod-db", name: "MySQL主库", status: "online" },
        { id: "prod-db-slave", name: "MySQL从库", status: "connecting" },
        { id: "prod-redis", name: "Redis集群", status: "online" },
      ],
    },
    {
      id: "test",
      name: "测试环境",
      type: "host",
      color: "#f59e0b",
      count: 2,
      items: [
        { id: "test-web", name: "测试服务器", status: "offline" },
        { id: "test-db", name: "测试数据库", status: "offline" },
      ],
    },
  ];

  const portGroups: SidebarGroup[] = [
    {
      id: "web",
      name: "Web服务",
      type: "port",
      color: "#3b82f6",
      count: 4,
      items: [
        { id: "web-80", name: "HTTP (80)", type: "Local Forward" },
        { id: "web-443", name: "HTTPS (443)", type: "Local Forward" },
        { id: "web-8080", name: "Dev Server (8080)", type: "Local Forward" },
        { id: "web-3000", name: "React Dev (3000)", type: "Local Forward" },
      ],
    },
    {
      id: "database",
      name: "数据库",
      type: "port",
      color: "#8b5cf6",
      count: 3,
      items: [
        { id: "db-3306", name: "MySQL (3306)", type: "Local Forward" },
        { id: "db-5432", name: "PostgreSQL (5432)", type: "Local Forward" },
        { id: "db-6379", name: "Redis (6379)", type: "Local Forward" },
      ],
    },
    {
      id: "monitoring",
      name: "监控服务",
      type: "port",
      color: "#f97316",
      count: 2,
      items: [
        { id: "mon-9090", name: "Prometheus (9090)", type: "Local Forward" },
        { id: "mon-3001", name: "Grafana (3001)", type: "Local Forward" },
      ],
    },
  ];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-gray-400";
      case "connecting":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "online":
        return "在线";
      case "offline":
        return "离线";
      case "connecting":
        return "连接中";
      default:
        return "未知";
    }
  };

  return (
    <div className="w-64 bg-background border-r border-border h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Network className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">PortFly</h1>
            <p className="text-xs text-muted-foreground">SSH隧道管理器</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {/* 主机分组 */}
          <div className="mb-6">
            <div className="flex items-center justify-between px-2 py-1 mb-2">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">主机分组</span>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            <div className="space-y-1">
              {hostGroups.map((group) => (
                <div key={group.id}>
                  <div className="flex items-center group">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-full justify-start px-2 py-1"
                      onClick={() => toggleGroup(group.id)}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {expandedGroups.has(group.id) ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                        <span className="text-sm">{group.name}</span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {group.count}
                        </Badge>
                      </div>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>编辑分组</DropdownMenuItem>
                        <DropdownMenuItem>添加主机</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          删除分组
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {expandedGroups.has(group.id) && group.items && (
                    <div className="ml-6 space-y-1 mt-1">
                      {group.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 px-2 py-1 hover:bg-accent rounded-sm">
                          <div className={cn("w-1.5 h-1.5 rounded-full", getStatusColor(item.status))} />
                          <span className="text-sm text-muted-foreground flex-1">{item.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {getStatusText(item.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 端口分组 */}
          <div className="mb-6">
            <div className="flex items-center justify-between px-2 py-1 mb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">端口分组</span>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            <div className="space-y-1">
              {portGroups.map((group) => (
                <div key={group.id}>
                  <div className="flex items-center group">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-full justify-start px-2 py-1"
                      onClick={() => toggleGroup(group.id)}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {expandedGroups.has(group.id) ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                        <span className="text-sm">{group.name}</span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {group.count}
                        </Badge>
                      </div>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>编辑分组</DropdownMenuItem>
                        <DropdownMenuItem>添加端口转发</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          删除分组
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {expandedGroups.has(group.id) && group.items && (
                    <div className="ml-6 space-y-1 mt-1">
                      {group.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 px-2 py-1 hover:bg-accent rounded-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span className="text-sm text-muted-foreground flex-1">{item.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-border">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
            <Link to="/settings">
              <Settings className="w-4 h-4 mr-2" />
              设置
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
            <Link to="/activity">
              <Activity className="w-4 h-4 mr-2" />
              活动监控
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
