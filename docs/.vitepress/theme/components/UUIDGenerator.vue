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
  background-color: var(--vp-c-brand-1); /* brand-3 浅色背景 */
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--vp-c-brand-3); /* brand-2 边框 */
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 0.95rem;
  color: var(--vp-button-brand-text); /* brand-1 文字色 */
  transition: background-color 0.3s, color 0.3s;
}

/* 暗色模式 */
.dark .md-code-block {
  background-color: var(--vp-c-brand-1); /* 深色背景 */
  border: 1px solid var(--vp-c-brand-3);
  color: var(--vp-button-brand-text);
}

/* 按钮组 */
.buttons {
  display: flex;
  gap: 0.5rem;
}

.buttons button {
  background-color: var(--vp-button-brand-bg);
  border: 1px solid var(--vp-button-brand-border);
  border-radius: 0.5rem;
  box-sizing: border-box;
  font-family: "Inter var", ui-sans-serif, system-ui, -apple-system, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1rem;
  padding: 0.75rem 1.5rem;
  text-align: center;
  text-decoration: none var(--vp-button-brand-text) solid;
  box-shadow: 0 1px 2px 0 var(--vp-button-brand-border);
  cursor: pointer;
  user-select: none;
  min-width: 120px;
  color: var(--vp-button-brand-text);
  transition: 
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.1s ease,
    box-shadow 0.2s ease;
}

/* 悬停 */
.buttons button:hover {
  background-color: var(--vp-button-brand-hover-bg);
  color: var(--vp-button-brand-hover-text);
}

/* 点击按下状态 */
.buttons button:active {
  background-color: var(--vp-button-brand-active-bg);
  color: var(--vp-button-brand-active-text);
  transform: translateY(2px);
}

/* 暗色模式按钮，降低刺眼度 */
.dark .buttons button {
  background-color: var(--vp-button-brand-bg);
  border: 0.5px solid var(--vp-button-brand-border);
  color: var(--vp-button-brand-text);
}

.dark .buttons button:hover {
  background-color: var(--vp-button-brand-hover-bg);
  color: var(--vp-button-brand-hover-text);
}

.dark .buttons button:active {
  background-color: var(--vp-button-brand-active-bg);
  color: var(--vp-button-brand-active-text);
  transform: translateY(2px);
}

/* 按钮聚焦 */
.buttons button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

</style>
