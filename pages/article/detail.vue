<template>
	<view class="article-detail">
		<!-- 文章主体 -->
		<scroll-view class="article-scroll" scroll-y>
			<view v-if="article" class="article-content">
				<!-- 封面-->
				<image v-if="article.coverImage" :src="article.coverImage" class="cover" mode="aspectFill" />

				<!-- 文章标题 -->
				<view class="title">{{ article.title }}</view>

				<!-- 作者信息（点击跳转他人主页）-->
				<view class="author-info" @click="goAuthor(null)">
					<image :src="article.authorAvatar || '/static/default-avatar.png'" class="avatar" />
					<view class="author-meta">
						<text class="nickname">{{ article.authorNickname }}</text>
						<text class="time">{{ formatTime(article.createTime) }}</text>
					</view>
					<template v-if="showFlollow">
						<view class="follow-btn" v-if="!isFollowing" @click.stop="follow">关注</view>
						<view class="followed-btn" v-else @click.stop="follow">已关注</view>
					</template>
				</view>

				<!-- 文章内容 -->
				<view class="content" v-html="renderedContent"></view>

				<!-- 标签 -->
				<view class="tags" v-if="article.tags">
					<text class="tag" v-for="tag in article.tags.split(',')" :key="tag">#{{ tag }}</text>
				</view>

				<!-- 推荐阅读 -->
				<view class="related-section" v-if="relatedArticles.length > 0">
					<view class="related-title">推荐阅读</view>
					<view class="related-list">
						<view class="related-item" v-for="item in relatedArticles" :key="item.id"
							@click="goDetail(item.id)">
							<image v-if="item.coverImage" :src="item.coverImage" class="related-cover"
								mode="aspectFill" />
							<view class="related-info">
								<text class="related-title-text">{{ item.title }}</text>
								<text class="related-meta">{{ item.authorNickname }} · {{ item.likeCount }} 赞</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 底部留白，给操作-->
				<view class="bottom-spacer"></view>
			</view>
		</scroll-view>

		<!-- 底部操作栏（文章底部悬浮）-->
		<view class="article-action-bar" v-if="article">
			<view class="action-input" @click="openCommentSheet(true)">
				<text>{{userStore.token?'说点什..':'请先登录...'}}</text>
			</view>
			<view class="action-icons">
				<view class="action-icon-item" :class="{ active: article.isLiked }" @click="toggleLike">
					<text class="action-icon"><uni-icons :type="article.isLiked?'heart-filled':'heart'"
							size="28"></uni-icons></text>
					<text class="action-label">{{ article.likeCount || 0 }}</text>
				</view>
				<view class="action-icon-item" @click="openCommentSheet(false)">
					<text class="action-icon">
						<uni-icons type="chat" size="28"></uni-icons>
					</text>
					<text class="action-label">{{ article.commentCount || 0 }}</text>
				</view>
				<view class="action-icon-item" :class="{ active: article.isFavorited }" @click="toggleFavorite">
					<text class="action-icon"><uni-icons :type="article.isFavorited?'star-filled':'star'"
							size="28"></uni-icons></text>
					<text class="action-label">{{ article.isFavorited ? '已收藏' : '收藏' }}</text>
				</view>
				<view class="action-icon-item" @click="goPublish(articleId)"
					v-if="article.userId === userStore.userInfo?.id">
					<text class="action-icon">
						<uni-icons type="compose" size="28"></uni-icons>
					</text>
					<text class="action-label">编辑</text>
				</view>
				<!-- <view class="action-icon-item" @click="shareArticle">
					<text class="action-icon">🔗</text>
					<text class="action-label">分享</text>
				</view> -->
			</view>
		</view>

		<!-- 评论区浮层遮-->
		<view class="comment-overlay" v-if="showCommentSheet" @click="closeCommentSheet"></view>

		<!-- 评论区浮-->
		<view class="comment-sheet" :class="{ open: showCommentSheet }">
			<!-- 浮层头部 -->
			<view class="sheet-header">
				<text class="sheet-title">{{ article?.commentCount || 0 }} 条评</text>
				<view class="sheet-tabs">
					<text class="tab" :class="{ active: sortType === 'hot' }" @click="selectSortType('hot')">热度</text>
					<text class="tab-divider">|</text>
					<text class="tab" :class="{ active: sortType === 'latest' }"
						@click="selectSortType('latest')">最新</text>
				</view>
				<text class="close-btn" @click="closeCommentSheet">×</text>
			</view>

			<!-- 评论列表 -->
			<scroll-view class="comment-scroll" scroll-y @scrolltolower="loadMoreComments">
				<view class="comment-list" v-if="commentTree.length > 0">
					<view class="comment-card" v-for="comment in commentTree" :key="comment.id">
						<!-- 右侧点赞 -->
						<!-- <view class="comment-like-col">
							<text class="like-icon" :class="{ liked: comment.isLiked }"
								@click="toggleCommentLike(comment)">
								{{ comment.isLiked ? '❤️' : '' }}
							</text>
							<text class="like-count">{{ comment.likeCount || 0 }}</text>
						</view> -->

						<!-- 左侧内容 -->
						<view class="comment-body-col">
							<image :src="comment.userAvatar || '/static/default-avatar.png'" class="c-avatar"
								@click="goAuthor(comment)" />
							<view class="c-content">
								<view class="c-header">
									<text class="c-nickname">{{ comment.userNickname }}</text>
									<text class="c-time">{{ relativeTime(comment.createTime) }}</text>
								</view>
								<view class="c-text">{{ comment.content }}</view>
								<view class="c-actions">
									<text class="c-reply-btn" @click="onReply(comment)">回复</text>
									<text class="c-report"><uni-icons
											:type="comment.liked ? 'hand-up-filled' : 'hand-up'"
											@click="doLike(comment)"></uni-icons></text>
								</view>

								<!-- 子评论（展开/收起-->
								<view class="sub-comments" v-if="comment.replies && comment.replies.length > 0">
									<view class="sub-comment" v-for="sub in comment.replies" :key="sub.id">
										<text class="sub-nickname">{{ sub.userNickname }}</text>
										<text class="sub-arrow" v-if="sub.parentId"> 回复 </text>
										<text class="sub-target"
											v-if="sub.parentId">@{{ getParentNickname(comment, sub.parentId) }}</text>
										<text class="sub-text">：{{ sub.content }}</text>
										<view class="sub-actions">
											<text class="sub-time">{{ relativeTime(sub.createTime) }}</text>
											<!-- <text class="sub-reply-btn" @click="onReply(sub)">回复</text> -->
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>

					<!-- 加载更多 -->
					<view class="load-more-tip">
						<text v-if="loadingMore">加载..</text>
						<text v-else-if="noMore">没有更多</text>
						<text v-else-if="commentTree.length >= (article?.commentCount || 0)">已加载全部</text>
					</view>
				</view>

				<!-- 空状-->
				<view class="comment-empty" v-else>
					<text class="empty-icon"></text>
					<text class="empty-text">还没有评论</text>
					<text class="empty-sub">快来抢沙发吧</text>
				</view>

				<view class="comment-bottom-spacer"></view>
			</scroll-view>

			<!-- 评论输入-->
			<view class="sheet-input-bar">
				<view class="reply-indicator" v-if="replyTo">
					<text class="reply-hint">
						<text class="reply-icon"></text> 回复 @{{ replyTo.userNickname }}
					</text>
					<text class="cancel-reply" @click="cancelReply">×</text>
				</view>
				<view class="input-row">
					<input class="comment-input" v-model="commentContent" :focus="inputFocus"
						:placeholder="userStore.token ? (replyTo ? `回复 ${replyTo.userNickname}...` : '说点什么..'):'请先登录...'"
						@confirm="submitComment" :disabled="!userStore.token" confirm-type="send" />
					<button class="send-btn" :class="{ active: commentContent.trim() }" @click="submitComment"
						:disabled="!userStore.token || !commentContent.trim()">
						发送 </button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed, watch, nextTick } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import { marked } from 'marked'
	import hljs from 'highlight.js'
	import { articleApi, type Article } from '@/api/article'
	import { commentApi, type Comment } from '@/api/comment'
	import { collectApi } from '@/api/collect'
	import { followApi } from '@/api/follow'
	import { useUserStore } from '@/store/user'

	const userStore = useUserStore()
	const articleId = ref<number>(0)
	const article = ref<Article | null>(null)
	const comments = ref<Comment[]>([])
	const commentContent = ref('')
	const replyTo = ref<Comment | null>(null)
	const showCommentSheet = ref(false)
	const inputFocus = ref(false)
	const sortType = ref<'hot' | 'latest'>('hot')
	const isFollowing = ref(false)
	const loadingMore = ref(false)
	const noMore = ref(false)
	const page = ref(1)
	const pageSize = 20
	const relatedArticles = ref<Article[]>([])

	const showFlollow = computed(() => {
		return userStore.userInfo?.id != article.value?.userId && userStore.userInfo?.id
	})
	// 时间相对化
	const relativeTime = (time : string) => {
		const now = Date.now()
		const t = new Date(time).getTime()
		const diff = now - t
		const minutes = Math.floor(diff / 60000)
		const hours = Math.floor(diff / 3600000)
		const days = Math.floor(diff / 86400000)
		if (minutes < 1) return '刚刚'
		if (minutes < 60) return `${minutes}分钟前`
		if (hours < 24) return `${hours}小时前`
		if (days < 30) return `${days}天前`
		return time.slice(0, 10)
	}

	// 获取父评论昵称
	const getParentNickname = (parentComment : Comment, parentId : number) : string => {
		if (parentComment.replies) {
			const found = parentComment.replies.find(r => r.id === parentId)
			if (found) return found.userNickname
		}
		return ''
	}

	// 排序后的树状评论
	const commentTree = computed(() => {
		return comments.value
	})

	marked.setOptions({
		highlight: function (code, lang) {
			if (lang && hljs.getLanguage(lang)) {
				return hljs.highlight(code, { language: lang }).value
			}
			return hljs.highlightAuto(code).value
		}
	})

	const renderedContent = computed(() => {
		if (!article.value?.content) return ''
		return marked(article.value.content)
	})

	const formatTime = (time : string) => {
		const date = new Date(time)
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
	}

	const loadArticle = async () => {
		try {
			const res = await articleApi.detail(articleId.value)
			article.value = res
			if (userStore.token) {
				getLike()
				hasCollect(article.value.id)
				loadRelated()
				checkFollow()
			}
		} catch (e) {
			uni.showToast({ title: '加载文章失败', icon: 'none' })
		}
	}
	const selectSortType = (type : string) => {
		sortType.value = type
		loadComments(true)
	}
	const checkFollow = async () => {
		if (!article.value?.userId) return
		try {
			isFollowing.value = await followApi.isFollowing(article.value.userId)
		} catch { }
	}

	const loadRelated = async () => {
		try {
			relatedArticles.value = await articleApi.related(articleId.value)
		} catch (e) {
			console.error('加载推荐失败', e)
		}
	}

	const hasCollect = async (id : number) => {
		const res = await collectApi.hascollect(id)
		article.value!.isFavorited = res
	}

	const getLike = async () => {
		const res = await articleApi.getlike(articleId.value)
		article.value!.isLiked = res
	}

	const loadComments = async (isRefresh = false) => {
		if (loadingMore.value) return
		if (isRefresh) {
			page.value = 1
			noMore.value = false
		}
		loadingMore.value = true
		try {
			const res = await commentApi.list(articleId.value, { page: page.value, size: pageSize, sort: sortType.value })
			const list : Comment[] = Array.isArray(res) ? res : (res.list ?? res ?? [])
			if (isRefresh) {
				comments.value = list
			} else {
				comments.value.push(...list)
			}
			if (comments.value.length >= res.total) noMore.value = true
		} catch (e) {
			console.error('加载评论失败', e)
		} finally {
			loadingMore.value = false
		}
	}

	const loadMoreComments = () => {
		if (noMore.value || loadingMore.value || !userStore.token) return
		page.value++
		loadComments()
	}

	const toggleLike = async () => {
		if (!article.value) return
		try {
			const res = await articleApi.like(article.value.id)
			article.value.isLiked = res
			article.value.likeCount += article.value.isLiked ? 1 : -1
		} catch (e) {
			uni.showToast({ title: '操作失败', icon: 'none' })
		}
	}

	const toggleFavorite = async () => {
		if (!article.value) return
		try {
			const res = await collectApi.toggle(article.value.id)
			article.value.isFavorited = res
		} catch (e) {
			uni.showToast({ title: '操作失败', icon: 'none' })
		}
	}

	const shareArticle = () => {
		uni.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] })
	}

	const follow = async () => {
		if (!article.value) return
		try {
			if (isFollowing.value) {
				await followApi.unfollow(article.value.userId)
				isFollowing.value = false
				uni.showToast({ title: '已取消关注', icon: 'none' })
			} else {
				await followApi.follow(article.value.userId)
				isFollowing.value = true
				uni.showToast({ title: '关注成功', icon: 'success' })
			}
		} catch (e) {
			uni.showToast({ title: '操作失败', icon: 'none' })
		}
	}

	const openCommentSheet = (isFoucs = false) => {
		// if(!userStore.token)return
		showCommentSheet.value = true
		page.value = 1
		// if (userStore.token)
		loadComments(true)
		// 先重置 focus 再设置，确保每次都能触发键盘弹出
		inputFocus.value = false
		if (isFoucs) {
			nextTick(() => {
				setTimeout(() => { inputFocus.value = true }, 350)
			})

		}
	}

	const closeCommentSheet = () => {
		showCommentSheet.value = false
		commentContent.value = ''
		replyTo.value = null
	}

	const onReply = (comment : Comment) => {
		if (!userStore.token) {
			uni.showToast({ title: '请登录后操作', icon: 'error' })
			setTimeout(() => {
				uni.navigateTo({
					url: '/pages/login/index'
				})
			}, 1000)
			return
		}
		replyTo.value = comment
		inputFocus.value = true
	}

	const doLike = async (comment : Comment) => {
		const res = await commentApi.like(comment.articleId, comment.id)
		comment.liked = res.liked
	}

	const cancelReply = () => {
		replyTo.value = null
	}

	const toggleCommentLike = (comment : Comment) => {
		comment.isLiked = !comment.isLiked
		comment.likeCount = (comment.likeCount || 0) + (comment.isLiked ? 1 : -1)
	}

	const submitComment = async () => {
		if (!commentContent.value.trim()) {
			uni.showToast({ title: '请输入评论内', icon: 'none' })
			return
		}
		try {
			await commentApi.add(articleId.value, {
				content: commentContent.value,
				parentId: replyTo.value?.id
			})
			commentContent.value = ''
			replyTo.value = null
			uni.showToast({ title: '评论成功', icon: 'success' })
			loadComments(true)
			if (article.value) article.value.commentCount++
		} catch (e) {
			uni.showToast({ title: '评论失败', icon: 'none' })
		}
	}

	const goAuthor = (comment : Comment) => {
		let userId : number = article.value?.userId
		if (comment) userId = comment.userId
		if (userId)
			uni.navigateTo({ url: `/pages/user/other?id=${userId}` })
	}

	const goDetail = (id : number) => {
		uni.navigateTo({ url: `/pages/article/detail?id=${id}` })
	}
	const goPublish = (id : number) => {
		uni.navigateTo({ url: `/pages/publish/index?id=${id}` })
	}
	onLoad((options) => {
		if (options?.id) {
			articleId.value = parseInt(options.id)
			loadArticle()
		}
	})
