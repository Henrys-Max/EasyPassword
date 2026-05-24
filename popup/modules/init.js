/**
 * 初始化模块 V1.2.0
 * 负责DOM元素的初始化和事件监听器的设置
 * 
 * 更新说明：
 * 1. 重构为使用新的密码服务架构
 * 2. 优化脚本加载流程
 * 3. 改进错误处理机制
 */

// DOM元素声明
let passwordOutput, copyButton, refreshButton, passwordType, passwordLength;
let lengthValue, includeNumbers, includeSymbols;

// 密码强度指示器元素
let strengthBar, strengthLabel;

// 初始化DOM元素
const initializeDOMElements = () => {
    try {
        console.log('Initializing DOM elements...');
        passwordOutput = document.getElementById('passwordOutput');
        
        if (!passwordOutput) {
            throw new Error('Password output element not found');
        }

        // 立即设置初始状态
        window.__passwordValid = false;
        passwordOutput.value = window.t('initializing');

        // 初始化其他DOM元素
        copyButton = document.getElementById('copyButton');
        refreshButton = document.getElementById('refreshButton');
        passwordType = document.querySelector('input[name="passwordType"]:checked');
        passwordLength = document.getElementById('passwordLength');
        lengthValue = document.getElementById('lengthValue');
        includeNumbers = document.getElementById('includeNumbers');
        includeSymbols = document.getElementById('includeSymbols');

        // 初始化密码强度相关元素
        strengthBar = document.querySelector('.strength-segments');
        strengthLabel = document.getElementById('strengthLabel');

        // 验证所有必需的DOM元素
        if (!copyButton || !refreshButton || !passwordType || !passwordLength || 
            !lengthValue || !includeNumbers || !includeSymbols || !strengthBar || 
            !strengthLabel) {
            throw new Error('Some required DOM elements not found');
        }

        return {
            passwordOutput,
            copyButton,
            refreshButton,
            passwordType,
            passwordLength,
            lengthValue,
            includeNumbers,
            includeSymbols,
            strengthBar,
            strengthLabel
        };
    } catch (error) {
        console.error('DOM element initialization failed:', error);
        if (passwordOutput) {
            passwordOutput.value = window.t('initFailed', error.message);
        }
        throw error;
    }
};

// 导出获取DOM元素的函数
export const getDOMElements = () => {
    if (!passwordOutput) {
        return initializeDOMElements();
    }
    // 每次获取时重新查询选中的密码类型
    passwordType = document.querySelector('input[name="passwordType"]:checked');
    return {
        passwordOutput,
        copyButton,
        refreshButton,
        passwordType,
        passwordLength,
        lengthValue,
        includeNumbers,
        includeSymbols,
        strengthBar,
        strengthLabel
    };
};