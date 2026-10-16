import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { API_BASE } from '../api/client'
import * as notificationApi from '../api/notification'
import type { NotificationItem } from '../api/types'
import { useAuthStore } from './auth'

export const useNotificationStore = defineStore('notification', () => {
  const auth = useAuthStore()
  const items = ref<NotificationItem[]>([])
  const loading = ref(false)
  const error = ref('')
  const serverUnreadCount = ref(0)
  const connected = ref(false)

  let source: EventSource | null = null

  const unreadCount = computed(() => serverUnreadCount.value)

  function upsertIncoming(item: NotificationItem) {
    // SSE重连、多个数据来源可能带来重复消息，以服务端ID去重
    const index = items.value.findIndex(existing => existing.id === item.id)
    if (index >= 0) {
      items.value[index] = item
      return
    }
    items.value.unshift(item)
    if (!item.is_read) serverUnreadCount.value++
  }

  async function load() {
    if (!auth.token || loading.value) return
    loading.value = true
    error.value = ''
    try {
      const [listResult, countResult] = await Promise.all([
        notificationApi.listNotifications(),
        notificationApi.unreadCount(),
      ])
      items.value = listResult.notifications
      serverUnreadCount.value = countResult.count
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  function disconnect() {
    source?.close()
    source = null
    connected.value = false
  }

  function connect() {
    disconnect()
    if (!auth.token) return

    // EventSource 不能像 fetch 一样设置自定义 Authorization Header，
    // 因此使用项目后端支持的 query token。
    const url = `${API_BASE}/notification/stream?token=${encodeURIComponent(auth.token)}`
    source = new EventSource(url)

    source.onopen = () => {
      connected.value = true
      error.value = ''
    }

    source.onmessage = event => {
      try {
        const item = JSON.parse(event.data) as NotificationItem
        upsertIncoming(item)
      } catch {
        error.value = '收到无法解析的通知数据'
      }
    }

    source.onerror = () => {
      connected.value = false
      // 不 close：原生 EventSource 会自动尝试重连。
    }
  }

  async function markOneRead(id: number) {
    await notificationApi.markRead(id)
    const item = items.value.find(entry => entry.id === id)
    if (item && !item.is_read) {
      item.is_read = true
      serverUnreadCount.value = Math.max(0, serverUnreadCount.value - 1)
    }
  }

  async function markAllRead() {
    await notificationApi.markRead()
    for (const item of items.value) item.is_read = true
    serverUnreadCount.value = 0
  }

  function reset() {
    disconnect()
    items.value = []
    loading.value = false
    error.value = ''
    serverUnreadCount.value = 0
  }

  return {
    items,
    loading,
    error,
    connected,
    unreadCount,
    load,
    connect,
    disconnect,
    markOneRead,
    markAllRead,
    reset,
  }
})
