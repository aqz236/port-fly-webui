import { BaseEntity } from "../base";
import { Host } from "../host";
import { PortForward } from "../port-forward";
import { Project } from "../project";

// 混合资源组 - 可以包含主机和端口
export interface Group extends BaseEntity {
  name: string;
  description: string;
  color: string;
  icon: string;
  project_id: number;
  project?: Project;
  hosts?: Host[];
  port_forwards?: PortForward[];
  tags: string[];
  metadata?: Record<string, any>;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  project_id: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateGroupData extends Partial<Omit<CreateGroupData, 'project_id'>> {}

export interface GroupStats {
  total_hosts: number;
  total_ports: number;
  connected_hosts: number;
  active_tunnels: number;
  last_used?: string;
}
