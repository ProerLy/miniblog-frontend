<template>
  <view class="skeleton-card">
    <view class="skeleton-cover"></view>
    <view class="skeleton-content">
      <view class="skeleton-title"></view>
      <view class="skeleton-summary"></view>
      <view class="skeleton-meta">
        <view class="skeleton-avatar"></view>
        <view class="skeleton-line short"></view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin: 24rpx;
  .skeleton-cover {
    width: 100%;
    height: 360rpx;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  .skeleton-content {
    padding: 24rpx;
    .skeleton-title {
      height: 36rpx;
      width: 80%;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      margin-bottom: 16rpx;
      border-radius: 4rpx;
    }
    .skeleton-summary {
      height: 28rpx;
      width: 100%;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      margin-bottom: 20rpx;
      border-radius: 4rpx;
    }
    .skeleton-meta {
      display: flex;
      align-items: center;
      .skeleton-avatar {
        width: 40rpx;
        height: 40rpx;
        border-radius: 50%;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        margin-right: 12rpx;
      }
      .skeleton-line.short {
        height: 24rpx;
        width: 120rpx;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4rpx;
      }
    }
  }
}
</style>
