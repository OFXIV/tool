import { defineConfig } from 'vitepress'
import { devDependencies, version } from '../../package.json'

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
  base: '/',
  appearance: 'dark',
  //markdown配置
  markdown: {
    lineNumbers: true, //false关闭
    image: {
      // 开启图片懒加载
      lazyLoading: true
    },
  },
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  lastUpdated: true,
  cleanUrls: true,
  title: '拼好具',
  description: '拼合收集各种工具网站',
  themeConfig: {
    //编辑本页
    editLink: {
      pattern: 'https://github.com/OFXIV/tool/edit/main/docs/:path', // 改成自己的仓库
      text: '编辑此页面'
    },
    //自定义上下页名
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    //手机端深浅模式文字修改
    darkModeSwitchLabel: '深浅模式',
    //本地搜索
    search: {
      provider: 'local'
    },
    logo: '/logo.png',
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/OFXIV' },
      {
        icon:
        {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 448 512"><path d="M162.4 196c4.8-4.9 6.2-5.1 36.4-5.1c27.2 0 28.1.1 32.1 2.1c5.8 2.9 8.3 7 8.3 13.6c0 5.9-2.4 10-7.6 13.4c-2.8 1.8-4.5 1.9-31.1 2.1c-16.4.1-29.5-.2-31.5-.8c-10.3-2.9-14.1-17.7-6.6-25.3zm61.4 94.5c-53.9 0-55.8.2-60.2 4.1c-3.5 3.1-5.7 9.4-5.1 13.9c.7 4.7 4.8 10.1 9.2 12c2.2 1 14.1 1.7 56.3 1.2l47.9-.6l9.2-1.5c9-5.1 10.5-17.4 3.1-24.4c-5.3-4.7-5-4.7-60.4-4.7zm223.4 130.1c-3.5 28.4-23 50.4-51.1 57.5c-7.2 1.8-9.7 1.9-172.9 1.8c-157.8 0-165.9-.1-172-1.8c-8.4-2.2-15.6-5.5-22.3-10c-5.6-3.8-13.9-11.8-17-16.4c-3.8-5.6-8.2-15.3-10-22C.1 423 0 420.3 0 256.3C0 93.2 0 89.7 1.8 82.6C8.1 57.9 27.7 39 53 33.4c7.3-1.6 332.1-1.9 340-.3c21.2 4.3 37.9 17.1 47.6 36.4c7.7 15.3 7-1.5 7.3 180.6c.2 115.8 0 164.5-.7 170.5zm-85.4-185.2c-1.1-5-4.2-9.6-7.7-11.5c-1.1-.6-8-1.3-15.5-1.7c-12.4-.6-13.8-.8-17.8-3.1c-6.2-3.6-7.9-7.6-8-18.3c0-20.4-8.5-39.4-25.3-56.5c-12-12.2-25.3-20.5-40.6-25.1c-3.6-1.1-11.8-1.5-39.2-1.8c-42.9-.5-52.5.4-67.1 6.2c-27 10.7-46.3 33.4-53.4 62.4c-1.3 5.4-1.6 14.2-1.9 64.3c-.4 62.8 0 72.1 4 84.5c9.7 30.7 37.1 53.4 64.6 58.4c9.2 1.7 122.2 2.1 133.7.5c20.1-2.7 35.9-10.8 50.7-25.9c10.7-10.9 17.4-22.8 21.8-38.5c3.2-10.9 2.9-88.4 1.7-93.9z" fill="currentColor"></path></svg>'
        },
        link: 'https://ofxiv.github.io/hugo-stack'
      }
    ],
    nav: [
      { text: '工具', link: '/uuid' },
      { text: '更新日志', link: '/CHANGELOG' },
      { text: `拼好具 v${version}`, link: '/', noIcon: true },
    ],
    sidebar: {
      '/': [
        {
          text: '生成器',
          items: [
            { text: 'UUID随机生成器', link: '/uuid' },
            { text: '随机密码生成器', link: '/randomkey' },
            { text: '二维码生成器', link: '/qrcode' }
          ]
        },
        {
          text: '换算器',
          items:[
            {text:'汇率换算',link:'/currencyconverter'}
          ]
        },
        {
          text: '格式化工具',
          items:[
            {text:'JSON格式化',link:'/jsonformatter'}
          ]
        },
        {
          text: '编码/解码器',
          items:[
            {text:'Base64',link:'/base64'}
          ]
        }
      ]
    }
  }
})
