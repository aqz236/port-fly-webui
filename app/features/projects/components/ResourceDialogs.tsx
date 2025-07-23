// ResourceDialogs.tsx - 资源对话框容器组件
import { GroupDialog } from "./dialogs/GroupDialog";
import { HostDialog } from "./dialogs/HostDialog";
import { PortForwardDialog } from "./dialogs/PortForwardDialog";
import { DialogState } from "../hooks/useResourceDialog";
import { Host } from "~/shared/types/host";
import { CreateGroupData, UpdateGroupData } from "~/shared/types/group";
import { CreateHostData, UpdateHostData } from "~/shared/types/host";
import { CreatePortForwardData, UpdatePortForwardData } from "~/shared/types/port-forward";

interface ResourceDialogsProps {
  dialogState: DialogState;
  hosts: Host[];
  onCloseDialog: () => void;
  onSaveGroup: (data: CreateGroupData | UpdateGroupData) => Promise<void>;
  onSaveHost: (data: CreateHostData | UpdateHostData) => Promise<void>;
  onSavePortForward: (data: CreatePortForwardData | UpdatePortForwardData) => Promise<void>;
  groupLoading: boolean;
  hostLoading: boolean;
  portLoading: boolean;
}

export function ResourceDialogs({
  dialogState,
  hosts,
  onCloseDialog,
  onSaveGroup,
  onSaveHost,
  onSavePortForward,
  groupLoading,
  hostLoading,
  portLoading
}: ResourceDialogsProps) {
  return (
    <>
      {dialogState.type === 'group' && (
        <GroupDialog
          open={true}
          onOpenChange={onCloseDialog}
          group={dialogState.mode === 'edit' ? dialogState.data : undefined}
          projectId={dialogState.groupId!}
          onSave={onSaveGroup}
          loading={groupLoading}
        />
      )}

      {dialogState.type === 'host' && (
        <HostDialog
          open={true}
          onOpenChange={onCloseDialog}
          host={dialogState.mode === 'edit' ? dialogState.data : undefined}
          groupId={dialogState.groupId!}
          onSave={onSaveHost}
          loading={hostLoading}
        />
      )}

      {dialogState.type === 'port' && dialogState.groupId && (
        <PortForwardDialog
          open={true}
          onOpenChange={onCloseDialog}
          portForward={dialogState.mode === 'edit' ? dialogState.data : undefined}
          groupId={dialogState.groupId}
          hostId={dialogState.hostId}
          hosts={hosts.filter(host => host.group_id === dialogState.groupId)}
          onSave={onSavePortForward}
          loading={portLoading}
        />
      )}
    </>
  );
}
