# 小红书数据洞察

一个基于Next.js + Playwright的智能化小红书数据抓取工具，可以自动获取热门内容并按浏览量排序展示。

## ✨ 功能特性

- 🎯 **智能抓取**: 使用Playwright自动化浏览器技术，模拟真实用户行为
- 📊 **数据分析**: 自动按浏览量排序，展示最具价值的内容
- ⚡ **实时更新**: 获取最新热门内容，数据实时同步
- 🎨 **现代UI**: 采用Glassmorphism设计风格，支持深色模式
- 📱 **响应式设计**: 完美适配桌面端和移动端

## 🚀 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Node.js + Playwright
- **部署**: Vercel + GitHub Actions CI/CD
- **UI设计**: Glassmorphism + 渐变背景

## 📦 安装与使用

### 1. 克隆仓库
```bash
git clone https://github.com/LGXfufile/xiaohongshu-scraper.git
cd xiaohongshu-scraper
```

### 2. 安装依赖
```bash
npm install
npx playwright install
```

### 3. 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🛠️ API 接口

### POST /api/scrape
抓取小红书数据

**请求体:**
```json
{
  "keyword": "副业"
}
```

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "title": "内容标题",
      "author": "作者名称",
      "viewCount": "浏览量",
      "likeCount": "点赞数",
      "link": "原文链接",
      "thumbnail": "缩略图"
    }
  ],
  "total": 10,
  "keyword": "副业"
}
```

## 🚀 部署

项目配置了自动化CI/CD流程，推送到main分支后会自动部署到Vercel。

### 环境变量配置
在Vercel中配置以下环境变量：
- `VERCEL_TOKEN`: Vercel访问令牌
- `ORG_ID`: Vercel组织ID
- `PROJECT_ID`: Vercel项目ID

## 📄 许可证

MIT License

---

🤖 Generated with [Claude Code](https://claude.ai/code)
