import { request } from '@/utils/request'

export interface Message {
  id: number
  senderId: number
  receiverId: number
  content: string
  createTime: string
  isRead?: boolean
  senderNickname?: string
  senderAvatar?: string
  receiverNickname?: string
  receiverAvatar?: string
}

/** 会话列表项 */
export interface ConversationItem {
  userId: number
  nickname: string
  avatar: string
  lastMessage: string
  lastTime: string
  unreadCount: number
}

export const messageApi = {
  // POST /api/messages/{receiverId} — 发送私信
  send(data: { receiverId: number; content: string }) {
    return request<Message>({ url: `/messages/${data.receiverId}`, method: 'POST', data: { content: data.content } })
  },

  // GET /api/messages/{otherId} — 获取与某人的聊天记录
  getConversation(otherId: number, params?: { limit?: number }) {
    return request<Message[]>({ url: `/messages/${otherId}`, data: params })
  },

  // GET /api/messages/conversations — 获取会话列表
  getConversationList() {
    return request<ConversationItem[]>({ url: '/messages/conversations' })
  },

  // PUT /api/messages/{senderId}/read — 标记某人的消息为已读
  markAsRead(senderId: number) {
    return request({ url: `/messages/${senderId}/read`, method: 'PUT' })
  },

  // GET /api/messages/unread-count — 未读消息数
  getUnreadCount() {
    return request<number>({ url: '/messages/unread-count' })
  }
}