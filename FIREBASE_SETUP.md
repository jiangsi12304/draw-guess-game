# Firebase 联机配置指南

## 第一步：创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com)
2. 点击"创建项目"
3. 输入项目名称（如：draw-guess-game）
4. 完成项目创建

## 第二步：启用 Realtime Database

1. 在项目设置中，点击"Realtime Database"
2. 点击"创建数据库"
3. 选择"亚太地区"（根据你的位置选择）
4. 选择"测试模式"（后续可改为生产模式）
5. 创建数据库

## 第三步：获取配置信息

1. 回到项目首页
2. 点击"项目设置"（齿轮图标）
3. 在"您的应用"部分，点击"</>"（Web 应用）
4. 复制 firebaseConfig 对象中的所有信息

## 第四步：配置本地环境

1. 在项目根目录创建 `.env.local` 文件
2. 复制下面的内容并填入你的 Firebase 凭证：

```env
VITE_FIREBASE_API_KEY=你的API_KEY
VITE_FIREBASE_AUTH_DOMAIN=你的项目名.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://你的项目名.firebaseio.com
VITE_FIREBASE_PROJECT_ID=你的项目ID
VITE_FIREBASE_STORAGE_BUCKET=你的项目名.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=你的sender_id
VITE_FIREBASE_APP_ID=你的app_id
```

## 第五步：测试联机

1. 运行 `npm run dev`
2. 打开两个浏览器或标签页
3. 在一个创建房间，在另一个加入房间
4. 如果所有操作同步，说明联机成功！

## 部署到 GitHub Pages（可选）

1. 构建项目：`npm run build`
2. 推送到 GitHub
3. 在 GitHub 项目设置中启用 GitHub Pages
4. 每个用户配置自己的 .env.local 文件后即可使用

## 常见问题

**Q: 为什么无法加入房间？**
A: 检查 Firebase 凭证是否正确配置，以及 Firebase 数据库规则是否允许读写。

**Q: 不同网络能联机吗？**
A: 可以！Firebase Realtime Database 支持全球实时同步，无需在同一局域网。

**Q: 如何确保数据安全？**
A: 完成测试后，在 Firebase 中更改 Realtime Database 规则为生产模式并添加身份验证。

**Q: 消息和数据会保存在 Firebase 吗？**
A: 是的。建议在游戏结束时清理临时数据以节省成本。
