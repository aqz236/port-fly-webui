// 测试 ProjectDetail v2 组件
import { ProjectDetailV2 } from './ProjectDetail.v2';

// 模拟项目数据
const mockProject = {
  id: 1,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  name: '测试项目',
  description: '这是一个测试项目，用于演示画布式资源管理',
  color: '#3b82f6',
  icon: 'folder',
  is_default: true,
  parent_id: undefined,
  level: 0,
  path: '/test-project',
  sort: 0,
  groups: [
    {
      id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      name: '生产环境',
      description: '生产环境服务器组',
      color: '#ef4444',
      icon: 'server',
      project_id: 1,
      tags: ['production', 'critical'],
      metadata: {},
      hosts: [
        {
          id: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          name: 'Web服务器-01',
          hostname: '192.168.1.100',
          port: 22,
          username: 'ubuntu',
          description: '主要Web服务器',
          group_id: 1,
          auth_method: 'key' as const,
          status: 'connected' as const,
          last_connected: '2024-01-01T12:00:00Z',
          connection_count: 25,
          tags: ['web', 'nginx'],
          metadata: {}
        },
        {
          id: 2,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          name: '数据库服务器',
          hostname: '192.168.1.101',
          port: 22,
          username: 'postgres',
          description: 'PostgreSQL数据库服务器',
          group_id: 1,
          auth_method: 'password' as const,
          status: 'disconnected' as const,
          connection_count: 10,
          tags: ['database', 'postgres'],
          metadata: {}
        }
      ],
      port_forwards: [
        {
          id: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          name: 'Web管理端口',
          type: 'local' as const,
          local_port: 8080,
          remote_host: 'localhost',
          remote_port: 80,
          description: '转发到Web服务器管理界面',
          group_id: 1,
          host_id: 1,
          status: 'active' as const,
          auto_start: true,
          tags: ['web', 'admin'],
          metadata: {}
        },
        {
          id: 2,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          name: '数据库连接',
          type: 'local' as const,
          local_port: 5432,
          remote_host: 'localhost',
          remote_port: 5432,
          description: '转发到PostgreSQL数据库',
          group_id: 1,
          host_id: 2,
          status: 'inactive' as const,
          auto_start: false,
          tags: ['database'],
          metadata: {}
        }
      ]
    },
    {
      id: 2,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      name: '开发环境',
      description: '开发测试环境',
      color: '#10b981',
      icon: 'code',
      project_id: 1,
      tags: ['development', 'testing'],
      metadata: {},
      hosts: [
        {
          id: 3,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          name: '开发服务器',
          hostname: '192.168.1.200',
          port: 22,
          username: 'developer',
          description: '开发环境服务器',
          group_id: 2,
          auth_method: 'key' as const,
          status: 'connecting' as const,
          connection_count: 5,
          tags: ['dev', 'testing'],
          metadata: {}
        }
      ],
      port_forwards: []
    }
  ]
};

const mockStats = {
  total_groups: 2,
  total_hosts: 3,
  total_ports: 2,
  active_tunnels: 1,
  last_used: '2024-01-01T12:00:00Z'
};

export function ProjectDetailV2Test() {
  return (
    <div className="w-full h-screen">
      <ProjectDetailV2 
        project={mockProject}
        stats={mockStats}
        onGroupClick={(group) => console.log('Group clicked:', group)}
      />
    </div>
  );
}
