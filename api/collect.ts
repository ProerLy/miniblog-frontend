import { request } from '@/utils/request'
import type { Article } from './article'

export const collectApi = {
  /** 查询当前用户是否已收藏某篇文章 */
  hascollect(id: number) {
    return request<boolean>({ url: `/articles/${id}/collect` })
  },
  /** 切换收藏状态（收藏 / 取消收藏） */
  toggle(id: number) {
    return request<boolean>({ url: `/articles/${id}/collect`, method: 'POST' })
  },
  /** 获取当前用户的收藏列表 */
  list(params: { page?: number; size?: number } = {}) {
    return request<{ records: Article[]; total: number }>({
      url: '/collects',
      method: 'GET',
      data: { page: 1, size: 10, ...params }
    })
  }
}
