// ProjectDetail 组件 v2 - 集成画布式资源管理
import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/shared/components/ui/card";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import { 
  Copy, 
  Edit, 
  Settings, 
  Plus,
  Folder,
  Users, 
  Server, 
  Activity,
  Clock,
  Database,
  TreePine,
  Layers3,
  List,
  Grid3X3
} from "lucide-react";

import { ProjectCanvas } from "./canvas";
import { GroupDialog } from "./dialogs/GroupDialog";
import { HostDialog } from "./dialogs/HostDialog";
import { PortForwardDialog } from "./dialogs/PortForwardDialog";

import { Project, ProjectStats } from "~/shared/types/project";
import { Group, CreateGroupData, UpdateGroupData } from "~/shared/types/group";
import { Host, CreateHostData, UpdateHostData } from "~/shared/types/host";
import { PortForward, CreatePortForwardData, UpdatePortForwardData } from "~/shared/types/port-forward";

// API hooks
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup } from "~/shared/api/hooks/groups";
import { useHosts, useCreateHost, useUpdateHost, useDeleteHost } from "~/shared/api/hooks/hosts";
import { usePortForwards, useCreatePortForward, useUpdatePortForward, useDeletePortForward } from "~/shared/api/hooks/port-forwards";

// Store
import { useResourceStore } from "~/store/slices/resourceStore";

interface ProjectDetailProps {
  project: Project;
  stats?: ProjectStats;
  onGroupClick?: (group: Group) => void;
}

type ViewMode = 'canvas' | 'list' | 'grid';

interface DialogState {
  type: 'group' | 'host' | 'port' | null;
  mode: 'create' | 'edit';
  data?: any;
  groupId?: number;
  hostId?: number;
}

