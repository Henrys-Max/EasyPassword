/**
 * 国际化支持模块 V1.1.2
 * 提供多语言支持功能，支持中英文切换
 * 
 * 更新说明：
 * 1. 新增易记密码配置相关的国际化支持
 * 2. 优化配置项的多语言显示
 * 3. 完善错误提示的国际化处理
 * 4. 新增 data-i18n-placeholder 支持和 formatTranslation 方法
 */

// 语言配置
const translations = {
    'zh_CN': {
        appName: 'Easy Password',
        appDescription: '安全且易记的密码生成器',
        refreshTooltip: '生成新密码',
        copyTooltip: '复制密码',
        passwordType: '类型',
        randomPassword: '随机',
        memorablePassword: '易记',
        passwordLength: '长度',
        includeNumbers: '数字',
        includeSymbols: '符号',
        strengthIndicator: '密码强度',
        copied: '已复制！',
        copiedToClipboard: '已复制到剪贴板',
        copyFailed: '复制失败',
        copy: '复制',
        securityWarning: '为了安全性，需至少使用3类字符！',
        entropy: '熵值',
        weak: '弱',
        medium: '中',
        strong: '强',
        'very-strong': '极强',
        // 易记密码配置
        wordCount: '单词数',
        separator: '分隔符',
        capitalizeFirst: '首字母大写',

        // 设置页面
        settingsMemorableWords: '易记单词',
        settingsAbout: '产品信息',
        settingsAddWord: '添加',
        settingsEdit: '编辑',
        settingsDone: '完成',
        settingsNoWords: '暂无单词',
        settingsProductName: '产品名称',
        settingsVersion: '产品版本',
        settingsFeedback: '意见反馈',
        settingsFeedbackLink: '去反馈',
        settingsEditHint: '编辑完成后保存生效',
        settingsMinWordWarning: '为确保密码安全性，单词组最少需保留10组',
        // 设置页面验证消息
        settingsValidateEmpty: '请输入单词',
        settingsValidateLettersOnly: '仅允许英文字母，不支持数字或符号',
        settingsValidateMinLength: '单词至少需要2个字母',
        settingsValidateMaxLength: '单词最多6个字母',
        settingsValidateDuplicate: '该单词已存在',
        settingsWordAdded: '"{0}" 已添加',
        settingsWordRemoved: '"{0}" 已移除',
        settingsSaveFailed: '保存失败，请重试',
        settingsSaveSuccess: '保存成功',
        settingsWordInputPlaceholder: '输入单词，回车键添加',
        settingsWordRemove: '删除',
        settingsTitle: 'EasyPassword - 设置',
        settingsButtonTitle: '设置',
        settingsButtonAlt: '设置',
        refreshButtonAlt: '刷新',
        // 弹出窗口
        popupTitle: 'EasyPassword - 密码生成器',
        // 通用
        initializing: '正在初始化...',
        initFailed: '初始化失败：{0}',
        generatingPassword: '正在生成{0}密码...',
        generationFailed: '生成失败: {0}',
        generationRetry: '生成失败，请重试',
        generatingMemorable: '易记',
        generatingRandom: '随机',
        copyInvalidPassword: '无法复制：密码无效',
        copyUnavailable: '复制功能暂时不可用，请稍后再试',
        errorOccurred: '出现错误：{0}',
        unknownError: '未知错误',
        weakPasswordSuggestion: '密码较弱，建议增加长度'
    },
    'en_US': {
        appName: 'Easy Password',
        appDescription: 'Secure and Memorable Password Generator',
        refreshTooltip: 'Generate New Password',
        copyTooltip: 'Copy Password',
        passwordType: 'Type',
        randomPassword: 'Random',
        memorablePassword: 'Easy',
        passwordLength: 'Length',
        includeNumbers: 'Numbers',
        includeSymbols: 'Symbols',
        strengthIndicator: 'Password Strength',
        copied: 'Copied!',
        copiedToClipboard: 'Copied to clipboard',
        copyFailed: 'Copy Failed',
        copy: 'Copy',
        securityWarning: 'For security, at least 3 character types are required!',
        entropy: 'Entropy',
        weak: 'Weak',
        medium: 'Medium',
        strong: 'Strong',
        'very-strong': 'Very Strong',
        // Memorable Password Configuration
        wordCount: 'Word Count',
        separator: 'Separator',
        capitalizeFirst: 'Capitalize First Letter',

        // Settings Page
        settingsMemorableWords: 'Memorable Words',
        settingsAbout: 'About',
        settingsAddWord: 'Add',
        settingsEdit: 'Edit',
        settingsDone: 'Done',
        settingsNoWords: 'No words yet',
        settingsProductName: 'Product Name',
        settingsVersion: 'Version',
        settingsFeedback: 'Feedback',
        settingsFeedbackLink: 'Feedback',
        settingsEditHint: 'Changes take effect after saving',
        settingsMinWordWarning: 'At least 10 word groups are required for password security',
        // Settings validation messages
        settingsValidateEmpty: 'Please enter a word',
        settingsValidateLettersOnly: 'Only English letters are allowed',
        settingsValidateMinLength: 'Word must have at least 2 letters',
        settingsValidateMaxLength: 'Word must have at most 6 letters',
        settingsValidateDuplicate: 'This word already exists',
        settingsWordAdded: '"{0}" added',
        settingsWordRemoved: '"{0}" removed',
        settingsSaveFailed: 'Save failed, please try again',
        settingsSaveSuccess: 'Saved successfully',
        settingsWordInputPlaceholder: 'Enter a word, press Enter to add',
        settingsWordRemove: 'Remove',
        settingsTitle: 'EasyPassword - Settings',
        settingsButtonTitle: 'Settings',
        settingsButtonAlt: 'Settings',
        refreshButtonAlt: 'Refresh',
        // Popup
        popupTitle: 'EasyPassword - Password Generator',
        // Common
        initializing: 'Initializing...',
        initFailed: 'Initialization failed: {0}',
        generatingPassword: 'Generating {0} password...',
        generationFailed: 'Generation failed: {0}',
        generationRetry: 'Generation failed, please retry',
        generatingMemorable: 'Memorable',
        generatingRandom: 'Random',
        copyInvalidPassword: 'Cannot copy: invalid password',
        copyUnavailable: 'Copy is temporarily unavailable, please try later',
        errorOccurred: 'Error occurred: {0}',
        unknownError: 'Unknown error',
        weakPasswordSuggestion: 'Weak password, try increasing length'
    }
};

