import DefaultTheme from 'vitepress/theme'
import { watch } from 'vue' // h函数
import UUIDGenerator from './components/UUIDGenerator.vue'
import RandomKey from './components/RandomKey.vue'
import ArticleMetadata from "./components/ArticleMetadata.vue"
import CurrencyConverter from "./components/CurrencyConverter.vue"
import QRcode from "./components/QRcode.vue"
import JsonFormatter from './components/JsonFormatter.vue'
import Base64Converter from './components/Base64Converter.vue'
import MyLayout from './components/MyLayout.vue'
import './style/index.css'
// 彩虹背景动画样式
let homePageStyle: HTMLStyleElement | undefined
export default {
  extends: DefaultTheme,
  Layout: MyLayout,
  enhanceApp({ app, router }) {
    // 注册全局组件
    app.component('UUIDGenerator', UUIDGenerator)
    app.component('RandomKey', RandomKey)
    app.component('ArticleMetadata', ArticleMetadata)
    app.component('CurrencyConverter', CurrencyConverter)
    app.component('QRcode', QRcode)
    app.component('JsonFormatter', JsonFormatter)
    app.component('Base64Converter', Base64Converter)
    // 彩虹背景动画样式
    if (typeof window !== 'undefined') {
      watch(
        () => router.route.data.relativePath,
        () => updateHomePageStyle(location.pathname === '/'),
        { immediate: true },
      )
    }
  },
}
// 彩虹背景动画样式
function updateHomePageStyle(value: boolean) {
  if (value) {
    if (homePageStyle) return

    homePageStyle = document.createElement('style')
    homePageStyle.innerHTML = `
    :root {
      animation: rainbow 12s linear infinite;
    }`
    document.body.appendChild(homePageStyle)
  } else {
    if (!homePageStyle) return

    homePageStyle.remove()
    homePageStyle = undefined
  }
}