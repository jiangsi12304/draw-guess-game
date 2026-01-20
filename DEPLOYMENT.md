# 跨局域网联机部署指南

## 📝 快速开始

### 第一步：获取Firebase凭证

1. 访问 [Firebase Console](https://console.firebase.google.com)
2. 创建新项目
3. 创建Realtime Database（亚太地区，测试模式）
4. 获取Web配置信息

### 第二步：本地配置

在项目根目录创建 `.env.local` 文件：

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 第三步：本地测试

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览生产版本
npm run preview
```

### 第四步：部署到GitHub Pages

#### 4.1 创建GitHub仓库

```bash
git init
git add .
git commit -m "Initial commit: Draw and Guess Game with Firebase"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/draw-guess-game.git
git push -u origin main
```

#### 4.2 配置GitHub Secrets

1. 打开仓库设置 → Secrets and variables → Actions
2. 添加以下Secrets：

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_DATABASE_URL
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

#### 4.3 创建GitHub Actions工作流

创建文件 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_DATABASE_URL: ${{ secrets.VITE_FIREBASE_DATABASE_URL }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          cname: your-custom-domain.com  # 可选，如果有自定义域名
```

#### 4.4 启用GitHub Pages

1. 仓库设置 → Pages
2. 选择 "Deploy from a branch"
3. 选择 "gh-pages" 分支
4. 保存

## 🎮 使用说明

### 创建房间
1. 输入昵称和选择头像
2. 点击"创建房间"
3. 设置游戏轮数和时间
4. 分享邀请码给朋友

### 加入房间
1. 输入昵称和选择头像
2. 点击"加入房间"
3. 输入6位邀请码
4. 开始游戏！

### 游戏规则
- **绘画者**：根据词语在画布上绘画
- **猜测者**：通过聊天猜测词语
- **计分**：猜对加50分，绘画者加额外分

## 🌍 跨设备联机

### 同局域网
✅ 输入你的电脑IP:3000访问（开发模式）

### 不同网络
✅ 部署GitHub Pages后可以通过URL访问
✅ Firebase自动同步所有数据

### 示例URL
```
https://your-username.github.io/draw-guess-game
```

## 🔒 安全建议

### 开发阶段
- 使用Firebase测试模式（当前配置）
- 仅限私密测试

### 生产部署
- 修改Firebase Realtime Database规则为生产模式
- 添加用户身份验证
- 实现房间密码保护

### Firebase数据库规则
```json
{
  "rules": {
    "rooms": {
      ".read": true,
      ".write": true,
      ".validate": "newData.hasChildren(['id', 'code', 'host', 'gameState'])"
    },
    "games": {
      ".read": true,
      ".write": true
    }
  }
}
```

## 📊 性能优化

- React 19最新版本
- Vite构建优化
- Firebase实时同步
- Tailwind CSS生产优化

## 🐛 故障排查

### 无法加入房间
- 检查Firebase连接
- 确认.env.local配置正确
- 查看浏览器控制台错误

### 实时同步延迟
- 正常延迟：100-500ms（网络相关）
- 检查网络连接质量

### Firebase配额相关
- 免费层支持100并发连接
- 5GB存储空间
- 足够中小型游戏使用

## 📱 支持的设备
- ✅ 桌面浏览器（Chrome, Firefox, Safari, Edge）
- ✅ 移动浏览器（iOS Safari, Chrome Mobile）
- ✅ 任何支持WebSocket的浏览器

## 🎯 下一步优化方案

- [ ] 用户账号系统
- [ ] 游戏历史记录
- [ ] 排行榜功能
- [ ] 自定义词库
- [ ] 语音聊天
- [ ] 绘画工具增强

## 📞 获取帮助

- Firebase文档：https://firebase.google.com/docs
- GitHub Issues：https://github.com/YOUR_USERNAME/draw-guess-game/issues
- Vite文档：https://vitejs.dev

---

**现在你的游戏可以在全球任何地方跨设备联机了！🎉**
