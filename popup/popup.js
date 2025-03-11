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
    try {
        // 加载必要的脚本
        await loadScripts();
        console.log('所有依赖模块加载完成');

        // 初始化密码生成器
        passwordGenerator = window.passwordGenerator;
        if (!passwordGenerator) {
            throw new Error('密码生成器初始化失败');
        }

        // 初始化DOM元素
        const domElements = getDOMElements();

        // 初始化事件监听器
        initializeEventListeners();

        // 加载保存的配置
        loadSavedConfig();

    } catch (error) {
        console.error('初始化失败:', error);
        const passwordOutput = document.getElementById('passwordOutput');
        if (passwordOutput) {
            passwordOutput.value = '初始化失败：' + error.message;
        }
    }
}

// 导出公共接口
export { initializeApp };

// 初始化应用
initializeApp();