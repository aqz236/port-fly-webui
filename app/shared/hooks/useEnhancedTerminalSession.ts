import { useProjects } from "~/shared/api/hooks";
import { useTerminalStore } from "~/shared/store/terminalStore";

// Hook for getting enhanced terminal session information
export function useEnhancedTerminalSession(hostId: number) {
  const { data: projects = [] } = useProjects();
  const { getTerminalSession } = useTerminalStore();
  
  const session = getTerminalSession(hostId);
  
  // Find the project and group information for the host
  const getHostContext = () => {
    if (!session?.host?.group_id) return null;
    
    for (const project of projects) {
      if (project.groups) {
        const group = project.groups.find((g: any) => g.id === session.host.group_id);
        if (group) {
          return {
            project,
            group,
            host: session.host
          };
        }
      }
    }
    return null;
  };

  const context = getHostContext();
  
  return {
    session,
    context,
    hostName: session?.host?.name || `主机 ${hostId}`,
    projectId: context?.project.id,
    groupId: context?.group.id,
    projectName: context?.project.name,
    groupName: context?.group.name
  };
}
