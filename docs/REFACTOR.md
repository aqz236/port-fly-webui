# PortFly Web UI 组件化重构

## 📁 新的目录结构

```
web-ui/app/components/
├── common/                    # 通用组件
│   ├── ActionButton.tsx       # 通用操作按钮
│   ├── StatCard.tsx          # 统计卡片
│   ├── StatusBadge.tsx       # 状态徽章
│   └── index.ts              # 通用组件导出
├── features/                  # 功能特性组件
│   ├── projects/             # 项目相关组件
│   │   ├── ProjectCard.tsx   # 项目卡片
│   │   ├── ProjectList.tsx   # 项目列表
│   │   └── index.ts          # 项目组件导出
│   ├── groups/               # 组相关组件
│   │   ├── GroupCard.tsx     # 组卡片
│   │   ├── GroupList.tsx     # 组列表
│   │   └── index.ts          # 组组件导出
│   ├── hosts/                # 主机相关组件
│   │   ├── HostCard.tsx      # 主机卡片
│   │   ├── HostList.tsx      # 主机列表
│   │   └── index.ts          # 主机组件导出
│   └── ports/                # 端口转发相关组件
│       ├── PortForwardCard.tsx  # 端口转发卡片
│       ├── PortForwardList.tsx  # 端口转发列表
│       └── index.ts             # 端口转发组件导出
├── layout/                    # 布局组件
│   ├── AppSidebar.tsx        # 应用侧边栏
│   ├── AppHeader.tsx         # 应用头部
│   └── index.ts              # 布局组件导出
├── views/                     # 视图组件
│   ├── OverviewView.tsx      # 概览视图
│   ├── ProjectView.tsx       # 项目视图
│   ├── GroupView.tsx         # 组视图
│   └── index.ts              # 视图组件导出
├── Dashboard.tsx              # 主仪表板组件
└── index.ts                   # 所有组件导出

web-ui/app/types/
└── dashboard.ts               # 类型定义
```

## 🧩 组件设计原则

### 1. 分层架构
- **Common**: 可复用的基础组件
- **Features**: 业务功能组件，按功能领域分组
- **Views**: 页面级视图组件
- **Layout**: 布局和导航组件

### 2. 单一职责
每个组件只负责一个特定的功能：
- `ProjectCard`: 只显示单个项目信息
- `ProjectList`: 只管理项目列表的渲染
- `ProjectView`: 组合使用项目相关组件

### 3. 可复用性
- 通用组件（如 `ActionButton`, `StatusBadge`）可在多处使用
- 功能组件通过 props 接口实现灵活配置
- 所有组件都支持样式定制

### 4. 类型安全
- 所有组件都有完整的 TypeScript 类型定义
- 统一的数据类型定义在 `types/dashboard.ts`
- 接口设计清晰，便于维护

## 🔄 数据流

```
_index.tsx (页面路由)
    ↓
Dashboard.tsx (主控制器)
    ↓
Views/ (视图组件)
    ↓
Features/ (功能组件)
    ↓
Common/ (基础组件)
```

## 📝 组件使用示例

### 基础组件使用
```tsx
import { StatCard, ActionButton, StatusBadge } from "~/components/common";

// 统计卡片
<StatCard
  title="项目总数"
  value={5}
  description="工作空间"
  icon={FolderOpen}
/>

// 操作按钮
<ActionButton
  type="connect"
  onClick={() => handleConnect()}
/>

// 状态徽章
<StatusBadge status="connected" />
```

### 功能组件使用
```tsx
import { ProjectList, HostList } from "~/components";

// 项目列表
<ProjectList 
  projects={projects}
  onProjectClick={handleProjectClick}
/>

// 主机列表
<HostList
  hosts={hosts}
  onEditHost={handleEditHost}
  onToggleConnection={handleToggleConnection}
/>
```

### 视图组件使用
```tsx
import { OverviewView, ProjectView, GroupView } from "~/components/views";

// 概览视图
<OverviewView
  projects={projects}
  onProjectSelect={handleProjectSelect}
/>

// 项目视图
<ProjectView
  project={selectedProject}
  onGroupSelect={handleGroupSelect}
  onAddGroup={handleAddGroup}
/>
```

## 🎯 重构收益

### 1. 可维护性提升
- 代码分离清晰，每个组件职责明确
- 组件可独立开发和测试
- 便于团队协作

### 2. 可复用性增强
- 基础组件可在多个场景使用
- 功能组件可组合使用
- 减少代码重复

### 3. 扩展性更好
- 新增功能时只需添加对应组件
- 组件接口设计灵活，易于扩展
- 支持渐进式开发

### 4. 开发效率提高
- 组件库化，开发新页面更快
- TypeScript 类型提示完整
- 统一的设计规范

## 🚀 下一步计划

1. **API 集成**: 将模拟数据替换为真实 API 调用
2. **状态管理**: 引入 Zustand 或 Redux 进行状态管理
3. **表单组件**: 添加创建/编辑表单组件
4. **实时更新**: 集成 WebSocket 实现实时状态更新
5. **测试覆盖**: 为所有组件添加单元测试
6. **Storybook**: 构建组件文档和演示
7. **性能优化**: 添加 memo、lazy loading 等优化

## 💡 开发建议

1. **遵循命名规范**: 组件名称清晰表达功能
2. **保持接口简洁**: Props 设计简单易用
3. **添加错误边界**: 处理组件渲染错误
4. **使用 React DevTools**: 调试组件层次结构
5. **定期重构**: 保持代码质量和架构清晰
