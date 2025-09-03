<script setup>
import { ref, watch, computed, onMounted } from 'vue'

// 状态管理
const state = ref({
  input: '',
  output: '',
  error: '',
  isCopied: false,
  processing: false,
  activeTab: 'json', // 当前活动标签: 'json', 'xml', 'csv'
  fileProcessing: false, // 文件处理状态
  fileSize: 0, // 文件大小
  processedChunks: 0, // 已处理的分片数
  totalChunks: 0, // 总分片数
  validationReport: null // 验证报告
})

// 计算属性
const isValidJson = computed(() => !state.value.error)
const hasContent = computed(() => state.value.input.trim() !== '')
const inputLines = computed(() => state.value.input.split('').length)
const inputChars = computed(() => state.value.input.length)
const outputLines = computed(() => state.value.output ? state.value.output.split('').length : 0)
const outputChars = computed(() => state.value.output ? state.value.output.length : 0)
const processingProgress = computed(() => {
  if (state.value.totalChunks === 0) return 0
  return Math.round((state.value.processedChunks / state.value.totalChunks) * 100)
})

// JSON处理工具函数
const jsonUtils = {
  // 从XML转换
  fromXml: (xmlString) => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml')

    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      throw new Error('XML解析错误: 无效的XML格式')
    }

    const xmlToJson = (xml) => {
      let obj = {}

      if (xml.nodeType === 1) { // element node
        if (xml.attributes.length > 0) {
          obj['@attributes'] = {}
          for (let j = 0; j < xml.attributes.length; j++) {
            const attribute = xml.attributes.item(j)
            obj['@attributes'][attribute.nodeName] = attribute.nodeValue
          }
        }
      } else if (xml.nodeType === 3) { // text node
        obj = xml.nodeValue.trim()
      }

      // 处理子节点
      if (xml.hasChildNodes()) {
        for (let i = 0; i < xml.childNodes.length; i++) {
          const item = xml.childNodes.item(i)
          const nodeName = item.nodeName

          if (typeof (obj[nodeName]) === 'undefined') {
            obj[nodeName] = xmlToJson(item)
          } else {
            if (typeof (obj[nodeName].push) === 'undefined') {
              const old = obj[nodeName]
              obj[nodeName] = []
              obj[nodeName].push(old)
            }
            obj[nodeName].push(xmlToJson(item))
          }
        }
      }
      return obj
    }

    return xmlToJson(xmlDoc.documentElement)
  },
  // 从CSV转换
  fromCsv: (csvString) => {
    const lines = csvString.split('\n').filter(line => line.trim() !== '')

    if (lines.length < 2) {
      throw new Error('CSV格式错误: 至少需要标题行和一行数据')
    }

    // 解析标题行
    const headers = lines[0].split(',').map(header => {
      // 移除引号
      return header.trim().replace(/^"|"$/g, '')
    })

    const result = []

    for (let i = 1; i < lines.length; i++) {
      const values = []
      let currentValue = ''
      let inQuotes = false

      // 处理可能包含逗号的值
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j]

        if (char === '"') {
          // 处理双引号转义
          if (j + 1 < lines[i].length && lines[i][j + 1] === '"') {
            currentValue += '"'
            j++ // 跳过下一个引号
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue)
          currentValue = ''
        } else {
          currentValue += char
        }
      }

      // 添加最后一个值
      values.push(currentValue)

      // 创建对象
      const obj = {}
      headers.forEach((header, index) => {
        // 尝试解析值类型
        let value = values[index] || ''
        value = value.trim().replace(/^"|"$/g, '')

        // 尝试转换为数字
        if (/^-?\d+\.?\d*$/.test(value)) {
          value = parseFloat(value)
        }
        // 尝试转换为布尔值
        else if (value.toLowerCase() === 'true') {
          value = true
        } else if (value.toLowerCase() === 'false') {
          value = false
        }
        // 处理空值
        else if (value.toLowerCase() === 'null') {
          value = null
        }

        obj[header] = value
      })

      result.push(obj)
    }

    return result
  },

  // 验证JSON
  validate: (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString)

      // 检查数据结构
      const checkStructure = (obj, path = '') => {
        const issues = []

        if (obj === null || obj === undefined) {
          return issues
        }

        if (typeof obj === 'object') {
          // 检查数组
          if (Array.isArray(obj)) {
            if (obj.length === 0) {
              issues.push({
                type: 'warning',
                path: path,
                message: '空数组'
              })
            }

            // 检查数组元素类型一致性
            if (obj.length > 1) {
              const firstType = typeof obj[0]
              const inconsistentTypes = obj.some(item => typeof item !== firstType && item !== null)

              if (inconsistentTypes) {
                issues.push({
                  type: 'warning',
                  path: path,
                  message: '数组元素类型不一致'
                })
              }
            }

            // 递归检查数组元素
            obj.forEach((item, index) => {
              issues.push(...checkStructure(item, `\${path}[\${index}]`))
            })
          }
          // 检查对象
          else {
            const keys = Object.keys(obj)
            if (keys.length === 0) {
              issues.push({
                type: 'warning',
                path: path,
                message: '空对象'
              })
            }

            // 检查键名格式
            const invalidKeys = keys.filter(key => !/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(key))
            if (invalidKeys.length > 0) {
              issues.push({
                type: 'warning',
                path: path,
                message: `包含非标准键名: \${invalidKeys.join(', ')}`
              })
            }

            // 递归检查对象值
            keys.forEach(key => {
              issues.push(...checkStructure(obj[key], path ? `\${path}.\${key}` : key))
            })
          }
        }

        return issues
      }

      const issues = checkStructure(parsed)

      return {
        valid: true,
        issues: issues,
        summary: {
          types: {
            object: 0,
            array: 0,
            string: 0,
            number: 0,
            boolean: 0,
            null: 0
          },
          depth: 0,
          size: JSON.stringify(parsed).length
        }
      }
    } catch (err) {
      return {
        valid: false,
        error: err.message,
        issues: [],
        summary: null
      }
    }
  },

  // 分片处理大型JSON文件
  processLargeJson: async (file, chunkSize = 1024 * 1024, callback) => {
    return new Promise((resolve, reject) => {
      const fileSize = file.size
      const chunks = Math.ceil(fileSize / chunkSize)
      let currentChunk = 0
      let fileContent = ''

      const reader = new FileReader()

      reader.onload = function (e) {
        try {
          fileContent += e.target.result
          currentChunk++

          // 更新进度
          if (callback) {
            callback({
              progress: Math.round((currentChunk / chunks) * 100),
              processed: currentChunk,
              total: chunks
            })
          }

          if (currentChunk < chunks) {
            // 继续读取下一块
            readNextChunk()
          } else {
            // 所有块读取完成，尝试解析JSON
            try {
              const result = JSON.parse(fileContent)
              resolve(result)
            } catch (err) {
              reject(new Error(`JSON解析错误: \${err.message}`))
            }
          }
        } catch (err) {
          reject(err)
        }
      }

      reader.onerror = function () {
        reject(new Error('文件读取错误'))
      }

      function readNextChunk() {
        const start = currentChunk * chunkSize
        const end = Math.min(fileSize, start + chunkSize)
        const blob = file.slice(start, end)
        reader.readAsText(blob)
      }

      // 开始读取第一块
      readNextChunk()
    })
  }
}

