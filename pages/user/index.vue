<template>
	<view class="user-page">
		<!-- 未登录状态 -->
		<view class="not-login" v-if="!userStore.isLoggedIn()">
			<view class="not-login-icon">👤</view>
			<view class="not-login-text">请先登录</view>
			<button class="login-btn" @click="goLogin">立即登录</button>
		</view>

		<!-- 已登录状态 -->
		<template v-else>
			<!-- 用户信息 -->
			<view class="user-header">
				<image :src="userInfo?.avatar || '/static/default-avatar.png'" class="avatar" />
				<view class="user-info">
					<view class="nickname">{{ userInfo?.nickname || userInfo?.username }}</view>
					<view class="bio">{{ userInfo?.bio || '这个人很懒，什么都没有写~' }}</view>
				</view>
				<view class="edit-btn" @click="goProfile">编辑</view>
			</view>

			<!-- 统计信息 -->
			<view class="user-stats">
				<view class="stat-item" @click="goFollowers">
					<text class="stat-num">{{ userInfo?.followerCount || 0 }}</text>
					<text class="stat-label">粉丝</text>
				</view>
				<view class="stat-item" @click="goFollowing">
					<text class="stat-num">{{ userInfo?.followingCount || 0 }}</text>
					<text class="stat-label">关注</text>
				</view>
				<view class="stat-item">
					<text class="stat-num">{{ userInfo?.likeCount || 0 }}</text>
					<text class="stat-label">获赞</text>
				</view>
			</view>

			<!-- Tab 切换 -->
			<view class="tab-bar">
				<view class="tab-item" :class="{ active: activeTab === 'articles' }" @click="switchTab('articles')">
					我的文章
				</view>
				<view class="tab-item" :class="{ active: activeTab === 'favorites' }" @click="switchTab('favorites')">
					我的收藏
				</view>
			</view>

			<!-- 文章列表 -->
			<view class="content-list" v-if="activeTab === 'articles'">
				<ArticleCard v-for="article in articles" :key="article.id" :article="article" />
				<SkeletonCard v-if="loading" v-for="i in 3" :key="i" />
				<EmptyState v-if="!loading && articles.length === 0" title="暂无文章" description="去发布你的第一篇文章吧" />
			</view>

			<!-- 收藏列表 -->
			<view class="content-list" v-else>
				<ArticleCard v-for="article in favorites" :key="article.id" :article="article" />
				<SkeletonCard v-if="loading" v-for="i in 3" :key="i" />
				<EmptyState v-if="!loading && favorites.length === 0" title="暂无收藏" description="去发现感兴趣的内容吧" />
			</view>

			<!-- 加载更多 -->
			<view class="load-more" v-if="(articles.length > 0 && activeTab === 'articles') || (favorites.length > 0 && activeTab === 'favorites')">
				<text v-if="loadingMore">加载中...</text>
				<text v-else-if="noMore">没有更多了</text>
				<text v-else>上拉加载更多</text>
			</view>

			<!-- 退出登录 -->
			<view class="logout-section">
				<button class="logout-btn" @click="handleLogout">退出登录</button>
			</view>
		</template>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed } from 'vue'
	import { onShow, onReachBottom } from '@dcloudio/uni-app'
	import ArticleCard from '@/components/ArticleCard.vue'
	import SkeletonCard from '@/components/SkeletonCard.vue'
	import EmptyState from '@/components/EmptyState.vue'
	import { useUserStore } from '@/store/user'
	import { userApi } from '@/api/user'

	const userStore = useUserStore()
	const activeTab = ref<'articles' | 'favorites'>('articles')

	const userInfo = computed(() => userStore.userInfo)

	// 分页相关
	const pageSize = 10
	const articlesPage = ref(1)
	const favoritesPage = ref(1)
	const articles = ref<any[]>([])
	const favorites = ref<any[]>([])
	const loading = ref(false)
	const loadingMore = ref(false)
	const articlesNoMore = ref(false)
	const favoritesNoMore = ref(false)

	const noMore = computed(() => {
		return activeTab.value === 'articles' ? articlesNoMore.value : favoritesNoMore.value
	})

	const switchTab = (tab : 'articles' | 'favorites') => {
		activeTab.value = tab
		if (tab === 'articles') {
			articlesNoMore.value = false
			loadArticles(true)
		} else if (tab === 'favorites') {
			favoritesNoMore.value = false
			loadFavorites(true)
		}
	}

	const loadArticles = async (isRefresh = false) => {
		if (!userStore.userInfo?.id) return
		if (loading.value || articlesNoMore.value) return

		if (isRefresh) {
			articlesPage.value = 1
			articlesNoMore.value = false
		}

		loading.value = true
		try {
			const res = await userApi.getUserArticles(userStore.userInfo.id, {
				page: articlesPage.value,
				size: pageSize
			})
			if (isRefresh) {
				articles.value = res.records
			} else {
				articles.value.push(...res.records)
			}
			if (articles.value.length >= res.total) {
				articlesNoMore.value = true
			}
		} catch (e) {
			console.error('加载文章失败', e)
		} finally {
			loading.value = false
			loadingMore.value = false
		}
	}

	const loadFavorites = async (isRefresh = false) => {
		if (!userStore.userInfo?.id) return
		if (loading.value || favoritesNoMore.value) return

		if (isRefresh) {
			favoritesPage.value = 1
			favoritesNoMore.value = false
		}

		loading.value = true
		try {
			const res = await userApi.getUserFavorites(userStore.userInfo.id, {
				page: favoritesPage.value,
				size: pageSize
			})
			if (isRefresh) {
				favorites.value = res.records
			} else {
				favorites.value.push(...res.records)
			}
			if (favorites.value.length >= res.total) {
				favoritesNoMore.value = true
			}
		} catch (e) {
			console.error('加载收藏失败', e)
		} finally {
			loading.value = false
			loadingMore.value = false
		}
	}
	
	const loadNum = async()=> {
		if (!userStore.userInfo?.id) return
		const res = await userApi.nums()
		userStore.userInfo = res;
	}

	const loadMore = async () => {
		if (loadingMore.value || noMore.value) return
		loadingMore.value = true

		if (activeTab.value === 'articles') {
			articlesPage.value++
			await loadArticles()
		} else {
			favoritesPage.value++
			await loadFavorites()
		}
	}

	const goLogin = () => {
		uni.navigateTo({ url: '/pages/login/index' })
	}

	const goProfile = () => {
		uni.navigateTo({ url: '/pages/user/profile' })
	}

	const goFollowers = () => {
		if (userStore.userInfo?.id) {
			uni.navigateTo({ url: `/pages/user/follow-list?userId=${userStore.userInfo.id}&type=followers` })
		}
	}

	const goFollowing = () => {
		if (userStore.userInfo?.id) {
			uni.navigateTo({ url: `/pages/user/follow-list?userId=${userStore.userInfo.id}&type=following` })
		}
	}

	const handleLogout = () => {
		uni.showModal({
			title: '提示',
			content: '确定要退出登录吗？',
			success: (res) => {
				if (res.confirm) {
					userStore.logout()
					uni.showToast({ title: '已退出登录', icon: 'success' })
				}
			}
		})
	}

	onShow(async () => {
		loadNum()
		if (activeTab.value === 'articles') {
			loadArticles(true)
		} else {
			loadFavorites(true)
		}
	})

	onReachBottom(() => {
		loadMore()
	})
