import DefaultTheme from 'vitepress/theme'
import { h } from 'vue' // h函数
import UUIDGenerator from './components/UUIDGenerator.vue'
import RandomKey from './components/RandomKey.vue'
import ArticleMetadata from "./components/ArticleMetadata.vue"
import './style/index.css'
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 注册全局组件
    app.component('UUIDGenerator', UUIDGenerator),
    app.component('RandomKey', RandomKey),
    app.component('ArticleMetadata',ArticleMetadata)
  },
}