// 格式化JSON
const formatJson = (jsonString) => {
  state.value.processing = true
  try {
    const parsed = OFUtils.JsonConverter.parseJSON(jsonString)
    state.value.output = OFUtils.JsonConverter.format(parsed)
    state.value.error = ''
    state.value.activeTab = 'json'
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
    const parsed = OFUtils.JsonConverter.parseJSON(state.value.input)
    state.value.output = OFUtils.JsonConverter.minify(parsed)
    state.value.error = ''
    state.value.activeTab = 'json'
  } catch (err) {
    state.value.error = err.message
  } finally {
    state.value.processing = false
  }
}

// 转换为XML
const convertToXml = () => {
  state.value.processing = true
  try {
    const parsed = OFUtils.JsonConverter.parseJSON(state.value.input)
    state.value.output = OFUtils.JsonConverter.toXML(parsed)
    state.value.error = ''
    state.value.activeTab = 'xml'
  } catch (err) {
    state.value.error = err.message
  } finally {
    state.value.processing = false
  }
}

// 从XML转换
const convertFromXml = () => {
  state.value.processing = true
  try {
    const result = jsonUtils.fromXml(state.value.input)
    state.value.output = jsonUtils.format(result)
    state.value.error = ''
    state.value.activeTab = 'json'
  } catch (err) {
    state.value.error = err.message
  } finally {
    state.value.processing = false
  }
}

// 转换为CSV
const convertToCsv = () => {
  state.value.processing = true
  try {
    const parsed = OFUtils.JsonConverter.parseJSON(state.value.input)
    state.value.output = OFUtils.JsonConverter.toCSV(parsed)
    state.value.error = ''
    state.value.activeTab = 'csv'
  } catch (err) {
    state.value.error = err.message
  } finally {
    state.value.processing = false
  }
}

