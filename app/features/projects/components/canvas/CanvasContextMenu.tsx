// 画布右键菜单组件
import { memo } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/shared/components/ui/dropdown-menu";
import { 
  Plus,
  Edit3,
  Trash2,
  Copy,
  Settings,
  Play,
  Square,
  Database,
  Server,
  Network,
  LucideIcon
} from "lucide-react";
import { CanvasContextMenuData, CanvasAction } from './types';

interface CanvasContextMenuProps {
  children: React.ReactNode;
  onAction: (action: CanvasAction, nodeId?: string) => void;
  contextData?: CanvasContextMenuData;
}

interface MenuItem {
  action?: CanvasAction;
  icon?: LucideIcon;
  label?: string;
  destructive?: boolean;
  separator?: boolean;
}

export const CanvasContextMenu = memo(({ 
  children, 
  onAction, 
  contextData 
}: CanvasContextMenuProps) => {
  
  const getMenuItems = (): MenuItem[] => {
    if (!contextData) return [];

    const { nodeType, nodeId, actions } = contextData;
    const items: MenuItem[] = [];

    // 如果没有选中节点，显示创建菜单
    if (!nodeId) {
      items.push(
        { action: 'create-group', icon: Database, label: '创建组' },
        { separator: true },
        { action: 'create-host', icon: Server, label: '创建主机' },
        { action: 'create-port', icon: Network, label: '创建端口' }
      );
    } else {
      // 如果选中了节点，显示对应的操作菜单
      switch (nodeType) {
        case 'group':
          items.push(
            { action: 'create-host', icon: Server, label: '添加主机' },
            { action: 'create-port', icon: Network, label: '添加端口' },
            { separator: true },
            { action: 'edit', icon: Edit3, label: '编辑组' },
            { action: 'delete', icon: Trash2, label: '删除组', destructive: true }
          );
          break;
        case 'host':
          items.push(
            { action: 'create-port', icon: Network, label: '添加端口转发' },
            { separator: true },
            { action: 'connect', icon: Play, label: '连接主机' },
            { action: 'edit', icon: Edit3, label: '编辑主机' },
            { action: 'delete', icon: Trash2, label: '删除主机', destructive: true }
          );
          break;
        case 'port':
          items.push(
            { action: 'connect', icon: Play, label: '启动转发' },
            { action: 'disconnect', icon: Square, label: '停止转发' },
            { separator: true },
            { action: 'edit', icon: Edit3, label: '编辑端口' },
            { action: 'delete', icon: Trash2, label: '删除端口', destructive: true }
          );
          break;
      }
    }

    return items.filter(item => 
      !actions || item.separator || (item.action && actions.includes(item.action))
    );
  };

  const handleAction = (action: CanvasAction) => {
    onAction(action, contextData?.nodeId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        {getMenuItems().map((item, index) => {
          if (item.separator) {
            return <DropdownMenuSeparator key={index} />;
          }
          
          const Icon = item.icon;
          const action = item.action;
          if (!Icon || !action) return null;
          
          return (
            <DropdownMenuItem
              key={index}
              onClick={() => handleAction(action)}
              className={item.destructive ? 'text-red-600' : ''}
            >
              <Icon className="h-4 w-4 mr-2" />
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

CanvasContextMenu.displayName = 'CanvasContextMenu';
