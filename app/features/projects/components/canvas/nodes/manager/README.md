# 节点管理器使用指南

## 概述

节点管理器是一个用于管理Reactflow画布节点的系统，它提供了节点的自动发现、注册、CRUD操作和模板管理功能。

## 核心特性

### 1. 自动节点发现
节点管理器能够自动发现在`nodeTypes`映射中定义的节点组件，并为它们创建基础配置。

### 2. 节点模板系统
- 支持节点基础模板接口
- 提供默认配置和验证功能
- 支持节点生命周期管理

### 3. 动态类别管理
- 类别不再写死，可以动态添加
- 每个节点都属于一个类别
- 支持类别筛选和搜索

### 4. 节点管理界面
- 可视化的节点创建和管理界面
- 支持搜索、筛选和分类
- 实时预览和配置

## 使用方法

### 1. 基础集成

在ProjectCanvas中，节点管理器会自动发现nodeTypes中的所有节点：

```tsx
// 自定义节点类型映射
const nodeTypes = {
  groupNode: GroupNode,
  hostNode: HostNode,
  hostV2: HostNodeV2,  // 这个会被自动发现并纳管
  emptyProjectNode: EmptyProjectNode,
};

// 在组件中调用发现功能
useEffect(() => {
  discoverNodesFromTypes(nodeTypes);
}, [discoverNodesFromTypes]);
```

### 2. 创建支持模板的节点

#### 方法一：使用装饰器（推荐）

```tsx
import { registerNode, createNodeConfig } from '../manager';

const nodeConfig = createNodeConfig({
  type: 'myCustomNode',
  displayName: '我的自定义节点',
  description: '这是一个自定义节点',
  icon: React.createElement(MyIcon, { className: "w-4 h-4" }),
  categoryId: 'custom',
  createNodeData: (params) => ({
    id: params.id || '',
    type: 'myCustomNode',
    label: params.label || '新节点',
    // ...其他数据
  }),
});

// 使用装饰器注册
@registerNode(nodeConfig)
export const MyCustomNode = (props) => {
  // 节点组件实现
};
```

#### 方法二：使用attachNodeConfig

```tsx
import { attachNodeConfig, createNodeConfig } from '../manager';

const MyCustomNode = (props) => {
  // 节点组件实现
};

// 附加配置元数据
export default attachNodeConfig(MyCustomNode, {
  type: 'myCustomNode',
  displayName: '我的自定义节点',
  description: '这是一个自定义节点',
  // ...其他配置
});
```

#### 方法三：自动发现（基础配置）

如果节点组件没有任何配置元数据，系统会自动创建基础配置：

```tsx
// 这个节点会被自动发现，并创建基础配置
export const SimpleNode = (props) => {
  return <div>简单节点</div>;
};

// 在nodeTypes中引用即可
const nodeTypes = {
  simpleNode: SimpleNode, // 会自动创建基础配置
};
```

### 3. 节点类别管理

#### 注册新类别

```tsx
import { registerCategory } from '../manager';

registerCategory({
  id: 'database',
  name: '数据库节点',
  description: '数据库连接和操作节点',
  color: '#f59e0b'
});
```

#### 默认类别

系统提供以下默认类别：
- `host`: 主机节点
- `service`: 服务节点  
- `database`: 数据库节点
- `network`: 网络节点
- `custom`: 自定义节点

### 4. 节点数据结构

所有节点数据都继承自BaseNodeData：

```tsx
interface BaseNodeData extends Record<string, any> {
  id: string;
  type: string;
  label: string;
  description?: string;
  status?: 'active' | 'inactive' | 'error' | 'pending';
  metadata?: Record<string, any>;
  // 操作回调
  onEdit?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
  // ...其他回调
}
```

### 5. 使用节点管理器界面

用户可以通过画布工具栏的"节点管理"按钮打开节点管理器：

1. **创建节点**：浏览可用节点类型，选择后创建
2. **管理节点**：查看、编辑、删除现有节点
3. **统计信息**：查看节点使用统计

### 6. 节点生命周期

使用useNodeLifecycle钩子管理节点生命周期：

```tsx
import { useNodeLifecycle } from '../manager';

const MyNode = ({ id, data }) => {
  useNodeLifecycle(id, data, {
    onMount: (nodeId, data) => console.log('节点挂载', nodeId),
    onUpdate: (nodeId, oldData, newData) => console.log('节点更新', nodeId),
    onUnmount: (nodeId) => console.log('节点卸载', nodeId),
  });

  return <div>节点内容</div>;
};
```

## 最佳实践

### 1. 节点命名规范
- 使用PascalCase命名节点组件
- 节点类型使用camelCase
- 显示名称使用中文描述

### 2. 配置完整性
- 为节点提供完整的配置信息
- 包含图标、描述、标签等元数据
- 实现数据验证函数

### 3. 类别分组
- 将相关节点归类到同一类别
- 使用有意义的类别名称和颜色
- 避免创建过多细分类别

### 4. 数据结构
- 继承BaseNodeData接口
- 使用metadata存储扩展信息
- 提供清晰的数据创建函数

## 故障排除

### 节点未被发现
- 检查是否在nodeTypes中注册
- 确认组件导入正确
- 查看控制台日志

### 节点配置错误
- 检查配置对象的完整性
- 确认categoryId存在
- 验证createNodeData函数

### 对话框不显示
- 检查NodeManagerDialog是否正确导入
- 确认状态管理器正常工作
- 查看是否有JavaScript错误

## 扩展开发

### 自定义节点类别
继承NodeCategory接口创建自定义类别

### 自定义验证规则
实现validateNodeData函数进行数据验证

### 自定义生命周期
使用useNodeLifecycle钩子实现自定义逻辑
