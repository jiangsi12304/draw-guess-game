# 🎮 你画我猜游戏 - 完整部署指南

## 📚 项目概述
这是一个实时多人在线游戏：
- **前端**: React + Vite + Tailwind CSS
- **后端**: Express + Socket.io
- **部署**: GitHub + Render

## 🚀 快速部署

### 第一步：后端服务器部署到 Render

1. **访问 Render Dashboard**
   - 打开 https://dashboard.render.com
   - 使用 GitHub 账户登录

2. **创建新 Web Service**
   ```
   点击 "New +" → "Web Service"
   ```

3. **连接 GitHub 仓库**
   - 选择 `jiangsi12304/draw-guess-game` 仓库
   - 分支选择 `master`

4. **配置服务**
   | 项目 | 值 |
   |------|-----|
   | Name | draw-guess-game-server |
   | Environment | Node |
   | Region | Singapore |
   | Build Command | `npm install` |
   | Start Command | `npm start` |

5. **添加环境变量** (Advanced 部分)
   ```
   NODE_ENV = production
   CLIENT_URL = 你的前端 URL（稍后添加）
   ```

6. **点击 "Create Web Service"**
   - 等待部署完成
   - 获取服务 URL，格式: `https://service-name.onrender.com`

### 第二步：前端部署到 GitHub Pages

1. **更新前端代码中的服务器地址**

   在你的 React 组件中：
   ```javascript
   const SERVER_URL = 'https://your-render-service.onrender.com';

   const socket = io(SERVER_URL, {
     reconnection: true,
     reconnectionDelay: 1000,
     reconnectionDelayMax: 5000,
     reconnectionAttempts: 5
   });
   ```

2. **修改 vite.config.ts**（如果需要部署到子路径）
   ```typescript
   export default defineConfig({
     base: '/draw-guess-game/',
     plugins: [react()]
   })
   ```

3. **构建和部署**
   ```bash
   npm run build
   # 上传 dist 文件夹到 GitHub Pages
   ```

### 第三步：更新 Render 环境变量

1. 在 Render Dashboard 找到你的后端服务
2. 点击 "Environment"
3. 更新 `CLIENT_URL` 为你的前端 URL
4. 服务自动重启

## 🔗 集成步骤

### 前端 Socket.io 连接配置

```typescript
import io from 'socket.io-client';

// 从环境变量或直接指定
const SERVER_URL = process.env.REACT_APP_SERVER_URL ||
                   'https://your-render-service.onrender.com';

export const socket = io(SERVER_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  secure: true,
  rejectUnauthorized: false
});
```

### 后端 CORS 配置

服务器已配置为支持：
- 本地开发 (`http://localhost:5178`)
- GitHub Pages (`https://jiangsi12304.github.io`)
- Render 前端 (通过 `CLIENT_URL` 环境变量)

## ✅ 测试部署

### 测试后端服务
```bash
# 访问服务器 URL
https://your-service-name.onrender.com

# 应该看到:
{
  "message": "✅ 你画我猜游戏Socket服务器正在运行",
  "status": "online",
  "onlineUsers": 0,
  "activeRooms": 0
}
```

### 测试前后端连接
1. 打开前端应用
2. 打开浏览器开发者工具 (F12)
3. 查看 Network → WS (WebSocket)
4. 应该看到 Socket.io 连接建立

## 📊 监控和日志

### 查看后端日志
1. Render Dashboard → 你的服务
2. 点击 "Logs" 选项卡
3. 查看实时日志

### 常见问题排查

**连接错误: "Connection refused"**
- 检查 Render 服务是否运行
- 确保 URL 正确
- 检查 CORS 配置中的 `CLIENT_URL`

**跨域错误: "CORS policy"**
- 确保前端 URL 在后端 CORS 白名单中
- 更新 `CLIENT_URL` 环境变量
- 重启 Render 服务

**Socket.io 连接超时**
- 检查网络连接
- 验证 Render 服务状态
- 查看 Render 日志

## 🔄 持续集成

每次提交到 master 分支时：
1. Render 自动检测代码变更
2. 自动构建和重新部署
3. 部署完成后服务重启

## 💡 性能优化

### Render 性能建议
- 使用最近的地理区域
- 考虑升级到付费计划（持续运行）
- 监控内存使用

### 前端优化
- 启用生产构建
- 压缩静态资源
- 使用 CDN

## 📞 支持资源

- [Render 文档](https://render.com/docs)
- [Socket.io 文档](https://socket.io/docs/)
- [GitHub Pages 部署](https://docs.github.com/en/pages)

---

**部署完成后，你的游戏应该在以下 URL 可用：**
- 前端: `https://jiangsi12304.github.io/draw-guess-game`
- 后端: `https://your-render-service.onrender.com`
