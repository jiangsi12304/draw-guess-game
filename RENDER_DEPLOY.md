# Render 部署指南

## 前提条件
- GitHub 账户
- Render 账户（https://render.com）

## 部署步骤

### 1. 访问 Render Dashboard
- 打开 https://dashboard.render.com
- 登录你的 Render 账户

### 2. 创建新的 Web Service
1. 点击 "New +"
2. 选择 "Web Service"
3. 连接你的 GitHub 账户
4. 选择 `jiangsi12304/draw-guess-game` 仓库

### 3. 配置服务
填写以下配置：

| 字段 | 值 |
|------|-----|
| Name | draw-guess-game-server |
| Environment | Node |
| Region | Singapore (或最近的区域) |
| Branch | master |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Plan | Free (或 Starter) |

### 4. 环境变量
在 "Advanced" 部分添加以下环境变量：

| Key | Value |
|-----|-------|
| NODE_ENV | production |
| CLIENT_URL | 你的前端 URL (例如: https://example.com) |

### 5. 部署
1. 点击 "Create Web Service"
2. Render 会自动开始部署
3. 等待部署完成（通常需要几分钟）

## 获取服务器地址
部署完成后，你会得到一个 URL，格式如下：
```
https://your-service-name.onrender.com
```

## 配置前端连接
在你的 React 应用中，配置 Socket.io 连接到 Render 服务器：

```javascript
import io from 'socket.io-client';

const socket = io('https://your-service-name.onrender.com', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});
```

## 更新 CORS 设置
如果你的前端部署到不同的 URL，需要更新 `CLIENT_URL` 环境变量：

1. 在 Render Dashboard 中找到你的服务
2. 点击 "Environment"
3. 修改 `CLIENT_URL` 为你的前端 URL
4. 服务会自动重启

## 常见问题

### Q: 连接失败？
A: 检查以下几点：
- 确保 `CLIENT_URL` 环境变量设置正确
- 确保前端 URL 在 CORS 白名单中
- 检查 Render 日志查看错误信息

### Q: 如何查看日志？
A: 在 Render Dashboard 中找到你的服务，点击 "Logs" 选项卡

### Q: 需要升级服务吗？
A: 免费计划可能会在 15 分钟无活动后自动关闭。如需持续运行，升级到 Starter 或更高计划。

## 后续步骤
1. 在 Render 上部署后端服务器
2. 在 GitHub Pages 或其他平台部署前端
3. 在前端应用中配置后端 URL
