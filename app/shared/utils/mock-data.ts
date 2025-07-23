import { Group } from "../types/group";

// 模拟组数据用于测试
export const mockGroups: Group[] = [
  {
    id: 1,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-20T14:45:00Z",
    name: "生产环境服务器",
    description: "生产环境的核心服务器组，包含Web服务器、数据库服务器等关键基础设施",
    color: "#ef4444",
    icon: "server",
    tags: ["production", "critical", "24x7"],
    metadata: {
      environment: "production",
      region: "us-east-1",
      backup_strategy: "daily",
      monitoring: true,
      alert_threshold: 95
    },
    project_id: 1
  },
  {
    id: 2,
    created_at: "2024-01-16T09:15:00Z",
    updated_at: "2024-01-22T11:30:00Z",
    name: "开发测试环境",
    description: "开发和测试使用的服务器组，用于功能验证和性能测试",
    color: "#22c55e",
    icon: "code",
    tags: ["development", "testing", "staging"],
    metadata: {
      environment: "development",
      region: "us-west-2",
      auto_shutdown: true,
      cost_optimization: true
    },
    project_id: 1
  },
  {
    id: 3,
    created_at: "2024-01-18T16:20:00Z",
    updated_at: "2024-01-25T08:45:00Z",
    name: "数据分析集群",
    description: "大数据处理和分析专用服务器集群，配置高性能计算资源",
    color: "#8b5cf6",
    icon: "database",
    tags: ["analytics", "bigdata", "high-performance"],
    metadata: {
      environment: "analytics",
      cluster_size: 5,
      storage_type: "ssd",
      processing_power: "high",
      scheduled_jobs: ["daily_etl", "weekly_report"]
    },
    project_id: 2
  },
  {
    id: 4,
    created_at: "2024-01-20T13:10:00Z",
    updated_at: "2024-01-26T15:20:00Z",
    name: "微服务网关",
    description: "API网关和微服务管理组，负责服务路由、负载均衡和安全认证",
    color: "#f59e0b",
    icon: "network",
    tags: ["microservices", "api-gateway", "load-balancer"],
    metadata: {
      service_mesh: "istio",
      load_balancer: "nginx",
      ssl_termination: true,
      rate_limiting: true,
      auth_provider: "oauth2"
    },
    project_id: 2
  },
  {
    id: 5,
    created_at: "2024-01-22T11:45:00Z",
    updated_at: "2024-01-27T09:30:00Z",
    name: "监控和日志",
    description: "系统监控、日志收集和告警服务器组，确保系统健康运行",
    color: "#06b6d4",
    icon: "activity",
    tags: ["monitoring", "logging", "alerting", "observability"],
    metadata: {
      monitoring_stack: "prometheus+grafana",
      log_aggregation: "elk",
      alert_manager: "pagerduty",
      retention_policy: "30_days",
      metrics_collection_interval: "30s"
    },
    project_id: 3
  }
];
