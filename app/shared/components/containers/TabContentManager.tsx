import React, { useRef, useEffect, useMemo } from "react";
import { useLocation } from "@remix-run/react";
import { useLayoutStore } from "~/store/slices/layoutStore";

interface TabContentManagerProps {
  children: React.ReactNode;
}

interface TabContent {
  tabId: string;
  path: string;
  content: React.ReactNode;
  timestamp: number;
}

/**
 * 标签页内容管理器
 * 
 * 这个组件的核心作用是保持所有标签页的组件实例，
 * 避免在标签页切换时卸载组件，从而防止终端连接丢失等问题。
 * 
 * 工作原理：
 * 1. 为每个标签页路径缓存组件实例
 * 2. 使用 CSS 显示/隐藏而不是挂载/卸载组件
 * 3. 保持所有标签页的状态和连接
 * 4. 只有在标签页关闭时才真正卸载组件
 */
export function TabContentManager({ children }: TabContentManagerProps) {
  const location = useLocation();
  const { tabs, activeTab } = useLayoutStore();
  const cachedContents = useRef<Map<string, TabContent>>(new Map());

  // 当前活动的标签页ID
  const currentTabId = useMemo(() => {
    return tabs.find(tab => tab.path === location.pathname)?.id || null;
  }, [tabs, location.pathname]);

  // 缓存当前路径的内容
  useEffect(() => {
    if (currentTabId && children) {
      const existingContent = cachedContents.current.get(currentTabId);
      
      // 如果是新的标签页或内容发生变化，更新缓存
      if (!existingContent || existingContent.path !== location.pathname) {
        cachedContents.current.set(currentTabId, {
          tabId: currentTabId,
          path: location.pathname,
          content: children,
          timestamp: Date.now()
        });
      }
    }
  }, [currentTabId, location.pathname, children]);

  // 清理已关闭标签页的缓存
  useEffect(() => {
    const activeTabIds = new Set(tabs.map(tab => tab.id));
    const cachedTabIds = Array.from(cachedContents.current.keys());
    
    cachedTabIds.forEach(tabId => {
      if (!activeTabIds.has(tabId)) {
        cachedContents.current.delete(tabId);
      }
    });
  }, [tabs]);

  // 如果没有标签页，直接显示内容
  if (tabs.length === 0) {
    return <div className="h-full">{children}</div>;
  }

  return (
    <div className="h-full relative">
      {Array.from(cachedContents.current.entries()).map(([tabId, tabContent]) => {
        const isActive = tabId === activeTab;
        
        return (
          <div
            key={tabId}
            className="absolute inset-0 h-full w-full"
            style={{
              display: isActive ? 'block' : 'none',
              visibility: isActive ? 'visible' : 'hidden',
              zIndex: isActive ? 10 : 0,
            }}
          >
            {/* 对于终端类型的标签页，始终保持组件挂载 */}
            {tabId.startsWith('terminal-') ? (
              <div style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? 'auto' : 'none' }}>
                {tabContent.content}
              </div>
            ) : (
              // 对于其他类型的标签页，在激活时显示
              isActive && tabContent.content
            )}
          </div>
        );
      })}
      
      {/* 如果当前路径没有缓存的内容，显示新内容 */}
      {currentTabId && !cachedContents.current.has(currentTabId) && (
        <div className="absolute inset-0 h-full w-full" style={{ zIndex: 10 }}>
          {children}
        </div>
      )}
    </div>
  );
}
