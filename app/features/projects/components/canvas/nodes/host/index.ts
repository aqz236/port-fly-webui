// index.ts - 主机节点组件导出
export { HostNode } from './HostNode';
export { SSHTerminal } from './terminal';  // 使用新的模块化终端
export { useHostNode } from './useHostNode';
export type {
  HostNodeData,
  SSHExecParams,
  SSHExecResult
} from './types';

// 从新的模块化终端导出类型
export type {
  TerminalState,
  TerminalConnectionParams,
  TerminalMessage
} from './terminal';
