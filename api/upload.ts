const BASE_URL = 'http://localhost:9090/api'

export const uploadApi = {
	uploadImage(filePath : string) {
		const token = uni.getStorageSync('token')
		return new Promise((resolve, reject) => {
			uni.uploadFile({
				url: `${BASE_URL}/upload/image`,
				filePath: filePath,
				name: 'file', // ← 对应后端 @RequestParam("file")
				header: {
					'Authorization': token ? `Bearer ${token}` : ''
				},
				success: (res) => {
					const data = JSON.parse(res.data)
					resolve(data)
				},
				fail: (err) => reject(err)
			})
		})
	},
}