/**
 * 密码生成器弹出窗口脚本 V1.2.0
 * 实现密码生成器的用户界面交互和状态管理
 * 
 * 更新说明：
 * 1. 重构为使用新的密码服务架构
 * 2. 优化初始化流程和错误处理
 * 3. 提升界面响应性能
 */

// 导入必要的模块
import { getDOMElements } from './modules/init.js';
import { loadSavedConfig, saveConfig } from './modules/config.js';
import { initializeEventListeners } from './modules/ui.js';
import { initializePasswordManager, generatePassword } from './modules/password-manager.js';
import passwordService from '../lib/core/password/passwordService.js';

// 全局变量
let isInitialized = false;

/**
 * 从 manifest.json 读取版本号并显示在 header 中
 */
function displayAppVersion() {
    const manifest = chrome.runtime.getManifest();
    const versionEl = document.getElementById('headerVersion');
    if (versionEl && manifest.version) {
        versionEl.textContent = 'v' + manifest.version;
    }
}

/**
 * 绑定设置按钮点击事件，打开设置页面
 */
function bindSettingsButton() {
    const settingsButton = document.getElementById('settingsButton');
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            chrome.tabs.create({ url: chrome.runtime.getURL('popup/settings.html') });
        });
    }
}

// 初始化应用
async function initializeApp() {
    // 设置页面标题
    document.title = window.t('popupTitle');

    // 显示版本号
    displayAppVersion();

    // 绑定设置按钮
    bindSettingsButton();

    // 立即显示初始状态，提高用户体验
    window.__passwordValid = false;
    const passwordOutput = document.getElementById('passwordOutput');
    if (passwordOutput) {
        passwordOutput.value = window.t('initializing');
    }

    try {
        // 初始化密码管理模块
        initializePasswordManager();
        
        // 初始化DOM元素
        getDOMElements();

        // 初始化事件监听器
        initializeEventListeners();

        // 加载保存的配置
        loadSavedConfig();

        // 注册popup关闭前的兜底保存
        window.addEventListener('beforeunload', saveConfig);
        
        // 注册应用级别的密码服务错误处理
        setupGlobalErrorHandling();
        
        // 生成初始密码
        setTimeout(() => {
            generatePassword();
            isInitialized = true;
        }, 100);

    } catch (error) {
        console.error('Initialization failed:', error);
        if (passwordOutput) {
            passwordOutput.value = window.t('initFailed', error.message);
            // 尝试恢复基本功能
            setTimeout(() => {
                try {
                    // 即使初始化失败，也尝试设置基本的UI交互
                    const copyButton = document.getElementById('copyButton');
                    const refreshButton = document.getElementById('refreshButton');
                    
                    if (copyButton) {
                        copyButton.addEventListener('click', () => {
                            alert(window.t('copyUnavailable'));
                        });
                    }
                    
                    if (refreshButton) {
                        refreshButton.addEventListener('click', () => {
                            location.reload(); // 尝试重新加载页面
                        });
                    }
                } catch (e) {
                    console.error('Recovery failed:', e);
                }
            }, 1000);
        }
    }
}

/**
 * 设置全局错误处理
 * 处理密码服务的错误和其他全局错误
 */
function setupGlobalErrorHandling() {
    // 监听全局未捕获的错误
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        
        const passwordOutput = document.getElementById('passwordOutput');
        if (passwordOutput && !isInitialized) {
            const errorMsg = event.error?.message || window.t('unknownError');
            passwordOutput.value = window.t('errorOccurred', errorMsg);
        }
        
        // 显示错误通知
        const securityWarning = document.getElementById('securityWarning');
        if (securityWarning) {
            const errorMsg = event.error?.message || window.t('unknownError');
            securityWarning.textContent = window.t('errorOccurred', errorMsg);
            securityWarning.classList.add('show');
            setTimeout(() => {
                securityWarning.classList.remove('show');
            }, 3000);
        }
    });
    
    // 密码服务错误监听
    passwordService.onPasswordError((message) => {
        console.error('Password service error:', message);
        // 全局错误处理已经在password-manager.js中实现
    });
}

// 导出公共接口
export { initializeApp };

// 初始化应用
initializeApp();