</script>

<style lang="scss" scoped>
	.user-page {
		height: calc(100vh - var(--window-top) - var(--window-bottom));
		overflow-y: auto;
		background: #f5f5f5;
		padding-bottom: calc(var(--window-bottom));
	}

	.not-login {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 160rpx 48rpx;
		background: #fff;
		height: 100%;

		.not-login-icon {
			font-size: 120rpx;
			margin-bottom: 32rpx;
		}

		.not-login-text {
			font-size: 32rpx;
			color: #666;
			margin-bottom: 48rpx;
		}

		.login-btn {
			width: 320rpx;
			height: 88rpx;
			background: $uni-primary;
			color: #fff;
			border-radius: 44rpx;
			font-size: 32rpx;
			display: flex;
			align-items: center;
			justify-content: center;

			&::after {
				border: none;
			}
		}
	}

	.user-header {
		display: flex;
		align-items: center;
		padding: 48rpx;
		background: #fff;

		.avatar {
			width: 120rpx;
			height: 120rpx;
			border-radius: 50%;
			margin-right: 24rpx;
		}

		.user-info {
			flex: 1;

			.nickname {
				font-size: 36rpx;
				font-weight: 600;
				color: #333;
				margin-bottom: 8rpx;
			}

			.bio {
				font-size: 26rpx;
				color: #999;
			}
		}

		.edit-btn {
			padding: 12rpx 32rpx;
			border: 2rpx solid $uni-primary;
			color: $uni-primary;
			border-radius: 32rpx;
			font-size: 26rpx;
		}
	}

	.user-stats {
		display: flex;
		justify-content: space-around;
		padding: 32rpx 48rpx;
		background: #fff;
		margin-bottom: 16rpx;

		.stat-item {
			display: flex;
			flex-direction: column;
			align-items: center;

			.stat-num {
				font-size: 36rpx;
				font-weight: 700;
				color: #333;
				margin-bottom: 8rpx;
			}

			.stat-label {
				font-size: 26rpx;
				color: #999;
			}
		}
	}

	.tab-bar {
		display: flex;
		background: #fff;
		margin-bottom: 16rpx;

		.tab-item {
			flex: 1;
			text-align: center;
			padding: 28rpx 0;
			font-size: 30rpx;
			color: #666;
			position: relative;

			&.active {
				color: $uni-primary;
				font-weight: 600;

				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 40rpx;
					height: 4rpx;
					background: $uni-primary;
					border-radius: 2rpx;
				}
			}
		}
	}

	.content-list {
		min-height: 400rpx;
	}

	.load-more {
		text-align: center;
		padding: 32rpx;
		font-size: 26rpx;
		color: #999;
	}

	.logout-section {
		padding: 48rpx;

		.logout-btn {
			width: 100%;
			height: 88rpx;
			background: #fff;
			color: #EF4444;
			border-radius: 12rpx;
			font-size: 30rpx;
			display: flex;
			align-items: center;
			justify-content: center;

			&::after {
				border: none;
			}
		}
	}
</style>