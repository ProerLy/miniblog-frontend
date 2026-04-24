import { request } from '@/utils/request'

export interface Article {
  id: number
  title: string
  content: string
  summary: string
  coverImage: string
  categoryId: number
  categoryName: string
  tags: string
  viewCount: number
  likeCount: number
  commentCount: number
  userId: number
  authorNickname: string
  authorAvatar: string
  createTime: string
  isLiked?: boolean
  isFavorited?: boolean
}

export const articleApi = {
  /** 文章列表（支持分类/标签/关键词筛选 + 分页） */
  list(params: { page?: number; size?: number; categoryId?: number; tag?: string; keyword?: string }) {
    return request<{ records: Article[]; total: number }>({ url: '/articles', data: params })
  },
  /** 文章详情 */
  detail(id: number) {
    return request<Article>({ url: `/articles/${id}` })
  },
  /** 发布文章 */
  publish(data: { title: string; content: string; summary?: string; coverImage?: string; categoryId?: number; tags?: string }) {
    return request({ url: '/articles', method: 'POST', data })
  },
  /** 更新文章 */
  update(id: number, data: { title: string; content: string; summary?: string; coverImage?: string; categoryId?: number; tags?: string }) {
    return request({ url: `/articles/${id}`, method: 'PUT', data })
  },
  /** 删除文章 */
  delete(id: number) {
    return request({ url: `/articles/${id}`, method: 'DELETE' })
  },
  /** 是否已点赞 */
  getlike(id: number) {
    return request<boolean>({ url: `/articles/${id}/like`, method: 'GET' })
  },
  /** 切换点赞状态 */
  like(id: number) {
    return request<boolean>({ url: `/articles/${id}/like`, method: 'POST' })
  },
  /** 推荐文章 */
  related(id: number) {
    return request<Article[]>({ url: `/articles/related/${id}` })
  },
  /** 轮播图 */
  banner(params?: { limit?: number }) {
    return request<Article[]>({ url: '/articles/banner', data: { limit: 5, ...params } })
  }
}
