<template>
  <view class="login-page">
    <view class="logo">
      <text class="logo-icon"></text>
      <text class="logo-text">轻博客</text>
    </view>
    
    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view class="tab-item" :class="{ active: activeTab === 'login' }" @click="activeTab = 'login'">
        登录
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'register' }" @click="activeTab = 'register'">
        注册
      </view>
    </view>
    
    <!-- 登录表单 -->
    <view class="form" v-if="activeTab === 'login'">
      <view class="form-item">
        <input 
          class="input" 
          v-model="loginForm.username" 
          placeholder="请输入用户名"
          maxlength="20"
        />
      </view>
      <view class="form-item">
        <input 
          class="input" 
          v-model="loginForm.password" 
          placeholder="请输入密码"
          password
          maxlength="20"
        />
      </view>
      <button class="submit-btn" @click="handleLogin" :loading="loading">登录</button>
    </view>
    
    <!-- 注册表单 -->
    <view class="form" v-else>
      <view class="form-item">
        <input 
          class="input" 
          v-model="registerForm.username" 
          placeholder="请输入用户名"
          maxlength="20"
        />
      </view>
      <view class="form-item">
        <input 
          class="input" 
          v-model="registerForm.password" 
          placeholder="请输入密码"
          password
          maxlength="20"
        />
      </view>
      <view class="form-item">
        <input 
          class="input" 
          v-model="registerForm.nickname" 
          placeholder="请输入昵称"
          maxlength="20"
        />
      </view>
      <button class="submit-btn" @click="handleRegister" :loading="loading">注册</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUserStore } from '@/store/user'
import { authApi } from '@/api/auth'

const userStore = useUserStore()
const activeTab = ref<'login' | 'register'>('login')
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  password: '',
  nickname: ''
})

const handleLogin = async () => {
  if (!loginForm.username.trim()) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!loginForm.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  
  loading.value = true
  try {
    await userStore.login(loginForm.username, loginForm.password)
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1500)
  } catch (e: any) {
    uni.showToast({ title: e.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  if (!registerForm.username.trim()) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!registerForm.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  if (!registerForm.nickname.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }
  
  loading.value = true
  try {
    await authApi.register(registerForm)
    uni.showToast({ title: '注册成功', icon: 'success' })
    activeTab.value = 'login'
    loginForm.username = registerForm.username
    registerForm.password = ''
    registerForm.nickname = ''
  } catch (e: any) {
    uni.showToast({ title: e.message || '注册失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: #fff;
  padding: 80rpx 48rpx;
  
  .logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 64rpx;
    .logo-icon {
      font-size: 120rpx;
      margin-bottom: 16rpx;
    }
    .logo-text {
      font-size: 48rpx;
      font-weight: 700;
      color: $uni-primary;
    }
  }
  
  .tab-bar {
    display: flex;
    margin-bottom: 48rpx;
    border-bottom: 2rpx solid #f0f0f0;
    .tab-item {
      flex: 1;
      text-align: center;
      padding: 24rpx 0;
      font-size: 32rpx;
      color: #666;
      position: relative;
      &.active {
        color: $uni-primary;
        font-weight: 600;
        &::after {
          content: '';
          position: absolute;
          bottom: -2rpx;
          left: 50%;
          transform: translateX(-50%);
          width: 60rpx;
          height: 4rpx;
          background: $uni-primary;
          border-radius: 2rpx;
        }
      }
    }
  }
  
  .form {
    .form-item {
      margin-bottom: 32rpx;
      .input {
        height: 96rpx;
        background: #f5f5f5;
        border-radius: 12rpx;
        padding: 0 24rpx;
        font-size: 30rpx;
      }
    }
    .submit-btn {
      height: 96rpx;
      background: $uni-primary;
      color: #fff;
      border-radius: 12rpx;
      font-size: 32rpx;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 48rpx;
      &::after {
        border: none;
      }
    }
  }
}
</style>
