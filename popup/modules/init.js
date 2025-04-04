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

// 加载依赖模块
export const loadScripts = () => {
    return new Promise((resolve, reject) => {
        const loadScript = (src) => {
            return new Promise((resolveScript, rejectScript) => {
                const script = document.createElement('script');
                script.src = src;
                script.type = 'module';
                script.onload = resolveScript;
                script.onerror = (error) => {
                    console.error(`加载模块失败: ${src}`, error);
                    rejectScript(new Error(`加载模块失败: ${src}`));
                };
                document.head.appendChild(script);
            });
        };

        // 加载国际化支持模块
        loadScript('../lib/shared/i18n.js')
            .then(() => {
                console.log('国际化模块加载成功');
                resolve();
            })
            .catch(error => {
                console.error('加载国际化模块失败:', error);
                // 即使国际化模块加载失败，也继续执行其他功能
                resolve();
            });
    });
};

// 初始化DOM元素
const initializeDOMElements = () => {
    try {
        console.log('开始初始化DOM元素...');
        passwordOutput = document.getElementById('passwordOutput');
        
        if (!passwordOutput) {
            throw new Error('无法找到密码显示框元素');
        }

        // 立即设置初始状态
        passwordOutput.value = '正在初始化...';

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
            throw new Error('部分必需的DOM元素未找到');
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
        console.error('初始化DOM元素失败:', error);
        if (passwordOutput) {
            passwordOutput.value = '初始化失败：' + error.message;
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