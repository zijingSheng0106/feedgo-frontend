<script setup lang="ts">
import {
  Bell,
  Flame,
  Home,
  LogIn,
  MessageCircle,
  MoreHorizontal,
  Search,
  Settings,
  Sparkles,
  Upload,
  UserRound,
} from '@lucide/vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notification'
import { useSocialStore } from '../stores/social'
import Toaster from './Toaster.vue'

const auth = useAuthStore()
const notifications = useNotificationStore()
const social = useSocialStore()
const route = useRoute()
const router = useRouter()

const search = ref(typeof route.query.q === 'string' ? route.query.q : '')
const isFullLayout = computed(() => route.meta.layout === 'full')
const routeTitle = computed(() => String(route.meta.title ?? 'FeedGo'))

const userLabel = computed(() => {
  if (!auth.isLoggedIn) return '登录'
  return auth.claims?.username || `用户 ${auth.claims?.account_id ?? ''}`.trim()
})

watch(
  () => route.query.q,
  value => {
    search.value = typeof value === 'string' ? value : ''
  },
)

watch(
  () => auth.isLoggedIn,
  loggedIn => {
    if (loggedIn) void social.refreshMine()
    else social.clear()
  },
  { immediate: true },
)

watch(
  () => auth.token,
  async token => {
    if (!token) {
      notifications.reset()
      return
    }

    await notifications.load()
    notifications.connect()
  },
  { immediate: true },
)

onBeforeUnmount(() => notifications.disconnect())

async function onSearch() {
  const query = search.value.trim()
  await router.push({ path: '/', query: query ? { q: query } : {} })
}
</script>

<template>
  <div class="app-shell">
    <aside class="app-sidebar" aria-label="主导航">
      <RouterLink class="brand" to="/jingxuan" aria-label="FeedGo 精选">
        <span class="brand-mark" aria-hidden="true">F</span>
        <span class="brand-name">FeedGo</span>
      </RouterLink>

      <nav class="primary-nav">
        <RouterLink class="nav-link" to="/jingxuan" title="精选">
          <Sparkles :size="21" :stroke-width="2" />
          <span class="nav-label">精选</span>
        </RouterLink>
        <RouterLink class="nav-link" to="/" title="推荐">
          <Home :size="21" :stroke-width="2" />
          <span class="nav-label">推荐</span>
        </RouterLink>
        <RouterLink v-if="auth.isLoggedIn" class="nav-link" to="/notifications" title="通知">
          <Bell :size="21" :stroke-width="2" />
          <span class="nav-label">通知</span>
          <span v-if="notifications.unreadCount" class="nav-badge" aria-label="未读通知数">
            {{ notifications.unreadCount > 99 ? '99+' : notifications.unreadCount }}
          </span>
        </RouterLink>
        <RouterLink class="nav-link" to="/account" :title="userLabel">
          <UserRound v-if="auth.isLoggedIn" :size="21" :stroke-width="2" />
          <LogIn v-else :size="21" :stroke-width="2" />
          <span class="nav-label">{{ userLabel }}</span>
        </RouterLink>
      </nav>

      <div class="nav-divider" />
      <div class="secondary-label">
        <MoreHorizontal :size="16" aria-hidden="true" />
        <span>更多</span>
      </div>

      <nav class="secondary-nav" aria-label="更多功能">
        <RouterLink class="nav-link" to="/hot" title="热榜">
          <Flame :size="20" :stroke-width="2" />
          <span class="nav-label">热榜</span>
        </RouterLink>
        <RouterLink class="nav-link" to="/video" title="发布">
          <Upload :size="20" :stroke-width="2" />
          <span class="nav-label">发布</span>
        </RouterLink>
        <RouterLink v-if="auth.isLoggedIn" class="nav-link" to="/messages" title="私信">
          <MessageCircle :size="20" :stroke-width="2" />
          <span class="nav-label">私信</span>
        </RouterLink>
        <RouterLink v-if="auth.isLoggedIn" class="nav-link" to="/settings" title="设置">
          <Settings :size="20" :stroke-width="2" />
          <span class="nav-label">设置</span>
        </RouterLink>
      </nav>

      <div class="sidebar-foot">
        <span class="connection-dot" :class="auth.isLoggedIn ? 'online' : ''" aria-hidden="true" />
        <span class="nav-label">{{ auth.isLoggedIn ? '账号已连接' : '游客模式' }}</span>
      </div>
    </aside>

    <div class="app-main">
      <header class="app-topbar">
        <div class="route-context">
          <span>{{ routeTitle }}</span>
        </div>

        <form class="global-search" role="search" @submit.prevent="onSearch">
          <Search class="search-icon" :size="19" aria-hidden="true" />
          <input
            v-model="search"
            type="search"
            aria-label="搜索视频标题或作者"
            placeholder="搜索视频标题或作者"
          />
          <button type="submit" aria-label="提交搜索">搜索</button>
        </form>

        <RouterLink class="publish-button" to="/video">
          <Upload :size="18" aria-hidden="true" />
          <span>发布视频</span>
        </RouterLink>
      </header>

      <main class="app-content" :class="isFullLayout ? 'is-full' : 'is-padded'">
        <slot />
      </main>
    </div>

    <Toaster />
  </div>
