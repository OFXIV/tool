# 拼好具

一个集成了多种实用工具的在线工具箱，提供简单易用的界面和强大的功能。

## 功能列表

### 生成器
- [UUID 随机生成器](/uuid) - 生成符合 RFC 4122 标准的 UUID
- [随机密码生成器](/randomkey) - 生成安全的随机密码
- [二维码生成器](/qrcode) - 将文本转换为二维码图片

### 换算器
- [汇率换算](/currencyconverter) - 支持多国货币实时汇率转换

### 格式化工具
- [JSON 格式化](/jsonformatter) - JSON 数据格式化和压缩

### 编码/解码器
- [Base64 编码/解码](/base64) - 文本与 Base64 互相转换

## 快速开始

### 环境要求
- Node.js >= 16
- pnpm >= 8

### 安装
```bash
pnpm install
```

### 开发
```bash
pnpm docs:dev
```

### 构建
```bash
pnpm docs:build
```

### 预览生产构建
```bash
pnpm docs:serve
```

## 项目结构
```
├── docs/                # 文档源码
│   ├── .vitepress/     # VitePress 配置
│   └── public/         # 静态资源
├── package.json        # 项目配置
└── README.md          # 项目说明
```

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。详情请查看 [贡献指南](CONTRIBUTING.md)。

## 许可证
[MIT License](LICENSE)

## 更新日志
查看 [更新日志](CHANGELOG.md) 了解版本更新详情。

## 致谢
感谢所有为此项目做出贡献的开发者。