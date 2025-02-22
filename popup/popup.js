/**
 * 密码生成器弹出窗口脚本 V1.1.0
 * 实现密码生成器的用户界面交互和状态管理
 * 
 * 主要功能：
 * 1. 密码生成和展示：支持随机密码和易记密码的生成与显示
 * 2. 用户配置管理：灵活配置密码类型、长度、字符类型等参数
 * 3. 密码复制功能：一键复制到剪贴板，带有视觉反馈
 * 4. 状态管理：完整的初始化和错误处理流程
 * 
 * 用户体验优化：
 * - 实时的状态反馈和加载提示
 * - 智能的配置验证和安全提醒
 * - 平滑的动画过渡效果
 * - 直观的操作响应
 * 
 * 技术实现：
 * - 采用模块化设计，分离UI和业务逻辑
 * - 实现完整的错误处理和状态反馈机制
 * - 支持配置的本地持久化存储
 * - 异步操作的状态管理
 * - 优化的事件处理和性能表现
 */

// 密码生成器实例
let passwordGenerator;

// DOM元素声明
let passwordOutput, copyButton, refreshButton, passwordType, passwordLength;
let lengthValue, includeNumbers, includeSymbols;

// 加载密码生成器核心模块
const scriptElement = document.createElement('script');
scriptElement.src = '/lib/password.js';
scriptElement.onload = () => {
    passwordGenerator = window.passwordGenerator;
};
document.head.appendChild(scriptElement);

// 确保在页面加载完成后再初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化DOM元素
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
        passwordType = document.getElementById('passwordType');
        passwordLength = document.getElementById('passwordLength');
        lengthValue = document.getElementById('lengthValue');
        includeNumbers = document.getElementById('includeNumbers');
        includeSymbols = document.getElementById('includeSymbols');

        // 验证所有必需的DOM元素
        if (!copyButton || !refreshButton || !passwordType || !passwordLength || 
            !lengthValue || !includeNumbers || !includeSymbols) {
            throw new Error('部分必需的DOM元素未找到');
        }

        // 更新状态
        passwordOutput.value = '正在设置事件监听器...';
        
        // 添加密码生成成功事件监听器
        window.addEventListener('passwordGenerated', (event) => {
            console.log('密码生成成功');
            if (event.detail && event.detail.password) {
                passwordOutput.value = event.detail.password;
            } else {
                console.error('密码生成事件缺少必要的数据');
                passwordOutput.value = '密码生成失败：无效的密码数据';
            }
        });

        // 更新状态
        passwordOutput.value = '正在初始化事件监听器...';
        
        // 初始化事件监听器
        initializeEventListeners();

        // 更新状态
        passwordOutput.value = '正在等待密码生成器初始化...';
        
        // 等待密码生成器初始化完成后再加载配置
        const checkPasswordGenerator = () => {
            if (passwordGenerator) {
                loadSavedConfig();
            } else {
                setTimeout(checkPasswordGenerator, 100);
            }
        };
        checkPasswordGenerator();
    } catch (error) {
        console.error('初始化失败:', error);
        if (passwordOutput) {
            passwordOutput.value = '初始化失败：' + error.message;
        }
    }
});

// 加载保存的配置
function loadSavedConfig() {
    // 更新状态提示
    passwordOutput.value = '正在加载配置...';
    try {
        chrome.storage.sync.get({
        passwordType: 'random',
        passwordLength: 12,
        includeNumbers: true,
        includeSymbols: false
    }, (config) => {
        try {
            // 更新UI元素的值
            passwordType.value = config.passwordType;
            passwordLength.value = config.passwordLength;
            lengthValue.textContent = config.passwordLength;
            includeNumbers.checked = config.includeNumbers;
            includeSymbols.checked = config.includeSymbols;

            // 更新状态提示
            passwordOutput.value = '配置加载完成，准备生成密码...';
            // 根据加载的配置生成密码
            generatePassword();
        } catch (error) {
            console.error('配置应用失败:', error);
            passwordOutput.value = '配置应用失败：' + error.message;
        }
    });
    } catch (error) {
        console.error('加载配置失败:', error);
        passwordOutput.value = '加载配置失败：' + error.message;
        // 使用默认配置生成密码
        generatePassword();
    }
}

