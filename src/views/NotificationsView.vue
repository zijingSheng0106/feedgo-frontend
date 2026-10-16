<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import type { NotificationItem } from '../api/types'
import AsyncState from '../components/AsyncState.vue'
import { useNotificationStore } from '../stores/notification'
import { useToastStore } from '../stores/toast'

const router = useRouter()
const notifications = useNotificationStore()
const toast = useToastStore()

function titleOf(item: NotificationItem) {
  const labels: Record<string, string> = {
    like: '收到点赞',
    comment: '收到评论',
    follow: '新增关注',
    mention: '有人提到了你',
  }
  return labels[item.type] ?? '新通知'
}

function formatTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

async function openItem(item: NotificationItem) {
  try {
    if (!item.is_read) await notifications.markOneRead(item.id)
    const target = item.type === 'follow' ? `/u/${item.target_id}` : `/video/${item.target_id}`
    await router.push(target)
  } catch (e) {
    toast.error(e instanceof Error ? e.message : String(e))
  }
}

async function markAll() {
  try {
    await notifications.markAllRead()
    toast.success('已全部标记为已读')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : String(e))
  }
}

onMounted(() => {
  void notifications.load()
})
</script>

<template>
    <main class="notifications-page">
      <header class="page-header">
        <div>
          <h1>通知</h1>
          <p class="subtle">
            {{ notifications.connected ? '实时连接已建立' : '实时连接正在恢复' }}
          </p>
        </div>
        <button
          class="mark-all-button"
          type="button"
          :disabled="notifications.unreadCount === 0"
          @click="markAll"
        >
          全部已读
        </button>
      </header>

      <p v-if="notifications.error && notifications.items.length" class="inline-error" role="alert">
        {{ notifications.error }}
      </p>

      <AsyncState
        :loading="notifications.loading && notifications.items.length === 0"
        :error="notifications.items.length === 0 ? notifications.error : ''"
        :empty="!notifications.loading && notifications.items.length === 0"
        empty-text="暂时没有通知"
        @retry="notifications.load"
      >
        <section class="notification-list" aria-label="通知列表">
          <button
            v-for="item in notifications.items"
            :key="item.id"
            type="button"
            class="notification-item"
            :class="{ unread: !item.is_read }"
            @click="openItem(item)"
          >
            <span v-if="!item.is_read" class="unread-dot" aria-label="未读" />
            <span class="notification-body">
              <strong>{{ titleOf(item) }}</strong>
              <span>{{ item.content }}</span>
              <time :datetime="item.created_at">{{ formatTime(item.created_at) }}</time>
            </span>
          </button>
        </section>
      </AsyncState>
    </main>
</template>

<style scoped>
.notifications-page {
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 0;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.page-header h1 {
  margin: 0;
}

.subtle {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 13px;
}

.mark-all-button {
  border: 1px solid rgba(43, 161, 255, 0.5);
  border-radius: 8px;
  padding: 9px 13px;
  background: rgba(43, 161, 255, 0.16);
  color: var(--text);
  cursor: pointer;
}

.mark-all-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.inline-error {
  margin: 0 0 12px;
  padding: 10px 12px;
  border: 1px solid rgba(255, 93, 115, 0.35);
  border-radius: 8px;
  background: rgba(255, 93, 115, 0.08);
  color: #ffb4b4;
}

.notification-list {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
}

.notification-item {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.notification-item:last-child {
  border-bottom: 0;
}

.notification-item:hover {
  background: rgba(255, 255, 255, 0.055);
}

.notification-item.unread {
  background: rgba(43, 161, 255, 0.1);
}

.notification-body {
  min-width: 0;
  display: grid;
  gap: 5px;
}

.notification-body time {
  color: var(--muted);
  font-size: 12px;
}

.unread-dot {
  width: 8px;
  height: 8px;
  margin-top: 7px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #2ba1ff;
}

@media (max-width: 900px) {
  .notifications-page {
    padding: 18px 0;
  }
}
</style>
