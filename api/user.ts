import { request } from '@/utils/request'

export const userApi = {
  getProfile(userId: number) {
    return request({ url: `/users/${userId}` })
  },
  updateProfile(data: { nickname?: string; avatar?: string; bio?: string }) {
    return request({ url: '/users/profile', method: 'PUT', data })
  },
  getUserArticles(userId: number, params?: { page?: number; size?: number }) {
    return request({ url: `/users/${userId}/articles`, data: params })
  },
  getUserFavorites(userId:number,params?: { page?: number; size?: number }) {
    return request({ url: `/users/${userId}/favorites`, data: params })
  },
  follow(userId: number) {
    return request({ url: `/users/${userId}/follow`, method: 'POST' })
  },
  unfollow(userId: number) {
    return request({ url: `/users/${userId}/follow`, method: 'DELETE' })
  },
  nums(userId?: number){
	  return request({ url: userId ? `/users/${userId}/stats` : `/users/stats` })
  }
}
