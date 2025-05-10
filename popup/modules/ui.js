/**
 * UI交互模块 V1.2.0
 * 负责处理界面交互和事件监听
 * 
 * 更新说明：
 * 1. 集成新的密码管理模块
 * 2. 优化事件监听和错误处理
 * 3. 改进UI交互体验
 */

import { getDOMElements } from './init.js';
import { saveConfig } from './config.js';
import { generatePassword, showSecurityWarning, evaluatePasswordStrength } from './password-manager.js';
import passwordService from '../../lib/core/password/passwordService.js';

// 初始化事件监听器
export const initializeEventListeners = () => {
    try {
        const { 
            copyButton, 
            refreshButton, 
            passwordLength, 
            lengthValue,
            includeNumbers,
            includeSymbols,
            passwordType,
            passwordOutput
        } = getDOMElements();

        // 复制按钮事件监听
        copyButton.addEventListener('click', handleCopyPassword);
        
        // 刷新按钮事件监听
        refreshButton.addEventListener('click', handleRefreshPassword);
        
        // 密码长度滑块事件监听
        passwordLength.addEventListener('input', handlePasswordLengthChange);
        
        // 选项更改事件监听
        includeNumbers.addEventListener('change', handleOptionChange);
        includeSymbols.addEventListener('change', handleOptionChange);
        
        // 密码类型切换事件监听
        const passwordTypeRadios = document.querySelectorAll('input[name="passwordType"]');
        passwordTypeRadios.forEach(radio => {
            radio.addEventListener('change', handlePasswordTypeChange);
        });
        
        // 为易记密码选项添加事件监听
        const wordCount = document.getElementById('wordCount');
        const wordCountValue = document.getElementById('wordCountValue');
        if (wordCount && wordCountValue) {
            wordCount.addEventListener('input', (event) => {
                wordCountValue.textContent = event.target.value;
                handleOptionChange();
            });
        }

        // 为其他易记密码选项添加事件监听
        const memorableOptions = document.querySelectorAll('#memorableOptions select, #memorableOptions input[type="checkbox"]');
        memorableOptions.forEach(option => {
            option.addEventListener('change', handleOptionChange);
        });
        
        // 当用户手动编辑密码时，实时评估强度
        if (passwordOutput) {
            passwordOutput.addEventListener('input', handleManualPasswordChange);
        }
        
        // 初始根据当前密码类型显示相应选项
        handlePasswordTypeChange({ target: passwordType });
        
        // 注册密码服务事件，使UI能够响应密码状态变化
        setupPasswordServiceEvents();
        
        console.log('事件监听器初始化成功');
    } catch (error) {
        console.error('初始化事件监听器失败:', error);
    }
};

/**
 * 设置密码服务事件监听
 * 确保UI能够实时响应密码状态变化
 */
const setupPasswordServiceEvents = () => {
    // 密码生成成功时更新界面状态
    passwordService.onPasswordGenerated((password, strengthResult) => {
        // 启用复制按钮
        const { copyButton } = getDOMElements();
        if (copyButton) {
            copyButton.disabled = false;
        }
    });
    
    // 密码生成错误时更新界面状态
    passwordService.onPasswordError((message) => {
        // 禁用复制按钮
        const { copyButton } = getDOMElements();
        if (copyButton) {
            copyButton.disabled = true;
        }
    });
    
    // 强度评估时更新界面状态
    passwordService.onStrengthEvaluated((strengthResult) => {
        // 根据强度结果更新安全提示
        if (strengthResult.score < 50) {
            showSecurityWarning(true, '密码较弱，建议增加长度');
        }
    });
};

// 处理密码复制按钮点击
const handleCopyPassword = () => {
    const { passwordOutput, copyButton } = getDOMElements();
    
    // 验证密码不为空且不是错误状态
    if (!passwordOutput.value || 
        passwordOutput.value.includes('初始化') || 
        passwordOutput.value.includes('失败') || 
        passwordOutput.value.includes('生成中')) {
        showSecurityWarning(true, '无法复制：密码无效');
        return;
    }
    
    try {
        // 复制到剪贴板
        passwordOutput.select();
        document.execCommand('copy');
        
        // 更新按钮文本指示
        const originalText = copyButton.textContent;
        copyButton.textContent = window.i18n.getTranslation('copied');
        
        // 显示成功提示
        showSecurityWarning(true, window.i18n.getTranslation('copiedToClipboard'));
        
        // 重置按钮文本
        setTimeout(() => {
            copyButton.textContent = originalText;
        }, 2000);
    } catch (error) {
        console.error('复制密码失败:', error);
        showSecurityWarning(true, window.i18n.getTranslation('copyFailed'));
    }
};

// 处理刷新密码按钮点击
const handleRefreshPassword = () => {
    generatePassword();
};

// 处理密码长度变化
const handlePasswordLengthChange = (event) => {
    const { lengthValue } = getDOMElements();
    // 更新长度值显示
    lengthValue.textContent = event.target.value;
    // 更新配置
    saveConfig();
    // 生成新密码
    generatePassword();
};

/**
 * 处理用户手动编辑密码
 */
const handleManualPasswordChange = (event) => {
    const password = event.target.value;
    // 仅在密码长度大于0时评估
    if (password && password.length > 0) {
        // 使用密码服务评估密码强度
        evaluatePasswordStrength(password);
    }
};

// 处理密码选项更改
const handleOptionChange = () => {
    // 保存新配置
    saveConfig();
    // 生成新密码
    generatePassword();
};

// 处理密码类型切换
const handlePasswordTypeChange = (event) => {
    const randomOptions = document.getElementById('randomOptions');
    const memorableOptions = document.getElementById('memorableOptions');
    
    if (event.target.value === 'memorable') {
        randomOptions.style.display = 'none';
        memorableOptions.style.display = 'block';
    } else {
        randomOptions.style.display = 'block';
        memorableOptions.style.display = 'none';
    }
    
    // 保存新配置
    saveConfig();
    // 生成新密码
    generatePassword();
};