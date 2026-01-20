# 🎨 你画我猜 - 远程联机游戏

一款高品质的实时在线绘画猜测游戏，具有温馨的UI设计、发光渐变和毛玻璃特效。

## ✨ 功能特性

- **🎮 实时联机**：与朋友一起在线游戏，支持2-6个玩家
- **🎨 创意绘画**：使用Canvas绘画功能，支持多种笔刷和颜色
- **💬 实时聊天**：与其他玩家实时聊天和猜测
- **🏆 计分系统**：实时排行榜，追踪得分
- **⏱️ 轮流作画**：自动轮流切换绘画者
- **📚 丰富词库**：500+词汇库，分难度等级
- **🎵 音效系统**：背景音乐和交互音效
- **📱 响应式设计**：适配各种屏幕尺寸
- **🌈 温馨UI**：发光渐变、毛玻璃特效、柔和配色

## 🚀 快速开始

### 1. 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 2. Firebase配置（可选，用于多设备联机）

如果你想使用远程Firebase实现跨设备实时同步：

1. 访问 [Firebase Console](https://console.firebase.google.com)
2. 创建新项目
3. 启用 Realtime Database
4. 复制配置信息
5. 创建 `.env.local` 文件并填入Firebase配置

### 3. 部署到GitHub Pages

```bash
# 构建生产版本
npm run build

# 部署文件在 dist/ 目录
```

## 📖 游戏规则

1. **创建或加入房间** - 房主创建房间，其他玩家通过邀请码加入
2. **等待准备** - 所有玩家在大厅中准备好后，房主开始游戏
3. **轮流作画** - 随机选择绘画者，其他玩家猜测
4. **猜词** - 观看绘画，在聊天框中输入猜测
5. **计分** - 猜对得分，继续下一轮

## 🛠️ 技术栈

- React 18 + TypeScript
- Tailwind CSS
- Canvas API
- Firebase Realtime Database
- Howler.js

## 📁 项目结构

```
draw-guess-game/
├── src/
│   ├── components/       # React组件
│   ├── data/            # 数据文件
│   ├── hooks/           # 自定义hooks
│   ├── types/           # TypeScript类型
│   ├── utils/           # 工具函数
│   └── App.tsx          # 主应用
```

---

**享受游戏！🎉**
