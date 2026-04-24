<script setup lang="ts">
	import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
	import { useUserStore } from './store/user'

	onLaunch(() => {
		console.log('App Launch')
	})
	onShow(async() => {
		const store = useUserStore()

		if (store.isLoggedIn()) {
			await store.fetchUserInfo()
		}

		console.log('App Show')
	})
	onHide(() => {
		console.log('App Hide')
	})
</script>

<style>
	@import "@/styles/common.scss";

	page {
		background-color: #f5f5f5;
	}
</style>