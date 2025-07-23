// WebSocket 连接管理服务
import { TerminalMessage, TerminalConnectionParams, WebSocketState } from '../types';
import { WEBSOCKET_CONFIG } from '../config';

export class TerminalWebSocketService {
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private messageQueue: TerminalMessage[] = [];
  private isProcessingQueue = false;
  private hostId: number;
  private onMessage: (message: TerminalMessage) => void;
  private onStateChange: (state: WebSocketState) => void;
  private onError: (error: string) => void;

  constructor(
    hostId: number,
    onMessage: (message: TerminalMessage) => void,
    onStateChange: (state: WebSocketState) => void,
    onError: (error: string) => void
  ) {
    this.hostId = hostId;
    this.onMessage = onMessage;
    this.onStateChange = onStateChange;
    this.onError = onError;
  }

    /**
   * 建立WebSocket连接
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.websocket?.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected for host', this.hostId);
        resolve();
        return;
      }

      this.onStateChange(WebSocketState.CONNECTING);
      const wsUrl = `ws://localhost:8080/ws/terminal/${this.hostId}`;
      console.log('Connecting to WebSocket:', wsUrl);

      try {
        this.websocket = new WebSocket(wsUrl);
        
        // 设置连接成功回调
        this.websocket.onopen = () => {
          console.log('WebSocket connected for host', this.hostId);
          this.reconnectAttempts = 0;
          this.onStateChange(WebSocketState.OPEN);
          this.startPing();
          resolve();
        };

        // 设置连接失败回调
        this.websocket.onerror = (error) => {
          console.error('WebSocket connection error:', error);
          this.onError('WebSocket connection failed');
          reject(error);
        };

        this.setupEventHandlers();
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        this.onError('Failed to create WebSocket connection');
        reject(error);
      }
    });
  }

  /**
   * 断开WebSocket连接
   */
  disconnect(): void {
    this.clearTimers();
    this.reconnectAttempts = 0;
    
    // 清理消息队列
    this.messageQueue = [];
    this.isProcessingQueue = false;
    
    if (this.websocket) {
      // 移除事件监听器，避免在关闭时触发状态更新
      this.websocket.onclose = null;
      this.websocket.onerror = null;
      this.websocket.onmessage = null;
      this.websocket.onopen = null;
      
      this.websocket.close(1000, 'Client initiated disconnect');
      this.websocket = null;
    }
    
    this.onStateChange(WebSocketState.CLOSED);
  }

  /**
   * 发送消息 (使用队列机制)
   */
  sendMessage(message: TerminalMessage): boolean {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot send message');
      return false;
    }

    // 将消息添加到队列
    this.messageQueue.push(message);
    this.processMessageQueue();
    return true;
  }

  /**
   * 处理消息队列 (串行发送避免并发)
   */
  private async processMessageQueue(): Promise<void> {
    if (this.isProcessingQueue || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          this.websocket!.send(JSON.stringify(message));
          // 在消息之间添加小延迟避免并发问题
          await new Promise(resolve => setTimeout(resolve, 10));
        } catch (error) {
          console.error('Failed to send WebSocket message:', error);
          this.onError('Failed to send message');
          break;
        }
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.websocket?.readyState === WebSocket.OPEN;
  }

  /**
   * 发送连接参数
   */
  sendConnectParams(params: TerminalConnectionParams): boolean {
    return this.sendMessage({
      type: 'terminal_connect',
      data: params
    });
  }

  /**
   * 发送输入数据
   */
  sendInput(data: string): boolean {
    return this.sendMessage({
      type: 'terminal_data',
      data: data
    });
  }

  /**
   * 发送窗口大小变化
   */
  sendResize(cols: number, rows: number): boolean {
    return this.sendMessage({
      type: 'terminal_resize',
      data: { cols, rows }
    });
  }

  /**
   * 获取连接状态
   */
  getState(): WebSocketState {
    if (!this.websocket) return WebSocketState.CLOSED;
    
    switch (this.websocket.readyState) {
      case WebSocket.CONNECTING:
        return WebSocketState.CONNECTING;
      case WebSocket.OPEN:
        return WebSocketState.OPEN;
      case WebSocket.CLOSING:
        return WebSocketState.CLOSING;
      case WebSocket.CLOSED:
        return WebSocketState.CLOSED;
      default:
        return WebSocketState.CLOSED;
    }
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    if (!this.websocket) return;

    // 只设置除了onopen外的其他事件处理器，onopen在connect方法中已设置
    this.websocket.onmessage = (event) => {
      this.handleMessage(event);
    };

    this.websocket.onerror = (error) => {
      console.error('WebSocket error for host', this.hostId, error);
      this.onError('WebSocket connection error');
    };

    this.websocket.onclose = (event) => {
      console.log('WebSocket closed for host', this.hostId, 'Code:', event.code, 'Reason:', event.reason);
      this.onStateChange(WebSocketState.CLOSED);
      this.stopPing();
      
      // 如果不是正常关闭，尝试重连
      if (event.code !== 1000 && this.reconnectAttempts < WEBSOCKET_CONFIG.maxReconnectAttempts) {
        this.attemptReconnect();
      }
    };
  }

  /**
   * 处理WebSocket消息
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: TerminalMessage = JSON.parse(event.data);
      console.log('Received terminal message:', message.type);
      this.onMessage(message);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
      this.onError('Failed to parse server message');
    }
  }

  /**
   * 尝试重连
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= WEBSOCKET_CONFIG.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached for host', this.hostId);
      this.onError('Connection failed after multiple attempts');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${WEBSOCKET_CONFIG.maxReconnectAttempts}) for host`, this.hostId);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, WEBSOCKET_CONFIG.reconnectInterval);
  }

  /**
   * 开始心跳检测
   */
  private startPing(): void {
    this.pingTimer = setInterval(() => {
      if (this.websocket?.readyState === WebSocket.OPEN) {
        try {
          this.websocket.send(JSON.stringify({ type: 'ping' }));
        } catch (error) {
          console.error('Failed to send ping:', error);
        }
      }
    }, WEBSOCKET_CONFIG.pingInterval);
  }

  /**
   * 停止心跳检测
   */
  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  /**
   * 清理定时器
   */
  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopPing();
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    this.disconnect();
    this.clearTimers();
  }
}
