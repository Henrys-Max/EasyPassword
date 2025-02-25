# EasyPassword 密码生成器
EasyPassword是一款专注于密码安全的Chrome浏览器扩展。它采用Web Crypto API生成高强度随机密码，支持随机乱序和单词组合两种生成模式，并集成了基于NIST标准的密码强度评估系统。扩展提供了现代化的Material Design界面，支持密码长度和字符类型的精确控制，内置布隆过滤器实现弱密码检测，并通过Web Worker确保高性能运行。无论是对安全性要求极高的场景，还是需要兼顾可记忆性的日常使用，EasyPassword都能提供专业可靠的密码解决方案。

## 迭代计划

### **用户体验优化方向**
### 1. 场景化密码推荐
- 根据当前访问网站自动推荐密码策略（如金融类网站强制启用随机乱序模式+符号必选）

### 2.浏览器深度集成
- 输入框智能标记
  - 在密码字段旁显示悬浮生成按钮（带强度指示图标），点击填充密码
  - 快捷键填充（如Ctrl+Shift+G）

### 3.智能密码管理中枢
- 密码保险箱集成
  - 新增加密存储空间，支持自动保存生成的密码并与浏览器密码管理器双向同步，提供分类标签、快速检索和跨设备同步功能

- 智能密码更新器
  - 开发过期密码检测系统，自动扫描已保存密码的强度变化，提供一键更新建议并保留历史版本记录

## 版本历史
### V1.1.0
- 新增密码强度指示器功能
  - 实现基于NIST标准的密码强度评估系统
  - 添加动态密码强度指示器直观展示密码强度
  - 集成多维度分析面板，提供字符分布、长度、复杂度等详细报告
  - 支持实时评估并给出针对性优化建议
- 优化用户交互体验
  - 新增密码强度评分卡片式展示
  - 添加密码问题智能检测与分类
  - 自动生成改进建议
  - 增加密码生成历史记录功能
- 技术架构升级
  - 引入布隆过滤器和字典树双重优化弱密码检测
  - 实现Web Worker多线程并行计算密码强度
  - 优化性能，将评估延迟控制在30ms以内
  - 添加IndexedDB本地存储支持

### V1.0.1
- 增强基础安全规则
  - 强制密码复杂度要求：至少包含大小写字母、数字、符号中的3类字符
  - 优化字符集：排除易混淆字符（1, l, I, 0, O, o, B, 8, 5, S等）
  - 调整密码长度范围：8-20位，默认12位
  - 引入密码熵值标准：≥80 bits
- 提升随机性保障
  - 使用Web Crypto API替代Math.random()
  - 增加SecureArray类型处理敏感数据
- 完善防混淆规则
  - 智能过滤发音混淆字符和键盘相邻组合
  - 添加智能纠错机制，避免连续重复字符和键盘序列模式
  - 引入弱密码库过滤功能
- 性能和兼容性优化
  - 使用Web Worker优化生成性能
  - 增加符号兼容性处理
  - 完善降级策略

### V1.0.0
- 初始版本发布
- 基础密码生成功能
- 双模式密码生成支持
- 字符类型和长度控制

## 功能特性

### 1. 智能密码生成
- 默认使用大小写字母生成密码，确保基本安全性
- 智能过滤易混淆字符（1/l/I/0/O等），提高密码可读性
- 灵活的字符组合控制，支持数字和特殊符号的开关
- 使用Fisher-Yates算法确保随机性
- 采用Web Crypto API生成高质量随机数
- 实现多重安全规则验证，包括：
  - 密码熵值计算和阈值控制
  - 键盘序列模式检测
  - 字符重复检测
  - 弱密码模式匹配

### 2. 双模式密码生成
- 随机乱序模式：生成高强度的随机密码，适合对安全性要求极高的场景
  - 强制包含大小写字母、数字和特殊符号
  - 智能字符分布算法，确保字符类型均匀分布
  - 动态权重调整的熵值计算
