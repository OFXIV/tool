---
title: 汇率换算
---
<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'

const currencies = ref({})
const fromCurrency = ref('USD')
const toCurrency = ref('CNY')
const amount = ref(1)
const convertedAmount = ref(0)
const rate = ref(0)

// 输入框内容
const fromSearch = ref('')
const toSearch = ref('')

// 下拉控制
const fromDropdownOpen = ref(false)
const toDropdownOpen = ref(false)
const fromActiveIndex = ref(-1)
const toActiveIndex = ref(-1)

// 保存原选中值
const preFromValue = ref(fromCurrency.value)
const preToValue = ref(toCurrency.value)

// 获取货币数据
async function loadCurrencies() {
  try {
    const res = await fetch('/currencies.json')
    if (!res.ok) throw new Error('无法加载 currencies.json 文件')
    const data = await res.json()
    currencies.value = data && typeof data === 'object' ? data : {}
    // 初始化输入框显示
    fromSearch.value = `${fromCurrency.value} - ${currencies.value[fromCurrency.value]}`
    toSearch.value = `${toCurrency.value} - ${currencies.value[toCurrency.value]}`
  } catch (e) {
    currencies.value = {}
    console.error(e)
  }
}

// 筛选选项
const filteredFromCurrencies = computed(() =>
  Object.entries(currencies.value)
    .filter(([code, name]) =>
      code.toLowerCase().includes(fromSearch.value.toLowerCase()) ||
      name.toLowerCase().includes(fromSearch.value.toLowerCase())
    )
)

const filteredToCurrencies = computed(() =>
  Object.entries(currencies.value)
    .filter(([code, name]) =>
      code.toLowerCase().includes(toSearch.value.toLowerCase()) ||
      name.toLowerCase().includes(toSearch.value.toLowerCase())
    )
)
const fromHandleFocus = () => {
  preFromValue.value = fromCurrency.value
  fromSearch.value = ''
  fromDropdownOpen.value = true
}

const fromHandleBlur = () => {
  window.setTimeout(() => {
      if (fromActiveIndex.value < 0) {
        fromCurrency.value = preFromValue.value
        fromSearch.value = `${preFromValue.value} - ${currencies.value[preFromValue.value]}`
      }
      fromDropdownOpen.value = false
    },100)
}
const toHandleFocus = () => {
  preToValue.value = toCurrency.value
  toSearch.value = ''
  toDropdownOpen.value = true
}

const toHandleBlur = () => {
  window.setTimeout(() => {
      if (toActiveIndex.value < 0) {
        toCurrency.value = preToValue.value
        toSearch.value = `${preToValue.value} - ${currencies.value[preToValue.value]}`
      }
      toDropdownOpen.value = false
  }, 100)
}

// 选中函数
function selectFrom(code) {
  fromCurrency.value = code
  fromSearch.value = `${code} - ${currencies.value[code]}`
  preFromValue.value = code
  fromDropdownOpen.value = false
  fromActiveIndex.value = -1
}

function selectTo(code) {
  toCurrency.value = code
  toSearch.value = `${code} - ${currencies.value[code]}`
  preToValue.value = code
  toDropdownOpen.value = false
  toActiveIndex.value = -1
}


// 键盘操作 + 滚动高亮
function onFromKeydown(e) {
  if (!fromDropdownOpen.value) return
  const len = filteredFromCurrencies.value.length
  if (e.key === 'ArrowDown') { fromActiveIndex.value = (fromActiveIndex.value + 1) % len; scrollToActive('from'); e.preventDefault() }
  else if (e.key === 'ArrowUp') { fromActiveIndex.value = (fromActiveIndex.value - 1 + len) % len; scrollToActive('from'); e.preventDefault() }
  else if (e.key === 'Enter') { const [code] = filteredFromCurrencies.value[fromActiveIndex.value]||[]; if(code) selectFrom(code); e.preventDefault() }
}

function onToKeydown(e) {
  if (!toDropdownOpen.value) return
  const len = filteredToCurrencies.value.length
  if (e.key === 'ArrowDown') { toActiveIndex.value = (toActiveIndex.value + 1) % len; scrollToActive('to'); e.preventDefault() }
  else if (e.key === 'ArrowUp') { toActiveIndex.value = (toActiveIndex.value - 1 + len) % len; scrollToActive('to'); e.preventDefault() }
  else if (e.key === 'Enter') { const [code] = filteredToCurrencies.value[toActiveIndex.value]||[]; if(code) selectTo(code); e.preventDefault() }
}

