/**
 * Lucide Icons Data
 * 
 * 提供 Lucide 图标的数据和搜索功能
 */

import {
  FolderIcon,
  FileTextIcon,
  StarIcon,
  HeartIcon,
  HomeIcon,
  UserIcon,
  SettingsIcon,
  CodeIcon,
  DatabaseIcon,
  GlobeIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  BellIcon,
  SearchIcon,
  FilterIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  DownloadIcon,
  UploadIcon,
  ShareIcon,
  CopyIcon,
  SaveIcon,
  Printer as PrintIcon,
  RefreshCw as RefreshIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlayIcon,
  PauseIcon,
  Square as StopIcon,
  SkipBackIcon,
  SkipForwardIcon,
  VolumeXIcon,
  Volume1Icon,
  Volume2Icon,
  MicIcon,
  MicOffIcon,
  CameraIcon,
  VideoIcon,
  ImageIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  UnlockIcon,
  KeyIcon,
  ShieldIcon,
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
  HelpCircleIcon,
  XCircleIcon,
  ZapIcon,
  FlameIcon,
  SunIcon,
  MoonIcon,
  CloudIcon,
  UmbrellaIcon,
  SnowflakeIcon,
  TreePineIcon,
  FlowerIcon,
  LeafIcon,
  BugIcon,
  FishIcon,
  BirdIcon,
  CatIcon,
  DogIcon,
  CarIcon,
  PlaneIcon,
  TrainIcon,
  BikeIcon,
  Footprints as WalkIcon,
  Zap as RunIcon,
  Waves as SwimIcon,
  GamepadIcon,
  TrophyIcon,
  MedalIcon,
  TargetIcon,
  Dice1 as DiceIcon,
  PuzzleIcon,
  BookIcon,
  GraduationCapIcon,
  PenToolIcon,
  PaletteIcon,
  BrushIcon,
  ScissorsIcon,
  RulerIcon,
  CompassIcon,
  CalculatorIcon,
  PieChartIcon,
  BarChartIcon,
  LineChartIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  CreditCardIcon,
  BanknoteIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  GiftIcon,
  PackageIcon,
  TruckIcon,
  StoreIcon,
  BuildingIcon,
  FactoryIcon,
  HospitalIcon,
  SchoolIcon,
  LibraryIcon,
  ChurchIcon,
  LandmarkIcon,
  MapIcon,
  NavigationIcon,
  AnchorIcon,
  CompassIcon as CompassIcon2,
  GlobeIcon as GlobeIcon2,
} from 'lucide-react';

export interface LucideIconData {
  name: string;
  component: React.ComponentType<LucideProps>;
  keywords: string[];
  category: string;
}

/**
 * Lucide Icons Data
 * 
 * 提供 Lucide 图标的数据和搜索功能
 */

import {
  Folder,
  FileText,
  Star,
  Heart,
  Home,
  User,
  Settings,
  Code,
  Database,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Bell,
  Search,
  Filter,
  Plus,
  Edit,
  Trash,
  Download,
  Upload,
  Share,
  Copy,
  Save,
  Printer,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  type LucideProps,
} from 'lucide-react';

export interface LucideIconData {
  name: string;
  component: React.ComponentType<LucideProps>;
  keywords: string[];
  category: string;
}

