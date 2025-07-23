import { BaseEntity } from "../base";
import { Group } from "../group";

// 项目/工作空间 - 支持树状结构的容器
export interface Project extends BaseEntity {
  name: string;
  description: string;
  color: string;
  icon: string;
  is_default: boolean;
  groups?: Group[];
  metadata?: Record<string, any>;
  
  // 树状结构支持
  parent_id?: number;
  level: number;
  path?: string;
  sort: number;
  
  // 关联关系
  parent?: Project;
  children?: Project[];
}

export interface CreateProjectData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  is_default?: boolean;
  metadata?: Record<string, any>;
  parent_id?: number;
  sort?: number;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {}

// 项目树节点，用于前端展示
export interface ProjectTreeNode {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  is_default: boolean;
  groups?: Group[];
  metadata?: Record<string, any>;
  parent_id?: number;
  level: number;
  path?: string;
  sort: number;
  parent?: Project;
  children?: ProjectTreeNode[];
  has_children: boolean;
  is_expanded?: boolean;
}

// 项目移动参数
export interface MoveProjectParams {
  project_id: number;
  parent_id?: number;
  position: number;
}

export interface ProjectStats {
  total_groups: number;
  total_hosts: number;
  total_ports: number;
  active_tunnels: number;
  last_used?: string;
}