export function ProjectDetail({ project, stats, onGroupClick }: ProjectDetailProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('canvas');
  const [showRawJson, setShowRawJson] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>({ type: null, mode: 'create' });

  // Resource Store
  const {
    currentProject,
    setCurrentProject,
    groups,
    setGroups,
    addGroup,
    updateGroup,
    removeGroup,
    hosts,
    setHosts,
    addHost,
    updateHost,
    removeHost,
    portForwards,
    setPortForwards,
    addPortForward,
    updatePortForward,
    removePortForward
  } = useResourceStore();

  // API Hooks
  const { data: apiGroups = [], refetch: refetchGroups } = useGroups(project.id);
  const { data: apiHosts = [], refetch: refetchHosts } = useHosts();
  const { data: apiPortForwards = [], refetch: refetchPortForwards } = usePortForwards();

  // Group mutations
  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup();
  const deleteGroupMutation = useDeleteGroup();

  // Host mutations
  const createHostMutation = useCreateHost();
  const updateHostMutation = useUpdateHost();
  const deleteHostMutation = useDeleteHost();

  // Port Forward mutations
  const createPortForwardMutation = useCreatePortForward();
  const updatePortForwardMutation = useUpdatePortForward();
  const deletePortForwardMutation = useDeletePortForward();

  // 初始化数据到 store - 使用更安全的方式
  useEffect(() => {
    if (project && project.id !== currentProject?.id) {
      setCurrentProject(project);
    }
  }, [project, currentProject?.id, setCurrentProject]);

  useEffect(() => {
    if (apiGroups && apiGroups.length >= 0 && JSON.stringify(apiGroups) !== JSON.stringify(groups)) {
      setGroups(apiGroups);
    }
  }, [apiGroups]); // 移除 groups 和 setGroups 依赖

  useEffect(() => {
    if (apiHosts && apiHosts.length >= 0 && JSON.stringify(apiHosts) !== JSON.stringify(hosts)) {
      setHosts(apiHosts);
    }
  }, [apiHosts]); // 移除 hosts 和 setHosts 依赖

  useEffect(() => {
    if (apiPortForwards && apiPortForwards.length >= 0 && JSON.stringify(apiPortForwards) !== JSON.stringify(portForwards)) {
      setPortForwards(apiPortForwards);
    }
  }, [apiPortForwards]); // 移除 portForwards 和 setPortForwards 依赖

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // 对话框处理函数
  const openDialog = useCallback((type: DialogState['type'], mode: DialogState['mode'], data?: any, groupId?: number, hostId?: number) => {
    setDialogState({ type, mode, data, groupId, hostId });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogState({ type: null, mode: 'create' });
  }, []);

  // Canvas 事件处理
  const handleCreateGroup = useCallback(async (data: any) => {
    openDialog('group', 'create', {}, project.id);
  }, [project.id, openDialog]);

  const handleCreateHost = useCallback(async (groupId: number, data: any) => {
    openDialog('host', 'create', {}, groupId);
  }, [openDialog]);

  const handleCreatePort = useCallback(async (groupId: number, hostId: number, data: any) => {
    openDialog('port', 'create', {}, groupId, hostId);
  }, [openDialog]);

  const handleEditNode = useCallback(async (nodeType: string, nodeId: number, data: any) => {
    switch (nodeType) {
      case 'group':
        openDialog('group', 'edit', data.group, data.group.id);
        break;
      case 'host':
        openDialog('host', 'edit', data.host, data.groupId, data.host.id);
        break;
      case 'port':
        openDialog('port', 'edit', data.port, data.groupId, data.hostId);
        break;
    }
  }, [openDialog]);

  const handleDeleteNode = useCallback(async (nodeType: string, nodeId: number) => {
    if (!confirm(`确定要删除这个${nodeType === 'group' ? '组' : nodeType === 'host' ? '主机' : '端口转发'}吗？`)) {
      return;
    }

    try {
      switch (nodeType) {
        case 'group':
          await deleteGroupMutation.mutateAsync(nodeId);
          removeGroup(nodeId);
          await refetchGroups();
          break;
        case 'host':
          await deleteHostMutation.mutateAsync(nodeId);
          removeHost(nodeId);
          await refetchHosts();
          break;
        case 'port':
          await deletePortForwardMutation.mutateAsync(nodeId);
          removePortForward(nodeId);
          await refetchPortForwards();
          break;
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  }, [deleteGroupMutation, deleteHostMutation, deletePortForwardMutation, removeGroup, removeHost, removePortForward, refetchGroups, refetchHosts, refetchPortForwards]);

  const handleConnectHost = useCallback(async (hostId: number) => {
    // TODO: 实现主机连接逻辑
    console.log('连接主机:', hostId);
  }, []);

  const handleStartPortForward = useCallback(async (portId: number) => {
    // TODO: 实现端口转发启动逻辑
    console.log('启动端口转发:', portId);
  }, []);

  const handleStopPortForward = useCallback(async (portId: number) => {
    // TODO: 实现端口转发停止逻辑
    console.log('停止端口转发:', portId);
  }, []);

  // CRUD 操作处理
  const handleSaveGroup = useCallback(async (data: CreateGroupData | UpdateGroupData) => {
    try {
      if (dialogState.mode === 'create') {
        const newGroup = await createGroupMutation.mutateAsync(data as CreateGroupData);
        addGroup(newGroup);
      } else {
        const updatedGroup = await updateGroupMutation.mutateAsync({ 
          id: dialogState.data.id, 
          data: data as UpdateGroupData 
        });
        updateGroup(dialogState.data.id, updatedGroup);
      }
      await refetchGroups();
      closeDialog();
    } catch (error) {
      console.error('保存组失败:', error);
    }
  }, [dialogState, createGroupMutation, updateGroupMutation, addGroup, updateGroup, refetchGroups, closeDialog]);

  const handleSaveHost = useCallback(async (data: CreateHostData | UpdateHostData) => {
    try {
      if (dialogState.mode === 'create') {
        const newHost = await createHostMutation.mutateAsync(data as CreateHostData);
        addHost(newHost);
      } else {
        const updatedHost = await updateHostMutation.mutateAsync({ 
          id: dialogState.data.id, 
          data: data as UpdateHostData 
        });
        updateHost(dialogState.data.id, updatedHost);
      }
      await refetchHosts();
      closeDialog();
    } catch (error) {
      console.error('保存主机失败:', error);
    }
  }, [dialogState, createHostMutation, updateHostMutation, addHost, updateHost, refetchHosts, closeDialog]);

  const handleSavePortForward = useCallback(async (data: CreatePortForwardData | UpdatePortForwardData) => {
    try {
      if (dialogState.mode === 'create') {
        const newPortForward = await createPortForwardMutation.mutateAsync(data as CreatePortForwardData);
        addPortForward(newPortForward);
      } else {
        const updatedPortForward = await updatePortForwardMutation.mutateAsync({ 
          id: dialogState.data.id, 
          data: data as UpdatePortForwardData 
        });
        updatePortForward(dialogState.data.id, updatedPortForward);
      }
      await refetchPortForwards();
      closeDialog();
    } catch (error) {
      console.error('保存端口转发失败:', error);
    }
  }, [dialogState, createPortForwardMutation, updatePortForwardMutation, addPortForward, updatePortForward, refetchPortForwards, closeDialog]);

  // 构建带有资源数据的项目对象
  const projectWithData = {
    ...project,
    groups: groups.map(group => ({
      ...group,
      hosts: hosts.filter(host => host.group_id === group.id),
      port_forwards: portForwards.filter(port => port.group_id === group.id),
    }))
  };

  return (
    <div className="space-y-6 p-6">
      {/* 项目基本信息 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: project.color }}
          >
            <Folder className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{project.name}</h2>
            <p className="text-muted-foreground">{project.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">ID: {project.id}</Badge>
              {project.is_default && (
                <Badge variant="default">默认项目</Badge>
              )}
              <Badge variant="outline">层级: {project.level}</Badge>
              {project.parent_id && (
                <Badge variant="outline">父项目: {project.parent_id}</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            编辑
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            设置
          </Button>
        </div>
      </div>

      {/* 统计信息 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">组数量</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_groups}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">主机数量</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_hosts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">端口数量</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_ports}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活跃隧道</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_tunnels}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 主要内容区域 */}
      <Card className="min-h-[600px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>资源管理</CardTitle>
              <CardDescription>
                可视化管理项目中的组、主机和端口转发
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* 视图切换 */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'canvas' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('canvas')}
                  className="h-8"
                >
                  <Layers3 className="h-4 w-4 mr-1" />
                  画布
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8"
                >
                  <List className="h-4 w-4 mr-1" />
                  列表
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8"
                >
                  <Grid3X3 className="h-4 w-4 mr-1" />
                  网格
                </Button>
              </div>
              
              {/* 快速创建按钮 */}
              <Button onClick={() => openDialog('group', 'create', {}, project.id)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                创建组
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {viewMode === 'canvas' && (
            <div className="h-[600px] border-t">
              <ProjectCanvas
                project={projectWithData}
                onCreateGroup={() => openDialog('group', 'create', {}, project.id)}
                onEditGroup={(group: Group) => openDialog('group', 'edit', group, group.id)}
                onDeleteGroup={handleDeleteNode.bind(null, 'group')}
                onCreateHost={(groupId: number) => openDialog('host', 'create', {}, groupId)}
                onEditHost={(host: Host) => openDialog('host', 'edit', host, host.group_id, host.id)}
                onDeleteHost={handleDeleteNode.bind(null, 'host')}
                onConnectHost={handleConnectHost}
                onCreatePort={(groupId: number, hostId?: number) => openDialog('port', 'create', {}, groupId, hostId)}
                onEditPort={(port: PortForward) => openDialog('port', 'edit', port, port.group_id, port.host_id)}
                onDeletePort={handleDeleteNode.bind(null, 'port')}
                onTogglePort={handleStartPortForward}
              />
            </div>
          )}
          
          {viewMode === 'list' && (
            <div className="p-6">
              <div className="text-center text-muted-foreground">
                列表视图开发中...
              </div>
            </div>
          )}
          
          {viewMode === 'grid' && (
            <div className="p-6">
              <div className="text-center text-muted-foreground">
                网格视图开发中...
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 项目数据展示 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>项目数据</CardTitle>
              <CardDescription>
                {showRawJson ? '原始JSON数据' : '格式化数据视图'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRawJson(!showRawJson)}
              >
                {showRawJson ? '格式化视图' : '原始JSON'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(projectWithData, null, 2))}
              >
                <Copy className="h-4 w-4 mr-2" />
                复制
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showRawJson ? (
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm max-h-96">
              {JSON.stringify(projectWithData, null, 2)}
            </pre>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">基本信息</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">ID:</dt>
                      <dd>{project.id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">名称:</dt>
                      <dd>{project.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">颜色:</dt>
                      <dd className="flex items-center gap-2">
                        {project.color}
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: project.color }}
                        />
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">层级:</dt>
                      <dd>{project.level}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">时间信息</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">创建时间:</dt>
                      <dd>{new Date(project.created_at).toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">更新时间:</dt>
                      <dd>{new Date(project.updated_at).toLocaleString()}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 对话框 */}
      {dialogState.type === 'group' && (
        <GroupDialog
          open={true}
          onOpenChange={closeDialog}
          group={dialogState.mode === 'edit' ? dialogState.data : undefined}
          projectId={dialogState.groupId || project.id}
          onSave={handleSaveGroup}
          loading={createGroupMutation.isPending || updateGroupMutation.isPending}
        />
      )}

      {dialogState.type === 'host' && (
        <HostDialog
          open={true}
          onOpenChange={closeDialog}
          host={dialogState.mode === 'edit' ? dialogState.data : undefined}
          groupId={dialogState.groupId!}
          onSave={handleSaveHost}
          loading={createHostMutation.isPending || updateHostMutation.isPending}
        />
      )}

      {dialogState.type === 'port' && dialogState.groupId && (
        <PortForwardDialog
          open={true}
          onOpenChange={closeDialog}
          portForward={dialogState.mode === 'edit' ? dialogState.data : undefined}
          groupId={dialogState.groupId}
          hostId={dialogState.hostId}
          hosts={hosts.filter(host => host.group_id === dialogState.groupId)}
          onSave={handleSavePortForward}
          loading={createPortForwardMutation.isPending || updatePortForwardMutation.isPending}
        />
      )}
    </div>
  );
}
