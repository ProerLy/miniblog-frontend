const STORAGE_PREFIX = 'miniblog_'

export const storage = {
  set(key: string, value: any) {
    try {
      uni.setStorageSync(STORAGE_PREFIX + key, value)
    } catch (e) {
      console.error('Storage set error:', e)
    }
  },
  
  get(key: string, defaultValue?: any) {
    try {
      return uni.getStorageSync(STORAGE_PREFIX + key) ?? defaultValue
    } catch (e) {
      console.error('Storage get error:', e)
      return defaultValue
    }
  },
  
  remove(key: string) {
    try {
      uni.removeStorageSync(STORAGE_PREFIX + key)
    } catch (e) {
      console.error('Storage remove error:', e)
    }
  },
  
  clear() {
    try {
      uni.clearStorageSync()
    } catch (e) {
      console.error('Storage clear error:', e)
    }
  }
}
