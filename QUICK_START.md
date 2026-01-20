# 🚀 快速开始指南 - 3分钟部署

## 步骤1️⃣：获取Firebase配置（2分钟）

### A. 创建Firebase项目
```
访问: https://console.firebase.google.com
→ 点击 "创建项目"
→ 项目名称: draw-guess-game
→ 继续 → 继续 → 创建项目
```

### B. 启用Realtime Database
```
左侧菜单 → 构建 → Realtime Database
→ 创建数据库
→ 区域: 亚太地区(新加坡) ap-southeast1
→ 安全规则: 以测试模式启动
→ 启用
```

### C. 复制配置信息
```
点击项目设置 (⚙️) → 您的应用 → </> Web
复制以下信息:
- apiKey
- authDomain
- databaseURL
- projectId
- storageBucket
- messagingSenderId
- appId
```

## 步骤2️⃣：本地运行测试（1分钟）

### A. 创建 .env.local 文件
在项目根目录创建 `.env.local`:

```env
VITE_FIREBASE_API_KEY=粘贴apiKey
VITE_FIREBASE_AUTH_DOMAIN=粘贴authDomain
VITE_FIREBASE_DATABASE_URL=粘贴databaseURL
VITE_FIREBASE_PROJECT_ID=粘贴projectId
VITE_FIREBASE_STORAGE_BUCKET=粘贴storageBucket
VITE_FIREBASE_MESSAGING_SENDER_ID=粘贴messagingSenderId
VITE_FIREBASE_APP_ID=粘贴appId
```

### B. 启动开发服务器
```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器
# 打开: http://localhost:5173
```

### C. 测试联机（两个标签页）
- Tab 1: 创建房间 → 得到邀请码
- Tab 2: 加入房间 → 输入邀请码
- ✅ 成功！现在可以跨设备联机了

## 步骤3️⃣：部署到GitHub（可选）

### A. 创建GitHub仓库
```bash
git init
git add .
git commit -m "Draw and Guess Game with Firebase"
git branch -M main
git remote add origin https://github.com/你的用户名/draw-guess-game.git
git push -u origin main
```

### B. 配置GitHub Secrets
```
仓库 Settings → Secrets and variables → Actions
创建7个Secrets（名称和值对应 .env.local 中的内容）:

1. VITE_FIREBASE_API_KEY
2. VITE_FIREBASE_AUTH_DOMAIN
3. VITE_FIREBASE_DATABASE_URL
4. VITE_FIREBASE_PROJECT_ID
5. VITE_FIREBASE_STORAGE_BUCKET
6. VITE_FIREBASE_MESSAGING_SENDER_ID
7. VITE_FIREBASE_APP_ID
```

### C. 启用GitHub Pages
```
仓库 Settings → Pages
→ Build and deployment
→ Source: 选择 "GitHub Actions"
→ 保存
```

### D. 等待部署完成
```
Actions 标签页看部署状态
完成后访问: https://你的用户名.github.io/draw-guess-game
```

## ✅ 验证清单

- [ ] Firebase项目已创建
- [ ] .env.local文件已创建
- [ ] npm run dev 可以本地运行
- [ ] 两个浏览器标签页可以联机
- [ ] GitHub仓库已创建（可选）
- [ ] GitHub Secrets已配置（可选）
- [ ] GitHub Pages已启用（可选）

## 🎮 开始游戏！

### 本地模式
```
npm run dev
在多个浏览器标签页打开 http://localhost:5173
```

### 在线模式
```
多人在不同网络访问 GitHub Pages URL
```

## 📱 分享给朋友

### 如果使用本地服务器
```
在同一WiFi网络:
1. 查看你的电脑IP: ipconfig (Windows) / ifconfig (Mac/Linux)
2. 分享链接: http://你的IP:5173
3. 朋友在同一WiFi输入链接

跨网络: 需要部署到GitHub Pages或使用内网穿透
```

### 如果使用GitHub Pages
```
直接分享 URL: https://你的用户名.github.io/draw-guess-game
任何地方任何网络都可以访问！
```

## 🆘 常见问题

**Q: 说"Cannot apply unknown utility class `glass`"**
A: 这是Tailwind配置问题，已在最新版本修复。运行:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Q: Firebase显示无法连接**
A: 检查:
1. .env.local中的配置是否正确
2. Firebase项目是否创建成功
3. 数据库是否启用

**Q: 部署后空白页**
A: 检查:
1. GitHub Actions是否构建成功（Actions标签页）
2. GitHub Pages设置是否正确
3. Secrets是否全部添加

**Q: 多个设备无法同步**
A: 检查:
1. 房间邀请码是否正确
2. 网络连接是否正常
3. Firebase数据库是否有数据（Firebase Console查看）

## 📚 更多资源

- Firebase文档: https://firebase.google.com/docs
- Vite文档: https://vitejs.dev
- React文档: https://react.dev
- Tailwind CSS: https://tailwindcss.com

---

**完成以上步骤后，你就拥有一个全功能的在线画图猜词游戏！🎉**
