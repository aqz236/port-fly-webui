import type { MetaFunction } from "@remix-run/node";
import { Dashboard } from "~/components/Dashboard";
import { Project } from "~/types/dashboard";

export const meta: MetaFunction = () => {
  return [
    { title: "PortFly - SSH隧道管理器" },
    { name: "description", content: "现代化的SSH隧道管理工具" },
  ];
};

// 模拟数据
const mockProjects: Project[] = [
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

export default function Index() {
  return <Dashboard projects={mockProjects} />;
}
