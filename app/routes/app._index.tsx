import { DashboardPage } from "~/pages/Dashboard";
import { useProjects } from "~/shared/api/hooks";
import { useNavigate } from "@remix-run/react";
import { useLayoutStore } from "~/store/slices/layoutStore";
import { useEffect } from "react";

export default function AppDashboard() {
  const navigate = useNavigate();
  const { data: projects = [] } = useProjects();
  const { setSelected } = useLayoutStore();

  // 设置选中状态为概览
  useEffect(() => {
    setSelected({ type: 'overview' });
  }, []); // 移除 setSelected 依赖项，只在组件挂载时执行一次

  const handleProjectClick = (project: any) => {
    navigate(`/app/project/${project.id}`);
  };

  return (
    <DashboardPage 
      projects={projects} 
      onProjectClick={handleProjectClick}
    />
  );
}