// 保存配置
function saveConfig() {
    const config = {
        passwordType: passwordType.value,
        passwordLength: parseInt(passwordLength.value),
        includeNumbers: includeNumbers.checked,
        includeSymbols: includeSymbols.checked
    };

    chrome.storage.sync.set(config, () => {
        console.log('配置已保存');
    });
}

// 生成密码
function generatePassword() {
    console.log('开始生成密码...');

    // 验证必需的DOM元素是否存在
    if (!passwordOutput || !passwordType || !passwordLength || !includeNumbers || !includeSymbols) {
        console.error('必需的DOM元素未找到');
        if (passwordOutput) {
            passwordOutput.value = '密码生成器初始化失败：必需的DOM元素未找到';
        }
        return;
    }

    passwordOutput.value = '正在生成密码...';

    try {
        const type = passwordType.value;
        const length = parseInt(passwordLength.value);
        const useNumbers = includeNumbers.checked;
        const useSymbols = includeSymbols.checked;

        passwordOutput.value = `正在准备生成${type === 'random' ? '随机' : '易记'}密码，长度：${length}，包含数字：${useNumbers}，包含符号：${useSymbols}`;

        console.log('密码生成参数:', {
            type,
            length,
            useNumbers,
            useSymbols
        });

        if (type === 'random') {
            // 生成随机乱序密码
            try {
                console.log('生成随机密码...');
                passwordOutput.value = '正在生成随机密码，请稍候...';
                passwordGenerator.generateRandomPassword(
                    length,
                    useNumbers,
                    useSymbols
                );
            } catch (error) {
                console.error('生成随机密码时发生错误:', error);
                passwordOutput.value = '生成随机密码时发生错误：' + error.message;
            }
        } else {
            // 生成易记的密码
            try {
                passwordOutput.value = '正在生成易记密码，请稍候...';
                passwordGenerator.generateMemorablePassword(
                    length,
                    useNumbers,
                    useSymbols
                );
            } catch (error) {
                console.error('生成易记密码时发生错误:', error);
                passwordOutput.value = '生成易记密码时发生错误：' + error.message;
            }
        }
    } catch (error) {
        console.error('生成密码时发生错误:', error);
        passwordOutput.value = '生成密码时发生错误：' + error.message;
    }
}

// 复制密码到剪贴板
async function copyPassword() {
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
        const originalText = copyButton.textContent;
        copyButton.textContent = '已复制！';
        copyButton.classList.add('success');
        setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.classList.remove('success');
        }, 1000);
    } catch (err) {
        console.error('复制失败:', err);
        copyButton.textContent = '复制失败';
        copyButton.classList.add('error');
        setTimeout(() => {
            copyButton.textContent = '复制';
            copyButton.classList.remove('error');
        }, 1000);
    }
}

// 初始化事件监听器
function initializeEventListeners() {
    // 复制按钮点击事件
    copyButton.addEventListener('click', copyPassword);

    // 刷新按钮点击事件
    refreshButton.addEventListener('click', generatePassword);

    // 密码类型变更事件
    passwordType.addEventListener('change', () => {
        generatePassword();
        saveConfig();
    });

    // 密码长度变更事件
    passwordLength.addEventListener('input', (e) => {
        lengthValue.textContent = e.target.value;
        generatePassword();
        saveConfig();
    });

    // 数字选项变更事件
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

    // 安全提示信息显示控制函数
    function showSecurityWarning(show) {
        const warningElement = document.getElementById('securityWarning');
        if (warningElement) {
            warningElement.style.display = show ? 'block' : 'none';
        }
    }
}