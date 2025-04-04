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
import { loadScripts, getDOMElements } from './modules/init.js';
import { loadSavedConfig } from './modules/config.js';
import { initializeEventListeners } from './modules/ui.js';
import { initializePasswordManager, generatePassword } from './modules/password-manager.js';

// 全局变量
let passwordGenerator = null;

// 初始化应用
async function initializeApp() {
    // 立即显示初始状态，提高用户体验
    const passwordOutput = document.getElementById('passwordOutput');
    if (passwordOutput) {
        passwordOutput.value = '正在初始化...';
    }

    try {
        // 设置超时处理，确保即使脚本加载缓慢也能继续执行
        const loadScriptsPromise = loadScripts();
        const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => {
                console.debug('继续初始化中，请稍候...');
                resolve('timeout');
            }, 5000); // 5秒超时
        });

        // 使用Promise.race确保不会无限等待
        const result = await Promise.race([loadScriptsPromise, timeoutPromise]);
        if (result === 'timeout') {
            console.debug('正在使用备用方式加载...');
        } else {
            console.debug('基础脚本加载完成');
        }

        // 初始化密码管理模块
        initializePasswordManager();
        
        // 初始化DOM元素
        const domElements = getDOMElements();

        // 初始化事件监听器
        initializeEventListeners();

        // 加载保存的配置
        loadSavedConfig();
        
        // 生成初始密码
        setTimeout(() => {
            generatePassword();
        }, 100);

    } catch (error) {
        console.error('初始化失败:', error);
        if (passwordOutput) {
            passwordOutput.value = '初始化失败：' + error.message;
            // 尝试恢复基本功能
            setTimeout(() => {
                try {
                    // 即使初始化失败，也尝试设置基本的UI交互
                    const copyButton = document.getElementById('copyButton');
                    const refreshButton = document.getElementById('refreshButton');
                    
                    if (copyButton) {
                        copyButton.addEventListener('click', () => {
                            alert('复制功能暂时不可用，请稍后再试');
                        });
                    }
                    
                    if (refreshButton) {
                        refreshButton.addEventListener('click', () => {
                            location.reload(); // 尝试重新加载页面
                        });
                    }
                } catch (e) {
                    console.error('恢复基本功能失败:', e);
                }
            }, 1000);
        }
    }
}

// 导出公共接口
export { initializeApp };

// 初始化应用
initializeApp();