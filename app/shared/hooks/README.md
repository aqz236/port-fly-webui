shared/hooks/                       # 共享hooks
├── layout/                         # 布局相关hooks
│   └── useSidebarSelection.ts      # 侧边栏选择逻辑
├── business/                       # 业务逻辑hooks
│   └── useProjectActions.ts        # 项目操作逻辑
└── index.ts

**注**: 
- 已经有了 `useLayoutStore` (Zustand) 来管理布局状态，比 Provider 模式更简洁高效，无需额外的 `LayoutProvider`
- 原有的 `useTabManager` 已被移除，标签页功能现在通过 Remix 路由系统和 `RemixTabBrowser` 组件实现
