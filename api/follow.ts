import { request } from '@/utils/request'
import type { User } from './user'

export interface FollowUser {
  id: number
  username: string
  nickname: string
  avatar: string
  bio?: string
  followers?: number
  following?: number
}

export const followApi = {
  // POST /api/follow/{userId}  — 关注用户
  follow(userId: number) {
    return request({ url: `/follow/${userId}`, method: 'POST' })
  },

  // DELETE /api/follow/{userId}  — 取消关注
  unfollow(userId: number) {
    return request({ url: `/follow/${userId}`, method: 'DELETE' })
  },

  // GET /api/follow/status/{userId}  — 查询是否已关注
  isFollowing(userId: number) {
    return request<boolean>({ url: `/follow/status/${userId}` })
  },

  // GET /api/users/{id}/followers  — 获取粉丝列表
  getFollowers(userId: number, params?: { page?: number; size?: number }) {
    return request<User[]>({ url: `/users/${userId}/followers`, data: params })
  },

  // GET /api/users/{id}/following  — 获取关注列表
  getFollowing(userId: number, params?: { page?: number; size?: number }) {
    return request<User[]>({ url: `/users/${userId}/following`, data: params })
  }
}
