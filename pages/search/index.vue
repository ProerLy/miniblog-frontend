<template>
	<view class="search-page">
		<!-- 搜索框 -->
		<view class="search-header">
			<view class="search-box">
				<text class="search-icon">🔍</text>
				<input class="search-input" v-model="keyword" placeholder="搜索文章、标签、作者..." confirm-type="search"
					@confirm="handleSearch" :focus="isFocus" />
				<text v-if="keyword" class="clear-icon" @click="clearSearch">✕</text>
			</view>
			<text class="cancel-btn" @click="goBack">取消</text>
		</view>

		<!-- 搜索结果 -->
		<view class="search-result" v-if="hasSearched">
			<view class="result-header">
				<text>搜索结果 ({{ total }})</text>
			</view>
			<ArticleCard v-for="article in articles" :key="article.id" :article="article" />
			<EmptyState v-if="articles.length === 0" title="未找到相关内容" description="换个关键词试试" />
			<!-- 加载更多 -->
			<view class="load-more" v-if="articles.length > 0">
				<text v-if="loadingMore">加载中...</text>
				<text v-else-if="noMore">没有更多了</text>
				<text v-else>上拉加载更多</text>
			</view>
		</view>

		<!-- 搜索历史和热门 -->
		<view class="search-suggest" v-else>
			<!-- 搜索历史 -->
			<view class="section" v-if="searchHistory.length > 0">
				<view class="section-header">
					<text class="section-title">搜索历史</text>
					<text class="clear-btn" @click="clearHistory">清空</text>
				</view>
				<view class="tag-list">
					<text class="tag" v-for="(item, index) in searchHistory" :key="index" @click="quickSearch(item)">
						{{ item }}
					</text>
				</view>
			</view>

			<!-- 热门搜索 -->
			<view class="section">
				<view class="section-header">
					<text class="section-title">热门搜索</text>
				</view>
				<view class="tag-list">
					<text class="tag hot" v-for="(item, index) in hotKeywords" :key="index" @click="quickSearch(item)">
						{{ item }}
					</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
	import { onPullDownRefresh, onReachBottom, onShow, onLoad } from '@dcloudio/uni-app'
	import ArticleCard from '@/components/ArticleCard.vue'
	import EmptyState from '@/components/EmptyState.vue'
	import { articleApi, type Article } from '@/api/article'
	import { storage } from '@/utils/storage'

	const keyword = ref('')
	const articles = ref<Article[]>([])
	const total = ref(0)
	const hasSearched = ref(false)
	const loading = ref(false)
	const page = ref(1)
	const pageSize = 3
	const noMore = ref(false)
	const loadingMore = ref(false)
	const isFocus = ref(false)

	const searchHistory = ref<string[]>([])
	const hotKeywords = ref(['Vue3', 'UniApp', 'TypeScript', '前端开发', '生活随笔', '美食探店'])

	const HISTORY_KEY = 'search_history'

	const loadHistory = () => {
		const history = storage.get(HISTORY_KEY, [])
		searchHistory.value = history || []
	}

	const saveHistory = () => {
		storage.set(HISTORY_KEY, searchHistory.value)
	}

	const addToHistory = (kw : string) => {
		if (!kw.trim()) return
		const index = searchHistory.value.indexOf(kw)
		if (index > -1) {
			searchHistory.value.splice(index, 1)
		}
		searchHistory.value.unshift(kw)
		if (searchHistory.value.length > 10) {
			searchHistory.value = searchHistory.value.slice(0, 10)
		}
		saveHistory()
	}

	const clearHistory = () => {
		uni.showModal({
			title: '提示',
			content: '确定清空搜索历史吗？',
			success: (res) => {
				if (res.confirm) {
					searchHistory.value = []
					saveHistory()
				}
			}
		})
	}

	const handleSearch = async () => {
		if (!keyword.value.trim()) {
			uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
			return
		}
		addToHistory(keyword.value)
		hasSearched.value = true
		noMore.value = false
		loadData(true)
	}
	const loadData = async (isRefresh = false) => {
		if (loading.value || noMore.value) return
		loading.value = true

		if (isRefresh) {
			page.value = 1
			noMore.value = false
		}

		try {
			const params : any = { page: page.value, size: pageSize, keyword: keyword.value }

			const res = await articleApi.list(params)
			if (isRefresh) {
				articles.value = res.records
				uni.stopPullDownRefresh()
			} else {
				articles.value.push(...res.records)
			}
			total.value = res.total
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

	const quickSearch = (kw : string) => {
		keyword.value = kw
		handleSearch()
	}

	const clearSearch = () => {
		keyword.value = ''
		hasSearched.value = false
		articles.value = []
	}

	const goBack = () => {
		clearSearch()
		uni.switchTab({
			url: '/pages/index/index'
		})
	}
	// watch(()=> keyword.value, (val)=> {
	// 	if(!val.trim()){
	// 		clearSearch()
	// 	}
	// })
	onPullDownRefresh(() => {
		noMore.value = false
		loadData(true)
	})

	onReachBottom(() => {
		loadData()
	})
	onMounted(() => {
		loadHistory()
	})
	onLoad(()=>{
		uni.$on('searchFoucs', () => {
			nextTick(() => {
				isFocus.value = false
				setTimeout(() => {
					isFocus.value = true
				}, 350)
			})
		})
	})
	onUnmounted(() => {
		uni.$off('searchFoucs')
	})
</script>

<style lang="scss" scoped>
	.search-page {
		background: #f5f5f5;
	}

	.search-header {
		display: flex;
		align-items: center;
		padding: 24rpx;
		background: #fff;

		.search-box {
			flex: 1;
			display: flex;
			align-items: center;
			background: #f5f5f5;
			border-radius: 36rpx;
			padding: 16rpx 24rpx;

			.search-icon {
				font-size: 28rpx;
				margin-right: 12rpx;
			}

			.search-input {
				flex: 1;
				font-size: 28rpx;
			}

			.clear-icon {
				font-size: 24rpx;
				color: #999;
				padding: 8rpx;
			}
		}

		.cancel-btn {
			font-size: 30rpx;
			color: #666;
			margin-left: 24rpx;
		}
	}

	.search-result {
		.result-header {
			padding: 24rpx;
			font-size: 28rpx;
			color: #666;
		}
	}

	.search-suggest {
		padding: 24rpx;

		.section {
			margin-bottom: 48rpx;

			.section-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 24rpx;

				.section-title {
					font-size: 30rpx;
					font-weight: 600;
					color: #333;
				}

				.clear-btn {
					font-size: 26rpx;
					color: #999;
				}
			}

			.tag-list {
				display: flex;
				flex-wrap: wrap;

				.tag {
					padding: 12rpx 24rpx;
					background: #fff;
					border-radius: 8rpx;
					font-size: 26rpx;
					color: #666;
					margin-right: 16rpx;
					margin-bottom: 16rpx;

					&.hot {
						background: #FFF2F0;
						color: #EF4444;
					}
				}
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