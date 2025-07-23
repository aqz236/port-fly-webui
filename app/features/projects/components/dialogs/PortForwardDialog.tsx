// Port Forward CRUD Dialog 组件
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/shared/components/ui/dialog";
import { Button } from "~/shared/components/ui/button";
import { Input } from "~/shared/components/ui/input";
import { Label } from "~/shared/components/ui/label";
import { Textarea } from "~/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/shared/components/ui/select";
import { Badge } from "~/shared/components/ui/badge";
import { Switch } from "~/shared/components/ui/switch";
import { Plus, X, Loader2, ArrowRight, ArrowLeft, ArrowRightLeft } from "lucide-react";
import { PortForward, CreatePortForwardData, UpdatePortForwardData } from "~/shared/types/port-forward";
import { Host } from "~/shared/types/host";

interface PortForwardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portForward?: PortForward;
  groupId: number;
  hostId?: number;
  hosts: Host[];
  onSave: (data: CreatePortForwardData | UpdatePortForwardData) => Promise<void>;
  loading?: boolean;
}

export function PortForwardDialog({ 
  open, 
  onOpenChange, 
  portForward, 
  groupId, 
  hostId, 
  hosts,
  onSave, 
  loading = false 
}: PortForwardDialogProps) {
  const [formData, setFormData] = useState({
    name: portForward?.name || '',
    type: portForward?.type || 'local' as 'local' | 'remote' | 'dynamic',
    local_port: portForward?.local_port || 8080,
    remote_host: portForward?.remote_host || 'localhost',
    remote_port: portForward?.remote_port || 80,
    description: portForward?.description || '',
    host_id: portForward?.host_id || hostId || (hosts[0]?.id || 0),
    auto_start: portForward?.auto_start || false,
    tags: portForward?.tags || [],
  });

  const [tagInput, setTagInput] = useState('');

  const handleSave = async () => {
    try {
      const data = portForward ? formData : { ...formData, group_id: groupId };
      await onSave(data);
      onOpenChange(false);
    } catch (error) {
      console.error('保存端口转发失败:', error);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'local':
        return <ArrowRight className="h-4 w-4" />;
      case 'remote':
        return <ArrowLeft className="h-4 w-4" />;
      case 'dynamic':
        return <ArrowRightLeft className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'local':
        return '本地转发 (-L): 将本地端口转发到远程主机的端口';
      case 'remote':
        return '远程转发 (-R): 将远程主机的端口转发到本地端口';
      case 'dynamic':
        return '动态转发 (-D): 创建SOCKS代理服务器';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {portForward ? '编辑端口转发' : '添加端口转发'}
          </DialogTitle>
          <DialogDescription>
            {portForward ? '修改端口转发规则和配置' : '创建新的端口转发规则'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 基本信息 */}
          <div className="space-y-2">
            <Label htmlFor="name">转发名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="请输入转发规则名称"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="请输入转发规则描述"
              rows={2}
            />
          </div>

          {/* 主机选择 */}
          <div className="space-y-2">
            <Label>目标主机 *</Label>
            <Select 
              value={formData.host_id.toString()} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, host_id: Number(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hosts.map((host) => (
                  <SelectItem key={host.id} value={host.id.toString()}>
                    {host.name} ({host.username}@{host.hostname}:{host.port})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 转发类型 */}
          <div className="space-y-2">
            <Label>转发类型</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    本地转发 (-L)
                  </div>
                </SelectItem>
                <SelectItem value="remote">
                  <div className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    远程转发 (-R)
                  </div>
                </SelectItem>
                <SelectItem value="dynamic">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="h-4 w-4" />
                    动态转发 (-D)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {getTypeDescription(formData.type)}
            </p>
          </div>

          {/* 端口配置 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="local_port">本地端口 *</Label>
              <Input
                id="local_port"
                type="number"
                value={formData.local_port}
                onChange={(e) => setFormData(prev => ({ ...prev, local_port: Number(e.target.value) }))}
                placeholder="8080"
                min="1"
                max="65535"
              />
            </div>

            {formData.type !== 'dynamic' && (
              <div className="space-y-2">
                <Label htmlFor="remote_port">远程端口 *</Label>
                <Input
                  id="remote_port"
                  type="number"
                  value={formData.remote_port}
                  onChange={(e) => setFormData(prev => ({ ...prev, remote_port: Number(e.target.value) }))}
                  placeholder="80"
                  min="1"
                  max="65535"
                />
              </div>
            )}
          </div>

          {formData.type !== 'dynamic' && (
            <div className="space-y-2">
              <Label htmlFor="remote_host">远程主机</Label>
              <Input
                id="remote_host"
                value={formData.remote_host}
                onChange={(e) => setFormData(prev => ({ ...prev, remote_host: e.target.value }))}
                placeholder="localhost"
              />
              <p className="text-sm text-muted-foreground">
                在目标主机上的地址，通常是 localhost 或 127.0.0.1
              </p>
            </div>
          )}

          {/* 转发预览 */}
          <div className="p-3 bg-muted rounded-md">
            <Label className="text-sm font-medium">转发预览</Label>
            <div className="mt-1 text-sm font-mono">
              {formData.type === 'local' && (
                <span>localhost:{formData.local_port} → {formData.remote_host}:{formData.remote_port}</span>
              )}
              {formData.type === 'remote' && (
                <span>{formData.remote_host}:{formData.remote_port} → localhost:{formData.local_port}</span>
              )}
              {formData.type === 'dynamic' && (
                <span>SOCKS5 代理: localhost:{formData.local_port}</span>
              )}
            </div>
          </div>

          {/* 自动启动 */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>自动启动</Label>
              <p className="text-sm text-muted-foreground">
                主机连接时自动启动此端口转发
              </p>
            </div>
            <Switch
              checked={formData.auto_start}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_start: checked }))}
            />
          </div>

          {/* 标签管理 */}
          <div className="space-y-2">
            <Label>标签</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="输入标签后按回车添加"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addTag} disabled={!tagInput.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="h-3 w-3 rounded-full hover:bg-red-100"
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!formData.name.trim() || !formData.host_id || loading}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {portForward ? '更新' : '添加'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