// 从CSV转换
const convertFromCsv = () => {
  state.value.processing = true
  try {
    const result = jsonUtils.fromCsv(state.value.input)
    state.value.output = jsonUtils.format(result)
    state.value.error = ''
    state.value.activeTab = 'json'
  } catch (err) {
    state.value.error = err.message
  } finally {
    state.value.processing = false
  }
}

// 验证JSON
const validateJson = () => {
  state.value.processing = true
  try {
    const report = jsonUtils.validate(state.value.input)
    state.value.validationReport = report

    if (report.valid) {
      state.value.output = jsonUtils.format(JSON.parse(state.value.input))
      state.value.error = ''
      state.value.activeTab = 'json'
    } else {
      state.value.error = report.error
    }
  } catch (err) {
    state.value.error = err.message
  } finally {
    state.value.processing = false
  }
}

// 处理文件上传
const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  state.value.fileProcessing = true
  state.value.fileSize = file.size
  state.value.processedChunks = 0
  state.value.totalChunks = Math.ceil(file.size / (1024 * 1024)) // 1MB chunks

  try {
    const result = await jsonUtils.processLargeJson(
      file,
      1024 * 1024, // 1MB chunks
      (progress) => {
        state.value.processedChunks = progress.processed
      }
    )

    state.value.input = JSON.stringify(result)
    state.value.output = jsonUtils.format(result)
    state.value.error = ''
    state.value.activeTab = 'json'
  } catch (err) {
    state.value.error = err.message
  } finally {
    state.value.fileProcessing = false
  }

  // 重置文件输入，允许再次选择同一文件
  event.target.value = ''
}

