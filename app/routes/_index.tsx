import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { useHostGroups, useHostGroupActions } from "../lib/hooks/api/useHostGroups";
import { usePortGroups, usePortGroupActions } from "../lib/hooks/api/usePortGroups";
import { useActiveTunnelSessions } from "../lib/hooks/api/useSessions";
import { Plus, Server, Zap, Activity, AlertCircle } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "PortFly - SSH隧道管理器" },
    { name: "description", content: "现代化的SSH隧道管理工具" },
  ];
};

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="flex items-center gap-4 p-6">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <div className="flex-1">
          <p className="text-red-800 font-medium">加载失败</p>
          <p className="text-red-600 text-sm">{message}</p>
        </div>
        {onRetry && (
          <Button variant="outline" onClick={onRetry} size="sm">
            重试
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function HostGroupsSection() {
  const { data: hostGroups, isLoading, error, refetch } = useHostGroups();
  const { create, isCreating } = useHostGroupActions();

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;

  const handleCreateGroup = () => {
    create({
      name: `新建分组 ${Date.now()}`,
      description: "通过API创建的测试分组",
      color: "#6366f1",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">主机分组</h2>
        <Button onClick={handleCreateGroup} disabled={isCreating} size="sm">
          {isCreating ? "创建中..." : "添加分组"}
          <Plus className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {hostGroups?.map((group) => (
          <Card key={group.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: group.color }}
                />
                <CardTitle className="text-base">{group.name}</CardTitle>
              </div>
              {group.description && (
                <p className="text-sm text-muted-foreground">{group.description}</p>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Server className="h-4 w-4" />
                <span>{group.hosts?.length || 0} 主机</span>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {(!hostGroups || hostGroups.length === 0) && (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Server className="h-8 w-8 mb-2" />
              <span className="text-sm">暂无主机分组</span>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function PortGroupsSection() {
  const { data: portGroups, isLoading, error, refetch } = usePortGroups();
  const { create, isCreating } = usePortGroupActions();

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;

  const handleCreateGroup = () => {
    create({
      name: `端口分组 ${Date.now()}`,
      description: "通过API创建的测试端口分组",
      color: "#10b981",
      max_concurrent: 10,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">端口分组</h2>
        <Button onClick={handleCreateGroup} disabled={isCreating} size="sm">
          {isCreating ? "创建中..." : "添加分组"}
          <Plus className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {portGroups?.map((group) => (
          <Card key={group.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: group.color }}
                />
                <CardTitle className="text-base">{group.name}</CardTitle>
              </div>
              {group.description && (
                <p className="text-sm text-muted-foreground">{group.description}</p>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                <span>{group.port_forwards?.length || 0} 端口</span>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {(!portGroups || portGroups.length === 0) && (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Zap className="h-8 w-8 mb-2" />
              <span className="text-sm">暂无端口分组</span>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatsOverview() {
  const { data: hostGroups } = useHostGroups();
  const { data: portGroups } = usePortGroups();
  const { data: activeSessions } = useActiveTunnelSessions();

  const totalHosts = hostGroups?.reduce((sum, group) => sum + (group.hosts?.length || 0), 0) || 0;
  const totalPorts = portGroups?.reduce((sum, group) => sum + (group.port_forwards?.length || 0), 0) || 0;
  const activeSessionsCount = activeSessions?.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">总主机数</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalHosts}</div>
          <p className="text-xs text-muted-foreground">
            {hostGroups?.length || 0} 个分组
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">端口转发</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPorts}</div>
          <p className="text-xs text-muted-foreground">
            {portGroups?.length || 0} 个分组
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">活跃连接</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeSessionsCount}</div>
          <p className="text-xs text-muted-foreground">实时数据</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">系统状态</CardTitle>
          <div className="w-2 h-2 bg-green-500 rounded-full" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">正常</div>
          <p className="text-xs text-muted-foreground">API连接正常</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">PortFly</span>
          </div>
          <div className="ml-auto">
            <p className="text-sm text-muted-foreground">API集成测试页面</p>
          </div>
        </div>
      </header>
      
      <main className="p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">仪表板</h1>
          <p className="text-muted-foreground">管理你的SSH隧道和端口转发</p>
        </div>
        
        <StatsOverview />
        <HostGroupsSection />
        <PortGroupsSection />
      </main>
    </div>
  );
}
