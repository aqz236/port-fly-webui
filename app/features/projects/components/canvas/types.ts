// Canvas 相关类型定义
import { Node, Edge } from '@xyflow/react';
import { Group } from '~/shared/types/group';
import { Host } from '~/shared/types/host';
import { PortForward } from '~/shared/types/port-forward';

export type CanvasNodeType = 'group' | 'host' | 'port';

export interface BaseCanvasNodeData {
  id: number;
  name: string;
  description?: string;
  color: string;
  type: CanvasNodeType;
  [key: string]: any; // 为了与 ReactFlow 兼容
}

export interface GroupNodeData extends BaseCanvasNodeData {
  type: 'group';
  group: Group;
  stats?: {
    hostCount: number;
    portCount: number;
    activeConnections: number;
  };
}

export interface HostNodeData extends BaseCanvasNodeData {
  type: 'host';
  host: Host;
  groupId: number;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
}

export interface PortNodeData extends BaseCanvasNodeData {
  type: 'port';
  port: PortForward;
  groupId: number;
  hostId: number;
  status: 'active' | 'inactive' | 'error';
}

export type CanvasNodeData = GroupNodeData | HostNodeData | PortNodeData;

// 画布操作类型
export type CanvasAction = 
  | 'create-group'
  | 'create-host'
  | 'create-port'
  | 'edit'
  | 'delete'
  | 'connect'
  | 'disconnect';

export interface CanvasContextMenuData {
  x: number;
  y: number;
  nodeId?: string;
  nodeType?: CanvasNodeType;
  actions: CanvasAction[];
}