- 单词组合模式：生成类似"Purple3#Tiger!"的易记密码，平衡了安全性和可记忆性
  - 智能单词选择算法，支持短密码和长密码生成
  - 特殊字符智能插入，确保分布均匀
  - 自适应长度调整机制

### 3. 精确的长度控制
- 支持8-25位密码长度的精确调节
- 直观的滑动条控制，实时预览
- 智能的长度限制，避免生成过长或过短的密码
- 根据长度自动调整密码生成策略：
  - 短密码（<10位）：优化字符组合
  - 长密码（≥10位）：增强复杂度要求

### 4. 灵活的字符类型控制
- 数字开关：一键控制是否在密码中包含数字（2-9，排除易混淆的0/1）
- 符号开关：灵活添加特殊符号（精选的!@#$%^&*_+-=?），增强密码强度
- 智能字符集管理：
  - 动态调整字符权重
  - 避免易混淆字符组合
  - 确保字符类型均衡分布

### 5. 便捷的操作体验
- 一键复制功能，快速应用生成的密码
- 实时刷新按钮，随时生成新的密码
- 优雅的动画效果，提供流畅的交互体验
- 自动保存用户配置，下次使用时自动加载
- 密码强度实时评估和反馈

## 技术架构

### 前端技术栈
- HTML5：使用语义化标签，提供清晰的文档结构
- CSS3：采用现代化的样式技术，实现优雅的UI设计
  - Flexbox布局
  - CSS变量
  - 过渡动画
- JavaScript (ES6+)：使用现代JavaScript特性
  - 类和模块化设计
  - Promise异步处理
  - 箭头函数
  - Web Crypto API用于安全随机数生成
  - Web Worker API用于性能优化
- Chrome Extension API：
  - storage.sync API用于配置持久化
  - runtime API用于扩展生命周期管理

### 核心技术实现
- 密码生成系统
  - 基于Web Crypto API的安全随机数生成
  - Fisher-Yates洗牌算法确保字符均匀分布
  - 智能字符集管理和过滤机制
  - 多重安全规则验证系统
- Web Worker异步处理
  - 密码生成任务异步执行
  - 实时密码强度计算
  - 性能优化，确保响应延迟≤50ms
- 安全特性
  - 布隆过滤器优化弱密码检测
  - 动态权重的熵值计算系统
  - 智能字符分布算法
  - 多重密码强度验证

### 项目结构
```
├── manifest.json        # 扩展配置文件
├── popup/              # 弹出窗口相关文件
│   ├── popup.html     # 弹出窗口HTML
│   ├── popup.css      # 弹出窗口样式
│   └── popup.js       # 弹出窗口逻辑
├── assets/            # 静态资源
│   └── icons/         # 图标文件
└── lib/               # 工具库
    ├── password.js    # 密码生成核心逻辑
    ├── worker.js      # Web Worker实现
    └── shared/        # 共享工具和常量
        ├── charset.js # 字符集定义
        └── utils.js   # 工具函数
```

## 开发计划

### 第一阶段：基础框架搭建
1. 创建项目基础结构
2. 配置manifest.json
3. 实现基本UI界面

### 第二阶段：核心功能实现
1. 实现密码生成算法
2. 添加字符过滤功能
3. 实现密码类型切换
4. 开发长度调节功能
5. 添加字符类型控制

### 第三阶段：优化和测试
1. UI/UX优化
2. 代码重构和优化
3. 单元测试
4. 用户测试

### 第四阶段：发布和维护
1. 打包和发布
2. 收集用户反馈
3. 持续更新和维护

## 安装使用

1. 下载源码或克隆仓库
2. 打开Chrome浏览器，进入扩展管理页面（chrome://extensions/）
3. 开启开发者模式
4. 点击"加载已解压的扩展程序"，选择项目目录

## 贡献指南

欢迎提交Issue和Pull Request来帮助改进这个项目。

## 许可证

MIT License