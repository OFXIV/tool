<script setup>
import { ref, watch } from 'vue'

const password = ref('')
const displayPassword = ref('')
const lengthInput = ref(22)
const copyStatus = ref('复制')
let copyTimeout = null



// 字符集
const numberChars = '0123456789'
const letterChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'

// 选项控制
const includeNumbers = ref(true)
const includeLetters = ref(true)
const includeSymbols = ref(true)

// 密码强度
const strength = ref({ level: '弱', color: 'red', width: '33%' })

// 生成密码
function generatePassword() {
  let charset = ''
  if (includeNumbers.value) charset += numberChars
  if (includeLetters.value) charset += letterChars
  if (includeSymbols.value) charset += symbolChars
  
  if (!charset) {
    password.value = ''
    displayPassword.value = '⚠️ 请至少选择一种字符类型'
    updateStrength('')
    return
  }

  // 使用crypto API生成密码
  const newPass = generateSecureRandomString(charset, lengthInput.value)
  password.value = newPass
  animatePassword(newPass)
  updateStrength(newPass)
}

// 使用crypto API生成安全随机字符串
function generateSecureRandomString(charset, length) {
  // 创建一个Uint32Array数组来存储随机值
  const randomValues = new Uint32Array(length);
  
  // 使用crypto API填充随机值
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(randomValues);
  } else {
    // 如果crypto API不可用，回退到Math.random()
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * 0xFFFFFFFF);
    }
  }
  
  // 将随机值映射到字符集
  let result = '';
  for (let i = 0; i < length; i++) {
    // 使用模运算确保随机值在字符集范围内
    const randomIndex = randomValues[i] % charset.length;
    result += charset[randomIndex];
  }
  
  return result;
}

// 动画显示
function animatePassword(newPass) {
  const chars = newPass.split('')
  let index = 0
  const interval = setInterval(() => {
    displayPassword.value = chars
      .map((c, i) => (i <= index ? c : randomChar()))
      .join('')
    index++
    if (index >= chars.length) clearInterval(interval)
  }, 20)
}

function randomChar() {
    // 构建所有可能的字符集
    let all = ''
    if (includeNumbers.value) all += numberChars
    if (includeLetters.value) all += letterChars
    if (includeSymbols.value) all += symbolChars
    
    // 如果没有选择任何字符类型，返回默认字符
    if (!all) return '?'
    
    // 使用crypto API生成随机索引
    let randomIndex;
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const randomValue = new Uint32Array(1);
      crypto.getRandomValues(randomValue);
      randomIndex = randomValue[0] % all.length;
    } else {
      // 如果crypto API不可用，回退到Math.random()
      randomIndex = Math.floor(Math.random() * all.length);
    }
    
    return all[randomIndex];
  }

// 复制
async function copyPassword() {
  if (!password.value) return
  await navigator.clipboard.writeText(password.value)
  copyStatus.value = '已复制'
  clearTimeout(copyTimeout)
  copyTimeout = setTimeout(() => (copyStatus.value = '复制'), 1500)
}

// 密码强度计算
function updateStrength(pass) {
  if (!pass) {
    strength.value = { level: '弱', color: 'red', width: '0%', entropy: 0 }
    return
  }

  // 计算字符集大小
  let charsetSize = 0
  if (includeNumbers.value) charsetSize += numberChars.length
  if (includeLetters.value) charsetSize += letterChars.length
  if (includeSymbols.value) charsetSize += symbolChars.length

  const entropy = Math.round(pass.length * Math.log2(charsetSize))

  if (entropy < 40) {
    strength.value = { level: '弱', color: 'red', width: '33%', entropy }
  } else if (entropy < 60) {
    strength.value = { level: '中', color: 'orange', width: '66%', entropy }
  } else {
    strength.value = { level: '强', color: 'green', width: '100%', entropy }
  }
}


// 初始生成一次
generatePassword()
</script>

<template>
  <div class="uuid-card">
    <!-- 强度提示条 -->
    <div class="strength">
      <div class="bar">
        <div class="fill" :style="{ backgroundColor: strength.color, width: strength.width }"></div>
      </div>
      <span class="level">{{ strength.level }} ({{ strength.entropy }} bits)</span>
    </div>
    <!-- 密码区域 -->
    <pre class="md-code-block"><code>{{ displayPassword }}</code></pre>
    <!-- 选项 -->
    <div class="options">
      <label><input type="checkbox" v-model="includeNumbers" /> 数字</label>
      <label><input type="checkbox" v-model="includeLetters" /> 字母</label>
      <label><input type="checkbox" v-model="includeSymbols" /> 常用符号</label>
    </div>
    <!-- 输入 + 按钮 -->
    <div class="buttons">
      <input type="number" v-model.number="lengthInput" min="6" max="128" placeholder="22" />
      <button @click="generatePassword">生成</button>
      <button @click="copyPassword">{{ copyStatus }}</button>
    </div>
  </div>
</template>

<style scoped>
.uuid-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-family: "SF Mono", monospace;
  max-width: 100%;
}

/* Markdown 风格代码块 */
.md-code-block {
  display: inline-block;
  background-color: var(--vp-c-brand-1); /* 浅色模式背景 */
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--vp-c-brand-3); /* 边框 */
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 0.95rem;
  color: var(--vp-button-brand-text); /* 文字色 */
  transition: background-color 0.3s, color 0.3s;
}

/* 暗色模式代码块 */
.dark .md-code-block {
  background-color: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-3);
  color: var(--vp-button-brand-text);
}

/* 按钮和输入组 */
.buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.buttons input {
  border-radius: 0.5rem;
  box-sizing: border-box;
  font-family: "Inter var", ui-sans-serif, system-ui, -apple-system, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  font-size: 0.775rem;
  font-weight: 600;
  line-height: 1rem;
  padding: 0.75rem 1.5rem;
  text-align: center;
  cursor: text;
  user-select: none;
  min-width: 110px;
  box-shadow: 0 0 0 0.5px var(--vp-c-brand-3);
  transition: all 0.2s;
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
  cursor: pointer;
  user-select: none;
  min-width: 120px;
  color: var(--vp-button-brand-text);
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
}

.buttons button:active {
  background-color: var(--vp-button-brand-active-bg);
  color: var(--vp-button-brand-active-text);
  transform: translateY(2px);
}

 .buttons button:hover{
  background-color: var(--vp-button-brand-hover-bg);
  color: var(--vp-button-brand-hover-text);
}

 .buttons button:active {
  transform: translateY(2px);
}

/* 按钮聚焦 */
.buttons button:focus,
.buttons input:focus {
  box-shadow: 0 0 0 1.5px var(--vp-c-brand-1);
}


/* 选项组 */
.options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
}

.options label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* 强度提示条 */
.strength {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bar {
  flex: 1;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.fill {
  height: 100%;
  transition: width 0.3s;
}

.level {
  font-size: 0.875rem;
  min-width: 30px;
  text-align: right;
}


</style>
