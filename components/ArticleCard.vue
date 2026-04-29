<template>
  <view class="article-card" @click="goDetail">
    <image v-if="article.coverImage" :src="article.coverImage" class="cover" mode="aspectFit" />
    <view class="content">
      <view class="title">{{ article.title }}</view>
      <view class="summary">{{ article.summary }}</view>
      <view class="meta">
        <view class="author">
          <image :src="article.authorAvatar || '/static/default-avatar.png'" class="avatar" />
          <text class="nickname">{{ article.authorNickname }}</text>
        </view>
        <view class="stats">
          <text class="iconfont">👁</text> {{ article.viewCount }}
          <text class="iconfont">💬</text> {{ article.commentCount }}
          <text class="iconfont">❤️</text> {{ article.likeCount }}
        </view>
      </view>
      <view class="tags" v-if="article.tags">
        <text class="tag" v-for="tag in article.tags.split(',')" :key="tag">#{{ tag }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Article } from '@/api/article'

const props = defineProps<{ article: Article }>()

const goDetail = () => {
  uni.navigateTo({ url: `/pages/article/detail?id=${props.article.id}` })
}
</script>

<style lang="scss" scoped>
.article-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
  .cover {
    width: 100%;
    height: 360rpx;
  }
  .content {
    padding: 24rpx;
    .title {
      font-size: 32rpx;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 12rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .summary {
      font-size: 26rpx;
      color: #666;
      margin-bottom: 16rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .author {
        display: flex;
        align-items: center;
        .avatar {
          width: 40rpx;
          height: 40rpx;
          border-radius: 50%;
          margin-right: 8rpx;
        }
        .nickname {
          font-size: 24rpx;
          color: #999;
        }
      }
      .stats {
        font-size: 22rpx;
        color: #999;
        .iconfont { margin-left: 12rpx; }
      }
    }
    .tags {
      margin-top: 12rpx;
      .tag {
        font-size: 22rpx;
        color: $uni-primary;
        background: #EBF5FF;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
        margin-right: 8rpx;
      }
    }
  }
}
</style>
