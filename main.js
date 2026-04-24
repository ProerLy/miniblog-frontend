import App from './App'
import pinia from '@/store'
import request from '@/utils/request'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
Vue.config.globalProperties.$http = request
App.mpType = 'app'
const app = new Vue({
  ...App
  pinia
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  app.config.globalProperties.$http = request
  app.use(pinia)
  return {
    app
  }
}
// #endif