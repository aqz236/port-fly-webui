// 终端管理器 - 与标签页系统集成，支持终端实例缓存
import { create } from 'zustand';
import { Host } from '~/shared/types/host';
import { TerminalState } from '~/features/projects/components/canvas/nodes/host/types';
import type { Terminal as ITerminal } from '@xterm/xterm';
import type { FitAddon as IFitAddon } from '@xterm/addon-fit';

interface TerminalInstance {
  terminal: ITerminal;
  fitAddon: IFitAddon;
  websocket: WebSocket | null;
  isActive: boolean;
}

interface TerminalSession {
  hostId: number;
  host: Host;
  state: TerminalState;
  instance?: TerminalInstance; // 缓存的终端实例
}

interface TerminalStore {
  sessions: Map<number, TerminalSession>;
  
  // 操作
  openTerminal: (host: Host, projectId: number) => void;
  closeTerminal: (hostId: number) => void;
  updateTerminalState: (hostId: number, state: Partial<TerminalState>) => void;
  getTerminalSession: (hostId: number) => TerminalSession | undefined;
  
  // 终端实例管理
  setTerminalInstance: (hostId: number, instance: TerminalInstance) => void;
  getTerminalInstance: (hostId: number) => TerminalInstance | undefined;
  removeTerminalInstance: (hostId: number) => void;
  activateTerminal: (hostId: number) => void;
  deactivateTerminal: (hostId: number) => void;
}

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  sessions: new Map(),

  openTerminal: (host: Host, projectId: number) => {
    // 动态导入布局存储以避免循环依赖
    import('~/store/slices/layoutStore').then(({ useLayoutStore }) => {
      const { openTerminalTab } = useLayoutStore.getState();
      openTerminalTab(host, projectId);
    });
    
    // 创建或获取终端会话
    const hostId = host.id;
    const existingSession = get().sessions.get(hostId);
    
    if (!existingSession) {
      const newSession: TerminalSession = {
        hostId,
        host,
        state: {
          hostId,
          connectionId: '',
          isConnected: false,
          isConnecting: false,
        },
      };
      
      set(state => {
        const newSessions = new Map(state.sessions);
        newSessions.set(hostId, newSession);
        return { sessions: newSessions };
      });
    }
  },

  closeTerminal: (hostId: number) => {
    const session = get().sessions.get(hostId);
    if (session?.instance) {
      // 清理终端实例
      if (session.instance.websocket) {
        session.instance.websocket.close();
      }
      session.instance.terminal.dispose();
    }
    
    set(state => {
      const newSessions = new Map(state.sessions);
      newSessions.delete(hostId);
      return { sessions: newSessions };
    });
  },

  updateTerminalState: (hostId: number, newState: Partial<TerminalState>) => {
    set(state => {
      const session = state.sessions.get(hostId);
      if (session) {
        const newSessions = new Map(state.sessions);
        newSessions.set(hostId, {
          ...session,
          state: { ...session.state, ...newState }
        });
        return { sessions: newSessions };
      }
      return state;
    });
  },

  getTerminalSession: (hostId: number) => {
    return get().sessions.get(hostId);
  },

  setTerminalInstance: (hostId: number, instance: TerminalInstance) => {
    set(state => {
      const session = state.sessions.get(hostId);
      if (session) {
        const newSessions = new Map(state.sessions);
        newSessions.set(hostId, { ...session, instance });
        return { sessions: newSessions };
      }
      return state;
    });
  },

  getTerminalInstance: (hostId: number) => {
    return get().sessions.get(hostId)?.instance;
  },

  removeTerminalInstance: (hostId: number) => {
    set(state => {
      const session = state.sessions.get(hostId);
      if (session?.instance) {
        const newSessions = new Map(state.sessions);
        newSessions.set(hostId, { ...session, instance: undefined });
        return { sessions: newSessions };
      }
      return state;
    });
  },

  activateTerminal: (hostId: number) => {
    set(state => {
      const session = state.sessions.get(hostId);
      if (session?.instance) {
        const newSessions = new Map(state.sessions);
        // 先将所有终端设为非活跃
        newSessions.forEach((session, id) => {
          if (session.instance) {
            session.instance.isActive = false;
          }
        });
        // 激活目标终端
        const updatedSession = { ...session };
        if (updatedSession.instance) {
          updatedSession.instance.isActive = true;
        }
        newSessions.set(hostId, updatedSession);
        return { sessions: newSessions };
      }
      return state;
    });
  },

  deactivateTerminal: (hostId: number) => {
    set(state => {
      const session = state.sessions.get(hostId);
      if (session?.instance) {
        const newSessions = new Map(state.sessions);
        const updatedSession = { ...session };
        if (updatedSession.instance) {
          updatedSession.instance.isActive = false;
        }
        newSessions.set(hostId, updatedSession);
        return { sessions: newSessions };
      }
      return state;
    });
  },
}));
