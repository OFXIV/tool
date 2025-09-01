<script setup>
import { ref, watch, computed, onMounted } from 'vue'

// 状态管理
const state = ref({
  input: '',
  output: '',
  error: '',
  isCopied: false,
  processing: false,
  mode: 'encode' // 'encode' 或 'decode'
})

// 计算属性
const hasInputContent = computed(() => state.value.input.trim() !== '')
const hasOutputContent = computed(() => state.value.output.trim() !== '')
const inputLines = computed(() => state.value.input.split('\n').length)
const inputChars = computed(() => state.value.input.length)
const outputLines = computed(() => state.value.output ? state.value.output.split('\n').length : 0)
const outputChars = computed(() => state.value.output ? state.value.output.length : 0)

// Base64处理工具函数
const base64Utils = {
  encode: (text) => {
    try {
      // 使用 TextEncoder 将字符串转换为 Uint8Array
      const encoder = new TextEncoder()
      const data = encoder.encode(text)
      // 使用 btoa 进行 Base64 编码
      return btoa(String.fromCharCode.apply(null, Array.from(data)))
    } catch (err) {
      throw new Error(`编码错误: ${err.message}`)
    }
  },

  decode: (base64) => {
    try {
      // 使用 atob 进行 Base64 解码
      const binaryString = atob(base64)
      // 使用 TextDecoder 将二进制字符串转换为文本
      const bytes = new Uint8Array(binaryString.split('').map(char => char.charCodeAt(0)))
      const decoder = new TextDecoder()
      return decoder.decode(bytes)
    } catch (err) {
      throw new Error(`解码错误: ${err.message}`)
    }
  }
}

// 编码/解码处理
const processInput = () => {
  if (!state.value.input.trim()) {
    clearContent()
    return
  }

  state.value.processing = true
  try {
    if (state.value.mode === 'encode') {
      state.value.output = base64Utils.encode(state.value.input)
    } else {
      state.value.output = base64Utils.decode(state.value.input)
    }
    state.value.error = ''
  } catch (err) {
    state.value.output = ''
    state.value.error = err.message
  } finally {
    state.value.processing = false
  }
}

// 复制到剪贴板
const copyToClipboard = async () => {
  if (!state.value.output || state.value.processing) return

  try {
    await navigator.clipboard.writeText(state.value.output)
    state.value.isCopied = true
    setTimeout(() => {
      state.value.isCopied = false
    }, 2000)
  } catch (err) {
    state.value.error = '复制到剪贴板失败，请手动复制'
  }
}

// 清空内容
const clearContent = () => {
  state.value.input = ''
  state.value.output = ''
  state.value.error = ''
}

// 切换模式
const switchMode = (mode) => {
  state.value.mode = mode
  // 如果有内容，则重新处理
  if (hasInputContent.value) {
    processInput()
  }
}

