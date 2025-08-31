# 拼好具

> 拼一拼 更好用

拼好具是一个实用的在线工具集，提供多种实用功能，帮助用户更高效地完成日常任务。

## 功能列表

- **汇率换算** - 实时汇率转换，支持全球160多种货币
- **随机二维码生成器** - 生成随机样式的二维码，支持自定义内容和下载
- **UUID 生成器** - 快速生成唯一的 UUID，用于标识符、API Key 等场景
- **随机密码生成器** - 根据选择的字符类型和长度生成安全密码，显示强度并可复制

## 快速开始

### 环境要求

- Node.js 16.0 或更高版本
- pnpm 7.0 或更高版本（推荐）或 npm

### 安装

1. 克隆仓库

```bash
git clone https://github.com/OFXIV/tool.git
cd tool
```

2. 安装依赖

```bash
pnpm install
```

### 开发

启动开发服务器：

```bash
pnpm docs:dev
```

将在本地启动一个开发服务器，通常可在 [http://localhost:5173](http://localhost:5173) 访问。

### 构建

构建生产版本：

```bash
pnpm docs:build
```

构建产物将位于 `docs/.vitepress/dist` 目录中。

### 预览生产构建

预览生产构建：

```bash
pnpm docs:serve
```

## 项目结构

```
tool/
├── docs/                # 文档源代码
│   ├── public/          # 静态资源
│   │   ├── currencies.json  # 货币列表
│   │   ├── favicon.ico      # 网站图标
│   │   ├── logo.png         # 网站Logo
│   │   └── vitepress-logo-large.svg # VitePress Logo
│   ├── currencyconverter.md # 汇率转换器文档
│   ├── index.md            # 首页
│   ├── qrcode.md           # 二维码生成器文档
│   ├── randomkey.md        # 随机密码生成器文档
│   └── uuid.md             # UUID生成器文档
└── package.json           # 项目配置和依赖
```

## 贡献指南

我们欢迎任何形式的贡献，包括但不限于：

- 报告错误
- 提出新功能建议
- 提交代码修复
- 改进文档

### 提交问题或功能请求

使用 [GitHub Issues](https://github.com/OFXIV/tool/issues) 提交问题或功能请求。

### 提交代码

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解项目的更新历史。

## 致谢

- [VitePress](https://vitepress.dev/) - 本项目使用的静态站点生成器
- [Vue](https://vuejs.org/) - 渐进式 JavaScript 框架
- [QRCode](https://www.npmjs.com/package/qrcode) - 二维码生成库
