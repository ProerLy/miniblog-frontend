const BASE_URL = 'http://localhost:9091/api'

interface RequestOptions {
	url : string
	method ?: 'GET' | 'POST' | 'PUT' | 'DELETE'
	data ?: any
	header ?: Record<string, string>
}

export function request<T = any>(options : RequestOptions) : Promise<T> {
	return new Promise((resolve, reject) => {
		const token = uni.getStorageSync('token')
		const header : Record<string, string> = {
			'Content-Type': 'application/json',
			...options.header
		}
		if (token) {
			header['Authorization'] = `Bearer ${token}`
		}

		uni.request({
			url: BASE_URL + options.url,
			method: options.method || 'GET',
			data: options.data,
			header,
			success: (res) => {
				if (res.statusCode === 200) {
					const data = res.data as any
					if (data.code === 200) {
						resolve(data.data)
					} else {
						uni.showToast({ title: data.message || '请求失败', icon: 'none' })
						reject(data)
					}
				} else {
					if (res.statusCode === 401) {
						uni.showToast({ title: '请登录后操作', icon: 'error' })
						setTimeout(()=> {
							uni.navigateTo({
								url: '/pages/login/index'
							})
						}, 1000)
					} else {
						uni.showToast({ title: '网络错误', icon: 'none' })
						reject(res)
					}
				}
			},
			fail: (err) => {
				uni.showToast({ title: '网络错误', icon: 'none' })
				reject(err)
			}
		})
	})
}
export const get = (url : string, data : object) => request({ url, data, method: 'GET' })
export const post = (url : string, data : object) => request({ url, data, method: 'POST' })
export const put = (url : string, data : object) => request({ url, data, method: 'PUT' })
export const del = (url : string, data : object) => request({ url, data, method: 'DELETE' })
export default {
	get,
	post,
	put,
	delete: del,
	request
}