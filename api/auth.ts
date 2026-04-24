import { request } from '@/utils/request'

export const authApi = {
  login(data: { username: string; password: string }) {
    return request({ url: '/auth/login', method: 'POST', data })
  },
  register(data: { username: string; password: string; nickname: string }) {
    return request({ url: '/auth/register', method: 'POST', data })
  },
  getUserInfo() {
    return request({ url: '/auth/userinfo' })
  }
}
