// Group CRUD Dialog 组件
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/shared/components/ui/dialog";
import { Button } from "~/shared/components/ui/button";
import { Input } from "~/shared/components/ui/input";
import { Label } from "~/shared/components/ui/label";
import { Textarea } from "~/shared/components/ui/textarea";
import { Badge } from "~/shared/components/ui/badge";
import { Plus, X, Save, Loader2 } from "lucide-react";
import { Group, CreateGroupData, UpdateGroupData } from "~/shared/types/group";

const DEFAULT_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
];

interface GroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: Group;
  projectId: number;
  onSave: (data: CreateGroupData | UpdateGroupData) => Promise<void>;
  loading?: boolean;
}

export function GroupDialog({ 
  open, 
  onOpenChange, 
  group, 
  projectId, 
  onSave, 
  loading = false 
}: GroupDialogProps) {
  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    color: group?.color || DEFAULT_COLORS[0],
    tags: group?.tags || [],
  });

  const [tagInput, setTagInput] = useState('');

  const handleSave = async () => {
    try {
      const data = group ? formData : { ...formData, project_id: projectId };
      await onSave(data);
      onOpenChange(false);
    } catch (error) {
      console.error('保存组失败:', error);
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {group ? '编辑组' : '创建新组'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 基本信息 */}
          <div className="space-y-2">
            <Label htmlFor="name">组名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="请输入组名称"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="请输入组描述"
              rows={3}
            />
          </div>

          {/* 颜色选择 */}
          <div className="space-y-2">
            <Label>主题颜色</Label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color 
                      ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900' 
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                />
              ))}
            </div>
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
              disabled={!formData.name.trim() || loading}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {group ? '更新' : '创建'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
