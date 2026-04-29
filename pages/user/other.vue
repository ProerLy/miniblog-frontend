<template>
	<view class="other-user-page">
		<!-- 顶部返回导航 -->
		<view class="nav-bar">
			<uni-icons type="left" size="20" @click="goBack"></uni-icons>
			<text class="nav-title">{{ userInfo?.nickname || userInfo?.username || '用户主页' }}</text>
			<view class="nav-placeholder"></view>
		</view>

		<scroll-view class="content" scroll-y @scrolltolower="loadMore">
			<!-- 用户信息 -->
			<view class="user-header" v-if="userInfo">
				<image :src="userInfo.avatar || '/static/default-avatar.png'" class="avatar" />
				<view class="nickname">{{ userInfo.nickname || userInfo.username }}</view>
				<view class="bio" v-if="userInfo.bio">{{ userInfo.bio }}</view>

				<view class="user-stats">
					<view class="stat-item" @click="goFollowers">
						<text class="stat-num">{{ userInfo.followerCount || 0 }}</text>
						<text class="stat-label">粉丝</text>
					</view>
					<view class="stat-item" @click="goFollowing">
						<text class="stat-num">{{ userInfo.followingCount || 0 }}</text>
						<text class="stat-label">关注</text>
					</view>
					<view class="stat-item">
						<text class="stat-num">{{ userInfo.likeCount || 0 }}</text>
						<text class="stat-label">点赞</text>
					</view>
				</view>

				<!-- 关注按钮（未登录不显示） -->
				<view class="follow-action" v-if="userStore.isLoggedIn() && !isMySelf">
					<view class="message-btn" @click="goMessage">私信</view>
					<view class="followed-btn" v-if="isFollowing" @click="toggleFollow">已关注</view>
					<view class="follow-btn" v-else @click="toggleFollow">关注</view>
				</view>
			</view>

			<!-- Tab -->
			<view class="tab-bar">
				<view class="tab-item active">他的文章</view>
			</view>

			<!-- 文章列表 -->
			<view class="article-list">
				<ArticleCard v-for="article in articles" :key="article.id" :article="article" />
				<EmptyState v-if="!loading && articles.length === 0" title="暂无文章" description="暂无发布内容" />
			</view>

			<view class="load-more" v-if="articles.length > 0">
				<text v-if="loadingMore">加载中...</text>
				<text v-else-if="noMore">没有更多了</text>
			</view>
		</scroll-view>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import ArticleCard from '@/components/ArticleCard.vue'
	import EmptyState from '@/components/EmptyState.vue'
	import { useUserStore } from '@/store/user'
	import { userApi } from '@/api/user'
	import { followApi } from '@/api/follow'
	import type { User } from '@/api/user'
	import type { Article } from '@/api/article'

	const userStore = useUserStore()

	const targetUserId = ref<number>(0)
	const userInfo = ref<User | null>(null)
	const isFollowing = ref(false)
	const articles = ref<Article[]>([])
	const loading = ref(false)
	const loadingMore = ref(false)
	const noMore = ref(false)
	const page = ref(1)
	const pageSize = 10

	const isMySelf = computed(() => userStore.userInfo?.id === targetUserId.value)

	const loadUserInfo = async () => {
		try {
			const res = await userApi.getProfile(targetUserId.value)
			userInfo.value = res
			loadNum()
			if (userStore.isLoggedIn() && !isMySelf.value) {
				try {
					isFollowing.value = await followApi.isFollowing(targetUserId.value)
				} catch {}
			}
		} catch (e) {
			uni.showToast({ title: '加载用户信息失败', icon: 'none' })
		}
	}

	const loadArticles = async (isRefresh = false) => {
		if (loading.value || noMore.value) return
		if (isRefresh) {
			page.value = 1
			noMore.value = false
		}
		loading.value = true
		try {
			const res = await userApi.getUserArticles(targetUserId.value, {
				page: page.value,
				size: pageSize
			})
			const items: Article[] = Array.isArray(res) ? res : (res.records ?? [])
			if (isRefresh) {
				articles.value = items
			} else {
				articles.value.push(...items)
			}
			if (items.length < pageSize) noMore.value = true
		} catch (e) {
			console.error('加载文章失败', e)
		} finally {
			loading.value = false
			loadingMore.value = false
		}
	}

	const loadMore = async () => {
		if (loadingMore.value || noMore.value) return
		loadingMore.value = true
		page.value++
		await loadArticles()
	}

	const toggleFollow = async () => {
		try {
			await followApi.follow(targetUserId.value)
			isFollowing.value = !isFollowing.value
			// if (isFollowing.value) {
			// 	await followApi.unfollow(targetUserId.value)
			// 	isFollowing.value = false
			// 	if (userInfo.value?.followerCount !== undefined) {
			// 		userInfo.value.followerCount--
			// 	}
			// } else {
			// 	await followApi.follow(targetUserId.value)
			// 	isFollowing.value = true
			// 	if (userInfo.value?.followerCount !== undefined) {
			// 		userInfo.value.followerCount++
			// 	}
			// }
		} catch (e) {
			uni.showToast({ title: '操作失败', icon: 'none' })
		}
	}

	const goMessage = () => {
		uni.navigateTo({ url: `/pages/message/chat?userId=${targetUserId.value}` })
	}
