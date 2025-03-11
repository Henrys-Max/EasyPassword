/**
 * UI交互模块
 * 负责处理界面更新和动画效果
 */

import { getDOMElements } from './init.js';
import { generatePassword, showSecurityWarning } from './password.js';
import { saveConfig, toggleConfigPanel } from './config.js';

// 定时器变量
let copyButtonTimer;

// 复制密码到剪贴板
export const copyPassword = async () => {
    const { passwordOutput, copyButton } = getDOMElements();
    const password = passwordOutput.value;
    
    if (!password || 
        password === '生成密码失败' || 
        password === '密码生成器初始化失败' || 
        password === '正在生成密码...' || 
        password === '正在初始化密码生成器...') {
        return;
    }

    try {
        await navigator.clipboard.writeText(password);
        const originalText = window.i18n.getTranslation('copy');
        
        // 清除之前的定时器并重置按钮状态
        if (copyButtonTimer) {
            clearTimeout(copyButtonTimer);
            copyButton.textContent = originalText;
            copyButton.classList.remove('success', 'error');
        }
        
        // 使用i18n获取当前语言的提示文本
        copyButton.textContent = window.i18n.getTranslation('copied');
        copyButton.classList.add('success');
        
        // 保存新的定时器引用
        copyButtonTimer = setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.classList.remove('success');
        }, 1000);
    } catch (err) {
        console.error('复制失败:', err);
        const originalText = window.i18n.getTranslation('copy');
        
        // 清除之前的定时器并重置按钮状态
        if (copyButtonTimer) {
            clearTimeout(copyButtonTimer);
            copyButton.textContent = originalText;
            copyButton.classList.remove('success', 'error');
        }
        
        // 使用i18n获取当前语言的失败提示文本
        copyButton.textContent = window.i18n.getTranslation('copyFailed');
        copyButton.classList.add('error');
        
        // 保存新的定时器引用
        copyButtonTimer = setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.classList.remove('error');
        }, 1000);
    }
};

// 初始化事件监听器
export const initializeEventListeners = () => {
    const { 
        copyButton, 
        refreshButton,
        passwordLength,
        lengthValue,
        includeNumbers,
        includeSymbols
    } = getDOMElements();

    // 复制按钮点击事件
    if (copyButton) {
        copyButton.addEventListener('click', copyPassword);
    }

    // 刷新按钮点击事件
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            const refreshIcon = refreshButton.querySelector('.refresh-icon');
            if (refreshIcon) {
                refreshIcon.classList.add('rotate');
                setTimeout(() => {
                    refreshIcon.classList.remove('rotate');
                }, 500);
            }
            generatePassword();
        });
    }

    // 密码类型变更事件
    document.querySelectorAll('input[name="passwordType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if(this.checked) {
                // 直接使用radio按钮的value值
                toggleConfigPanel(this.value);
                generatePassword();
                saveConfig();
            }
        });
    });

    // 密码长度变更事件
    if (passwordLength && lengthValue) {
        passwordLength.addEventListener('input', (e) => {
            lengthValue.textContent = e.target.value;
            generatePassword();
            saveConfig();
        });
    }

    // 数字选项变更事件
    if (includeNumbers && includeSymbols) {
        includeNumbers.addEventListener('change', (e) => {
            // 检查是否尝试同时关闭数字和符号
            if (!e.target.checked && !includeSymbols.checked) {
                e.target.checked = true;
                showSecurityWarning(true);
                return;
            }
            showSecurityWarning(false);
            generatePassword();
            saveConfig();
        });

        // 符号选项变更事件
        includeSymbols.addEventListener('change', (e) => {
            // 检查是否尝试同时关闭数字和符号
            if (!e.target.checked && !includeNumbers.checked) {
                e.target.checked = true;
                showSecurityWarning(true);
                return;
            }
            showSecurityWarning(false);
            generatePassword();
            saveConfig();
        });
    }

    // 易记密码配置变更事件
    const wordCount = document.getElementById('wordCount');
    const wordCountValue = document.getElementById('wordCountValue');
    const separator = document.getElementById('separator');
    const capitalizeFirst = document.getElementById('capitalizeFirst');

    if (wordCount && wordCountValue) {
        wordCount.addEventListener('input', (e) => {
            wordCountValue.textContent = e.target.value;
            generatePassword();
            saveConfig();
        });
    }

    if (separator) {
        separator.addEventListener('change', () => {
            generatePassword();
            saveConfig();
        });
    }

    if (capitalizeFirst) {
        capitalizeFirst.addEventListener('change', () => {
            generatePassword();
            saveConfig();
        });
    }
};