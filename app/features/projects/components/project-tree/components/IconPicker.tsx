/**
 * Icon Picker Component
 * 
 * 图标选择组件，支持搜索、分类过滤和分页
 */

import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '~/shared/components/ui/button';
import { Input } from '~/shared/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/shared/components/ui/select';
import { 
  searchIcons, 
  ICON_CATEGORIES, 
  ICON_COLORS, 
  type LucideIconData 
} from '../utils/icons';

interface IconPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (iconName: string, color: string) => void;
  selectedIcon?: string;
  selectedColor?: string;
}

const ICONS_PER_PAGE = 24;

export function IconPicker({
  open,
  onOpenChange,
  onSelect,
  selectedIcon,
  selectedColor = ICON_COLORS[0],
}: IconPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [tempSelectedIcon, setTempSelectedIcon] = useState(selectedIcon || '');
  const [tempSelectedColor, setTempSelectedColor] = useState(selectedColor);

  // 过滤图标
  const filteredIcons = useMemo(() => {
    return searchIcons(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  // 分页
  const totalPages = Math.ceil(filteredIcons.length / ICONS_PER_PAGE);
  const startIndex = (currentPage - 1) * ICONS_PER_PAGE;
  const currentIcons = filteredIcons.slice(startIndex, startIndex + ICONS_PER_PAGE);

  // 重置分页当搜索或分类改变时
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const handleConfirm = () => {
    if (tempSelectedIcon) {
      onSelect(tempSelectedIcon, tempSelectedColor);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setTempSelectedIcon(selectedIcon || '');
    setTempSelectedColor(selectedColor);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>选择图标</DialogTitle>
        </DialogHeader>

        {/* 搜索和过滤 */}
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索图标..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              {ICON_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? '全部' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 颜色选择 */}
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">颜色</div>
          <div className="flex gap-2 flex-wrap">
            {ICON_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setTempSelectedColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  tempSelectedColor === color
                    ? 'border-gray-400 scale-110'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* 图标网格 */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-8 gap-3 p-2">
            {currentIcons.map((icon) => {
              const IconComponent = icon.component;
              const isSelected = tempSelectedIcon === icon.name;
              
              return (
                <button
                  key={icon.name}
                  onClick={() => setTempSelectedIcon(icon.name)}
                  className={`flex items-center justify-center p-3 rounded-lg transition-all hover:bg-gray-50 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={icon.name}
                >
                  <IconComponent 
                    size={24} 
                    style={{ color: tempSelectedColor }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              第 {currentPage} 页，共 {totalPages} 页 ({filteredIcons.length} 个图标)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                下一页
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!tempSelectedIcon}>
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
