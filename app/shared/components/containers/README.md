shared/components/containers/
├── content/            # 内容相关容器
│   └── MainContentArea.tsx         # 主内容区域
└── index.ts

# 说明
- 原有的layout/目录已被移除，因为标签页系统已重构为基于Remix路由
- 原有的AppLayoutContainer和TabContentRenderer已不再需要
- 标签页功能现在通过RemixTabBrowser和路由系统实现
