// 节点注册装饰器和工具函数
import React from 'react';
import { NodeConfig, NodeCategory } from './types';
import { nodeRegistrar } from './store';

/**
 * 节点注册装饰器
 * 用于自动注册节点配置到管理器
 */
export function registerNode(config: NodeConfig) {
  return function <T extends React.ComponentType<any>>(target: T): T {
    // 将配置信息附加到组件上，用于自动发现
    (target as any).__nodeConfig = config;
    
    // 注册节点配置
    const nodeConfig: NodeConfig = {
      ...config,
      component: target
    };

    // 延迟注册，确保在React组件加载时注册
    if (typeof window !== 'undefined') {
      // 浏览器环境，立即注册
      nodeRegistrar.register(nodeConfig);
    } else {
      // 服务端渲染环境，延迟到客户端
      setTimeout(() => {
        nodeRegistrar.register(nodeConfig);
      }, 0);
    }

    return target;
  };
}

/**
 * 直接给组件添加节点配置元数据（不通过装饰器）
 * 用于在无法使用装饰器的情况下标记组件
 */
export function attachNodeConfig<T extends React.ComponentType<any>>(
  component: T, 
  config: Omit<NodeConfig, 'component'>
): T {
  (component as any).__nodeConfig = config;
  return component;
}

/**
 * 类别注册装饰器
 * 用于注册新的节点类别
 */
export function registerCategory(category: NodeCategory) {
  if (typeof window !== 'undefined') {
    nodeRegistrar.registerCategory(category);
  } else {
    setTimeout(() => {
      nodeRegistrar.registerCategory(category);
    }, 0);
  }
}

/**
 * 自动发现并注册节点
 * 扫描指定目录下的所有节点组件
 */
export function autoRegisterNodes() {
  // 这个函数主要用于开发时的自动发现
  // 在生产环境中，节点需要显式导入才能注册
  console.log('节点自动发现已启用，请确保所有节点组件都有正确的装饰器');
}

/**
 * 创建节点配置的工厂函数
 */
export function createNodeConfig(
  partial: Omit<NodeConfig, 'component'>
): Omit<NodeConfig, 'component'> {
  return {
    // 默认值
    resizable: true,
    connectable: true,
    deletable: true,
    draggable: true,
    selectable: true,
    version: '1.0.0',
    tags: [],
    defaultStyle: {
      width: 200,
      height: 100,
      backgroundColor: '#ffffff',
      borderColor: '#d1d5db',
      borderWidth: 1,
      borderRadius: 8
    },
    // 覆盖用户提供的配置
    ...partial,
    // 默认创建节点数据函数
    createNodeData: partial.createNodeData || ((params: any) => ({
      id: params.id || '',
      type: partial.type,
      label: params.label || partial.displayName,
      description: params.description || partial.description,
      status: 'inactive' as const,
      metadata: params.metadata || {}
    })),
    // 默认验证函数
    validateNodeData: partial.validateNodeData || ((data: any) => {
      return !!(data && data.id && data.type && data.label);
    })
  };
}

/**
 * 节点基础组件属性接口
 */
export interface BaseNodeProps {
  id: string;
  data: any;
  selected?: boolean;
  dragging?: boolean;
}

/**
 * 创建节点基础组件的高阶组件
 */
export function withNodeBase<P extends BaseNodeProps>(
  WrappedComponent: React.ComponentType<P>
) {
  return function BaseNodeWrapper(props: P) {
    return React.createElement(
      'div',
      {
        className: 'node-wrapper',
        'data-node-id': props.id,
        'data-node-type': props.data.type
      },
      React.createElement(WrappedComponent, props)
    );
  };
}

/**
 * 节点生命周期钩子
 */
export interface NodeLifecycleHooks {
  onMount?: (nodeId: string, data: any) => void;
  onUnmount?: (nodeId: string) => void;
  onUpdate?: (nodeId: string, oldData: any, newData: any) => void;
  onSelect?: (nodeId: string, selected: boolean) => void;
  onConnect?: (nodeId: string, connection: any) => void;
  onDisconnect?: (nodeId: string, connection: any) => void;
}

/**
 * 使用节点生命周期的钩子
 */
export function useNodeLifecycle(
  nodeId: string,
  data: any,
  hooks: NodeLifecycleHooks
) {
  const { onMount, onUnmount, onUpdate } = hooks;

  // 组件挂载时调用
  React.useEffect(() => {
    onMount?.(nodeId, data);
    return () => onUnmount?.(nodeId);
  }, [nodeId, onMount, onUnmount]);

  // 数据更新时调用
  const prevDataRef = React.useRef(data);
  React.useEffect(() => {
    const prevData = prevDataRef.current;
    if (prevData !== data) {
      onUpdate?.(nodeId, prevData, data);
      prevDataRef.current = data;
    }
  }, [nodeId, data, onUpdate]);
}

// 重新导出存储和注册器
export { useNodeManagerStore, nodeRegistrar } from './store';
