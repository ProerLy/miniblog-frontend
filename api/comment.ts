import { request } from '@/utils/request'

export interface Comment {
  id: number
  articleId: number
  userId: number
  content: string
  parentId: number
  userNickname: string
  userAvatar: string
  createTime: string
  replies?: Comment[]
}

export const commentApi = {
  /** 获取文章评论列表 */
  list(articleId: number, params?: { page?: number; size?: number }) {
    return request<{ list: Comment[]; total: number }>({ url: `/articles/${articleId}/comments`, data: params })
  },
  /** 发表评论（或回复） */
  add(articleId: number, data: { content: string; parentId?: number }) {
    return request({ url: `/articles/${articleId}/comments`, method: 'POST', data })
  },
  /** 删除评论 */
  delete(articleId: number, commentId: number) {
    return request({ url: `/articles/${articleId}/comments/${commentId}`, method: 'DELETE' })
  },
  /** 评论点赞 */
  like(articleId: number, commentId: number) {
    return request({ url: `/articles/${articleId}/comments/${commentId}/like`, method: 'POST' })
  },
}
