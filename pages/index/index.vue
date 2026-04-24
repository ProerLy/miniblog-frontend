<template>
	<view class="home-page">
		<!-- 顶部搜索栏 -->
		<view class="search-bar" @click="goSearch">
			<text class="search-placeholder">搜索文章...</text>
		</view>

		<!-- 轮播图 -->
		<swiper class="banner" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500">
			<swiper-item v-for="(item, index) in banners" :key="index" @click="goDetail(item.id)">
				<image :src="item.coverImage" class="banner-img" mode="aspectFill" />
			</swiper-item>
		</swiper>

		<!-- 分类标签栏 -->
		<scroll-view class="category-bar" scroll-x :show-scrollbar="false">
			<view class="category-item" :class="{ active: currentCategory === 0 }" @click="selectCategory(0)">
				全部
			</view>
			<view v-for="cat in categories" :key="cat.id" class="category-item"
				:class="{ active: currentCategory === cat.id }" @click="selectCategory(cat.id)">
				{{ cat.name }}
			</view>
		</scroll-view>

		<!-- 文章列表 -->
		<view class="article-list">
			<ArticleCard v-for="article in articles" :key="article.id" :article="article" />
			<SkeletonCard v-if="loading" v-for="i in 3" :key="i" />
			<EmptyState v-if="!loading && articles.length === 0" title="暂无文章" description="换个分类看看吧" />
		</view>

		<!-- 加载更多 -->
		<view class="load-more" v-if="articles.length > 0">
			<text v-if="loadingMore">加载中...</text>
			<text v-else-if="noMore">没有更多了</text>
			<text v-else>上拉加载更多</text>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, onMounted, onUnmounted } from 'vue'
	import { onPullDownRefresh, onReachBottom, onLoad } from '@dcloudio/uni-app'
	import ArticleCard from '@/components/ArticleCard.vue'
	import SkeletonCard from '@/components/SkeletonCard.vue'
	import EmptyState from '@/components/EmptyState.vue'
	import { articleApi, type Article } from '@/api/article'
	import { categorieApi } from '@/api/categorie'

	const banners = ref([
	])

	const categories = ref([
	])

	const currentCategory = ref(0)
	const articles = ref<Article[]>([])
	const loading = ref(false)
	const loadingMore = ref(false)
	const noMore = ref(false)
	const page = ref(1)
	const pageSize = 10

	const loadCategories = async (isRefresh = false) => {
		try {
			const res = await categorieApi.categories()
			categories.value = res
			noMore.value = false
			loadData(isRefresh)
		} catch (e) {
			console.error('加载失败', e)
		}
	}
	const getBanner = async () => {
		try {
			const res = await articleApi.banner()
			banners.value = res
		} catch (e) {

		}
	}
	const loadData = async (isRefresh = false) => {
		if (loading.value || noMore.value) return
		loading.value = true

		if (isRefresh) {
			page.value = 1
			noMore.value = false
		}

		try {
			const params : any = { page: page.value, size: pageSize }
			if (currentCategory.value > 0) {
				params.categoryId = currentCategory.value
			}

			const res = await articleApi.list(params)
			if (isRefresh) {
				articles.value = res.records
				uni.stopPullDownRefresh()
			} else {
				articles.value.push(...res.records)
			}
			if (articles.value.length >= res.total) {
				noMore.value = true
			}
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
		await loadData()
	}

	const selectCategory = (id : number) => {
		currentCategory.value = id
		noMore.value = false
		loadData(true)
	}

	const goSearch = () => {
		uni.$emit('searchFoucs')
		uni.switchTab({
			url: '/pages/search/index'
		})
	}
	const goDetail = (id : number) => {
		uni.navigateTo({ url: `/pages/article/detail?id=${id}` })
	}
	onPullDownRefresh(() => {
		getBanner()
		loadCategories(true)
	})

	onReachBottom(() => {
		loadData()
	})

	onMounted(() => {
		getBanner()
		loadCategories()
	})

	onLoad(() => {
		uni.$on('refreshHome', () => {
			getBanner()
			loadCategories(true)
		})
	})
	onUnmounted(() => {
		uni.$off('refreshHome'); // 记得移除监听
	})
</script>

<style lang="scss" scoped>
	.home-page {
		padding-bottom: 40rpx;
	}

	.search-bar {
		display: flex;
		align-items: center;
		padding: 20rpx 32rpx;
		background: $uni-primary;
		position: sticky;
		top: 0;
		z-index: 2;

		.search-placeholder {
			flex: 1;
			height: 72rpx;
			line-height: 72rpx;
			padding: 0 24rpx;
			font-size: 28rpx;
			color: #999;
			background: #fff;
			border-radius: 36rpx;
		}
	}

	.banner {
		height: 400rpx;

		.banner-img {
			width: 100%;
			height: 100%;
		}
	}

	.category-bar {
		white-space: nowrap;
		padding: 24rpx;
		background: #fff;
		margin-bottom: 16rpx;

		.category-item {
			display: inline-block;
			padding: 12rpx 32rpx;
			margin-right: 16rpx;
			font-size: 28rpx;
			color: #666;
			background: #f5f5f5;
			border-radius: 32rpx;

			&.active {
				background: $uni-primary;
				color: #fff;
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