</script>

<style lang="scss" scoped>
	// ========== 文章主体 ==========
	.article-detail {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: #fff;
	}

	.article-scroll {
		flex: 1;
		height: 0;
	}

	.article-content {
		padding: 24rpx;
		padding-bottom: var(--windows-bottom);
		height: calc(100% - 24rpx);

		.cover {
			width: 100%;
			height: 480rpx;
			border-radius: 16rpx;
			margin-bottom: 24rpx;
		}

		.title {
			font-size: 44rpx;
			font-weight: 800;
			color: #1a1a1a;
			line-height: 1.35;
			margin-bottom: 24rpx;
		}

		.author-info {
			display: flex;
			align-items: center;
			margin-bottom: 32rpx;

			.avatar {
				width: 72rpx;
				height: 72rpx;
				border-radius: 50%;
				margin-right: 16rpx;
			}

			.author-meta {
				flex: 1;

				.nickname {
					font-size: 30rpx;
					color: #333;
					font-weight: 600;
					display: block;
				}

				.time {
					font-size: 24rpx;
					color: #999;
				}
			}

			.follow-btn {
				padding: 10rpx 28rpx;
				background: $uni-primary;
				color: #fff;
				border-radius: 40rpx;
				font-size: 26rpx;
				font-weight: 600;
			}

			.followed-btn {
				padding: 10rpx 28rpx;
				background: #F5F5F5;
				color: #999;
				border-radius: 40rpx;
				font-size: 26rpx;
			}
		}

		.content {
			font-size: 30rpx;
			line-height: 1.8;
			color: #333;
			margin-bottom: 32rpx;

			:deep(p) {
				margin-bottom: 16rpx;
			}

			:deep(h1),
			:deep(h2),
			:deep(h3) {
				margin: 24rpx 0 16rpx;
				font-weight: 600;
			}

			:deep(code) {
				background: #f5f5f5;
				padding: 4rpx 8rpx;
				border-radius: 4rpx;
				font-family: monospace;
			}

			:deep(pre) {
				background: #f8f8f8;
				padding: 16rpx;
				border-radius: 8rpx;
				overflow-x: auto;
			}

			:deep(img) {
				max-width: 100%;
				border-radius: 8rpx;
			}

			:deep(a) {
				color: #3B82F6;
			}
		}

		.tags {
			margin-bottom: 32rpx;

			.tag {
				display: inline-block;
				font-size: 26rpx;
				color: $uni-primary;
				margin-right: 16rpx;
				margin-bottom: 8rpx;
			}
		}

		// ========== 推荐阅读 ==========
		.related-section {
			padding: 32rpx 0 0;
			border-top: 1rpx solid #f0f0f0;
			margin-top: 16rpx;

			.related-title {
				font-size: 32rpx;
				font-weight: 700;
				color: #1a1a1a;
				margin-bottom: 24rpx;
			}

			.related-list {
				display: flex;
				flex-direction: column;
				gap: 24rpx;
			}

			.related-item {
				display: flex;
				gap: 20rpx;
				align-items: center;

				.related-cover {
					width: 160rpx;
					height: 120rpx;
					border-radius: 12rpx;
					flex-shrink: 0;
				}

				.related-info {
					flex: 1;
					display: flex;
					flex-direction: column;
					gap: 8rpx;

					.related-title-text {
						font-size: 28rpx;
						color: #1a1a1a;
						font-weight: 600;
						line-height: 1.4;
						display: -webkit-box;
						-webkit-line-clamp: 2;
						-webkit-box-orient: vertical;
						overflow: hidden;
					}

					.related-meta {
						font-size: 22rpx;
						color: #999;
					}
				}
			}
		}

		.bottom-spacer {
			height: 140rpx;
		}
	}

	// ========== 文章底部悬浮操作==========
	.article-action-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(255, 255, 255, 0.97);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border-top: 1rpx solid rgba(0, 0, 0, 0.06);
		padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
		display: flex;
		align-items: center;
		gap: 16rpx;
		z-index: 50;

		.action-input {
			flex: 1;
			height: 72rpx;
			background: #F4F4F5;
			border-radius: 36rpx;
			display: flex;
			align-items: center;
			padding: 0 28rpx;
			font-size: 28rpx;
			color: #969799;
		}

		.action-icons {
			display: flex;
			align-items: center;
			gap: 24rpx;
		}

		.action-icon-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 2rpx;
			color: #646766;
			min-width: 80rpx;

			.action-icon {
				font-size: 44rpx;
				line-height: 1;
			}

			.action-label {
				font-size: 20rpx;
				line-height: 1.2;
				color: #646766;
			}

			&.active {
				.action-label {
					color: $uni-primary;
				}
			}
		}
	}

	// ========== 评论区浮==========
	.comment-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 200;
		animation: fadeIn 0.25s ease;
	}

	.comment-sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: 80vh;
		background: #fff;
		border-radius: 24rpx 24rpx 0 0;
		z-index: 201;
		display: flex;
		flex-direction: column;
		transform: translateY(100%);
		transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
		overflow: hidden;

		&.open {
			transform: translateY(0);
		}
	}

	// 浮层头部
	.sheet-header {
		display: flex;
		align-items: center;
		padding: 32rpx 32rpx 24rpx;
		border-bottom: 1rpx solid #F0F0F0;
		flex-shrink: 0;

		.sheet-title {
			font-size: 32rpx;
			font-weight: 700;
			color: #1a1a1a;
			flex: 1;
		}

		.sheet-tabs {
			display: flex;
			align-items: center;
			margin-right: 24rpx;

			.tab {
				font-size: 28rpx;
				color: #8a8a8a;
				padding: 0 12rpx;
				transition: color 0.2s;

				&.active {
					color: $uni-primary;
					font-weight: 600;
				}
			}

			.tab-divider {
				color: #E5E5E5;
				font-size: 28rpx;
			}
		}

		.close-btn {
			width: 56rpx;
			height: 56rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 28rpx;
			color: #8a8a8a;
			background: #F5F5F5;
			border-radius: 50%;
		}
	}

	// 评论滚动	
	.comment-scroll {
		flex: 1;
		overflow: hidden;
	}

	.comment-list {
		padding: 0 24rpx;
	}

	// 单条评论卡片（抖音风格：左侧内容 + 右侧点赞	
	.comment-card {
		display: flex;
		gap: 20rpx;
		padding: 28rpx 0;
		border-bottom: 1rpx solid #F7F7F7;

		&:last-child {
			border-bottom: none;
		}
	}

	// 右侧点赞	
	.comment-like-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6rpx;
		flex-shrink: 0;
		width: 60rpx;

		.like-icon {
			font-size: 44rpx;
			transition: transform 0.15s;
		}

		.like-icon:active {
			transform: scale(1.3);
		}

		.liked {
			color: $uni-primary;
		}

		.like-count {
			font-size: 22rpx;
			color: #8a8a8a;
		}
	}

	// 左侧内容
	.comment-body-col {
		flex: 1;
		display: flex;
		gap: 16rpx;
		overflow: hidden;

		.c-avatar {
			width: 64rpx;
			height: 64rpx;
			border-radius: 50%;
			flex-shrink: 0;
		}

		.c-content {
			flex: 1;
			overflow: hidden;

			.c-header {
				display: flex;
				align-items: baseline;
				margin-bottom: 8rpx;
				gap: 12rpx;

				.c-nickname {
					font-size: 28rpx;
					font-weight: 600;
					color: #555;
				}

				.c-time {
					font-size: 22rpx;
					color: #B2B2B2;
				}
			}

			.c-text {
				font-size: 30rpx;
				color: #1a1a1a;
				line-height: 1.7;
				word-break: break-all;
				margin-bottom: 12rpx;
			}

			.c-actions {
				display: flex;
				align-items: center;
				gap: 24rpx;

				.c-reply-btn {
					font-size: 24rpx;
					color: #B2B2B2;
				}

				.c-report {
					font-size: 24rpx;
					color: #B2B2B2;
				}
			}

			// 子评			
			.sub-comments {
				margin-top: 16rpx;
				padding: 16rpx 20rpx;
				background: #F7F8FA;
				border-radius: 12rpx;

				.sub-comment {
					font-size: 28rpx;
					line-height: 1.8;
					color: #333;

					.sub-nickname {
						font-weight: 600;
						color: #555;
					}

					.sub-arrow,
					.sub-target {
						color: #B2B2B2;
					}

					.sub-text {
						color: #1a1a1a;
					}

					.sub-actions {
						display: inline-flex;
						gap: 16rpx;
						margin-left: 12rpx;

						.sub-time {
							font-size: 22rpx;
							color: #B2B2B2;
						}

						.sub-reply-btn {
							font-size: 22rpx;
							color: #B2B2B2;
						}
					}
				}
			}
		}
	}

	.load-more-tip {
		text-align: center;
		padding: 32rpx;
		font-size: 24rpx;
		color: #B2B2B2;
	}

	.comment-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 120rpx 0;
		gap: 16rpx;

		.empty-icon {
			font-size: 80rpx;
		}

		.empty-text {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
		}

		.empty-sub {
			font-size: 26rpx;
			color: #999;
		}
	}

	.comment-bottom-spacer {
		height: 40rpx;
	}

	// ========== 浮层底部输入==========
	.sheet-input-bar {
		flex-shrink: 0;
		padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
		background: #fff;
		border-top: 1rpx solid #F0F0F0;

		.reply-indicator {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 10rpx 20rpx;
			margin-bottom: 12rpx;
			background: #EBF5FF;
			border-radius: 20rpx;

			.reply-hint {
				font-size: 24rpx;
				color: $uni-primary;
				display: flex;
				align-items: center;
				gap: 6rpx;
			}

			.cancel-reply {
				width: 36rpx;
				height: 36rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 20rpx;
				color: #999;
				background: rgba(0, 0, 0, 0.06);
				border-radius: 50%;
			}
		}

		.input-row {
			display: flex;
			align-items: center;
			gap: 16rpx;
		}

		.comment-input {
			flex: 1;
			height: 80rpx;
			padding: 0 32rpx;
			font-size: 28rpx;
			color: #1a1a1a;
			background: #F4F4F5;
			border-radius: 40rpx;
			transition: all 0.2s;

			&:focus {
				background: #fff;
				box-shadow: 0 0 0 3rpx rgba(254, 44, 85, 0.15);
			}
		}

		.send-btn {
			width: 120rpx;
			height: 72rpx;
			line-height: 72rpx;
			text-align: center;
			background: #E5E5E5;
			color: #B2B2B2;
			border-radius: 36rpx;
			font-size: 28rpx;
			font-weight: 600;
			transition: all 0.2s;
			flex-shrink: 0;

			&.active {
				background: $uni-primary;
				color: #fff;
				box-shadow: 0 4rpx 16rpx rgba(254, 44, 85, 0.3);
			}

			&::after {
				border: none;
			}
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}
</style>