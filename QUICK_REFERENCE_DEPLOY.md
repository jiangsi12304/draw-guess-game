# 🚀 快速参考表

## 🔑 关键 URL

| 项目 | URL |
|------|-----|
| GitHub 仓库 | https://github.com/jiangsi12304/draw-guess-game |
| Render Dashboard | https://dashboard.render.com |
| GitHub Settings | https://github.com/settings/keys |

## 📋 部署清单

### ✅ 已完成
- [x] 代码上传到 GitHub
- [x] SSH 密钥配置
- [x] Server.js 配置
- [x] package.json 配置
- [x] render.yaml 创建

### ⏳ 待完成
- [ ] Render 后端服务部署
- [ ] 前端代码更新（添加后端 URL）
- [ ] 前端部署到 GitHub Pages
- [ ] Render 环境变量配置
- [ ] 测试后端连接
- [ ] 测试前后端集成

## 🛠️ 命令速查

### 本地开发
```bash
# 启动前端开发服务器
npm run dev

# 启动后端 Socket.io 服务器
node server.js

# 构建生产版本
npm run build
```

### Git 操作
```bash
# 查看状态
git status

# 提交更改
git add .
git commit -m "描述"

# 推送到 GitHub
git push origin master

# 查看日志
git log --oneline -5
```

## 🌐 环境变量

### 后端 (Render)
```
NODE_ENV=production
CLIENT_URL=你的前端URL
PORT=3001（自动设置）
```

### 前端
```
REACT_APP_SERVER_URL=https://your-render-service.onrender.com
```

## 📞 Socket.io 事件

### 客户端发送
- `create-room` - 创建游戏房间
- `join-room` - 加入游戏房间
- `leave-room` - 离开房间
- `send-chat-message` - 发送聊天消息
- `send-drawing-action` - 发送绘画动作
- `start-game` - 开始游戏
- `ready-game` - 准备游戏

### 服务器响应
- `user-connected` - 用户连接成功
- `room-created` - 房间创建成功
- `room-joined` - 加入房间成功
- `new-chat-message` - 新聊天消息
- `new-drawing-action` - 新绘画动作
- `game-started` - 游戏开始
- `player-ready` - 玩家准备状态
- `player-joined` - 新玩家加入
- `player-left` - 玩家离开

## 🔐 CORS 白名单

当前允许的来源：
- `http://localhost:5178`
- `http://localhost:3000`
- `https://jiangsi12304.github.io`
- 环境变量 `CLIENT_URL` 中的 URL

## 📱 浏览器 DevTools 检查

### WebSocket 连接
1. 打开 Chrome DevTools (F12)
2. Network → WS 标签
3. 查找 Socket.io 连接
4. 检查 Messages 标签查看实时通信

### 存储
- LocalStorage: 游戏状态
- SessionStorage: 临时数据

## 🐛 常见错误排查

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| 连接拒绝 | 后端不运行 | 检查 Render 服务状态 |
| CORS 错误 | 前端 URL 不在白名单 | 更新 CLIENT_URL |
| 连接超时 | 网络问题 | 刷新页面，检查网络 |
| 握手失败 | Socket.io 版本不匹配 | 更新依赖 |

## 📊 性能指标

### 建议配置
- Render 计划: Starter ($12/月) 或更高
- 地区: Singapore (亚洲最近)
- Node 版本: 18+

### 监控指标
- 连接数
- 活跃房间数
- 消息延迟
- 错误率

---

**最后更新**: 2026-01-21
**项目**: draw-guess-game
**部署方案**: GitHub + Render
