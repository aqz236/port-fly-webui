import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "@remix-run/react";
import { useLayoutStore } from "~/store/slices/layoutStore";

interface PersistentTabContentProps {
  children: React.ReactNode;
}

interface CachedTab {
  id: string;
  path: string;
  element: React.ReactElement;
  isTerminal: boolean;
  lastAccessed: number;
}

/**
 * 持久化标签页内容组件
 * 
 * 专门解决终端连接在标签页切换时丢失的问题
 * 
 * 核心策略：
 * 1. 为每个标签页路径缓存 React 元素
 * 2. 终端类型标签页始终保持挂载状态
 * 3. 非终端标签页在切换时可以正常卸载重载
 * 4. 使用 CSS 控制显示/隐藏，避免 DOM 操作
 */
export function PersistentTabContent({ children }: PersistentTabContentProps) {
  const location = useLocation();
  const { tabs, activeTab } = useLayoutStore();
  
  // 缓存的标签页内容
  const [cachedTabs, setCachedTabs] = useState<Map<string, CachedTab>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // 当前标签页信息
  const currentTab = tabs.find(tab => tab.path === location.pathname);
  const isTerminalTab = currentTab?.type === 'terminal';

  // 缓存当前标签页内容
  useEffect(() => {
    if (!currentTab) return;

    setCachedTabs(prev => {
      const newMap = new Map(prev);
      
      // 检查是否已经缓存
      const existing = newMap.get(currentTab.id);
      
      if (!existing || existing.path !== location.pathname) {
        // 创建新的缓存项
        newMap.set(currentTab.id, {
          id: currentTab.id,
          path: location.pathname,
          element: React.cloneElement(children as React.ReactElement, { key: currentTab.id }),
          isTerminal: isTerminalTab,
          lastAccessed: Date.now()
        });
      } else {
        // 更新访问时间
        newMap.set(currentTab.id, {
          ...existing,
          lastAccessed: Date.now()
        });
      }
      
      return newMap;
    });
  }, [currentTab, location.pathname, children, isTerminalTab]);

  // 清理已关闭的标签页缓存
  useEffect(() => {
    const activeTabIds = new Set(tabs.map(tab => tab.id));
    
    setCachedTabs(prev => {
      const newMap = new Map();
      
      prev.forEach((cachedTab, tabId) => {
        if (activeTabIds.has(tabId)) {
          newMap.set(tabId, cachedTab);
        }
      });
      
      return newMap;
    });
  }, [tabs]);

  // 如果没有标签页，直接显示内容
  if (tabs.length === 0) {
    return <div className="h-full">{children}</div>;
  }

  return (
    <div ref={containerRef} className="h-full relative">
      {/* 渲染所有缓存的标签页 */}
      {Array.from(cachedTabs.values()).map((cachedTab) => {
        const isActive = cachedTab.id === activeTab;
        const shouldRender = isActive || cachedTab.isTerminal;
        
        if (!shouldRender) return null;

        return (
          <div
            key={cachedTab.id}
            className="absolute inset-0 h-full w-full"
            style={{
              display: isActive ? 'block' : 'none',
              visibility: isActive ? 'visible' : 'hidden',
              zIndex: isActive ? 10 : 1,
              opacity: isActive ? 1 : 0,
              pointerEvents: isActive ? 'auto' : 'none',
            }}
          >
            {cachedTab.element}
          </div>
        );
      })}

      {/* 如果当前标签页还没有被缓存，显示最新内容 */}
      {currentTab && !cachedTabs.has(currentTab.id) && (
        <div className="absolute inset-0 h-full w-full" style={{ zIndex: 10 }}>
          {children}
        </div>
      )}
    </div>
  );
}
