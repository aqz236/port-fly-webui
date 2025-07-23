// useProjectData.ts - 项目数据管理Hook
import { useEffect } from "react";
import { Project } from "~/shared/types/project";
import { useGroups } from "~/shared/api/hooks/groups";
import { useHosts } from "~/shared/api/hooks/hosts";
import { usePortForwards } from "~/shared/api/hooks/port-forwards";
import { useResourceStore } from "~/store/slices/resourceStore";

export function useProjectData(project: Project) {
  const {
    currentProject,
    setCurrentProject,
    groups,
    setGroups,
    hosts,
    setHosts,
    portForwards,
    setPortForwards
  } = useResourceStore();

  // API queries
  const { data: apiGroups = [], refetch: refetchGroups } = useGroups(project.id);
  const { data: apiHosts = [], refetch: refetchHosts } = useHosts();
  const { data: apiPortForwards = [], refetch: refetchPortForwards } = usePortForwards();

  // 初始化数据到 store
  useEffect(() => {
    if (project && project.id !== currentProject?.id) {
      setCurrentProject(project);
    }
  }, [project, currentProject?.id, setCurrentProject]);

  useEffect(() => {
    if (apiGroups && apiGroups.length >= 0 && JSON.stringify(apiGroups) !== JSON.stringify(groups)) {
      setGroups(apiGroups);
    }
  }, [apiGroups]);

  useEffect(() => {
    if (apiHosts && apiHosts.length >= 0 && JSON.stringify(apiHosts) !== JSON.stringify(hosts)) {
      setHosts(apiHosts);
    }
  }, [apiHosts]);

  useEffect(() => {
    if (apiPortForwards && apiPortForwards.length >= 0 && JSON.stringify(apiPortForwards) !== JSON.stringify(portForwards)) {
      setPortForwards(apiPortForwards);
    }
  }, [apiPortForwards]);

  // 构建带有资源数据的项目对象
  const projectWithData = {
    ...project,
    groups: groups.map(group => ({
      ...group,
      hosts: hosts.filter(host => host.group_id === group.id),
      port_forwards: portForwards.filter(port => port.group_id === group.id),
    }))
  };

  return {
    projectWithData,
    groups,
    hosts,
    portForwards,
    refetchGroups,
    refetchHosts,
    refetchPortForwards
  };
}
