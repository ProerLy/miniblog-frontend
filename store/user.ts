import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '@/api/auth'

export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  bio?: string
  followerCount?: number
  followingCount?: number
  likeCount?: number
}

export const useUserStore = defineStore('user', () => {
  const token = ref(uni.getStorageSync('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  const setToken = (t: string) => {
    token.value = t
    uni.setStorageSync('token', t)
  }

  const setUserInfo = (info: UserInfo | null) => {
    userInfo.value = info
  }

  const login = async (username: string, password: string) => {
    const data = await authApi.login({ username, password })
    setToken(data.token)
    await fetchUserInfo()
  }

  const fetchUserInfo = async () => {
    if (!token.value) return
    try {
      const info = await authApi.getUserInfo()
      setUserInfo(info)
    } catch (e) {
      logout()
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    uni.removeStorageSync('token')
  }

  const isLoggedIn = () => !!token.value

  return { token, userInfo, setToken, setUserInfo, login, fetchUserInfo, logout, isLoggedIn }
})
