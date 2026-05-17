/**
 * 密码管理模块 V1.0.0
 * 负责处理popup界面的密码生成和强度评估
 */

import { getDOMElements } from './init.js';
import passwordService from '../../lib/core/password/passwordService.js';

// 密码服务初始化状态
let isInitialized = false;

/**
 * 初始化密码管理功能
 */
export const initializePasswordManager = () => {
    if (isInitialized) return;
    
    console.log('初始化密码管理模块...');
    
    // 注册密码生成成功回调
    passwordService.onPasswordGenerated((password, strengthResult) => {
        const { passwordOutput } = getDOMElements();
        if (passwordOutput) {
            passwordOutput.value = password;
            // 更新密码强度UI
            updatePasswordStrengthUI(strengthResult);
        }
    });
    
    // 注册密码生成错误回调
    passwordService.onPasswordError((message) => {
        const { passwordOutput } = getDOMElements();
        if (passwordOutput) {
            passwordOutput.value = '生成失败: ' + message;
            showSecurityWarning(true, `密码生成失败: ${message}`);
        }
    });
    
    // 注册强度评估回调
    passwordService.onStrengthEvaluated((strengthResult) => {
        updatePasswordStrengthUI(strengthResult);
    });
    
    isInitialized = true;
    console.log('密码管理模块初始化完成');
};

/**
 * 生成密码
 */
export const generatePassword = () => {
    console.log('开始生成密码...');
    const { passwordOutput, passwordType, passwordLength, includeNumbers, includeSymbols } = getDOMElements();

    // 验证必需的DOM元素是否存在
    if (!passwordOutput) {
        console.error('密码输出元素未找到');
        return;
    }

    // 显示正在生成状态
    passwordOutput.value = `正在生成${passwordType?.value === 'memorable' ? '易记' : '随机'}密码...`;

    try {
        // 获取参数，使用默认值防止错误
        const type = passwordType?.value || 'random';
        const length = parseInt(passwordLength?.value || '12');
        const useNumbers = includeNumbers?.checked !== false; // 默认为true
        const useSymbols = includeSymbols?.checked || false;

        // 验证参数有效性，使用安全的默认值
        const safeLength = (isNaN(length) || length < 8 || length > 26) ? 12 : length;

        // 记录生成参数
        console.log('密码生成参数:', {
            type,
            length: safeLength,
            useNumbers,
            useSymbols
        });
        
        // 根据类型生成密码
        if (type === 'memorable') {
            // 获取易记密码的额外配置
            const wordCount = document.getElementById('wordCount');
            const separator = document.getElementById('separator');
            const capitalizeFirst = document.getElementById('capitalizeFirst');
            
            // 构建易记密码配置选项
            const memorableOptions = {
                wordCount: wordCount ? parseInt(wordCount.value) : 3,
                separator: separator ? separator.value : '-',
                capitalizeFirst: capitalizeFirst ? capitalizeFirst.checked : true
            };
            
            // 使用密码服务生成易记密码
            passwordService.generateMemorablePassword(memorableOptions);
        } else {
            // 使用密码服务生成随机密码
            passwordService.generateRandomPassword(safeLength, useNumbers, useSymbols);
        }

    } catch (error) {
        console.error('密码生成过程出错:', error);
        passwordOutput.value = '生成失败，请重试...';
        showSecurityWarning(true, '密码生成失败，请重试');
    }
};

/**
 * 更新密码强度UI显示
 * @param {Object} strengthResult - 密码强度评估结果
 */
export const updatePasswordStrengthUI = (strengthResult) => {
    const { strengthBar, strengthLabel } = getDOMElements();
    
    if (!strengthBar || !strengthLabel) {
        console.error('强度指示器元素未找到');
        return;
    }
    
    // 更新强度指示器
    const segments = strengthBar.querySelectorAll('.strength-segment');
    
    // 根据密码强度评分确定激活的段数
    const score = strengthResult.score;
    let activeSegments = 0;
    if (score <= 40) {
        activeSegments = 1;
    } else if (score <= 60) {
        activeSegments = 2;
    } else if (score <= 80) {
        activeSegments = 3;
    } else {
        activeSegments = 4;
    }

    // 根据强度级别设置各段颜色
    segments.forEach((segment, index) => {
        if (index < activeSegments) {
            if (activeSegments === 1) {
                segment.style.backgroundColor = '#e74c3c'; // 红色 - 弱
            } else if (activeSegments === 2) {
                segment.style.backgroundColor = '#f39c12'; // 橙色 - 一般
            } else if (activeSegments === 3) {
                segment.style.backgroundColor = '#2ecc71'; // 绿色 - 强
            } else {
                segment.style.backgroundColor = '#27ae60'; // 深绿色 - 非常强
            }
        } else {
            segment.style.backgroundColor = '#ccc';
        }
    });
    
    // 更新强度标签
    strengthLabel.querySelector('.entropy').textContent = `${window.i18n.getTranslation('entropy')}: ${Math.round(strengthResult.entropy)} bits`;
    strengthLabel.querySelector('.level').textContent = window.i18n.getTranslation(strengthResult.level.label);
    
    // 显示任何相关安全提示
    if (strengthResult.warnings && strengthResult.warnings.length > 0) {
        showSecurityWarning(true, strengthResult.warnings[0]);
    }
};

/**
 * 显示安全警告
 * @param {boolean} show - 是否显示警告
 * @param {string} message - 警告消息
 */
export const showSecurityWarning = (show, message = null) => {
    const securityWarning = document.getElementById('securityWarning');
    // 清除现有的计时器
    if (window.securityWarningTimer) {
        clearTimeout(window.securityWarningTimer);
        window.securityWarningTimer = null;
    }

    if (securityWarning) {
        if (show) {
            if (message) {
                securityWarning.textContent = message;
            }
            securityWarning.classList.add('show');
            // 设置新的3秒计时器
            window.securityWarningTimer = setTimeout(() => {
                securityWarning.classList.remove('show');
                window.securityWarningTimer = null;
            }, 2000);
        } else {
            securityWarning.classList.remove('show');
        }
    }
}; 