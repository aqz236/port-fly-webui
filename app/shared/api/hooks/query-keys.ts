// Query Keys for React Query
// 集中管理所有的查询键，确保一致性和避免重复

export const queryKeys = {
  // 健康检查
  health: ['health'] as const,
  systemStats: ['system', 'stats'] as const,
  
  // 项目相关
  projects: ['projects'] as const,
  project: (id: number) => ['projects', id] as const,
  projectStats: (id: number) => ['projects', id, 'stats'] as const,
  projectChildren: (id: number) => ['projects', id, 'children'] as const,
  projectTree: () => ['projects', 'tree'] as const,
  
  // 组相关
  groups: ['groups'] as const,
  groupsByProject: (projectId: number) => ['groups', 'project', projectId] as const,
  group: (id: number) => ['groups', id] as const,
  groupStats: (id: number) => ['groups', id, 'stats'] as const,
  
  // 主机相关
  hosts: ['hosts'] as const,
  hostsByGroup: (groupId: number) => ['hosts', 'group', groupId] as const,
  host: (id: number) => ['hosts', id] as const,
  hostStats: (id: number) => ['hosts', id, 'stats'] as const,
  
  // 端口转发相关
  portForwards: ['port-forwards'] as const,
  portForwardsByGroup: (groupId: number) => ['port-forwards', 'group', groupId] as const,
  portForward: (id: number) => ['port-forwards', id] as const,
  portForwardStats: (id: number) => ['port-forwards', id, 'stats'] as const,
  
  // 会话相关
  sessions: ['sessions'] as const,
  activeSessions: ['sessions', 'active'] as const,
  session: (id: number) => ['sessions', id] as const,
  sessionStats: ['sessions', 'stats'] as const,
}