export const LUCIDE_ICONS: LucideIconData[] = [
  // 基础文件和文件夹
  { name: 'folder', component: Folder, keywords: ['folder', 'directory', 'file'], category: 'files' },
  { name: 'file-text', component: FileText, keywords: ['file', 'document', 'text'], category: 'files' },
  
  // 常用图标
  { name: 'star', component: Star, keywords: ['star', 'favorite', 'bookmark'], category: 'common' },
  { name: 'heart', component: Heart, keywords: ['heart', 'love', 'like'], category: 'common' },
  { name: 'home', component: Home, keywords: ['home', 'house', 'main'], category: 'common' },
  { name: 'user', component: User, keywords: ['user', 'person', 'profile'], category: 'common' },
  { name: 'settings', component: Settings, keywords: ['settings', 'config', 'gear'], category: 'common' },
  
  // 开发相关
  { name: 'code', component: Code, keywords: ['code', 'programming', 'development'], category: 'development' },
  { name: 'database', component: Database, keywords: ['database', 'data', 'storage'], category: 'development' },
  { name: 'globe', component: Globe, keywords: ['globe', 'world', 'web', 'internet'], category: 'development' },
  
  // 通讯
  { name: 'mail', component: Mail, keywords: ['mail', 'email', 'message'], category: 'communication' },
  { name: 'phone', component: Phone, keywords: ['phone', 'call', 'contact'], category: 'communication' },
  
  // 位置和时间
  { name: 'map-pin', component: MapPin, keywords: ['location', 'pin', 'map', 'place'], category: 'location' },
  { name: 'calendar', component: Calendar, keywords: ['calendar', 'date', 'schedule'], category: 'time' },
  { name: 'clock', component: Clock, keywords: ['clock', 'time', 'hour'], category: 'time' },
  { name: 'bell', component: Bell, keywords: ['bell', 'notification', 'alert'], category: 'notification' },
  
  // 操作图标
  { name: 'search', component: Search, keywords: ['search', 'find', 'look'], category: 'action' },
  { name: 'filter', component: Filter, keywords: ['filter', 'sort', 'organize'], category: 'action' },
  { name: 'plus', component: Plus, keywords: ['plus', 'add', 'create', 'new'], category: 'action' },
  { name: 'edit', component: Edit, keywords: ['edit', 'modify', 'change', 'pencil'], category: 'action' },
  { name: 'trash', component: Trash, keywords: ['trash', 'delete', 'remove'], category: 'action' },
  { name: 'download', component: Download, keywords: ['download', 'save', 'get'], category: 'action' },
  { name: 'upload', component: Upload, keywords: ['upload', 'send', 'put'], category: 'action' },
  { name: 'share', component: Share, keywords: ['share', 'send', 'distribute'], category: 'action' },
  { name: 'copy', component: Copy, keywords: ['copy', 'duplicate', 'clone'], category: 'action' },
  { name: 'save', component: Save, keywords: ['save', 'store', 'keep'], category: 'action' },
  { name: 'print', component: Printer, keywords: ['print', 'printer', 'output'], category: 'action' },
  { name: 'refresh', component: RefreshCw, keywords: ['refresh', 'reload', 'update'], category: 'action' },
  
  // 箭头和导航
  { name: 'arrow-left', component: ArrowLeft, keywords: ['arrow', 'left', 'back'], category: 'navigation' },
  { name: 'arrow-right', component: ArrowRight, keywords: ['arrow', 'right', 'forward'], category: 'navigation' },
  { name: 'arrow-up', component: ArrowUp, keywords: ['arrow', 'up', 'top'], category: 'navigation' },
  { name: 'arrow-down', component: ArrowDown, keywords: ['arrow', 'down', 'bottom'], category: 'navigation' },
];

export const ICON_CATEGORIES = [
  'all',
  'common',
  'files',
  'development',
  'communication',
  'location',
  'time',
  'notification',
  'action',
  'navigation',
];

export const ICON_COLORS = [
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#06B6D4', // cyan
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
  '#84CC16', // lime
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#F97316', // orange
  '#8B5A2B', // brown
  '#6B7280', // gray
];

/**
 * 搜索图标
 */
export function searchIcons(query: string, category: string = 'all'): LucideIconData[] {
  let filteredIcons = LUCIDE_ICONS;

  // 按分类过滤
  if (category !== 'all') {
    filteredIcons = filteredIcons.filter(icon => icon.category === category);
  }

  // 按关键词搜索
  if (query.trim()) {
    const searchTerm = query.toLowerCase().trim();
    filteredIcons = filteredIcons.filter(icon => 
      icon.name.toLowerCase().includes(searchTerm) ||
      icon.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
    );
  }

  return filteredIcons;
}

/**
 * 根据名称获取图标
 */
export function getIconByName(name: string): LucideIconData | undefined {
  return LUCIDE_ICONS.find(icon => icon.name === name);
}

/**
 * 获取随机图标
 */
export function getRandomIcon(): LucideIconData {
  const randomIndex = Math.floor(Math.random() * LUCIDE_ICONS.length);
  return LUCIDE_ICONS[randomIndex];
}

/**
 * 获取随机颜色
 */
export function getRandomColor(): string {
  const randomIndex = Math.floor(Math.random() * ICON_COLORS.length);
  return ICON_COLORS[randomIndex];
}
