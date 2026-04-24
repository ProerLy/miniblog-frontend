<template>
	<view class="comment-item">
		<view class="comment-main">
			<image :src="comment.userAvatar || '/static/default-avatar.png'" class="avatar" />
			<view class="comment-body">
				<view class="comment-header">
					<text class="nickname">{{ comment.userNickname }}</text>
					<text class="time">{{ formatTime(comment.createTime) }}</text>
				</view>
				<!-- 回复目标提示 -->
				<view class="reply-to" v-if="comment.parentId">
					<text class="reply-arrow">↳</text>
					<text class="reply-username">@{{ parentNickname }}</text>
				</view>
				<view class="comment-content">{{ comment.content }}</view>
				<view class="comment-actions">
					<text class="action-btn" @click="$emit('reply', comment)">回复</text>
				</view>
			</view>
		</view>

		<!-- 子评论（树状缩进） -->
		<view class="replies" v-if="comment.replies && comment.replies.length > 0">
			<CommentItem v-for="reply in comment.replies" :key="reply.id" :comment="reply"
				:parentNickname="comment.userNickname" @reply="$emit('reply', $event)" />
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Comment } from '@/api/comment'

const props = withDefaults(defineProps<{
	comment: Comment
	parentNickname?: string
}>(), {
	parentNickname: ''
})

defineEmits<{
	reply: [comment: Comment]
}>()

const formatTime = (time: string) => {
	const date = new Date(time)
	return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.comment-item {
	padding: 24rpx 0;
	border-bottom: 1rpx solid #f0f0f0;

	.comment-main {
		display: flex;

		.avatar {
			width: 64rpx;
			height: 64rpx;
			border-radius: 50%;
			margin-right: 16rpx;
			flex-shrink: 0;
		}

		.comment-body {
			flex: 1;
			overflow: hidden;

			.comment-header {
				display: flex;
				align-items: center;
				margin-bottom: 8rpx;

				.nickname {
					font-size: 28rpx;
					color: $uni-primary;
					font-weight: 500;
					margin-right: 16rpx;
				}

				.time {
					font-size: 22rpx;
					color: #999;
				}
			}

			.reply-to {
				display: flex;
				align-items: center;
				margin-bottom: 8rpx;
				font-size: 24rpx;
				color: #999;

				.reply-arrow {
					margin-right: 6rpx;
					color: #ccc;
				}

				.reply-username {
					color: $uni-primary;
				}
			}

			.comment-content {
				font-size: 28rpx;
				color: #333;
				line-height: 1.6;
				margin-bottom: 12rpx;
				word-break: break-all;
			}

			.comment-actions {
				.action-btn {
					font-size: 24rpx;
					color: #999;
					padding: 4rpx 12rpx;
				}
			}
		}
	}

	.replies {
		margin-left: 80rpx;
		margin-top: 16rpx;
		padding-left: 24rpx;
		border-left: 4rpx solid #EBF5FF;
		background: #FAFCFF;
		border-radius: 8rpx;
	}
}
</style>
