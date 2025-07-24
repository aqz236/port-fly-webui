// 项目画布相关的类型定义
import { Project } from '~/shared/types/project';
import { Group } from '~/shared/types/group';
import { Host } from '~/shared/types/host';
import { PortForward } from '~/shared/types/port-forward';

// 项目画布属性接口
export interface ProjectCanvasProps {
  project: Project;
  onCreateHost?: (groupId: number) => void;
  onEditHost?: (host: Host) => void;
  onDeleteHost?: (hostId: number) => void;
  onConnectHost?: (hostId: number) => void;
  onCreatePort?: (groupId: number, hostId?: number) => void;
  onEditPort?: (port: PortForward) => void;
  onDeletePort?: (portId: number) => void;
  onTogglePort?: (portId: number) => void;
}

// 画布状态接口 - 重构后不再使用 GroupNode，而是直接管理画布状态
export interface CanvasState {
  [groupId: number]: {
    isExpanded: boolean;
    position: { x: number; y: number };
  };
}

// 画布操作处理器接口
export interface CanvasHandlers {

  
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
  canvasStates: CanvasState;
  timestamp: string;
  version?: string;
}
