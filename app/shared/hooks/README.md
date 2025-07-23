shared/hooks/                       # 共享hooks
├── layout/                         # 布局相关hooks
│   ├── useSidebarSelection.ts      # 侧边栏选择逻辑
│   └── useTabManager.ts            # 标签页管理逻辑
├── business/                       # 业务逻辑hooks
│   └── useProjectActions.ts        # 项目操作逻辑
└── index.ts

**注**: 已经有了 `useLayoutStore` (Zustand) 来管理布局状态，比 Provider 模式更简洁高效，无需额外的 `LayoutProvider`。
