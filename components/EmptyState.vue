<template>
  <view class="empty-state">
    <view class="icon">📭</view>
    <view class="title">{{ title }}</view>
    <view class="desc" v-if="description">{{ description }}</view>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {
  title: '暂无内容',
  description: ''
})
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  .icon {
    font-size: 96rpx;
    margin-bottom: 24rpx;
  }
  .title {
    font-size: 32rpx;
    color: #666;
    margin-bottom: 12rpx;
  }
  .desc {
    font-size: 26rpx;
    color: #999;
  }
}
</style>
