import { Host } from "~/shared/types/api";
import { HostCard,  } from "./HostCard";

interface HostListProps {
  hosts: Host[];
  onEditHost?: (host: Host) => void;
  onToggleConnection?: (host: Host) => void;
}

export function HostList({ hosts, onEditHost, onToggleConnection }: HostListProps) {
  if (hosts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        暂无主机，点击右上角添加主机
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {hosts.map((host) => (
        <HostCard
          key={host.id}
          host={host}
          onEdit={onEditHost}
          onToggleConnection={onToggleConnection}
        />
      ))}
    </div>
  );
}
