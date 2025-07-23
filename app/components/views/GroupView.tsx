import { Button } from "~/shared/components/ui/button";
import { HostList } from "~/features/hosts/components";
import { PortForwardList } from "~/features/port-forwards/components";
import { Plus } from "lucide-react";
import type { Group, Host, PortForward } from "~/shared/types/api";

interface GroupViewProps {
  group: Group;
  onAddHost?: () => void;
  onAddPort?: () => void;
  onEditHost?: (host: Host) => void;
  onToggleConnection?: (host: Host) => void;
  onEditPort?: (port: PortForward) => void;
  onTogglePortStatus?: (port: PortForward) => void;
}

export function GroupView({ 
  group, 
  onAddHost, 
  onAddPort,
  onEditHost,
  onToggleConnection,
  onEditPort,
  onTogglePortStatus
}: GroupViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: group.color }}
            />
            {group.name}
          </h2>
          <p className="text-muted-foreground">{group.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onAddHost}>
            <Plus className="w-4 h-4 mr-2" />
            添加主机
          </Button>
          <Button onClick={onAddPort}>
            <Plus className="w-4 h-4 mr-2" />
            添加端口转发
          </Button>
        </div>
      </div>
      
      {/* 主机列表 */}
      <div>
        <h3 className="text-lg font-medium mb-4">主机 ({group.hosts?.length || 0})</h3>
        <HostList 
          hosts={group.hosts || []}
          onEditHost={onEditHost}
          onToggleConnection={onToggleConnection}
        />
      </div>
      
      {/* 端口转发列表 */}
      <div>
        <h3 className="text-lg font-medium mb-4">端口转发 ({group.port_forwards?.length || 0})</h3>
        <PortForwardList 
          ports={group.port_forwards || []}
          onEditPort={onEditPort}
          onToggleStatus={onTogglePortStatus}
        />
      </div>
    </div>
  );
}
