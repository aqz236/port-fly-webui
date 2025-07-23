// Host CRUD Dialog 组件
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/shared/components/ui/dialog";
import { Button } from "~/shared/components/ui/button";
import { Input } from "~/shared/components/ui/input";
import { Label } from "~/shared/components/ui/label";
import { Textarea } from "~/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/shared/components/ui/select";
import { Badge } from "~/shared/components/ui/badge";
import { Plus, X, Save, Loader2, Eye, EyeOff } from "lucide-react";
import { Host, CreateHostData, UpdateHostData } from "~/shared/types/host";

interface HostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  host?: Host;
  groupId: number;
  onSave: (data: CreateHostData | UpdateHostData) => Promise<void>;
  loading?: boolean;
}

export function HostDialog({ 
  open, 
  onOpenChange, 
  host, 
  groupId, 
  onSave, 
  loading = false 
}: HostDialogProps) {
  const [formData, setFormData] = useState({
    name: host?.name || '',
    hostname: host?.hostname || '',
    port: host?.port || 22,
    username: host?.username || '',
    description: host?.description || '',
    auth_method: host?.auth_method || 'password' as 'password' | 'key' | 'agent',
    password: host?.password || '',
    private_key: host?.private_key || '',
    tags: host?.tags || [],
  });

  const [tagInput, setTagInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = async () => {
    try {
      const data = host ? formData : { ...formData, group_id: groupId };
      await onSave(data);
      onOpenChange(false);
    } catch (error) {
      console.error('保存主机失败:', error);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {host ? '编辑主机' : '添加新主机'}
          </DialogTitle>
          <DialogDescription>
            {host ? '修改主机的连接信息和配置' : '添加一台新的主机到当前组中'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">主机名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="请输入主机名称"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hostname">主机地址 *</Label>
              <Input
                id="hostname"
                value={formData.hostname}
                onChange={(e) => setFormData(prev => ({ ...prev, hostname: e.target.value }))}
                placeholder="IP地址或域名"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="port">SSH端口</Label>
              <Input
                id="port"
                type="number"
                value={formData.port}
                onChange={(e) => setFormData(prev => ({ ...prev, port: Number(e.target.value) }))}
                placeholder="22"
                min="1"
                max="65535"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">用户名 *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="登录用户名"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="请输入主机描述"
              rows={2}
            />
          </div>

          {/* 认证方式 */}
          <div className="space-y-2">
            <Label>认证方式</Label>
            <Select 
              value={formData.auth_method} 
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, auth_method: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="password">密码认证</SelectItem>
                <SelectItem value="key">密钥认证</SelectItem>
                <SelectItem value="agent">SSH代理</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 认证信息 */}
          {formData.auth_method === 'password' && (
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="请输入登录密码"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {formData.auth_method === 'key' && (
            <div className="space-y-2">
              <Label htmlFor="private_key">私钥</Label>
              <Textarea
                id="private_key"
                value={formData.private_key}
                onChange={(e) => setFormData(prev => ({ ...prev, private_key: e.target.value }))}
                placeholder="请粘贴私钥内容"
                rows={6}
                className="font-mono text-sm"
              />
            </div>
          )}

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
              disabled={!formData.name.trim() || !formData.hostname.trim() || !formData.username.trim() || loading}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {host ? '更新' : '添加'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
