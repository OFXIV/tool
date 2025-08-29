<script setup>
import { ref, reactive } from 'vue'

const uuid = ref('')
const displayUUID = ref('')
const history = reactive([])

const copyStatus = ref('复制')
let copyTimeout = null

function generateUUID() {
  const newUuid = crypto.randomUUID()
  uuid.value = newUuid
  history.unshift(newUuid)
  if (history.length > 10) history.pop()
  animateUUID(newUuid)
}

// UUID 动态滚动效果
function animateUUID(newUuid) {
  const chars = newUuid.split('')
  let index = 0
  const interval = setInterval(() => {
    displayUUID.value = chars
      .map((c, i) => (i <= index ? c : randomChar()))
      .join('')
    index++
    if (index >= chars.length) clearInterval(interval)
  }, 20)
}

// 随机字符
function randomChar() {
  const chars = '0123456789abcdef-'
  return chars[Math.floor(Math.random() * chars.length)]
}

// 点击复制
async function copyUUID() {
  if (!uuid.value) return
  await navigator.clipboard.writeText(uuid.value)
  copyStatus.value = '已复制'
  clearTimeout(copyTimeout)
  copyTimeout = setTimeout(() => (copyStatus.value = '复制'), 1500)
}

// 初始生成
generateUUID()
</script>

<template>
  <div class="uuid-card">
    <!-- Markdown 样式代码块，大小自适应内容 -->
    <pre class="md-code-block"><code>{{ displayUUID }}</code></pre>

    <!-- 下方按钮 -->
    <div class="buttons">
      <button @click="generateUUID">生成</button>
      <button @click="copyUUID">{{ copyStatus }}</button>
    </div>
  </div>
</template>

<style scoped>
.uuid-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-family: "SF Mono", monospace;
  max-width: 100%;
}

/* Markdown 风格代码块，自适应内容大小 */
.md-code-block {
  display: inline-block;
  background-color: #f6f8fa; /* 默认亮色 */
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 0.95rem;
  color: #111; /* 亮色模式下文字 */
}

/* 暗色模式下覆盖 */
.dark .md-code-block {
  background-color: #2d2d2d; /* 深灰 */
  border: 1px solid #444;
  color: #eee; /* 亮文字 */
}

/* 下方按钮 */
.buttons {
  display: flex;
  gap: 0.5rem;
}

.buttons button {
  background-color: #f6f8fa;
  border: 1px solid rgb(209, 213, 219);
  border-radius: 0.5rem;
  box-sizing: border-box;
  font-family: "Inter var", ui-sans-serif, system-ui, -apple-system, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1rem;
  padding: 0.75rem 1.5rem;
  text-align: center;
  text-decoration: none #D1D5DB solid;
  text-decoration-thickness: auto;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  min-width: 120px;
  color: #111;
}

/* 暗色模式下按钮覆盖 */
.dark .buttons button {
  background-color: #3a3a3a;
  border: 1px solid #555;
  color: #f5f5f5;
}

.buttons button:hover {
  background-color: #eaeff1;
}

.dark .buttons button:hover {
  background-color: #4a4a4a;
}

.buttons button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.buttons button:focus-visible {
  box-shadow: none;
}
</style>
