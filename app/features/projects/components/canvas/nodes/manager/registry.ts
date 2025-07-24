// 节点注册表 - 管理所有可用的节点类型
import { NodeRegistry, NodeConfig } from './types';

class NodeRegistryManager {
  private registry: NodeRegistry = {};

  /**
   * 注册节点类型
   */
  register(config: NodeConfig): void {
    if (this.registry[config.type]) {
      console.warn(`节点类型 "${config.type}" 已经存在，将被覆盖`);
    }
    this.registry[config.type] = config;
  }

  /**
   * 批量注册节点类型
   */
  registerMultiple(configs: NodeConfig[]): void {
    configs.forEach(config => this.register(config));
  }

  /**
   * 获取节点配置
   */
  getConfig(type: string): NodeConfig | undefined {
    return this.registry[type];
  }

  /**
   * 获取所有注册的节点类型
   */
  getAllConfigs(): NodeConfig[] {
    return Object.values(this.registry);
  }

  /**
   * 检查节点类型是否已注册
   */
  isRegistered(type: string): boolean {
    return type in this.registry;
  }

  /**
   * 取消注册节点类型
   */
  unregister(type: string): boolean {
    if (this.registry[type]) {
      delete this.registry[type];
      return true;
    }
    return false;
  }

  /**
   * 清空注册表
   */
  clear(): void {
    this.registry = {};
  }

  /**
   * 获取节点类型映射 (用于ReactFlow)
   */
  getNodeTypes(): Record<string, React.ComponentType<any>> {
    const nodeTypes: Record<string, React.ComponentType<any>> = {};
    Object.entries(this.registry).forEach(([type, config]) => {
      nodeTypes[type] = config.component;
    });
    return nodeTypes;
  }

  /**
   * 创建节点数据
   */
  createNodeData(type: string, params: any) {
    const config = this.getConfig(type);
    if (!config) {
      throw new Error(`未找到节点类型 "${type}" 的配置`);
    }
    return config.createNodeData(params);
  }

  /**
   * 验证节点数据
   */
  validateNodeData(type: string, data: any): boolean {
    const config = this.getConfig(type);
    if (!config) {
      return false;
    }
    return config.validateNodeData ? config.validateNodeData(data) : true;
  }
}

// 创建全局单例
export const nodeRegistry = new NodeRegistryManager();

// 导出类型供外部使用
export type { NodeRegistry, NodeConfig } from './types';