// 当前语言
let currentLanguage = 'en_US';

// 设置语言
function setLanguage(lang) {
    // 标准化语言代码
    const normalizedLang = lang.startsWith('zh') ? 'zh_CN' : 'en_US';
    if (translations[normalizedLang]) {
        currentLanguage = normalizedLang;
        updatePageTranslations();
    }
}

// 获取翻译文本
function getTranslation(key) {
    return translations[currentLanguage][key] || key;
}

// 带参数替换的翻译（{0}, {1} 等占位符）
function formatTranslation(key, ...args) {
    let text = translations[currentLanguage][key] || key;
    args.forEach((arg, i) => {
        text = text.replace(`{${i}}`, arg);
    });
    return text;
}

// 更新页面翻译
function updatePageTranslations() {
    // 更新data-i18n属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = getTranslation(key);
    });

    // 更新data-i18n-title属性的元素
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        element.title = getTranslation(key);
    });

    // 更新data-i18n-placeholder属性的元素
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = getTranslation(key);
    });

    // 更新data-i18n-alt属性的元素
    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
        const key = element.getAttribute('data-i18n-alt');
        element.alt = getTranslation(key);
    });
}

// 初始化国际化
function initI18n() {
    // 检测浏览器语言，默认使用英语
    const browserLang = navigator.language || 'en';
    setLanguage(browserLang);
}

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', initI18n);

// t() 快捷方法：支持无参数和有参数两种形式
//   t('key')        → getTranslation(key)
//   t('key', a, b)  → formatTranslation(key, a, b)
const t = (key, ...args) => {
    return args.length ? formatTranslation(key, ...args) : getTranslation(key);
};

// 导出函数
window.i18n = {
    setLanguage,
    getTranslation,
    formatTranslation,
    updatePageTranslations,
    t
};

// 全局快捷方式
window.t = t;
