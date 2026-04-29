<template>
	<view class="chat-page">
		<scroll-view class="message-list" scroll-y :scroll-into-view="scrollInto" :scroll-top="scrollTop">
			<view v-for="msg in messages" :key="msg.id" :id="`msg-${msg.id}`" class="message-item"
				:class="{ mine: msg.senderId === myId }">
				<image v-if="msg.senderId === myId" :src="msg.senderAvatar || '/static/default-avatar.png'"
					@click="goAuthor(msg.senderId)" class="avatar" />
				<image v-if="msg.senderId !== myId" :src="msg.senderAvatar || '/static/default-avatar.png'" class="avatar"
					@click="goAuthor(msg.senderId)"/>
				<view class=" bubble">
					<text class="content">{{ msg.content }}</text>
			</view>
	</view>
	<view v-if="messages.length === 0 && !loading" class="empty-tip">开始发送消息吧</view>
	</scroll-view>

	<view class="input-area">
		<input v-model="inputText" class="message-input" placeholder="发送消息..." confirm-type="send"
			@confirm="sendMessage" />
		<view class="send-btn" :class="{ active: inputText.trim() }" @click="sendMessage">发送</view>
	</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import { messageApi, Message } from '@/api/message'
	import { useUserStore } from '@/store/user'

	const userStore = useUserStore()
	const userId = ref<number>(0)
	const messages = ref<Message[]>([])
	const inputText = ref('')
	const loading = ref(false)
	const scrollInto = ref('')
	const scrollTop = ref(0)

	const myId = computed(() => userStore.userInfo?.id)

	const loadMessages = async () => {
		loading.value = true
		try {
			const res = await messageApi.getConversation(userId.value)
			messages.value = res.reverse()
			scrollToBottom()
			// 标记已读
			messageApi.markAsRead(userId.value)
		} catch (e) {
			console.error('加载消息失败', e)
		} finally {
			loading.value = false
		}
	}

	const sendMessage = async () => {
		const content = inputText.value.trim()
		if (!content) return

		inputText.value = ''
		try {
			const res = await messageApi.send({ receiverId: userId.value, content })
			messages.value.push(res)
			scrollToBottom()
		} catch (e) {
			console.error('发送失败', e)
			uni.showToast({ title: '发送失败', icon: 'none' })
		}
	}

	const scrollToBottom = () => {
		setTimeout(() => {
			if (messages.value.length > 0) {
				const lastMsg = messages.value[messages.value.length - 1]
				scrollInto.value = `msg-${lastMsg.id}`
			}
		}, 100)
	}
	const goAuthor = (senderId: nuber) => {
		if (senderId) {
			uni.navigateTo({ url: `/pages/user/other?id=${senderId}` })
		}
	}
	onLoad((options : any) => {
		userId.value = Number(options.userId)
		// 获取聊天记录
		loadMessages()
	})
</script>

<style lang="scss" scoped>
	.chat-page {
		display: flex;
		flex-direction: column;
		max-height: calc(100vh - var(--window-bottom) - var(--window-top) - 100rpx);
		overflow-y: auto;
		overflow-x: hidden;
		background: #f5f5f5;
	}

	.message-list {
		width: calc(100% - 48rpx);
		flex: 1;
		padding: 24rpx;
		overflow-y: auto;
	}

	.message-item {
		display: flex;
		margin-bottom: 32rpx;
		align-items: flex-start;

		&.mine {
			flex-direction: row-reverse;

			.bubble {
				background: #3B82F6;
				color: #fff;
				margin-right: 16rpx;
				margin-left: 0;

				&::before {
					right: -16rpx;
					left: auto;
					border-left: 16rpx solid #3B82F6;
					border-right: none;
				}
			}

			.avatar {
				margin-left: 0;
			}
		}

		.avatar {
			width: 72rpx;
			height: 72rpx;
			border-radius: 50%;
			margin-right: 16rpx;
			flex-shrink: 0;
		}

		.bubble {
			max-width: 70%;
			background: #fff;
			padding: 20rpx 24rpx;
			border-radius: 16rpx;
			position: relative;
			word-break: break-all;

			&::before {
				content: '';
				position: absolute;
				left: -16rpx;
				top: 24rpx;
				border-right: 16rpx solid #fff;
				border-top: 16rpx solid transparent;
				border-bottom: 16rpx solid transparent;
			}

			.content {
				font-size: 28rpx;
				line-height: 1.5;
			}
		}
	}

	.empty-tip {
		text-align: center;
		color: #999;
		padding: 48rpx;
		font-size: 28rpx;
	}

	.input-area {
		display: flex;
		align-items: center;
		padding: 16rpx 24rpx;
		background: #fff;
		border-top: 1rpx solid #eee;
		position: fixed;
		bottom: 0;
		left: 0;
		width: calc(100% - 48rpx);
		height: 100rpx;
	}

	.message-input {
		flex: 1;
		height: 72rpx;
		background: #f5f5f5;
		border-radius: 36rpx;
		padding: 0 32rpx;
		font-size: 28rpx;
	}

	.send-btn {
		margin-left: 16rpx;
		width: 120rpx;
		height: 72rpx;
		line-height: 72rpx;
		text-align: center;
		background: #ccc;
		color: #fff;
		border-radius: 36rpx;
		font-size: 28rpx;

		&.active {
			background: #3B82F6;
		}
	}
</style>