const loadNum = async () => {
		if (!targetUserId.value) return
		const res = await userApi.nums(targetUserId.value)
		userInfo.value = {
			...userInfo.value,
			followerCount: res.followers,
			followingCount: res.following,
			likeCount: res.likes
		};
	}
	const goFollowers = () => {
		uni.navigateTo({
			url: `/pages/user/follow-list?userId=${targetUserId.value}&type=followers`
		})
	}

	const goFollowing = () => {
		uni.navigateTo({
			url: `/pages/user/follow-list?userId=${targetUserId.value}&type=following`
		})
	}

	const goBack = () => {
		uni.navigateBack()
	}

	onLoad((options: any) => {
		targetUserId.value = parseInt(options?.id) || 0
		loadUserInfo()
		loadArticles(true)
	})
</script>

<style lang="scss" scoped>
	.other-user-page {
		height: calc(100vh - var(--window-bottom) - var(--window-top));
		overflow-y: auto;
		overflow-x: hidden;
		display: flex;
		flex-direction: column;
		background: #f5f5f5;
	}

	.nav-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 32rpx;
		background: #fff;
		border-bottom: 1rpx solid #f0f0f0;

		.back-btn {
			font-size: 48rpx;
			color: #333;
			width: 60rpx;
		}

		.nav-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
		}

		.nav-placeholder {
			width: 60rpx;
		}
	}

	.content {
		flex: 1;
		height: 0;
	}

	.user-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 48rpx 32rpx 32rpx;
		background: #fff;
		margin-bottom: 16rpx;

		.avatar {
			width: 140rpx;
			height: 140rpx;
			border-radius: 50%;
			margin-bottom: 20rpx;
		}

		.nickname {
			font-size: 38rpx;
			font-weight: 700;
			color: #333;
			margin-bottom: 8rpx;
		}

		.bio {
			font-size: 26rpx;
			color: #999;
			margin-bottom: 24rpx;
			text-align: center;
		}

		.user-stats {
			display: flex;
			gap: 80rpx;
			margin-bottom: 24rpx;

			.stat-item {
				display: flex;
				flex-direction: column;
				align-items: center;

				.stat-num {
					font-size: 36rpx;
					font-weight: 700;
					color: #333;
					margin-bottom: 4rpx;
				}

				.stat-label {
					font-size: 24rpx;
					color: #999;
				}
			}
		}

		.follow-action {
			display: flex;
			gap: 16rpx;

			.message-btn {
				padding: 14rpx 32rpx;
				background: #fff;
				color: #333;
				border: 2rpx solid #ddd;
				border-radius: 40rpx;
				font-size: 28rpx;
			}

			.follow-btn {
				padding: 14rpx 64rpx;
				background: $uni-primary;
				color: #fff;
				border-radius: 40rpx;
				font-size: 28rpx;
				font-weight: 600;
			}

			.followed-btn {
				padding: 14rpx 64rpx;
				background: #f5f5f5;
				color: #666;
				border-radius: 40rpx;
				font-size: 28rpx;
			}
		}
	}

	.tab-bar {
		display: flex;
		background: #fff;
		padding: 0 32rpx;
		margin-bottom: 16rpx;

		.tab-item {
			padding: 28rpx 0;
			font-size: 30rpx;
			color: #666;
			border-bottom: 4rpx solid transparent;

			&.active {
				color: $uni-primary;
				border-bottom-color: $uni-primary;
				font-weight: 600;
			}
		}
	}

	.article-list {
		min-height: 400rpx;
	}

	.load-more {
		text-align: center;
		padding: 32rpx;
		font-size: 26rpx;
		color: #999;
	}
</style>
