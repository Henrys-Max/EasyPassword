/**
 * 密码生成器弹出窗口脚本 V1.1.0
 * 实现密码生成器的用户界面交互和状态管理
 */

// 导入必要的模块
import { loadScripts, getDOMElements } from './modules/init.js';
import { loadSavedConfig } from './modules/config.js';
import { initializeEventListeners } from './modules/ui.js';

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
                console.warn('脚本加载超时，继续执行');
                resolve('timeout');
            }, 5000); // 5秒超时
        });

        // 使用Promise.race确保不会无限等待
        const result = await Promise.race([loadScriptsPromise, timeoutPromise]);
        if (result === 'timeout') {
            console.warn('使用有限功能继续初始化');
        } else {
            console.log('所有依赖模块加载完成');
        }

        // 尝试初始化密码生成器，即使超时也继续执行
        passwordGenerator = window.passwordGenerator;
        
        // 初始化DOM元素
        const domElements = getDOMElements();

        // 初始化事件监听器
        initializeEventListeners();

        // 加载保存的配置
        loadSavedConfig();

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