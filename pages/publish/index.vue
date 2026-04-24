<template>
	<view class="publish-page">
		<view class="form">
			<!-- 标题 -->
			<view class="form-item">
				<input class="title-input" v-model="form.title" placeholder="请输入文章标题" maxlength="100" />
			</view>

			<!-- 内容 -->
			<view class="form-item">
				<textarea class="content-textarea" v-model="form.content" placeholder="请输入文章内容，支持 Markdown 语法..."
					maxlength="10000" />
			</view>

			<!-- 摘要 -->
			<view class="form-item">
				<text class="label">摘要</text>
				<textarea class="summary-textarea" v-model="form.summary" placeholder="请输入文章摘要（选填）" maxlength="200" />
			</view>

			<!-- 封面图 -->
			<view class="form-item">
				<text class="label">封面图</text>
				<view class="cover-wrapper" @click="chooseCover">
					<image v-if="form.coverImage" :src="form.coverImage" class="cover-preview" mode="aspectFill" />
					<view v-else class="cover-placeholder">
						<text class="icon"></text>
						<text class="hint">点击上传封面图</text>
					</view>
				</view>
			</view>

			<!-- 分类 -->
			<view class="form-item">
				<text class="label">分类</text>
				<picker mode="selector" :range="categories" range-key="name" @change="onCategoryChange">
					<view class="picker">
						{{ selectedCategory?.name || '请选择分类' }}
						<text class="arrow">></text>
					</view>
				</picker>
			</view>

			<!-- 标签 -->
			<view class="form-item">
				<text class="label">标签</text>
				<input class="input" v-model="form.tags" placeholder="输入标签，用逗号分隔" maxlength="50" />
			</view>
		</view>

		<!-- 发布按钮 -->
		<view class="footer">
			<button class="publish-btn" @click="handlePublish" :loading="loading">发布文章</button>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed, onMounted } from 'vue'
	import { articleApi } from '@/api/article'
	import { categorieApi } from '@/api/categorie'

	const categories = ref([
	])

	const form = ref({
		title: '',
		content: '',
		summary: '',
		coverImage: '',
		categoryId: undefined as number | undefined,
		tags: ''
	})

	const loading = ref(false)
	const selectedCategory = computed(() => {
		return categories.value.find(c => c.id === form.value.categoryId)
	})
	const loadCategories = async () => {
		try {
			const res = await categorieApi.categories()
			categories.value = res
		} catch (e) {
			console.error('加载失败', e)
		}
	}
	const chooseCover = () => {
		uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				// 演示模式，使用本地路径
				form.value.coverImage = res.tempFilePaths[0]
				uni.showToast({ title: '图片已选择', icon: 'none' })
			}
		})
	}

	const onCategoryChange = (e : any) => {
		const index = e.detail.value
		form.value.categoryId = categories.value[index].id
	}

	const handlePublish = async () => {
		if (!form.value.title.trim()) {
			uni.showToast({ title: '请输入文章标题', icon: 'none' })
			return
		}
		if (!form.value.content.trim()) {
			uni.showToast({ title: '请输入文章内容', icon: 'none' })
			return
		}

		loading.value = true
		try {
			await articleApi.publish(form.value)
			uni.showToast({ title: '发布成功', icon: 'success' })
			setTimeout(() => {
				form.value = {
					title: '',
					content: '',
					summary: '',
					coverImage: '',
					categoryId: undefined as number | undefined,
					tags: ''
				}
				uni.switchTab({ url: '/pages/index/index' })
				uni.$emit('refreshHome')
			}, 1500)
		} catch (e) {
			uni.showToast({ title: '发布失败', icon: 'none' })
		} finally {
			loading.value = false
		}
	}
	onMounted(() => {
		loadCategories()
	})
</script>

<style lang="scss" scoped>
	.publish-page {
		min-height: 100vh;
		background: #f5f5f5;
		padding-bottom: calc(var(--window-bottom) + 50rpx);
	}

	.form {
		background: #fff;
		padding: 32rpx;

		.form-item {
			margin-bottom: 32rpx;

			.content-textarea,
			.summary-textarea {
				width: calc(100% - 45rpx)
			}

			.title-input {
				height: 96rpx;
				font-size: 36rpx;
				font-weight: 600;
				border-bottom: 2rpx solid #f0f0f0;
			}

			.content-textarea {
				height: 400rpx;
				font-size: 30rpx;
				line-height: 1.8;
				background: #f8f8f8;
				border-radius: 12rpx;
				padding: 24rpx;
			}

			.label {
				font-size: 30rpx;
				color: #333;
				font-weight: 500;
				margin-bottom: 16rpx;
				display: block;
			}

			.summary-textarea {
				height: 160rpx;
				font-size: 30rpx;
				background: #f8f8f8;
				border-radius: 12rpx;
				padding: 24rpx;
			}

			.cover-wrapper {
				width: 100%;
				height: 360rpx;
				background: #f8f8f8;
				border-radius: 12rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				overflow: hidden;

				.cover-preview {
					width: 100%;
					height: 100%;
				}

				.cover-placeholder {
					display: flex;
					flex-direction: column;
					align-items: center;

					.icon {
						font-size: 64rpx;
						margin-bottom: 16rpx;
					}

					.hint {
						font-size: 28rpx;
						color: #999;
					}
				}
			}

			.picker {
				height: 88rpx;
				background: #f8f8f8;
				border-radius: 12rpx;
				padding: 0 24rpx;
				display: flex;
				align-items: center;
				justify-content: space-between;
				font-size: 30rpx;
				color: #333;

				.arrow {
					color: #999;
				}
			}

			.input {
				height: 88rpx;
				background: #f8f8f8;
				border-radius: 12rpx;
				padding: 0 24rpx;
				font-size: 30rpx;
			}
		}
	}

	.footer {
		position: fixed;
		bottom: var(--window-bottom);
		left: 0;
		right: 0;
		background: #fff;
		padding: 24rpx 32rpx;
		box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.05);

		.publish-btn {
			height: 96rpx;
			background: $uni-primary;
			color: #fff;
			border-radius: 12rpx;
			font-size: 32rpx;
			font-weight: 600;
			display: flex;
			align-items: center;
			justify-content: center;

			&::after {
				border: none;
			}
		}
	}
</style>