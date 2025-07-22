import { ReactNode } from "react";

interface CustomSidebarProps {
  children: ReactNode;
  className?: string;
}

export function CustomSidebar({ children, className = "" }: CustomSidebarProps) {
  return (
    <div className={`w-64 h-full bg-background border-r border-border flex flex-col ${className}`}>
      {children}
    </div>
  );
}

interface CustomSidebarContentProps {
  children: ReactNode;
  className?: string;
}

export function CustomSidebarContent({ children, className = "" }: CustomSidebarContentProps) {
  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

interface CustomSidebarGroupProps {
  children: ReactNode;
  className?: string;
}

export function CustomSidebarGroup({ children, className = "" }: CustomSidebarGroupProps) {
  return (
    <div className={`px-3 py-2 ${className}`}>
      {children}
    </div>
  );
}

interface CustomSidebarGroupLabelProps {
  children: ReactNode;
  className?: string;
}

export function CustomSidebarGroupLabel({ children, className = "" }: CustomSidebarGroupLabelProps) {
  return (
    <div className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 ${className}`}>
      {children}
    </div>
  );
}

interface CustomSidebarGroupContentProps {
  children: ReactNode;
  className?: string;
}

export function CustomSidebarGroupContent({ children, className = "" }: CustomSidebarGroupContentProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {children}
    </div>
  );
}

interface CustomSidebarMenuProps {
  children: ReactNode;
  className?: string;
}

export function CustomSidebarMenu({ children, className = "" }: CustomSidebarMenuProps) {
  return (
    <nav className={`space-y-1 ${className}`}>
      {children}
    </nav>
  );
}

interface CustomSidebarMenuItemProps {
  children: ReactNode;
  className?: string;
}

export function CustomSidebarMenuItem({ children, className = "" }: CustomSidebarMenuItemProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

interface CustomSidebarMenuButtonProps {
  children: ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

export function CustomSidebarMenuButton({ 
  children, 
  onClick, 
  isActive = false, 
  className = "" 
}: CustomSidebarMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md
        transition-colors duration-150 ease-in-out
        ${isActive 
          ? 'bg-accent text-accent-foreground font-medium' 
          : 'text-foreground hover:bg-accent/50'
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
}
