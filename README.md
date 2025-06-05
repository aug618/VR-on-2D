# 3D Eye Tracking Visualization

Johnny 著名目标演示在本地浏览器中复现

## 🌟 功能特性

- 🎯 实时眼动追踪
- 🎨 3D圆环目标动画效果
- 🌫️ 可调节雾效和隧道背景
- 📱 响应式GUI控制界面
- 🎬 目标喷射动画系统
- 📐 离轴投影校准

## 📁 项目结构

```
3D/
├── index.html              # 主入口文件
├── 说明文档.md              # 项目文档
├── src/                   # 源代码目录
│   ├── core/              # 核心模块
│   │   ├── main.js        # 主程序入口
│   │   ├── config.js      # 全局配置
│   │   └── sceneElements.js # 3D场景基础元素
│   ├── managers/          # 管理器模块
│   │   ├── backgroundGridManager.js  # 背景网格管理
│   │   ├── fogManager.js             # 雾效管理
│   │   ├── targetObjectManager.js    # 目标对象管理
│   │   ├── textOverlayManager.js     # 文字覆盖层管理
│   │   └── virtualScreenManager.js  # 虚拟屏幕管理
│   ├── tracking/          # 追踪相关
│   │   └── mediaPipeHandler.js # MediaPipe处理器
│   └── ui/                # 用户界面
│       └── guiManager.js  # GUI控制面板
```

## 🚀 快速开始

### 环境要求

- 现代浏览器（在谷歌浏览器上通过测试）
- 摄像头访问权限
- HTTPS环境（本地开发可使用localhost）

### 安装运行

1. 克隆项目到本地
2. 使用HTTP服务器运行（不能直接打开文件）
3. 访问 `index.html`
4. 允许摄像头权限

```bash
# 使用Python启动本地服务器
python -m http.server 8000

```

## 🎮 使用说明

### 基本操作

1. **眼动追踪**：面对摄像头，眼睛移动会实时改变3D视角
2. **GUI控制**：右侧面板可调节各种参数
3. **动画控制**：支持重播目标喷射动画

### 参数调节

- **灵敏度调节**：控制眼动响应强度
- **深度校准**：调节距离检测范围
- **屏幕校准**：匹配实际屏幕尺寸
- **视觉效果**：雾效、网格、透明度等

## 🔧 技术架构

### 核心技术栈

- **Three.js** - 3D图形渲染
- **MediaPipe** - 面部和眼动检测
- **lil-gui** - 控制面板界面

### 关键算法

1. **眼动追踪**：基于虹膜直径估算深度距离
2. **离轴投影**：根据眼部位置计算视锥体
3. **动画系统**：缓动函数实现平滑过渡

## ⚙️ 配置说明

### 核心参数

```javascript
// 追踪灵敏度
movementMultiplier: 2.5    // 左右/上下移动敏感度
depthMultiplier: 1.0       // 深度敏感度

// 深度范围
minDepth: 15               // 最小检测距离(cm)
maxDepth: 100              // 最大检测距离(cm)

// 屏幕校准
screenWidth: 34.5          // 屏幕宽度(cm)
screenHeight: 19.4         // 屏幕高度(cm)
```

### 视觉效果

```javascript
// 雾效设置
fogNear: 20                // 雾起始距离
fogFar: 90                 // 雾终止距离

// 网格设置
gridCellSize: 4            // 网格单元大小
tunnelLength: 120          // 隧道长度
```

## 🐛 故障排除

### 常见问题


1. **眼动追踪不准确**
   - 调节FOV参数匹配自己的设备，直至深度等坐标计算合适
   - 确保充足光线环境
   - 调节深度范围参数

2. **性能问题**
   - 降低网格密度
   - 减少目标对象数量
   - 关闭不必要的效果

### 调试信息

在 `mediaPipeHandler.js` 中取消注释调试日志：
```javascript
console.log(`Video Width: ${videoElement.videoWidth}, FOV: ${appParams.fov}`);
```

