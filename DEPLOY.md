# 🚀 部署指南 - 你画我猜游戏

## 📊 当前部署状态

| 平台 | 状态 | 地址 |
|------|------|------|
| **GitHub Pages** | ✅ 自动部署中 | https://jiangsi12304.github.io/draw-guess-game/ |
| **Render (后端)** | ⏳ 需要手动部署 | 待配置 |

---

## 🎯 快速开始

### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动后端服务器
npm start

# 3. 新开终端，启动前端
npm run dev
```

访问：http://localhost:5178

---

## 🔨 部署到 Render（后端服务器）

### 步骤 1：连接 GitHub

1. 访问 [Render Dashboard](https://dashboard.render.com/)
2. 点击 **New +** → **Web Service**
3. 选择 **Build and deploy from a Git repository**
4. 点击 **Connect GitHub**
5. 授权 Render 访问你的 GitHub
6. 选择 `jiangsi12304/draw-guess-game` 仓库
7. 点击 **Connect**

### 步骤 2：配置服务

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **Name** | `draw-guess-game-server` | 服务名称 |
| **Root Directory** | `/` | 仓库根目录 |
| **Branch** | `master` | 默认分支 |
| **Runtime** | `Node` | Node.js 运行时 |
| **Build Command** | `npm install` | 安装依赖 |
| **Start Command** | `npm start` | 启动服务器 |
| **Instance** | `Free` | 免费套餐 |

### 步骤 3：配置环境变量（Advanced）

点击 **Advanced** 展开，添加以下环境变量：

```
NODE_ENV=production
PORT=10000
```

### 步骤 4：部署

点击底部 **Deploy Web Service** 按钮

---

## 🔗 连接前端到 Render 服务器

部署完成后，你会得到一个 Render URL，例如：
```
https://draw-guess-game-server-xxxx.onrender.com
```

### 更新前端 Socket 连接

编辑 `src/utils/socket.ts`，将第 13 行的默认 URL 改为你的 Render 地址：

```typescript
export function connectSocketServer(url: string = 'https://your-render-url.onrender.com') {
```

然后重新部署前端：

```bash
npm run build
git add .
git commit -m "更新 Socket 服务器地址"
git push
```

---

## 🌐 部署后的访问方式

### 前端（静态网站）
- **地址**: https://jiangsi12304.github.io/draw-guess-game/
- **自动更新**: 推送到 GitHub 后自动部署
- **状态**: 查看 GitHub Actions 页面

### 后端（Socket.io 服务器）
- **地址**: https://your-render-url.onrender.com (部署后显示)
- **WebSocket**: wss://your-render-url.onrender.com
- **状态**: 查看 Render Dashboard

---

## ⚠️ 常见问题

### 1. 页面空白/白屏

**原因**: JavaScript 错误导致组件崩溃

**解决方案**:
- 打开浏览器开发者工具 (F12)
- 查看 Console 标签中的错误信息
- 常见错误：
  - `navigator.clipboard is undefined` → 已修复
  - `Socket connection failed` → 检查服务器地址

### 2. 无法连接到 Socket 服务器

**原因**:
- 服务器未启动
- 服务器地址错误
- CORS 配置问题
- 防火墙阻止

**解决方案**:
```bash
# 检查服务器状态
curl https://your-render-url.onrender.com

# 检查 WebSocket
wscat -c wss://your-render-url.onrender.com
```

### 3. Render 部署失败

**常见原因**:
- `package.json` 中没有 `start` 脚本
- `server.js` 不在仓库根目录
- PORT 环境变量冲突

**解决方案**:
```bash
# 检查 package.json
npm start  # 本地测试是否可以启动

# 查看 Render 日志
# Render Dashboard → Your Service → Logs
```

### 4. 本地测试正常，部署后失败

**检查清单**:
- [ ] 服务器地址已更新为 Render URL
- [ ] 使用 `https://` 或 `wss://` 而不是 `http://`
- [ ] 环境变量 `NODE_ENV=production` 已设置
- [ ] 依赖已正确安装 (`npm install`)
- [ ] 服务器监听正确的端口 (`process.env.PORT`)

---

## 📝 项目文件结构

```
draw-guess-game/
├── server.js                  # Socket.io 服务器入口
├── render.yaml               # Render 部署配置
├── .github/
│   └── workflows/
│       └── deploy-frontend.yml  # GitHub Pages 自动部署
├── src/
│   ├── utils/
│   │   └── socket.ts          # Socket 连接配置
│   └── ...
└── package.json
```

---

## 🔧 配置文件说明

### render.yaml
- 配置 Render 后端服务
- 设置 PORT=10000
- 自动安装依赖并启动

### .github/workflows/deploy-frontend.yml
- 推送到 master 分支时自动触发
- 构建前端静态文件
- 部署到 GitHub Pages

### vite.config.ts
- 设置 `base: '/draw-guess-game/'`
- GitHub Pages 子路径配置

---

## 🚀 完整部署流程

```bash
# 1. 开发和测试
npm install
npm start          # 终端1: 启动后端
npm run dev        # 终端2: 启动前端

# 2. 提交代码
git add .
git commit -m "描述改动"
git push

# 3. 前端自动部署到 GitHub Pages
# 等待 GitHub Actions 完成构建
# 访问: https://jiangsi12304.github.io/draw-guess-game/

# 4. 手动部署后端到 Render
# 按照 Render 步骤操作
# 获取 Render URL 后，更新 src/utils/socket.ts

# 5. 更新前端 Socket 地址
# 编辑 src/utils/socket.ts
# git add . && git commit && git push
```

---

## 💡 开发提示

### 本地开发服务器端口
- 前端: `http://localhost:5178` (Vite 自动分配)
- 后端: `http://localhost:10000` (可修改)

### 环境变量
```bash
# 前端环境变量（.env 文件）
VITE_SOCKET_SERVER_URL=http://localhost:10000

# 后端环境变量（Render 设置）
NODE_ENV=production
PORT=10000
CLIENT_URL=https://jiangsi12304.github.io/draw-guess-game/
```

---

## 📞 支持

遇到问题？
1. 查看浏览器 Console (F12)
2. 查看 Render Dashboard Logs
3. 检查 GitHub Actions 日志

---

**最后更新**: 2026-01-21
**版本**: v0.1.0
