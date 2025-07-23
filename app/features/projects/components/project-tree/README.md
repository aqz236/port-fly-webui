# Project Tree Component 架构文档

## 概述

这是一个完全重构的项目树组件，采用了模块化、高内聚、低耦合的设计原则。该组件专门用于实现类似 VSCode 资源管理器的可拖拽、可嵌套的项目树功能。

## 目录结构

```
app/components/project-tree/
├── core/                   # 核心逻辑（与UI无关）
│   ├── types.ts           # 核心类型定义
│   ├── adapter.ts         # 数据适配器
│   └── operations.ts      # 操作管理器
├── hooks/                  # React Hooks
│   ├── useProjectTreeState.ts      # 状态管理Hook
│   └── useProjectTreeDragDrop.ts   # 拖拽处理Hook
├── components/            # UI组件
│   ├── ProjectTree.tsx           # 主要树组件
│   ├── ProjectTreeSection.tsx    # 适配器组件
│   └── ProjectTreeActions.tsx    # 操作按钮组件
├── utils/                 # 工具函数
│   └── tree-utils.ts     # 树操作工具
└── index.ts              # 导出文件
```

## 设计原则

### 1. 关注点分离 (Separation of Concerns)

- **Core**: 纯粹的业务逻辑，不依赖任何UI框架
- **Hooks**: React状态管理逻辑
- **Components**: UI渲染逻辑
- **Utils**: 纯函数工具

### 2. 高内聚

每个模块都有单一明确的职责：
- `adapter.ts`: 数据转换
- `operations.ts`: 树操作逻辑
- `useProjectTreeState.ts`: 状态管理
- `useProjectTreeDragDrop.ts`: 拖拽处理

### 3. 低耦合

- 核心逻辑不依赖UI组件
- 组件通过接口与核心逻辑通信
- 可以轻易替换UI库而不影响业务逻辑

### 4. 可测试性

- 纯函数易于单元测试
- 逻辑与UI分离，便于测试业务逻辑
- 明确的接口定义

## 核心组件说明

### ProjectTreeAdapter (数据适配器)

负责将外部的 `Project` 数据转换为树组件内部使用的 `ProjectTreeNode` 格式。

```typescript
// 主要方法
toTreeNodes(projects: Project[]): ProjectTreeNode[]
fromTreeNode(node: ProjectTreeNode): Project
createRootNode(): ProjectTreeNode
```

### TreeOperationsManager (操作管理器)

处理树的各种操作，如拖拽、移动、键盘导航等。

```typescript
// 主要方法
parseDropTarget(draggingPosition: DraggingPosition): DropTarget
validateMove(params: MoveNodeParams, nodeMap: Map): ValidationResult
handleKeyboardNavigation(key: string, ...): NavigationResult
```

### useProjectTreeState (状态管理Hook)

管理树的状态，包括展开项、选中项、聚焦项等。

```typescript
// 返回的接口
interface UseProjectTreeReturn {
  treeNodes: ProjectTreeNode[]
  nodeMap: Map<string, ProjectTreeNode>
  treeState: TreeState
  // ... 操作函数
}
```

### useProjectTreeDragDrop (拖拽处理Hook)

专门处理拖拽相关的逻辑。

```typescript
// 返回的接口
interface UseProjectTreeDragDropReturn {
  handleDrop: (items, target) => Promise<void>
  canDropAt: (items, target) => boolean
}
```

## 使用方式

### 基础使用

```typescript
import { ProjectTree } from '~/components/project-tree';

<ProjectTree
  projects={projects}
  selected={selected}
  onSelect={onSelect}
  onCreateProject={onCreateProject}
  onMoveProject={onMoveProject}
/>
```

### 兼容旧接口

```typescript
import { ProjectTreeSection } from '~/components/project-tree';

// 直接替换旧的 ProjectTreeSection
<ProjectTreeSection
  projects={projects}
  selected={selected}
  onSelect={onSelect}
  onCreateProject={onCreateProject}
  onMoveProject={onMoveProject}
/>
```

### 自定义配置

```typescript
import { ProjectTree, createTreeConfig } from '~/components/project-tree';

const customConfig = createTreeConfig({
  enableDragAndDrop: false,
  canDropOnFolder: true,
  enableSearch: true,
});

<ProjectTree
  // ... 其他属性
  enableDragAndDrop={customConfig.enableDragAndDrop}
/>
```

## 扩展性

### 添加新的树操作

1. 在 `core/types.ts` 中定义新的操作类型
2. 在 `core/operations.ts` 中实现操作逻辑
3. 在相应的 Hook 中暴露操作函数

### 支持不同的数据源

1. 实现新的适配器类继承 `TreeDataAdapter`
2. 在 Hook 中替换适配器实例

### 自定义UI组件

所有的业务逻辑都在 Core 和 Hooks 中，可以轻易创建新的UI组件使用这些逻辑。

## 性能优化

1. **Memoization**: 所有昂贵的计算都使用了 `useMemo`
2. **Callback Optimization**: 使用 `useCallback` 避免不必要的重渲染
3. **数据结构优化**: 使用 Map 进行快速查找
4. **惰性计算**: 只在需要时进行树结构计算

## 错误处理

1. **输入验证**: 所有操作都有输入验证
2. **优雅降级**: 操作失败时不会破坏整个组件
3. **错误边界**: 可以轻易添加 Error Boundary
4. **调试支持**: 详细的日志和错误信息

## 迁移指南

### 从旧的 ProjectTreeSection 迁移

1. 导入路径改变：
   ```typescript
   // 旧的
   import { ProjectTreeSection } from '~/components/layout/sidebar/ProjectTreeSection';
   
   // 新的
   import { ProjectTreeSection } from '~/components/project-tree';
   ```

2. 接口保持兼容，无需修改使用代码

3. 如果需要更多定制，可以直接使用 `ProjectTree` 组件

### 注意事项

1. 新组件使用了新的状态管理逻辑，可能在某些边缘情况下行为略有不同
2. 拖拽操作的验证更加严格
3. 性能有显著提升，特别是在大量项目时

## 未来计划

1. **搜索功能**: 添加项目搜索和过滤
2. **虚拟滚动**: 支持大量项目的虚拟滚动
3. **键盘导航**: 完整的键盘导航支持
4. **自定义渲染**: 支持自定义节点渲染
5. **动画效果**: 添加展开/折叠动画
6. **拖拽预览**: 改进拖拽时的视觉反馈
