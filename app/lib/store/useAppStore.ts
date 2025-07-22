import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// 应用设置类型
export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: 'zh-CN' | 'en-US'
  apiBaseURL: string
  autoRefreshInterval: number
  showNotifications: boolean
  soundEnabled: boolean
}

// 连接状态类型
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error'

// 应用状态接口
interface AppState {
  // 用户设置
  settings: AppSettings
  updateSettings: (settings: Partial<AppSettings>) => void
  resetSettings: () => void

  // 全局状态
  isLoading: boolean
  error: string | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  // 连接状态
  connectionStatus: ConnectionStatus
  setConnectionStatus: (status: ConnectionStatus) => void
  lastConnectionCheck: Date | null
  setLastConnectionCheck: (date: Date) => void

  // 统计信息
  stats: {
    totalHosts: number
    connectedHosts: number
    totalSessions: number
    activeSessions: number
  }
  updateStats: (stats: Partial<AppState['stats']>) => void
}

// 默认设置
const defaultSettings: AppSettings = {
  theme: 'system',
  language: 'zh-CN',
  apiBaseURL: 'http://localhost:8080',
  autoRefreshInterval: 30000, // 30秒
  showNotifications: true,
  soundEnabled: false,
}

// 创建应用状态store
export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      settings: defaultSettings,
      isLoading: false,
      error: null,
      connectionStatus: 'disconnected',
      lastConnectionCheck: null,
      stats: {
        totalHosts: 0,
        connectedHosts: 0,
        totalSessions: 0,
        activeSessions: 0,
      },

      // 设置相关
      updateSettings: (newSettings) => {
        set(
          (state) => ({
            settings: { ...state.settings, ...newSettings },
          }),
          false,
          'updateSettings'
        )
      },

      resetSettings: () => {
        set(
          { settings: defaultSettings },
          false,
          'resetSettings'
        )
      },

      // 全局状态相关
      setLoading: (loading) => {
        set({ isLoading: loading }, false, 'setLoading')
      },

      setError: (error) => {
        set({ error }, false, 'setError')
      },

      clearError: () => {
        set({ error: null }, false, 'clearError')
      },

      // 连接状态相关
      setConnectionStatus: (status) => {
        set(
          { 
            connectionStatus: status,
            lastConnectionCheck: new Date()
          },
          false,
          'setConnectionStatus'
        )
      },

      setLastConnectionCheck: (date) => {
        set(
          { lastConnectionCheck: date },
          false,
          'setLastConnectionCheck'
        )
      },

      // 统计信息相关
      updateStats: (newStats) => {
        set(
          (state) => ({
            stats: { ...state.stats, ...newStats },
          }),
          false,
          'updateStats'
        )
      },
    }),
    {
      name: 'portfly-app-store',
    }
  )
)
