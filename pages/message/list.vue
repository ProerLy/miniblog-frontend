<template>
	<view class="message-list">
		<view v-if="loading" class="loading">加载中...</view>
		<view v-else-if="conversations.length === 0" class="empty">
			<text class="empty-icon">💬</text>
			<text class="empty-text">暂无消息</text>
		</view>
		<view v-else class="conversation-items">
			<view v-for="item in conversations" :key="item.userId" class="conversation-item"
				@click="goChat(item.userId)">
				<image :src="item.avatar || '/static/default-avatar.png'" class="avatar" />
				<view class="content">
					<view class="top">
						<text class="nickname">{{ item.nickname }}</text>
						<text class="time">{{ formatTime(item.lastTime) }}</text>
					</view>
					<view class="bottom">
						<text class="last-message">{{ item.lastMessage }}</text>
						<view v-if="item.unreadCount > 0" class="badge">{{ item.unreadCount }}</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref } from 'vue'
	import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
	import { messageApi, ConversationItem } from '@/api/message'
	import { useUserStore } from '@/store/user'

	const conversations = ref<ConversationItem[]>([])
	const loading = ref(false)
	const userStore = useUserStore()

	const loadConversations = async () => {
		if(!userStore.userInfo?.id) return
		loading.value = true
		try {
			const res = await messageApi.getConversationList().finally(_ => {
				uni.stopPullDownRefresh()
			})
			conversations.value = res
		} catch (e) {
			console.error('加载会话列表失败', e)
		} finally {
			loading.value = false
		}
	}

	const formatTime = (timeStr : string) => {
		if (!timeStr) return ''
		const date = new Date(timeStr)
		const now = new Date()
		const diff = now.getTime() - date.getTime()
		const day = Math.floor(diff / (1000 * 60 * 60 * 24))
		if (day === 0) {
			return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
		} else if (day === 1) {
			return '昨天'
		} else if (day < 7) {
			return `${day}天前`
		} else {
			return `${date.getMonth() + 1}-${date.getDate()}`
		}
	}

	const goChat = (userId : number) => {
		uni.navigateTo({ url: `/pages/message/chat?userId=${userId}` })
	}
	onPullDownRefresh(() => {
		loadConversations()
	})
	onShow(() => {
		loadConversations()
	})
</script>

<style lang="scss" scoped>
	.message-list {
		background: #f5f5f5;
	}

	.loading {
		text-align: center;
		padding: 48rpx;
		color: #999;
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 120rpx 0;

		.empty-icon {
			font-size: 96rpx;
			margin-bottom: 24rpx;
		}

		.empty-text {
			font-size: 28rpx;
			color: #999;
		}
	}

	.conversation-items {
		background: #fff;
	}

	.conversation-item {
		display: flex;
		align-items: center;
		padding: 24rpx 32rpx;
		border-bottom: 1rpx solid #f0f0f0;

		.avatar {
			width: 96rpx;
			height: 96rpx;
			border-radius: 50%;
			margin-right: 24rpx;
		}

		.content {
			flex: 1;
			min-width: 0;

			.top {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 8rpx;

				.nickname {
					font-size: 30rpx;
					font-weight: 500;
					color: #333;
				}

				.time {
					font-size: 24rpx;
					color: #999;
				}
			}

			.bottom {
				display: flex;
				justify-content: space-between;
				align-items: center;

				.last-message {
					flex: 1;
					font-size: 26rpx;
					color: #666;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					margin-right: 16rpx;
				}

				.badge {
					min-width: 36rpx;
					height: 36rpx;
					padding: 0 10rpx;
					background: #EF4444;
					color: #fff;
					font-size: 22rpx;
					border-radius: 18rpx;
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}
		}
	}
</style>