// 清空内容
const clearContent = () => {
  state.value = {
    input: '',
    output: '',
    error: '',
    isCopied: false,
    processing: false,
    activeTab: 'json',
    fileProcessing: false,
    fileSize: 0,
    processedChunks: 0,
    totalChunks: 0,
    validationReport: null
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
          <label class="action-button file-upload-button">
            <input type="file" accept=".json" @change="handleFileUpload"
              :disabled="state.processing || state.fileProcessing" style="display: none;" />
            上传文件
          </label>
          <button v-if="hasContent" class="action-button clear-button" @click="clearContent"
            :disabled="state.processing || state.fileProcessing">
            清空
          </button>
        </div>
      </div>

      <div v-if="state.fileProcessing" class="file-progress">
        <div class="progress-info">
          <span>处理大型文件: {{ (state.fileSize / 1024 / 1024).toFixed(2) }} MB</span>
          <span>{{ processingProgress }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: processingProgress + '%' }"></div>
        </div>
      </div>

      <textarea v-model="state.input" placeholder="在此输入 JSON 数据，或上传文件..." class="json-input"
        :class="{ 'has-error': state.error }" spellcheck="false"></textarea>
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
          <button v-if="hasContent" class="action-button" @click="formatJson(state.input)"
            :disabled="state.processing || state.fileProcessing">
            格式化
          </button>
          <button v-if="hasContent" class="action-button" @click="minifyJson"
            :disabled="state.processing || state.fileProcessing">
            压缩
          </button>
          <button v-if="hasContent" class="action-button" @click="validateJson"
            :disabled="state.processing || state.fileProcessing">
            验证
          </button>
          <button v-if="hasContent" class="action-button" @click="convertToXml"
            :disabled="state.processing || state.fileProcessing">
            转XML
          </button>
          <button v-if="hasContent" class="action-button" @click="convertFromXml"
            :disabled="state.processing || state.fileProcessing">
            XML转JSON
          </button>
          <button v-if="hasContent" class="action-button" @click="convertToCsv"
            :disabled="state.processing || state.fileProcessing">
            转CSV
          </button>
          <button v-if="hasContent" class="action-button" @click="convertFromCsv"
            :disabled="state.processing || state.fileProcessing">
            CSV转JSON
          </button>
          <button v-if="hasContent" class="action-button copy-button" :class="{ copied: state.isCopied }"
            @click="copyToClipboard" :disabled="state.processing || state.fileProcessing">
            {{ state.isCopied ? '已复制!' : '复制' }}
          </button>
        </div>
      </div>

      <div class="output-tabs">
        <button class="tab-button" :class="{ active: state.activeTab === 'json' }" @click="state.activeTab = 'json'">
          JSON
        </button>
        <button class="tab-button" :class="{ active: state.activeTab === 'xml' }" @click="state.activeTab = 'xml'">
          XML
        </button>
        <button class="tab-button" :class="{ active: state.activeTab === 'csv' }" @click="state.activeTab = 'csv'">
          CSV
        </button>
        <button v-if="state.validationReport" class="tab-button" :class="{ active: state.activeTab === 'validation' }"
          @click="state.activeTab = 'validation'">
          验证报告
        </button>
      </div>

      <div class="json-container" :class="{ 'has-error': !isValidJson }">
        <!-- JSON 输出 -->
        <div v-if="state.activeTab === 'json'" class="tab-content">
          <pre><code>{{ state.output }}</code></pre>
        </div>

        <!-- XML 输出 -->
        <div v-if="state.activeTab === 'xml'" class="tab-content">
          <pre><code>{{ state.output }}</code></pre>
        </div>

        <!-- CSV 输出 -->
        <div v-if="state.activeTab === 'csv'" class="tab-content">
          <pre><code>{{ state.output }}</code></pre>
        </div>

        <!-- 验证报告 -->
        <div v-if="state.activeTab === 'validation' && state.validationReport" class="tab-content validation-report">
          <div class="report-header">
            <h4>JSON 验证报告</h4>
            <div class="validation-status" :class="{ valid: state.validationReport.valid }">
              {{ state.validationReport.valid ? '✓ 有效' : '✗ 无效' }}
            </div>
          </div>

          <div v-if="!state.validationReport.valid" class="validation-error">
            {{ state.validationReport.error }}
          </div>

          <div v-if="state.validationReport.valid && state.validationReport.summary" class="validation-summary">
            <h5>数据摘要</h5>
            <ul>
              <li>大小: {{ (state.validationReport.summary.size / 1024).toFixed(2) }} KB</li>
              <li>对象: {{ state.validationReport.summary.types.object }}</li>
              <li>数组: {{ state.validationReport.summary.types.array }}</li>
              <li>字符串: {{ state.validationReport.summary.types.string }}</li>
              <li>数字: {{ state.validationReport.summary.types.number }}</li>
              <li>布尔值: {{ state.validationReport.summary.types.boolean }}</li>
              <li>空值: {{ state.validationReport.summary.types.null }}</li>
            </ul>
          </div>

          <div v-if="state.validationReport.valid && state.validationReport.issues.length > 0"
            class="validation-issues">
            <h5>潜在问题</h5>
            <ul>
              <li v-for="(issue, index) in state.validationReport.issues" :key="index" :class="issue.type">
                <span class="issue-path">{{ issue.path }}:</span> {{ issue.message }}
              </li>
            </ul>
          </div>
        </div>
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
      <p>请在上方输入 JSON 数据或上传文件</p>
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
  padding: 0.5rem 1rem;
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
  white-space: nowrap;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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

.file-upload-button {
  position: relative;
  overflow: hidden;
  cursor: pointer;
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

.file-progress {
  margin-bottom: 0.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.progress-bar {
  height: 6px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--vp-c-brand-1);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.output-tabs {
  display: flex;
  border-bottom: 1px solid var(--vp-c-divider);
  margin-bottom: 0.5rem;
}

.tab-button {
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: var(--vp-c-text-1);
}

.tab-button.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}

.tab-content {
  width: 100%;
}

.json-container {
  background-color: var(--vp-c-bg-soft);
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--vp-c-divider);
  overflow-x: auto;
  transition: all 0.2s ease;
  min-height: 200px;
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
  color: var(--vp-c-text-1);
}

.json-container.has-error {
  border-color: var(--vp-c-danger-1);
  background-color: var(--vp-c-danger-soft);
}

.json-container.has-error code {
  color: var(--vp-c-danger-1);
}

.validation-report {
  padding: 0;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.validation-status {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-weight: 600;
}

.validation-status.valid {
  background-color: var(--vp-c-green-soft);
  color: var(--vp-c-green-1);
}

.validation-status:not(.valid) {
  background-color: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
}

.validation-error {
  padding: 0.75rem;
  background-color: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
  border-radius: 0.25rem;
  margin-bottom: 1rem;
}

.validation-summary,
.validation-issues {
  margin-bottom: 1rem;
}

.validation-summary h5,
.validation-issues h5 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: var(--vp-c-text-1);
}

.validation-summary ul,
.validation-issues ul {
  margin: 0;
  padding-left: 1.5rem;
}

.validation-summary li,
.validation-issues li {
  margin-bottom: 0.25rem;
  color: var(--vp-c-text-2);
}

.validation-issues li.warning {
  color: var(--vp-c-yellow-1);
}

.issue-path {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-weight: 600;
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

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-5px);
  }

  75% {
    transform: translateX(5px);
  }
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