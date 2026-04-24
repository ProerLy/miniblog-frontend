// vite.config.js
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  // 👇 关键配置
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('uni-')
      }
    }
  }
})