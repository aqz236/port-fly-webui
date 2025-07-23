// 项目画布相关的类型定义
import { Project } from '~/shared/types/project';
import { Group } from '~/shared/types/group';
import { Host } from '~/shared/types/host';
import { PortForward } from '~/shared/types/port-forward';

// 项目画布属性接口
export interface ProjectCanvasProps {
  project: Project;
  onCreateGroup?: (projectId: number) => void;
  onEditGroup?: (group: Group) => void;
  onDeleteGroup?: (groupId: number) => void;
  onCreateHost?: (groupId: number) => void;
  onEditHost?: (host: Host) => void;
  onDeleteHost?: (hostId: number) => void;
  onConnectHost?: (hostId: number) => void;
  onCreatePort?: (groupId: number, hostId?: number) => void;
  onEditPort?: (port: PortForward) => void;
  onDeletePort?: (portId: number) => void;
  onTogglePort?: (portId: number) => void;
}

// 组节点状态接口
export interface GroupNodeState {
  [groupId: number]: {
    isExpanded: boolean;
    position: { x: number; y: number };
  };
}

// 画布操作处理器接口
export interface CanvasHandlers {
  // 组操作
  handleEditGroup: (group: Group) => void;
  handleDeleteGroup: (groupId: number) => void;
  handleAddHost: (groupId: number) => void;
  handleAddPort: (groupId: number) => void;
  
  // 主机操作
  handleHostEdit: (host: Host) => void;
  handleHostDelete: (hostId: number) => void;
  handleHostConnect: (hostId: number) => void;
  handleHostDisconnect: (hostId: number) => void;
  
  // 端口操作
  handlePortEdit: (port: PortForward) => void;
  handlePortDelete: (portId: number) => void;
  handlePortToggle: (portId: number) => void;
}

// 布局数据导出格式
export interface LayoutExportData {
  projectId: number;
  groupStates: GroupNodeState;
  timestamp: string;
  version?: string;
}
