<script setup>
import { ref, watch, computed, onMounted } from 'vue'

// 状态管理
const state = ref({
  input: '',
  output: '',
  error: '',
  isCopied: false,
  processing: false
})

// 计算属性
const isValidJson = computed(() => !state.value.error)
const hasContent = computed(() => state.value.input.trim() !== '')
const inputLines = computed(() => state.value.input.split('\n').length)
const inputChars = computed(() => state.value.input.length)
const outputLines = computed(() => state.value.output ? state.value.output.split('\n').length : 0)
const outputChars = computed(() => state.value.output ? state.value.output.length : 0)

// JSON处理工具函数
const jsonUtils = {
  parse: (jsonString) => {
    try {
      return JSON.parse(jsonString)
    } catch (err) {
      throw new Error(`JSON解析错误: ${err.message}`)
    }
  },

  format: (jsonObject) => JSON.stringify(jsonObject, null, 2),
  minify: (jsonObject) => JSON.stringify(jsonObject)
}

// 格式化JSON
const formatJson = (jsonString) => {
  state.value.processing = true
  try {
    const parsed = jsonUtils.parse(jsonString)
    state.value.output = jsonUtils.format(parsed)
    state.value.error = ''
  } catch (err) {
    state.value.output = jsonString
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
    // 使用更现代的方式显示成功状态
    setTimeout(() => {
      state.value.isCopied = false
    }, 2000)
  } catch (err) {
    state.value.error = '复制到剪贴板失败，请手动复制'
  }
}

// 压缩JSON
const minifyJson = () => {
  state.value.processing = true
  try {
    const parsed = jsonUtils.parse(state.value.input)
    state.value.output = jsonUtils.minify(parsed)
    state.value.error = ''
  } catch (err) {
    state.value.error = err.message
  } finally {
    state.value.processing = false
  }
}

// 清空内容
const clearContent = () => {
  state.value = {
    input: '',
    output: '',
    error: '',
    isCopied: false,
    processing: false
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
  debounce((newJson) => {
    if (newJson.trim()) {
      formatJson(newJson)
    } else {
      clearContent()
    }
  }, 300)
)
</script>

<template>
  <div class="json-formatter">
    <div class="input-section">
      <div class="section-header">
        <div class="section-info">
          <div class="input-stats">
            <span class="stat">{{ inputLines }} 行</span>
            <span class="stat">{{ inputChars }} 字符</span>
          </div>
        </div>
        <div class="header-actions">
          <button 
            v-if="hasContent" 
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
        placeholder="在此输入 JSON 数据..."
        class="json-input"
        :class="{ 'has-error': state.error }"
        spellcheck="false"
      ></textarea>
    </div>

    <div v-if="hasContent" class="output-section">
      <div class="section-header">
        <div class="section-info">
          <h3>输出结果</h3>
          <div class="output-stats">
            <span class="stat" v-if="state.output">{{ outputChars }} 字符</span>
            <span class="stat" v-if="state.output">{{ outputLines }} 行</span>
          </div>
        </div>
        <div class="action-buttons">
          <button 
            v-if="hasContent"
            class="action-button"
            @click="formatJson(state.input)"
            :disabled="state.processing"
          >
            格式化
          </button>
          <button 
            v-if="hasContent"
            class="action-button"
            @click="minifyJson"
            :disabled="state.processing"
          >
            压缩
          </button>
          <button 
            v-if="hasContent"
            class="action-button copy-button"
            :class="{ copied: state.isCopied }"
            @click="copyToClipboard"
            :disabled="state.processing"
          >
            {{ state.isCopied ? '已复制!' : '复制' }}
          </button>
        </div>
      </div>

      <div class="json-container" :class="{ 'has-error': !isValidJson }">
        <pre><code>{{ state.output }}</code></pre>
      </div>

      <transition name="fade">
        <div v-if="state.error" class="error-message">
          {{ state.error }}
        </div>
      </transition>
    </div>

    <div v-if="!hasContent" class="empty-state">
      <div class="empty-icon">📄</div>
      <h3>没有输入内容</h3>
      <p>请在上方输入 JSON 数据</p>
    </div>
  </div>
</template>

<style scoped>
.json-formatter {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 10px;
  padding: 18px 20px 20px 15px;
  position: relative;
  border-left: 6px solid var(--vp-c-brand-1);
}

.header {
  text-align: center;
  margin-bottom: 1rem;
}

.header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.subtitle {
  margin: 0;
  font-size: 1rem;
  color: var(--vp-c-text-2);
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
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg-soft);
  padding: 0.1rem 0.5rem;
  border-radius: 0.25rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid var(--vp-button-brand-border);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
}

.action-button:hover {
  background-color: var(--vp-button-brand-hover-bg);
  border-color: var(--vp-button-brand-hover-border);
  color: var(--vp-button-brand-text);
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
  border-color: var(--vp-c-danger);
  transform: translateY(-1px);
}

.json-input {
  width: 100%;
  min-height: 150px;
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  border-radius: 0.8rem;
  font-size: 0.95rem;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.2s ease;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.json-input:focus {
  outline: none;
  border: 1.5px solid var(--vp-c-brand-1);
  background-color: var(--vp-c-bg);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
}
.dark .json-input:focus {
  background-color: #1a1a1a;
}
.json-input.has-error {
  border-color: var(--vp-c-danger-1);
  background-color: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
}
.json-container {
  background-color: var(--vp-c-brand-1);
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1.5px solid #00000000;
  overflow-x: auto;
  transition: all 0.2s ease;
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
.json-container.has-error {
  border-color: var(--vp-c-danger-1);
  background-color: var(--vp-c-danger-soft);
  & code {
    color: var(--vp-c-danger-1);
  }
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