// 防抖函数
const debounce = (fn, delay) => {
  let timer = null
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// 监听输入变化（使用防抖）
watch(
  () => state.value.input,
  debounce(() => {
    processInput()
  }, 300)
)
</script>

<template>
  <div class="base64-converter">
    <div class="input-section">
      <div class="section-header">
        <div class="section-info">
          <div class="mode-selector">
            <button 
              class="mode-button" 
              :class="{ active: state.mode === 'encode' }"
              @click="switchMode('encode')"
            >
              编码
            </button>
            <button 
              class="mode-button" 
              :class="{ active: state.mode === 'decode' }"
              @click="switchMode('decode')"
            >
              解码
            </button>
          </div>
          <div class="input-stats">
            <span class="stat">{{ inputLines }} 行</span>
            <span class="stat">{{ inputChars }} 字符</span>
          </div>
        </div>
        <div class="header-actions">
          <button 
            v-if="hasInputContent" 
            class="action-button clear-button"
            @click="clearContent"
            :disabled="state.processing"
          >
            清空
          </button>
        </div>
      </div>
      <textarea
        v-model="state.input"
        :placeholder="state.mode === 'encode' ? '在此输入要编码的文本...' : '在此输入要解码的 Base64...'"
        class="input-textarea"
        :class="{ 'has-error': state.error }"
        spellcheck="false"
      ></textarea>
    </div>

    <div v-if="hasOutputContent || state.error" class="output-section">
      <div class="section-header">
        <div class="section-info">
          <h3>{{ state.mode === 'encode' ? 'Base64 结果' : '解码结果' }}</h3>
          <div class="output-stats">
            <span class="stat" v-if="state.output">{{ outputChars }} 字符</span>
            <span class="stat" v-if="state.output">{{ outputLines }} 行</span>
          </div>
        </div>
        <div class="action-buttons">
          <button 
            v-if="hasOutputContent"
            class="action-button copy-button"
            :class="{ copied: state.isCopied }"
            @click="copyToClipboard"
            :disabled="state.processing"
          >
            {{ state.isCopied ? '已复制!' : '复制' }}
          </button>
        </div>
      </div>

      <div class="output-container" :class="{ 'has-error': state.error }">
        <pre><code>{{ state.output }}</code></pre>
      </div>

      <transition name="fade">
        <div v-if="state.error" class="error-message">
          {{ state.error }}
        </div>
      </transition>
    </div>

    <div v-if="!hasInputContent" class="empty-state">
      <div class="empty-icon">🔐</div>
      <h3>没有输入内容</h3>
      <p>请在上方输入{{ state.mode === 'encode' ? '文本' : 'Base64' }}</p>
    </div>
  </div>
</template>

<style scoped>
.base64-converter {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 10px;
  padding: 18px 20px 20px 15px;
  position: relative;
  border-left: 6px solid var(--vp-c-brand-1);
}

.input-with-mode {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.mode-selector {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  min-width: 100px;
}

.input-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mode-button {
  padding: 0.5rem 1.5rem;
  border-radius: 0.25rem;
  border: 1px solid var(--vp-c-brand-1);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.mode-button:hover {
  background-color: var(--vp-c-brand-2);
  color: var(--vp-button-brand-text);
}

.mode-button.active {
  background-color: var(--vp-c-brand);
  color: white;
  border-color: var(--vp-c-brand);
}

.input-section,
.output-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.section-info h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.input-stats,
.output-stats {
  display: flex;
  gap: 0.5rem;
}

.stat {
  font-size: 0.8rem;
  color: var(--vp-c-brand-3);
  background-color: var(--vp-c-bg-soft);
  padding: 0.1rem 0.5rem;
  border-radius: 0.25rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-direction:row;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid var(--vp-c-brand-1);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
}

.action-button:hover {
  background-color: var(--vp-c-bg);
  border-color: var(--vp-c-brand);
  transform: translateY(-1px);
}

.action-button:active {
  transform: translateY(0);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.copy-button.copied {
  background-color: var(--vp-c-brand);
  color: white;
  border-color: var(--vp-c-brand);
}

.clear-button {
  color: var(--vp-c-danger-1);
  border-color: var(--vp-c-danger-1);
}

.clear-button:hover {
  background-color: var(--vp-c-danger-2);
  color:var(--vp-button-brand-text);
  border-color: var(--vp-c-danger-2);
}
.input-textarea {
  width: 100%;
  min-height: 150px;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  border-radius: 0.8rem;
  font-size: 0.95rem;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.2s ease;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.input-textarea:focus {
  outline: none;
  border: 1.5px solid var(--vp-c-brand-1);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
}
.input-textarea.has-error {
  border: 1.5px solid var(--vp-c-danger-1);
}
.dark .input-textarea:focus {
  background-color: #1a1a1a;
}

.output-container {
  background-color: var(--vp-c-brand-2);
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1.5px solid #00000000;
  overflow-x: auto;
  transition: all 0.2s ease;
}

.output-container.has-error {
  border-color: var(--vp-c-danger-1);
  background-color: var(--vp-c-danger-soft);
}

pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

code {
  font-size: 0.95rem;
  line-height: 1.2;
  color: var(--vp-button-brand-text);
}

.error-message {
  color: var(--vp-c-danger-1);
  font-size: 0.95rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: var(--vp-c-danger-soft);
  border-radius: 0.25rem;
  animation: shake 0.5s ease-in-out;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  border: 2px dashed var(--vp-c-divider);
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
}

.empty-state p {
  margin: 0;
  color: var(--vp-c-text-2);
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@media (max-width: 640px) {
  .input-with-mode {
    flex-direction: column;
  }
  
  .mode-selector {
    flex-direction: row;
    min-width: auto;
  }
  
  .section-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .action-buttons {
    width: 100%;
    flex-wrap: wrap;
  }

  .action-button {
    flex: 1;
    min-width: 80px;
  }
}
</style>
