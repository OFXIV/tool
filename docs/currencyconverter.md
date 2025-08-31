---
title: 汇率换算
---

# 汇率换算
<ArticleMetadata />

<CurrencyConverter />

## 使用指南

1. 在输入框中输入要转换的金额
2. 从下拉列表中选择源货币（默认为美元USD）
3. 从下拉列表中选择目标货币（默认为人民币CNY）
4. 点击"转换"按钮或直接输入金额自动触发转换

## 技术实现

### 数据来源

货币列表存储在 `public/currencies.json` 文件中，包含货币代码和对应的货币名称。

汇率数据通过ExchangeRate API接口获取，接口地址为：

```
/api/exchange/?fromCurrency=USD&toCurrency=CNY&amount=1
```

ExchangeRate是一个提供实时和历史汇率数据的API服务，支持全球160多种货币的汇率转换。

### API文档

#### 端点

`GET /api/exchange/`

#### 参数

| 参数名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| fromCurrency | string | 是 | 源货币代码，如USD |
| toCurrency | string | 是 | 目标货币代码，如CNY |
| amount | number | 是 | 要转换的金额 |

#### 响应

```json
{
  "convertedAmount": 7.23,
  "rate": 7.23
}
```

| 字段 | 类型 | 描述 |
|------|------|------|
| convertedAmount | number | 转换后的金额 |
| rate | number | 汇率（1个源货币等于多少目标货币） |

### 实现细节

- 使用Vue 3的组合式API实现响应式数据管理
- 货币搜索功能支持按货币代码和名称搜索
- 下拉列表支持键盘导航（上下箭头选择，回车确认）
- 自动滚动确保选中项在视图中可见
- 错误处理确保API请求失败时优雅降级

### 扩展功能建议

- 添加历史汇率图表功能
- 支持批量转换多个金额
- 添加常用货币收藏功能
- 支持设置默认货币对
- 添加汇率变动提醒
- 支持离线缓存最近查询的汇率数据

## 常见问题

### Q: 汇率数据多久更新一次？

A: 汇率数据通过ExchangeRate API获取，数据每天更新一次，确保提供准确的汇率信息。

### Q: 为什么有些货币的汇率转换不准确？

A: 汇率数据来源于ExchangeRate API，可能会有轻微延迟或误差。建议在进行大额交易前参考官方汇率数据。

### Q: 如何添加新的货币？

A: 编辑 `public/currencies.json` 文件，添加新的货币代码和名称即可。格式为：

```json
{
  "货币代码": "货币名称"
}
```

ExchangeRate API支持全球160多种货币，如果您需要添加更多货币，请告知我，我会尽快更新。

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+