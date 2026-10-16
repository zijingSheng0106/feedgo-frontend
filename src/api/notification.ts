import { postJson } from './client'
import type {
  MessageResponse,
  NotificationListResponse,
  UnreadCountResponse,
} from './types'

export function listNotifications() {
  return postJson<NotificationListResponse>(
    '/notification/list',
    {},
    { authRequired: true },
  )
}

export function unreadCount() {
  return postJson<UnreadCountResponse>(
    '/notification/unreadCount',
    {},
    { authRequired: true },
  )
}

export function markRead(id?: number) {
  return postJson<MessageResponse>(
    '/notification/markRead',
    id === undefined ? {} : { id },
    { authRequired: true },
  )
}
