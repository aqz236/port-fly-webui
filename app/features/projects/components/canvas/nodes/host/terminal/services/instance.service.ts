// 终端实例服务
import type { Terminal as XTerminal } from '@xterm/xterm';
import type { FitAddon as XFitAddon } from '@xterm/addon-fit';
import XTermPkg from '@xterm/xterm';
const { Terminal } = XTermPkg;
import FitAddonPkg from '@xterm/addon-fit';
const { FitAddon } = FitAddonPkg;
import { TerminalInstance, TerminalConfig } from '../types';
import { DEFAULT_TERMINAL_CONFIG } from '../config';

export class TerminalInstanceService {
  private instances = new Map<number, TerminalInstance>();

  /**
   * 创建新的终端实例
   */
  async createInstance(hostId: number, config?: Partial<TerminalConfig>): Promise<TerminalInstance> {
    // 检查是否已存在实例
    const existing = this.instances.get(hostId);
    if (existing) {
      return existing;
    }

    const finalConfig = { ...DEFAULT_TERMINAL_CONFIG, ...config };

    try {
      // 动态导入 xterm 和插件
      const [
        { Terminal },
        { FitAddon },
        { WebLinksAddon },
        { Unicode11Addon }
      ] = await Promise.all([
        import('@xterm/xterm'),
        import('@xterm/addon-fit'),
        import('@xterm/addon-web-links'),
        import('@xterm/addon-unicode11')
      ]);

      // 创建终端实例
      const terminal = new Terminal({
        cursorBlink: finalConfig.cursorBlink,
        fontSize: finalConfig.fontSize,
        fontFamily: finalConfig.fontFamily,
        theme: finalConfig.theme,
        allowTransparency: finalConfig.allowTransparency,
        allowProposedApi: true,
        cols: finalConfig.cols,
        rows: finalConfig.rows
      });

      // 创建插件
      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();
      const unicode11Addon = new Unicode11Addon();

      // 加载插件
      terminal.loadAddon(fitAddon);
      terminal.loadAddon(webLinksAddon);
      terminal.loadAddon(unicode11Addon);
      terminal.unicode.activeVersion = '11';

      // 创建实例对象
      const instance: TerminalInstance = {
        terminal,
        fitAddon,
        websocket: null,
        isActive: false,
        createdAt: new Date(),
        lastUsed: new Date()
      };

      // 保存实例
      this.instances.set(hostId, instance);
      
      console.log('Created terminal instance for host', hostId);
      return instance;

    } catch (error) {
      console.error('Failed to create terminal instance:', error);
      throw new Error('Failed to initialize terminal');
    }
  }

  /**
   * 获取终端实例
   */
  getInstance(hostId: number): TerminalInstance | undefined {
    return this.instances.get(hostId);
  }

  /**
   * 挂载终端到DOM元素
   */
  mountTerminal(hostId: number, element: HTMLElement): boolean {
    const instance = this.instances.get(hostId);
    if (!instance) {
      console.error('Terminal instance not found for host', hostId);
      return false;
    }

    try {
      instance.terminal.open(element);
      instance.fitAddon.fit();
      instance.isActive = true;
      instance.lastUsed = new Date();
      console.log('Mounted terminal for host', hostId);
      return true;
    } catch (error) {
      console.error('Failed to mount terminal:', error);
      return false;
    }
  }

  /**
   * 卸载终端
   */
  unmountTerminal(hostId: number): void {
    const instance = this.instances.get(hostId);
    if (instance) {
      instance.isActive = false;
      // 注意：不要调用 dispose，因为我们要保持实例
      console.log('Unmounted terminal for host', hostId);
    }
  }

  /**
   * 调整终端大小
   */
  resizeTerminal(hostId: number): boolean {
    const instance = this.instances.get(hostId);
    if (!instance || !instance.isActive) {
      return false;
    }

    try {
      instance.fitAddon.fit();
      instance.lastUsed = new Date();
      return true;
    } catch (error) {
      console.error('Failed to resize terminal:', error);
      return false;
    }
  }

  /**
   * 清空终端
   */
  clearTerminal(hostId: number): boolean {
    const instance = this.instances.get(hostId);
    if (!instance) {
      return false;
    }

    try {
      instance.terminal.clear();
      instance.lastUsed = new Date();
      return true;
    } catch (error) {
      console.error('Failed to clear terminal:', error);
      return false;
    }
  }

  /**
   * 写入数据到终端
   */
  writeToTerminal(hostId: number, data: string): boolean {
    const instance = this.instances.get(hostId);
    if (!instance) {
      return false;
    }

    try {
      instance.terminal.write(data);
      instance.lastUsed = new Date();
      return true;
    } catch (error) {
      console.error('Failed to write to terminal:', error);
      return false;
    }
  }

  /**
   * 获取终端选中内容
   */
  getTerminalSelection(hostId: number): string | null {
    const instance = this.instances.get(hostId);
    if (!instance) {
      return null;
    }

    try {
      return instance.terminal.getSelection();
    } catch (error) {
      console.error('Failed to get terminal selection:', error);
      return null;
    }
  }

  /**
   * 粘贴内容到终端
   */
  pasteToTerminal(hostId: number, text: string): boolean {
    const instance = this.instances.get(hostId);
    if (!instance) {
      return false;
    }

    try {
      instance.terminal.paste(text);
      instance.lastUsed = new Date();
      return true;
    } catch (error) {
      console.error('Failed to paste to terminal:', error);
      return false;
    }
  }

  /**
   * 获取终端大小
   */
  getTerminalSize(hostId: number): { cols: number; rows: number } | null {
    const instance = this.instances.get(hostId);
    if (!instance) {
      return null;
    }

    return {
      cols: instance.terminal.cols,
      rows: instance.terminal.rows
    };
  }

  /**
   * 设置WebSocket连接
   */
  setWebSocket(hostId: number, websocket: WebSocket | null): void {
    const instance = this.instances.get(hostId);
    if (instance) {
      instance.websocket = websocket;
    }
  }

  /**
   * 销毁终端实例
   */
  destroyInstance(hostId: number): void {
    const instance = this.instances.get(hostId);
    if (instance) {
      try {
        // 关闭WebSocket连接
        if (instance.websocket) {
          instance.websocket.close();
        }
        
        // 销毁终端
        instance.terminal.dispose();
        
        // 从Map中移除
        this.instances.delete(hostId);
        
        console.log('Destroyed terminal instance for host', hostId);
      } catch (error) {
        console.error('Failed to destroy terminal instance:', error);
      }
    }
  }

  /**
   * 获取所有活跃的实例
   */
  getActiveInstances(): Map<number, TerminalInstance> {
    const active = new Map<number, TerminalInstance>();
    
    this.instances.forEach((instance, hostId) => {
      if (instance.isActive) {
        active.set(hostId, instance);
      }
    });
    
    return active;
  }

  /**
   * 清理未使用的实例
   */
  cleanupInactiveInstances(maxAge: number = 30 * 60 * 1000): void {
    const now = new Date();
    const toDestroy: number[] = [];

    this.instances.forEach((instance, hostId) => {
      if (!instance.isActive && (now.getTime() - instance.lastUsed.getTime()) > maxAge) {
        toDestroy.push(hostId);
      }
    });

    toDestroy.forEach(hostId => {
      console.log('Cleaning up inactive terminal instance for host', hostId);
      this.destroyInstance(hostId);
    });
  }

  /**
   * 销毁所有实例
   */
  destroyAll(): void {
    const hostIds = Array.from(this.instances.keys());
    hostIds.forEach(hostId => {
      this.destroyInstance(hostId);
    });
  }
}
