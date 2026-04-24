import { request } from '@/utils/request'

export const categorieApi = {
  categories() {
    return request({ url: '/categories', method: 'GET' })
  },
}
