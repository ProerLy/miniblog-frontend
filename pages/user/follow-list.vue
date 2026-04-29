<template>
	<view class="follow-list-page">
		<!-- 椤堕儴瀵艰埅 -->
		<view class="nav-bar">
			<uni-icons type="left" size="20" @click="goBack"></uni-icons>
			<text class="nav-title">{{ pageTitle }}</text>
			<view class="nav-placeholder"></view>
		</view>

		<!-- 鍒楄〃 -->
		<scroll-view class="user-list" scroll-y @scrolltolower="loadMore">
			<view class="user-item" v-for="user in list" :key="user.id" @click="goUserProfile(user.id)">
				<image :src="user.avatar || '/static/default-avatar.png'" class="avatar" />
				<view class="user-info">
					<view class="nickname">{{ user.nickname || user.username }}</view>
					<view class="bio" v-if="user.bio">{{ user.bio }}</view>
					<view class="bio" v-else>鏆傛棤绠€浠?</view>
				</view>
				<!-- 鍏虫敞鎸夐挳锛氬鏋滄槸绮変笣鍒楄〃锛屾樉绀哄叧娉ㄧ姸鎬侊紱鍏虫敞鍒楄〃涓嶆樉绀?-->
				<view class="action-btn" v-if="type === 'followers' && !isMe(user.id) && userStore.token"
					:class="{ following: followingIds.has(user.id) }" @click.stop="toggleFollow(user)">
					{{ followingIds.has(user.id) ? '已关注' : '关注' }}
				</view>
			</view>

			<!-- 绌虹姸鎬?-->
			<EmptyState v-if="!loading && list.length === 0" :title="type === 'followers' ? '暂无粉丝' : '暂无关注'"
				:description="type === 'followers' ? '去发文章收集粉丝吧' : '去关注优质博主吧'" />

			<!-- 鍔犺浇鏇村 -->
			<view class="load-more" v-if="list.length > 0">
				<text v-if="loadingMore">加载中...</text>
				<text v-else="noMore">没有更多了</text>
			</view>
		</scroll-view>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed } from 'vue'
	import { onLoad, onShow } from '@dcloudio/uni-app'
	import EmptyState from '@/components/EmptyState.vue'
	import { useUserStore } from '@/store/user'
	import { followApi } from '@/api/follow'
	import type { User } from '@/api/user'

	const userStore = useUserStore()

	const type = ref<'followers' | 'following'>('followers')
	const userId = ref<number>(0)
	const pageTitle = computed(() => type.value === 'followers' ? '粉丝列表' : '关注列表')
	const list = ref<User[]>([])
	const loading = ref(false)
	const loadingMore = ref(false)
	const noMore = ref(false)
	const page = ref(1)
	const pageSize = 10
	const followingIds = ref(new Set<number>())

	const isMe = (id : number) => userStore.userInfo?.id === id

	const loadData = async (isRefresh = false) => {
		if (loading.value || noMore.value) return
		loading.value = true
		if (isRefresh) {
			page.value = 1
			noMore.value = false
			followingIds.value = new Set()
		}

		try {
			const params = { page: page.value, size: pageSize }
			const res = type.value === 'followers'
				? await followApi.getFollowers(userId.value, params)
				: await followApi.getFollowing(userId.value, params)

			const items : User[] = Array.isArray(res) ? res : res.records
			if (isRefresh) {
				list.value = items
			} else {
				list.value.push(...items)
			}

			// 妫€鏌ユ槸鍚﹀凡鍏虫敞
			if (type.value === 'followers') {
				for (const u of items) {
					try {
						const followed = await followApi.isFollowing(u.id)
						if (followed) followingIds.value.add(u.id)
					} catch { }
				}
			}

			if (items.length < pageSize) noMore.value = true
		} catch (e) {
			console.error('鍔犺浇澶辫触', e)
		} finally {
			loading.value = false
			loadingMore.value = false
		}
	}

	const loadMore = async () => {
		if (loadingMore.value || noMore.value) return
		loadingMore.value = true
		page.value++
		await loadData()
	}

	const toggleFollow = async (user : User) => {
		if (!userStore.isLoggedIn()) {
			uni.showToast({ title: '璇峰厛鐧诲綍', icon: 'none' })
			return
		}
		try {
			if (followingIds.value.has(user.id)) {
				await followApi.unfollow(user.id)
				followingIds.value.delete(user.id)
			} else {
				await followApi.follow(user.id)
				followingIds.value.add(user.id)
			}
		} catch (e) {
			uni.showToast({ title: '鎿嶄綔澶辫触', icon: 'none' })
		}
	}

	const goUserProfile = (id : number) => {
		if (id !== userStore.userInfo?.id) {
			uni.navigateTo({ url: `/pages/user/other?id=${id}` })
		}
	}

	const goBack = () => {
		uni.navigateBack()
	}

	onLoad((options : any) => {
		type.value = options?.type || 'followers'
		userId.value = parseInt(options?.userId) || 0
		loadData(true)
	})
	onShow(()=> {
		noMore.value = false
		loadData(true)
	})
</script>

<style lang="scss" scoped>
	.follow-list-page {
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

		.nav-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
		}

		.nav-placeholder {
			width: 60rpx;
		}
	}

	.user-list {
		flex: 1;
		height: 0;
	}

	.user-item {
		display: flex;
		align-items: center;
		padding: 28rpx 32rpx;
		background: #fff;
		border-bottom: 1rpx solid #f7f7f7;

		.avatar {
			width: 96rpx;
			height: 96rpx;
			border-radius: 50%;
			margin-right: 24rpx;
			flex-shrink: 0;
		}

		.user-info {
			flex: 1;
			overflow: hidden;

			.nickname {
				font-size: 30rpx;
				font-weight: 600;
				color: #333;
				margin-bottom: 6rpx;
			}

			.bio {
				font-size: 24rpx;
				color: #999;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}

		.action-btn {
			padding: 10rpx 32rpx;
			background: $uni-primary;
			color: #fff;
			border-radius: 40rpx;
			font-size: 26rpx;
			flex-shrink: 0;

			&.following {
				background: #f5f5f5;
				color: #666;
			}
		}
	}

	.load-more {
		text-align: center;
		padding: 32rpx;
		font-size: 26rpx;
		color: #999;
	}
</style>