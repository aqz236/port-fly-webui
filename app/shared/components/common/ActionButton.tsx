import { Button } from "~/shared/components/ui/button";
import { Play, Square, Edit } from "lucide-react";

export type ActionType = 'connect' | 'disconnect' | 'start' | 'stop' | 'edit';

interface ActionButtonProps {
  type: ActionType;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const actionConfig = {
  connect: { 
    icon: Play, 
    label: '连接',
    className: 'text-green-600'
  },
  disconnect: { 
    icon: Square, 
    label: '断开',
    className: 'text-red-600'
  },
  start: { 
    icon: Play, 
    label: '启动',
    className: 'text-green-600'
  },
  stop: { 
    icon: Square, 
    label: '停止',
    className: 'text-red-600'
  },
  edit: { 
    icon: Edit, 
    label: '编辑',
    className: ''
  },
};

export function ActionButton({ 
  type, 
  size = "sm", 
  variant = "outline", 
  onClick, 
  disabled,
  className 
}: ActionButtonProps) {
  const config = actionConfig[type];
  const Icon = config.icon;
  
  return (
    <Button 
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={`${config.className} ${className}`}
    >
      <Icon className="w-4 h-4 mr-1" />
      {config.label}
    </Button>
  );
}
