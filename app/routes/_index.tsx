import type { MetaFunction } from "@remix-run/node";
import { useQueryClient } from "@tanstack/react-query";
import { Dashboard } from "~/components/Dashboard";
import { useProjects } from "~/lib/hooks/api";

export const meta: MetaFunction = () => {
  return [
    { title: "PortFly - SSH隧道管理器" },
    { name: "description", content: "现代化的SSH隧道管理工具" },
  ];
};

export default function Index() {
  const queryClient = useQueryClient();
  
  // 使用封装好的 hook 获取项目数据
  const { data: projects = [], isLoading, error } = useProjects();

  // 项目更新回调函数
  const handleProjectsUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-500">
          加载失败: {error instanceof Error ? error.message : '未知错误'}
        </div>
      </div>
    );
  }

  return <Dashboard projects={projects} onProjectsUpdate={handleProjectsUpdate} />;
}
