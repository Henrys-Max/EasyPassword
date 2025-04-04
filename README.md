# EasyPassword 密码生成器
EasyPassword是一款专注于密码安全的浏览器扩展。它采用Web Crypto API生成高强度随机密码，支持随机乱序和单词组合两种生成模式，并集成了基于NIST标准的密码强度评估系统。扩展提供了现代化的Material Design界面，支持密码长度和字符类型的精确控制，内置布隆过滤器实现弱密码检测，并通过Web Worker确保高性能运行。无论是对安全性要求极高的场景，还是需要兼顾可记忆性的日常使用，EasyPassword都能提供专业可靠的密码解决方案。

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

### 4. 密码更新与安全
- 智能密码更新器
  - 开发过期密码检测系统，自动扫描已保存密码的强度变化，提供一键更新建议并保留历史版本记录

## 版本历史
### V1.1.4
- 深色/浅色主题支持
  - 实现自动适配浏览器外观模式
  - 优化深色模式下的UI界面显示效果
  - 完善深色模式下的配置面板样式
  - 改进深色模式下的图标和按钮显示
- 技术优化
  - 优化CSS变量管理系统
  - 完善主题切换逻辑
  - 提升界面响应性能
  - 增强用户体验

### V1.1.3
- 优化语言设置
  - 将默认语言切换为中文
  - 优化语言切换逻辑
  - 完善中文界面体验
- 技术优化
  - 更新扩展版本至1.1.3
  - 优化配置文件结构
  - 提升整体稳定性

### V1.1.2
- 易记密码功能优化
  - 新增易记密码专属配置面板，支持动态切换
  - 增加单词数量控制（2-5个单词）
  - 提供多样化分隔符选择（-、_、?、.、#）
  - 支持首字母大小写控制
- 密码生成逻辑优化
  - 重构易记密码生成算法
  - 优化单词选择和组合逻辑
  - 增强密码安全性评估
- 配置管理更新
  - 新增易记密码专属配置存储
  - 优化配置加载和保存逻辑
  - 实现配置持久化
- 国际化支持完善
  - 新增配置项多语言支持
  - 优化错误提示的国际化

### V1.1.1
- 新增国际化支持
  - 实现自动检测浏览器语言设置
  - 支持中英文界面无缝切换
  - 优化多语言资源管理系统
  - 添加语言切换器组件
- 技术优化
  - 引入i18n国际化解决方案
  - 实现语言资源的动态加载
  - 优化界面布局适配不同语言
  - 添加语言设置持久化存储
- UI界面优化
  - 优化密码选项配置区域布局，提升操作流畅度
  - 改进密码强度指示器的视觉反馈效果
  - 调整按钮和输入框的间距与对齐方式
  - 优化移动端适配效果
- Bug修复
  - 修复复制按钮在特定状态下不响应的问题
  - 解决安全提示信息显示时长不合理的问题
  - 优化错误提示信息的展示逻辑
- 性能优化
  - 减少不必要的DOM操作，提升界面响应速度
  - 优化资源加载策略，改善首次加载性能
  - 完善内存管理，避免潜在的内存泄漏
  - 增强异常处理机制，提高应用稳定性

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
  - Bootstrap样式库支持
- JavaScript (ES6+)：使用现代JavaScript特性
  - 类和模块化设计
  - Promise异步处理
  - 箭头函数
  - ES模块系统（import/export）
  - Web Crypto API用于安全随机数生成
  - Web Worker API用于性能优化
- 国际化支持：
  - 多语言资源管理
  - 动态语言切换
  - 自动检测浏览器语言设置
- Chrome Extension API：
  - storage.sync API用于配置持久化
  - runtime API用于扩展生命周期管理
  - clipboardWrite API用于密码复制功能

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
├── manifest.json        # 扩展配置文件（V1.1.4）
├── popup/              # 弹出窗口相关文件
│   ├── popup.html     # 弹出窗口HTML
│   ├── popup.css      # 弹出窗口样式
│   ├── popup.js       # 弹出窗口主逻辑
│   └── modules/       # 模块化组件
│       ├── config.js  # 配置管理模块
│       ├── init.js    # 初始化模块
│       ├── password-manager.js # 密码管理模块
│       └── ui.js      # UI交互模块
├── options/           # 设置页面
│   ├── options.html   # 设置页面HTML
│   ├── options.css    # 设置页面样式
│   └── options.js     # 设置页面逻辑
├── _locales/          # 国际化资源
│   ├── en_US/         # 英文语言包
│   │   └── messages.json # 英文翻译
│   └── zh_CN/         # 中文语言包
│       └── messages.json # 中文翻译
├── assets/            # 静态资源
│   └── icons/         # 图标文件
│       ├── logo_16.png  # 16x16图标
│       ├── logo_32.png  # 32x32图标
│       ├── logo_48.png  # 48x48图标
│       ├── logo_128.png # 128x128图标
│       ├── Renew.svg    # 刷新图标
│       └── settings.svg # 设置图标
├── content/           # 内容脚本目录（待开发）
└── lib/               # 核心库
    ├── Bootstrap/     # Bootstrap样式库
    │   └── bootstrap.min.css # Bootstrap样式
    ├── core/          # 核心功能模块
    │   └── password/  # 密码生成核心
    │       ├── charset.js    # 字符集定义
    │       ├── generator.js  # 密码生成器
    │       ├── passwordService.js # 密码服务
    │       ├── strength.js   # 密码强度评估
    │       ├── utils.js      # 工具函数
    │       └── worker.js     # Web Worker实现
    └── shared/        # 共享工具和常量
        └── i18n.js    # 国际化支持
```


## 安装使用

1. 下载源码或克隆仓库
2. 打开Chrome浏览器，进入扩展管理页面（chrome://extensions/）
3. 开启开发者模式
4. 点击"加载已解压的扩展程序"，选择项目目录

## 贡献指南

欢迎提交Issue和Pull Request来帮助改进这个项目。

## 许可证

MIT License