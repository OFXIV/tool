---
title: 随机二维码生成器
---
<script setup>
import { ref } from 'vue'
import QRCode from 'qrcode'

const text = ref('https://example.com')
const qrDataUrl = ref('')

// 随机生成一个颜色
function getRandomColor() {
  const randomColor = Math.floor(Math.random()*16777215).toString(16)
  return `#${randomColor.padStart(6, '0')}`
}

// 随机生成二维码样式
function getRandomQRCodeOptions() {
  return {
    width: Math.floor(Math.random() * 100) + 150, // 随机宽度，最小150px
    margin: Math.floor(Math.random() * 4), // 随机边距，最大3
    color: {
      dark: getRandomColor(),  // 随机前景色
      light: getRandomColor()  // 随机背景色
    }
  }
}

// 生成二维码
async function generateQRCode() {
  if (!text.value) return
  try {
    const options = getRandomQRCodeOptions() // 获取随机样式
    qrDataUrl.value = await QRCode.toDataURL(text.value, options)
  } catch (err) {
    console.error(err)
  }
}

// 初始生成
generateQRCode()
</script>

# 随机二维码生成器
> 生成随机样式的二维码 点击图片可下载 `png`格式<br>
> <input v-model="text" type="text" placeholder="输入内容生成二维码" @input="generateQRCode" />

<div class="qr-preview">
  <a v-if="qrDataUrl" :href="qrDataUrl" download="qrcode.png">
    <img :src="qrDataUrl" alt="二维码" />
  </a>
</div>

<style scoped>
input[type="text"] {
  border: 1px solid var(--vp-c-brand-3);
  color: var(--vp-button-brand-text);
  background-color: var(--vp-c-brand-1);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  width: 100%;
  box-sizing: border-box;
}

.qr-preview {
    border-radius: 10px;
    padding: 18px 20px 20px 15px;
    display: inline-flex; 
    background-color: var(--vp-c-gray-soft);
    border: 7px outset var(--vp-c-brand-1);
}

.qr-preview img {
  width: 200px;
  height: 200px;
  cursor: pointer; /* 鼠标悬停时显示点击效果 */
}

.qr-preview a {
  display: block;
}
</style>