// 滚动到高亮项
function scrollToActive(type) {
  nextTick(() => {
    const container = document.querySelector(`.${type}-dropdown-menu`)
    const activeItem = container?.querySelector('.active')
    if (activeItem) {
      const top = container.scrollTop
      const bottom = top + container.clientHeight
      const itemTop = activeItem.offsetTop
      const itemBottom = itemTop + activeItem.offsetHeight
      if (itemBottom > bottom) container.scrollTop += itemBottom - bottom
      else if (itemTop < top) container.scrollTop -= top - itemTop
    }
  })
}

// 获取汇率
async function loadExchangeRates() {
  if (!fromCurrency.value || !toCurrency.value) return
  const API_URL = `/api/exchange/?fromCurrency=${fromCurrency.value}&toCurrency=${toCurrency.value}&amount=${amount.value}`
  const res = await fetch(API_URL)
  const data = await res.json()
  if (data) {
    convertedAmount.value = data.convertedAmount
    rate.value = data.rate
  }
}

function calculateConversion() { loadExchangeRates() }

onMounted(() => loadCurrencies())
</script>

# 汇率换算
<ArticleMetadata />

<div>
  <input v-model="amount" type="number" placeholder="输入金额" />

  <!-- 源货币 -->
  <div class="dropdown">
    <label>源货币：</label>
    <input 
      type="text" 
      v-model="fromSearch"
      @focus="fromHandleFocus"
      @keydown="onFromKeydown"
      @blur="fromHandleBlur"
      placeholder="搜索货币..."
    />
    <div v-if="fromDropdownOpen" class="dropdown-menu from-dropdown-menu">
      <div 
        v-for="([code,name], index) in filteredFromCurrencies" 
        :key="code" 
        class="dropdown-item" 
        :class="{ active: index===fromActiveIndex }"
        @mousedown.prevent="selectFrom(code)"
      >
        {{ code }} - {{ name }}
      </div>
      <div v-if="filteredFromCurrencies.length===0" class="dropdown-item disabled">无匹配</div>
    </div>
  </div>

  <!-- 目标货币 -->
  <div class="dropdown">
    <label>目标货币：</label>
    <input 
      type="text" 
      v-model="toSearch"
      @focus="toHandleFocus"
      @keydown="onToKeydown"
      @blur="toHandleBlur"
      placeholder="搜索货币..."
    />
    <div v-if="toDropdownOpen" class="dropdown-menu to-dropdown-menu">
      <div 
        v-for="([code,name], index) in filteredToCurrencies" 
        :key="code" 
        class="dropdown-item" 
        :class="{ active: index===toActiveIndex }"
        @mousedown.prevent="selectTo(code)"
      >
        {{ code }} - {{ name }}
      </div>
      <div v-if="filteredToCurrencies.length===0" class="dropdown-item disabled">无匹配</div>
    </div>
  </div>

  <button type="button" @click="calculateConversion">转换</button>

  <span v-if="convertedAmount !== 0">
  <p>
{{ amount }} {{ currencies[fromCurrency] }} = {{ convertedAmount }} {{ currencies[toCurrency] }}
  </p>
    <span>1 {{ fromCurrency }} = {{ rate }} {{ toCurrency }}</span>
    <span>1 {{ toCurrency }} = {{ 1/rate }} {{ fromCurrency }}</span>
  </span>
</div>

<style scoped>
.converter-row {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}
input[type="number"], input, button {
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  border: 0.5px solid var(--vp-c-brand-3);
  border-radius: 0.5rem;
  display: block;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
input:hover{
  border: 1.5px solid var(--vp-c-brand-2);
}
input:focus {
  border: 2px solid var(--vp-c-brand-1);
  outline: none;
}

button {
  background-color: var(--vp-c-brand-1);
  color: var(--vp-button-brand-text);
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s ease;
}

button:hover {
  background-color: var(--vp-c-brand-2);
  box-shadow:0 3px 6px 0 rgba(0,0,0,0.8);
}

button:active{
  background-color: var(--vp-c-brand-2);
  box-shadow:0 3px 6px 0 rgba(0,0,0,0.8);
  transform: translateY(1px);
}

.dropdown {
  position: relative;
  margin-bottom: 1rem;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;                  /* 跟随输入框宽度 */
  max-height: 200px;            /* 最大高度 */
  overflow-y: auto;             /* 超出滚动 */
  border: 1px solid #ccc;
  background: #fff;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-radius: 0 0 0.5rem 0.5rem;
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.dark .dropdown-menu {
  color:rgba(0,0,0,1);
}

.dropdown-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.dropdown-item:hover,
.dropdown-item.active {
  background-color: var(--vp-c-brand-2);
  color: #fff;
}

.dropdown-item.disabled {
  color: #aaa;
  cursor: default;
  background: transparent;
}

</style>