</template>

<style scoped>
.app-shell {
  min-width: 1024px;
  height: 100vh;
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  overflow: hidden;
  background: var(--color-bg);
}

.app-sidebar {
  min-width: 0;
  padding: var(--space-4) var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  border-right: 1px solid var(--color-border);
  background: var(--color-surface-1);
}

.brand {
  height: 52px;
  padding: 0 var(--space-3);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  border-radius: var(--radius-md);
  color: var(--color-text-strong);
  font-size: var(--font-size-lg);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.brand:hover {
  color: var(--color-text-strong);
  background: var(--color-surface-hover);
}

.brand-mark {
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--color-accent) 0 52%, var(--color-accent-cyan) 52% 100%);
  color: #fff;
  font-size: 18px;
  box-shadow: 0 8px 24px rgba(255, 54, 95, 0.22);
}

.primary-nav,
.secondary-nav {
  display: grid;
  gap: var(--space-1);
}

.nav-link {
  min-width: 0;
  min-height: 44px;
  padding: 0 var(--space-3);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  position: relative;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 600;
  transition:
    color var(--duration-fast) var(--ease-standard),
    background var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard);
}

.nav-link:hover {
  color: var(--color-text-strong);
  background: var(--color-surface-hover);
}

.nav-link.router-link-exact-active {
  color: var(--color-text-strong);
  border-color: var(--color-border-strong);
  background: var(--color-surface-active);
}

.nav-link.router-link-exact-active::before {
  content: '';
  width: 3px;
  height: 20px;
  position: absolute;
  left: -1px;
  top: 50%;
  border-radius: 0 4px 4px 0;
  background: var(--color-accent);
  transform: translateY(-50%);
}

.nav-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-badge {
  min-width: 20px;
  height: 20px;
  margin-left: auto;
  padding: 0 6px;
  display: inline-grid;
  place-items: center;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  color: #fff;
  font-size: 11px;
  line-height: 1;
}

.nav-divider {
  height: 1px;
  margin: var(--space-1) var(--space-3);
  background: var(--color-border);
}

.secondary-label {
  height: 26px;
  padding: 0 var(--space-3);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 0.08em;
}

.sidebar-foot {
  min-height: 42px;
  margin-top: auto;
  padding: 0 var(--space-3);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.connection-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--color-text-tertiary);
}

.connection-dot.online {
  background: var(--color-success);
  box-shadow: 0 0 0 4px rgba(65, 209, 138, 0.12);
}

.app-main {
  min-width: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-topbar {
  height: var(--topbar-height);
  flex: 0 0 auto;
  padding: 0 var(--space-5);
  display: grid;
  grid-template-columns: minmax(130px, 1fr) minmax(360px, 680px) minmax(130px, 1fr);
  align-items: center;
  gap: var(--space-5);
  border-bottom: 1px solid var(--color-border);
  background: rgba(17, 19, 25, 0.88);
  backdrop-filter: blur(18px);
  z-index: var(--z-sticky);
}

.route-context {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.global-search {
  height: 40px;
  padding-left: var(--space-3);
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface-2);
  transition: border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard);
}

.global-search:focus-within {
  border-color: rgba(255, 54, 95, 0.62);
  box-shadow: 0 0 0 3px rgba(255, 54, 95, 0.12);
}

.search-icon {
  color: var(--color-text-tertiary);
}

.global-search input {
  min-width: 0;
  height: 38px;
  padding: 0 var(--space-3);
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-text-primary);
}

.global-search input:focus {
  box-shadow: none;
}

.global-search button {
  height: 32px;
  margin-right: 4px;
  padding: 0 var(--space-4);
  border: 0;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  color: #fff;
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.publish-button {
  min-height: 38px;
  justify-self: end;
  padding: 0 var(--space-4);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  border: 1px solid rgba(255, 54, 95, 0.5);
  border-radius: var(--radius-md);
  background: rgba(255, 54, 95, 0.13);
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.publish-button:hover {
  background: rgba(255, 54, 95, 0.2);
  color: #fff;
}

.app-content {
  min-width: 0;
  min-height: 0;
  flex: 1;
}

.app-content.is-padded {
  padding: var(--space-6);
  overflow: auto;
}

.app-content.is-full {
  overflow: hidden;
}

@media (max-width: 1180px) {
  .app-shell {
    grid-template-columns: var(--sidebar-width-compact) minmax(0, 1fr);
  }

  .app-sidebar {
    padding-inline: var(--space-2);
  }

  .brand,
  .nav-link,
  .secondary-label,
  .sidebar-foot {
    justify-content: center;
    padding-inline: 0;
  }

  .brand-name,
  .nav-label,
  .secondary-label span {
    width: 1px;
    height: 1px;
    position: absolute;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .nav-badge {
    min-width: 17px;
    height: 17px;
    padding: 0 4px;
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 9px;
  }

  .app-topbar {
    grid-template-columns: 110px minmax(300px, 1fr) auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-link,
  .global-search,
  .publish-button {
    transition: none;
  }
}
</style>
