import { useParams } from "@remix-run/react";
import { SimpleTerminal } from "~/shared/components/terminal/SimpleTerminal";
import { useLayoutStore } from "~/store/slices/layoutStore";
import { useProjects } from "~/shared/api/hooks";
import { useEffect, useMemo } from "react";

export default function TerminalPage() {
  const { hostId } = useParams();
  const { setSelected } = useLayoutStore();
  const { data: projects = [] } = useProjects();

  // 创建一个模拟的host对象用于演示
  const mockHost = useMemo(() => ({
    id: Number(hostId),
    name: `Host ${hostId}`,
    hostname: `host-${hostId}.example.com`,
    port: 22,
    username: 'user',
    description: `Mock host ${hostId} for demonstration`,
    group_id: 1,
    auth_method: 'password' as const,
    status: 'connected' as const,
    last_connected: new Date().toISOString(),
    connection_count: 1,
    tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }), [hostId]);

  // 根据host的group_id找到对应的project_id（这里使用默认值）
  const getProjectIdFromHost = () => {
    // 由于是模拟数据，我们使用第一个项目或默认值
    return projects.length > 0 ? projects[0].id : 1;
  };

  // 设置选中状态
  useEffect(() => {
    const projectId = getProjectIdFromHost();
    if (projectId) {
      setSelected({ 
        type: 'project',
        projectId: projectId
      });
    }
  }, [projects]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <SimpleTerminal 
        host={mockHost}
        embedded={true}
      />
    </div>
  );
}
