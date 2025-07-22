import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// 通知类型
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// 模态框状态类型
export interface ModalState {
  isOpen: boolean
  data?: any
}

// UI状态接口
interface UIState {
  // 侧边栏状态
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void

  // 模态框状态
  modals: Record<string, ModalState>
  openModal: (id: string, data?: any) => void
  closeModal: (id: string) => void
  isModalOpen: (id: string) => boolean
  getModalData: (id: string) => any

  // 通知系统
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void

  // 页面状态
  currentPage: string
  setCurrentPage: (page: string) => void
  
  // 选中状态
  selectedHostGroup: number | null
  selectedPortGroup: number | null
  setSelectedHostGroup: (id: number | null) => void
  setSelectedPortGroup: (id: number | null) => void

  // 搜索状态
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchFilters: Record<string, any>
  setSearchFilters: (filters: Record<string, any>) => void
  clearSearch: () => void

  // 加载状态
  loadingStates: Record<string, boolean>
  setLoading: (key: string, loading: boolean) => void
  isLoading: (key: string) => boolean
}

// 生成唯一ID
const generateId = () => Math.random().toString(36).substr(2, 9)

// 创建UI状态store
export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      sidebarOpen: true,
      sidebarCollapsed: false,
      modals: {},
      notifications: [],
      currentPage: 'dashboard',
      selectedHostGroup: null,
      selectedPortGroup: null,
      searchQuery: '',
      searchFilters: {},
      loadingStates: {},

      // 侧边栏相关
      setSidebarOpen: (open) => {
        set({ sidebarOpen: open }, false, 'setSidebarOpen')
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed }, false, 'setSidebarCollapsed')
      },

      toggleSidebar: () => {
        set(
          (state) => ({ sidebarOpen: !state.sidebarOpen }),
          false,
          'toggleSidebar'
        )
      },

      // 模态框相关
      openModal: (id, data) => {
        set(
          (state) => ({
            modals: {
              ...state.modals,
              [id]: { isOpen: true, data }
            }
          }),
          false,
          'openModal'
        )
      },

      closeModal: (id) => {
        set(
          (state) => ({
            modals: {
              ...state.modals,
              [id]: { isOpen: false, data: undefined }
            }
          }),
          false,
          'closeModal'
        )
      },

      isModalOpen: (id) => {
        return get().modals[id]?.isOpen || false
      },

      getModalData: (id) => {
        return get().modals[id]?.data
      },

      // 通知相关
      addNotification: (notification) => {
        const id = generateId()
        const newNotification: Notification = {
          ...notification,
          id,
          duration: notification.duration || 5000,
        }

        set(
          (state) => ({
            notifications: [...state.notifications, newNotification]
          }),
          false,
          'addNotification'
        )

        // 自动移除通知
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id)
          }, newNotification.duration)
        }
      },

      removeNotification: (id) => {
        set(
          (state) => ({
            notifications: state.notifications.filter(n => n.id !== id)
          }),
          false,
          'removeNotification'
        )
      },

      clearAllNotifications: () => {
        set({ notifications: [] }, false, 'clearAllNotifications')
      },

      // 页面状态相关
      setCurrentPage: (page) => {
        set({ currentPage: page }, false, 'setCurrentPage')
      },

      // 选中状态相关
      setSelectedHostGroup: (id) => {
        set(
          { 
            selectedHostGroup: id,
            selectedPortGroup: null // 清除端口分组选择
          },
          false,
          'setSelectedHostGroup'
        )
      },

      setSelectedPortGroup: (id) => {
        set(
          { 
            selectedPortGroup: id,
            selectedHostGroup: null // 清除主机分组选择
          },
          false,
          'setSelectedPortGroup'
        )
      },

      // 搜索相关
      setSearchQuery: (query) => {
        set({ searchQuery: query }, false, 'setSearchQuery')
      },

      setSearchFilters: (filters) => {
        set(
          (state) => ({
            searchFilters: { ...state.searchFilters, ...filters }
          }),
          false,
          'setSearchFilters'
        )
      },

      clearSearch: () => {
        set(
          { 
            searchQuery: '',
            searchFilters: {}
          },
          false,
          'clearSearch'
        )
      },

      // 加载状态相关
      setLoading: (key, loading) => {
        set(
          (state) => ({
            loadingStates: {
              ...state.loadingStates,
              [key]: loading
            }
          }),
          false,
          'setLoading'
        )
      },

      isLoading: (key) => {
        return get().loadingStates[key] || false
      },
    }),
    {
      name: 'portfly-ui-store',
    }
  )
)

// 便捷的通知函数
export const notify = {
  success: (title: string, description?: string) => {
    useUIStore.getState().addNotification({
      type: 'success',
      title,
      description,
    })
  },
  error: (title: string, description?: string) => {
    useUIStore.getState().addNotification({
      type: 'error',
      title,
      description,
      duration: 0, // 错误通知不自动消失
    })
  },
  warning: (title: string, description?: string) => {
    useUIStore.getState().addNotification({
      type: 'warning',
      title,
      description,
    })
  },
  info: (title: string, description?: string) => {
    useUIStore.getState().addNotification({
      type: 'info',
      title,
      description,
    })
  },
}
