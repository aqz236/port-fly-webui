// 自动注册现有节点类型
// 这个文件负责将现有的节点自动注册到管理器中

import { registerCategory } from './decorators';

// 注册自定义节点类别
registerCategory({
  id: 'terminal',
  name: '终端节点',
  description: 'SSH终端和远程连接节点',
  color: '#059669'
});

registerCategory({
  id: 'monitor',
  name: '监控节点',
  description: '系统监控和状态节点',
  color: '#dc2626'
});

// 注意：这里暂时只注册了类别
// 具体的节点配置将在各自的节点文件中使用装饰器注册
console.log('节点管理器已初始化，等待节点注册...');
