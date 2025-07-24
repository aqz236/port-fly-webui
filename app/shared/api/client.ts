// PortFly API Client v4
// 简洁的模块化 API 客户端，支持新架构：Project -> Group -> (Host + Port)
// 使用组合模式将不同功能模块组合在一起

import type { ApiConfig } from './base-client'
import { BaseApiClient } from './base-client'
import { HealthApiClient } from './health-client'
import { ProjectsApiClient } from './projects-client'
import { GroupsApiClient } from './groups-client'
import { HostsApiClient } from './hosts-client'
import { SessionsApiClient } from './sessions-client'
import { UtilitiesApiClient } from './utilities-client'

/**
 * 模块化的 API 客户端
 * 
 * 使用方式：
 * - apiClient.health.getStatus()
 * - apiClient.projects.getProjects()
 * - apiClient.groups.getGroups()
 * - apiClient.hosts.getHosts()
 * - apiClient.portForwards.getPortForwards()
 * - apiClient.sessions.getTunnelSessions()
 * - apiClient.utilities.bulkOperation()
 */
export class ApiClient extends BaseApiClient {
  // 功能模块
  public readonly health: HealthApiClient
  public readonly projects: ProjectsApiClient
  public readonly groups: GroupsApiClient
  public readonly hosts: HostsApiClient
  public readonly sessions: SessionsApiClient
  public readonly utilities: UtilitiesApiClient

  constructor(config: Partial<ApiConfig> = {}) {
    super(config)
    
    // 初始化各功能模块，共享同一个配置
    this.health = new HealthApiClient(this.config)
    this.projects = new ProjectsApiClient(this.config)
    this.groups = new GroupsApiClient(this.config)
    this.hosts = new HostsApiClient(this.config)
    this.sessions = new SessionsApiClient(this.config)
    this.utilities = new UtilitiesApiClient(this.config)
  }
}

// 创建默认客户端实例
export const apiClient = new ApiClient()
