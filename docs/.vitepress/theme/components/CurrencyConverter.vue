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
  }, 100)
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
  else if (e.key === 'Enter') { const [code] = filteredFromCurrencies.value[fromActiveIndex.value] || []; if (code) selectFrom(code); e.preventDefault() }
}

function onToKeydown(e) {
  if (!toDropdownOpen.value) return
  const len = filteredToCurrencies.value.length
  if (e.key === 'ArrowDown') { toActiveIndex.value = (toActiveIndex.value + 1) % len; scrollToActive('to'); e.preventDefault() }
  else if (e.key === 'ArrowUp') { toActiveIndex.value = (toActiveIndex.value - 1 + len) % len; scrollToActive('to'); e.preventDefault() }
  else if (e.key === 'Enter') { const [code] = filteredToCurrencies.value[toActiveIndex.value] || []; if (code) selectTo(code); e.preventDefault() }
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
<template>
  <div class="currency-converter"> 
    <div class="converter-card">
      <div class="amount-input">
        <label>金额</label>
        <div class="input-group">
          <input v-model="amount" type="number" placeholder="输入金额" />
        </div>
      </div>
      
      <div class="currency-selection">
        <!-- 源货币 -->
        <div class="currency-dropdown">
          <label>从</label>
          <div class="dropdown-container">
            <div class="dropdown-input" :class="{ active: fromDropdownOpen }" @click="fromDropdownOpen = !fromDropdownOpen">
              <span class="currency-code">{{ fromCurrency }}</span>
              <span class="currency-name">{{ currencies[fromCurrency] }}</span>
              <span class="dropdown-arrow">▼</span>
            </div>
            <div v-if="fromDropdownOpen" class="dropdown-menu from-dropdown-menu">
              <div class="search-box">
                <input type="text" v-model="fromSearch" @focus="fromHandleFocus" @keydown="onFromKeydown" @blur="fromHandleBlur"
                  placeholder="搜索货币..." />
              </div>
              <div class="dropdown-list">
                <div v-for="([code, name], index) in filteredFromCurrencies" :key="code" class="dropdown-item"
                  :class="{ active: index === fromActiveIndex }" @mousedown.prevent="selectFrom(code)">
                  <span class="item-code">{{ code }}</span>
                  <span class="item-name">{{ name }}</span>
                </div>
                <div v-if="filteredFromCurrencies.length === 0" class="dropdown-item disabled">无匹配</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 交换按钮 -->
        <div class="swap-button" @click="() => {
          const temp = fromCurrency;
          fromCurrency = toCurrency;
          toCurrency = temp;
          fromSearch.value = `${fromCurrency.value} - ${currencies.value[fromCurrency.value]}`;
          toSearch.value = `${toCurrency.value} - ${currencies.value[toCurrency.value]}`;
          calculateConversion();
        }">
          ⇄
        </div>
        
        <!-- 目标货币 -->
        <div class="currency-dropdown">
          <label>到</label>
          <div class="dropdown-container">
            <div class="dropdown-input" :class="{ active: toDropdownOpen }" @click="toDropdownOpen = !toDropdownOpen">
              <span class="currency-code">{{ toCurrency }}</span>
              <span class="currency-name">{{ currencies[toCurrency] }}</span>
              <span class="dropdown-arrow">▼</span>
            </div>
            <div v-if="toDropdownOpen" class="dropdown-menu to-dropdown-menu">
              <div class="search-box">
                <input type="text" v-model="toSearch" @focus="toHandleFocus" @keydown="onToKeydown" @blur="toHandleBlur"
                  placeholder="搜索货币..." />
              </div>
              <div class="dropdown-list">
                <div v-for="([code, name], index) in filteredToCurrencies" :key="code" class="dropdown-item"
                  :class="{ active: index === toActiveIndex }" @mousedown.prevent="selectTo(code)">
                  <span class="item-code">{{ code }}</span>
                  <span class="item-name">{{ name }}</span>
                </div>
                <div v-if="filteredToCurrencies.length === 0" class="dropdown-item disabled">无匹配</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button class="convert-button" type="button" @click="calculateConversion">转换</button>
    </div>
    
    <div v-if="convertedAmount !== 0" class="result-card">
      <div class="result-main">
        <div class="result-amount">{{ amount }} {{ fromCurrency }}</div>
        <div class="equals-sign">=</div>
        <div class="result-amount">{{ convertedAmount }} {{ toCurrency }}</div>
      </div>
      <div class="result-details">
        <div class="exchange-rate">1 {{ fromCurrency }} = {{ rate }} {{ toCurrency }}</div>
        <div class="exchange-rate">1 {{ toCurrency }} = {{ (1 / rate).toFixed(6) }} {{ fromCurrency }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.currency-converter {
  width: 100%;
  margin: 0 auto;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  color: var(--vp-c-text-1);
}

.converter-card {
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.208);
  border: 1px solid var(--vp-c-divider);
}

.amount-input {
  margin-bottom: 1.5rem;
}

.amount-input label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-2);
}

.input-group {
  position: relative;
}

input[type="number"] {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1.125rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.5rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  transition: border-color 0.2s, box-shadow 0.2s;
}

input[type="number"]:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px rgba(var(--vp-c-brand-1), 0.1);
}

.currency-selection {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.currency-dropdown {
  flex: 1;
}

.currency-dropdown label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-2);
}

.dropdown-container {
  position: relative;
}

.dropdown-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.dropdown-input.active {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px rgba(var(--vp-c-brand-1), 0.1);
}

.currency-code {
  font-weight: 700;
  font-size: 1rem;
}

.currency-name {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin-left: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.dropdown-arrow {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  transition: transform 0.2s;
}

.dropdown-input.active .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  width: 100%;
  max-height: 250px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-box {
  padding: 0.75rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.search-box input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.375rem;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.search-box input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.dropdown-list {
  overflow-y: auto;
  max-height: 180px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

.dropdown-item:hover {
  background: var(--vp-c-brand-2);
  color: var(--vp-button-brand-text);
}

.dropdown-item.active {
  background: var(--vp-c-brand-2);
  color: var(--vp-button-brand-text);
}

.item-code {
  font-weight: 600;
  margin-right: 0.75rem;
  min-width: 3rem;
}

.item-name {
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-item.disabled {
  color: var(--vp-c-text-3);
  cursor: default;
  justify-content: center;
  font-style: italic;
}

.swap-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: var(--vp-c-brand-1);
  color: var(--vp-button-brand-text);
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  transition: background-color 0.2s, transform 0.2s;
}

.swap-button:hover {
  background: var(--vp-c-brand-2);
  transform: rotate(180deg);
}

.swap-button:active {
  transform: rotate(180deg) translateY(2px);
}

.convert-button {
  width: 100%;
  padding: 0.875rem;
  background: var(--vp-c-brand-1);
  color: var(--vp-button-brand-text);
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.convert-button:hover {
  background: var(--vp-c-brand-2);
}

.convert-button:active {
  transform: translateY(1px);
}

.result-card {
  margin-top: 1.5rem;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.208);
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.result-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.result-amount {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.equals-sign {
  color: var(--vp-c-text-2);
  font-size: 1.5rem;
  margin: 0 1rem;
}

.result-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.exchange-rate {
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  padding: 0.5rem 0;
  border-bottom: 1px dashed var(--vp-c-divider-light);
}

.exchange-rate:last-child {
  border-bottom: none;
}

</style>
