<template>
	<view class="profile-page">
		<view class="form">
			<!-- 头像 -->
			<view class="form-item avatar-item">
				<text class="label">头像</text>
				<view class="avatar-wrapper" @click="chooseAvatar">
					<image :src="form.avatar || '/static/default-avatar.png'" class="avatar" />
					<text class="edit-hint">点击更换</text>
				</view>
			</view>

			<!-- 昵称 -->
			<view class="form-item">
				<text class="label">昵称</text>
				<input class="input" v-model="form.nickname" placeholder="请输入昵称" maxlength="20" />
			</view>

			<!-- 简介 -->
			<view class="form-item">
				<text class="label">简介</text>
				<textarea class="textarea" v-model="form.bio" placeholder="介绍一下你自己..." maxlength="100" />
			</view>

			<!-- 保存按钮 -->
			<button class="save-btn" @click="saveProfile" :loading="loading">保存</button>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, onMounted } from 'vue'
	import { useUserStore } from '@/store/user'
	import { userApi } from '@/api/user'
	import { uploadApi } from '@/api/upload'

	const userStore = useUserStore()
	const loading = ref(false)

	const form = ref({
		nickname: '',
		avatar: '',
		bio: ''
	})

	const chooseAvatar = () => {
		uni.chooseImage({
			count: 1,
			success: async (res) => {
				const filePath = res.tempFilePaths[0]
				const result = await uploadApi.uploadImage(filePath)
				if (result.code === 200) {
					form.value.avatar = result.data // 拿到 URL 填进去
					uni.showToast({ title: '上传成功', icon: 'success' })
				} else {
					uni.showToast({ title: result.msg, icon: 'none' })
				}
			}
		})
	}

	const saveProfile = async () => {
		if (!form.value.nickname.trim()) {
			uni.showToast({ title: '请输入昵称', icon: 'none' })
			return
		}

		loading.value = true
		try {
			await userApi.updateProfile({
				nickname: form.value.nickname,
				avatar: form.value.avatar,
				bio: form.value.bio
			})
			await userStore.fetchUserInfo()
			uni.showToast({ title: '保存成功', icon: 'success' })
			setTimeout(() => {
				uni.navigateBack()
			}, 1500)
		} catch (e) {
			uni.showToast({ title: '保存失败', icon: 'none' })
		} finally {
			loading.value = false
		}
	}

	onMounted(() => {
		if (userStore.userInfo) {
			form.value.nickname = userStore.userInfo.nickname || ''
			form.value.avatar = userStore.userInfo.avatar || ''
			form.value.bio = userStore.userInfo.bio || ''
		}
	})
</script>

<style lang="scss" scoped>
	.profile-page {
		background: #f5f5f5;
		padding: 24rpx;
	}

	.form {
		background: #fff;
		border-radius: 16rpx;
		padding: 32rpx;

		.form-item {
			margin-bottom: 32rpx;

			&.avatar-item {
				display: flex;
				align-items: center;
				justify-content: space-between;
			}

			.label {
				font-size: 30rpx;
				color: #333;
				font-weight: 500;
				margin-bottom: 16rpx;
				display: block;
			}

			.avatar-wrapper {
				display: flex;
				flex-direction: column;
				align-items: center;

				.avatar {
					width: 120rpx;
					height: 120rpx;
					border-radius: 50%;
					margin-bottom: 8rpx;
				}

				.edit-hint {
					font-size: 24rpx;
					color: $uni-primary;
				}
			}

			.input {
				height: 88rpx;
				background: #f5f5f5;
				border-radius: 12rpx;
				padding: 0 24rpx;
				font-size: 30rpx;
			}

			.textarea {
				height: 200rpx;
				background: #f5f5f5;
				border-radius: 12rpx;
				padding: 24rpx;
				font-size: 30rpx;
			}
		}

		.save-btn {
			height: 96rpx;
			background: $uni-primary;
			color: #fff;
			border-radius: 12rpx;
			font-size: 32rpx;
			font-weight: 600;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-top: 48rpx;

			&::after {
				border: none;
			}
		}
	}
</style>