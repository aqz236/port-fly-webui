import { PortForward } from "~/shared/types/api";
import { PortForwardCard,  } from "./PortForwardCard";

interface PortForwardListProps {
  ports: PortForward[];
  onEditPort?: (port: PortForward) => void;
  onToggleStatus?: (port: PortForward) => void;
}

export function PortForwardList({ ports, onEditPort, onToggleStatus }: PortForwardListProps) {
  if (ports.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        暂无端口转发，点击右上角添加端口转发
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {ports.map((port) => (
        <PortForwardCard
          key={port.id}
          port={port}
          onEdit={onEditPort}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}
