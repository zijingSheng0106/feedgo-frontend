import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import HotView from '../views/HotView.vue'
import VideoView from '../views/VideoView.vue'
import VideoDetailView from '../views/VideoDetailView.vue'
import AccountView from '../views/AccountView.vue'
import ChangePasswordView from '../views/ChangePasswordView.vue'
import RegisterView from '../views/RegisterView.vue'
import SettingsView from '../views/SettingsView.vue'
import UserProfileView from '../views/UserProfileView.vue'
import MessageView from '../views/MessageView.vue'
import NotificationsView from '../views/NotificationsView.vue'
import JingxuanView from '../views/JingxuanView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: '推荐', layout: 'full' } },
    { path: '/feed', redirect: '/' },
    { path: '/jingxuan', name: 'jingxuan', component: JingxuanView, meta: { title: '精选' } },
    { path: '/hot', name: 'hot', component: HotView, meta: { title: '热榜' } },
    { path: '/video', name: 'video', component: VideoView, meta: { title: '发布视频', requiresAuth: true } },
    { path: '/video/:id', name: 'video-detail', component: VideoDetailView, props: true, meta: { title: '视频详情', layout: 'full' } },
    { path: '/account', name: 'account', component: AccountView, meta: { title: '账号' } },
    { path: '/account/register', name: 'account-register', component: RegisterView, meta: { title: '注册' } },
    { path: '/account/change-password', name: 'account-change-password', component: ChangePasswordView, meta: { title: '修改密码' } },
    { path: '/settings', name: 'settings', component: SettingsView, meta: { title: '设置', requiresAuth: true } },
    { path: '/u/:id', name: 'user-profile', component: UserProfileView, props: true, meta: { title: '用户主页' } },
    { path: '/messages', name: 'message-list', component: MessageView, meta: { title: '私信', requiresAuth: true } },
    { path: '/messages/:peerId', name: 'messages', component: MessageView, meta: { title: '私信', requiresAuth: true } },
    { path: '/notifications', name: 'notifications', component: NotificationsView, meta: { title: '通知', requiresAuth: true } },
  ],
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next({ path: '/account', query: { redirect: to.fullPath } })
    return
  }
  next()
})

export default router
