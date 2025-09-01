<script setup>
import { ref } from 'vue'
import QRCode from 'qrcode'

const text = ref('')
const qrDataUrl = ref('')

// 随机生成一个颜色
function getRandomColor() {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16)
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
  if (!text.value) {
    qrDataUrl.value = ''
    return
  }
  try {
    const options = getRandomQRCodeOptions() // 获取随机样式
    qrDataUrl.value = await QRCode.toDataURL(text.value, options)
  } catch (err) {
    console.error(err)
  }
}

</script>
<template>
  <div>
    <div class="input-container">
      <input v-model="text" type="text" placeholder="输入内容生成二维码" @input="generateQRCode" />
    </div>
    <transition name="fade">
      <div class="qr-preview" v-if="qrDataUrl">
        <a :href="qrDataUrl" download="qrcode.png">
          <img :src="qrDataUrl" alt="二维码" />
        </a>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.input-container {
  border-radius: 10px;
  padding: 18px 20px 20px 15px;
  position: relative;
  border-left: 6px solid var(--vp-c-brand-2);
}
input[type="text"] {
  box-shadow: 0 0.5px 2px 0 var(--vp-c-brand-2);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.2s ease-in-out;
}s
/* 添加过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

input:focus {
  box-shadow: 0 3px 5px 0 var(--vp-c-brand-1);
}

.qr-preview {
  border-radius: 10px;
  padding: 18px 20px 20px 15px;
  display: inline-flex;
}

.qr-preview img {
  width: 200px;
  height: 200px;
  cursor: pointer;
}

.qr-preview a {
  display: block;
}
</style>