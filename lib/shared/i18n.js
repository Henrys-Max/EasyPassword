/**
 * 国际化支持模块 V1.0.0
 * 提供多语言支持功能，支持中英文切换
 */

// 语言配置
const translations = {
    'zh-CN': {
        appName: 'EasyPassword',
        version: 'v1.1.0',
        appDescription: '安全且易记的密码生成器',
        refreshTooltip: '生成新密码',
        copyTooltip: '复制密码',
        passwordType: '密码类型',
        randomPassword: '随机密码',
        memorablePassword: '易记密码',
        passwordLength: '密码长度',
        includeNumbers: '包含数字',
        includeSymbols: '包含符号',
        strengthIndicator: '密码强度',
        copied: '已复制！',
        copyFailed: '复制失败',
        copy: '复制',
        securityWarning: '为了安全性，需至少使用3类字符！',
        entropy: '熵值',
        weak: '弱',
        medium: '中',
        strong: '强',
        'very-strong': '极强'
    },
    'en-US': {
        appName: 'EasyPassword',
        version: 'v1.1.0',
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
        copyFailed: 'Copy Failed',
        copy: 'Copy',
        securityWarning: 'For security, at least 3 character types are required!',
        entropy: 'Entropy',
        weak: 'Weak',
        medium: 'Medium',
        strong: 'Strong',
        'very-strong': 'Very Strong'
    }
};

// 当前语言
let currentLanguage = 'zh-CN';

// 设置语言
function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        updatePageTranslations();
    }
}

// 获取翻译文本
function getTranslation(key) {
    return translations[currentLanguage][key] || key;
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

    // 更新select选项
    const passwordType = document.getElementById('passwordType');
    if (passwordType) {
        const options = passwordType.options;
        options[0].text = getTranslation('randomPassword');
        options[1].text = getTranslation('memorablePassword');
    }
}

// 初始化国际化
function initI18n() {
    // 检测浏览器语言
    const browserLang = navigator.language;
    const initialLang = browserLang.startsWith('zh') ? 'zh-CN' : 'en-US';
    setLanguage(initialLang);

    // 添加语言切换监听器
    window.addEventListener('languagechange', () => {
        const newLang = navigator.language.startsWith('zh') ? 'zh-CN' : 'en-US';
        setLanguage(newLang);
    });
}

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', initI18n);

// 导出函数
window.i18n = {
    setLanguage,
    getTranslation,
    updatePageTranslations
};