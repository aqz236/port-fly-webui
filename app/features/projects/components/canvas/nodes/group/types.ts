// types.ts - GroupNode 相关类型定义
import { Group } from '~/shared/types/group';
import { Host } from '~/shared/types/host';
import { PortForward } from '~/shared/types/port-forward';

export interface GroupNodeData {
  group: Group;
  hosts: Host[];
  portForwards: PortForward[];
  isExpanded?: boolean;
  onEdit: (group: Group) => void;
  onDelete: (groupId: number) => void;
  onAddHost: (groupId: number) => void;
  onAddPort: (groupId: number) => void;
  onToggleExpand: (groupId: number) => void;
  onHostEdit: (host: Host) => void;
  onHostDelete: (hostId: number) => void;
  onHostConnect: (hostId: number) => void;
  onPortEdit: (port: PortForward) => void;
  onPortDelete: (portId: number) => void;
  onPortToggle: (portId: number) => void;
}

export interface GroupNodeEventHandlers {
  onEdit: (group: Group) => void;
  onDelete: (groupId: number) => void;
  onAddHost: (groupId: number) => void;
  onAddPort: (groupId: number) => void;
  onToggleExpand: (groupId: number) => void;
}

export interface HostItemEventHandlers {
  onHostEdit: (host: Host) => void;
  onHostDelete: (hostId: number) => void;
  onHostConnect: (hostId: number) => void;
}

export interface PortItemEventHandlers {
  onPortEdit: (port: PortForward) => void;
  onPortDelete: (portId: number) => void;
  onPortToggle: (portId: number) => void;
}
