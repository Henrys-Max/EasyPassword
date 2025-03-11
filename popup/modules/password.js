/**
 * 密码生成和强度计算模块
 * 负责处理密码生成和密码强度评估
 */

import { getDOMElements } from './init.js';

// 生成密码
export const generatePassword = () => {
    console.log('开始生成密码...');
    const { passwordOutput, passwordType, passwordLength, includeNumbers, includeSymbols } = getDOMElements();

    // 验证必需的DOM元素是否存在
    if (!passwordOutput || !passwordType || !passwordLength || !includeNumbers || !includeSymbols) {
        const error = new Error('必需的DOM元素未找到');
        console.error(error);
        if (passwordOutput) {
            passwordOutput.value = '初始化失败：' + error.message;
        }
        return;
    }

    // 检查密码生成器是否已初始化
    if (!window.passwordGenerator) {
        const error = new Error('密码生成器未初始化');
        console.error(error);
        passwordOutput.value = '等待初始化：' + error.message;
        // 定期检查密码生成器是否已初始化
        const checkGenerator = setInterval(() => {
            if (window.passwordGenerator) {
                clearInterval(checkGenerator);
                generatePassword();
            }
        }, 100);
        return;
    }

    // 检查密码生成器方法是否可用
    if (typeof window.passwordGenerator.generateRandomPassword !== 'function' || 
        typeof window.passwordGenerator.generateMemorablePassword !== 'function') {
        const error = new Error('密码生成器功能不完整');
        console.error(error);
        passwordOutput.value = '初始化错误：' + error.message;
        return;
    }

    try {
        // 获取并验证参数
        const type = passwordType.value;
        const length = parseInt(passwordLength.value);
        const useNumbers = includeNumbers.checked;
        const useSymbols = includeSymbols.checked;

        // 验证参数有效性
        if (isNaN(length) || length < 8 || length > 26) {
            throw new Error('密码长度必须在8-26位之间');
        }

        // 更新状态提示
        passwordOutput.value = `正在生成${type === 'random' ? '随机' : '易记'}密码...`;

        // 记录生成参数
        console.log('密码生成参数:', {
            type,
            length,
            useNumbers,
            useSymbols
        });

        // 添加事件监听器处理密码生成结果
        const handlePasswordGenerated = (event) => {
            const { password } = event.detail;
            passwordOutput.value = password;
            
            // 评估密码强度并更新UI
            updatePasswordStrength(password);

            // 移除事件监听器
            window.removeEventListener('passwordGenerated', handlePasswordGenerated);
            window.removeEventListener('passwordError', handlePasswordError);
        };

        const handlePasswordError = (event) => {
            const { message } = event.detail;
            console.error('密码生成失败:', message);
            passwordOutput.value = '生成失败：' + message;
            // 移除事件监听器
            window.removeEventListener('passwordGenerated', handlePasswordGenerated);
            window.removeEventListener('passwordError', handlePasswordError);
        };

        // 添加事件监听器
        window.addEventListener('passwordGenerated', handlePasswordGenerated);
        window.addEventListener('passwordError', handlePasswordError);

        // 调用密码生成方法
        if (type === 'random') {
            console.log('开始生成随机密码...');
            window.passwordGenerator.generateRandomPassword(length, useNumbers, useSymbols);
        } else {
            console.log('开始生成易记密码...');
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
            
            window.passwordGenerator.generateMemorablePassword(memorableOptions);
        }

    } catch (error) {
        console.error('密码生成过程出错:', error);
        passwordOutput.value = '生成失败：' + error.message;
    }
};

// 更新密码强度显示
const updatePasswordStrength = (password) => {
    const { strengthBar, strengthLabel } = getDOMElements();
    
    // 评估密码强度
    const strengthResult = window.PasswordStrength.evaluateStrength(password);
    
    // 更新强度指示器
    const segments = strengthBar.querySelectorAll('.strength-segment');
    // 重置所有段的状态
    segments.forEach(segment => {
        segment.classList.remove('active');
        segment.style.backgroundColor = '#ccc';
    });
    
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

    // 重置并激活指示器段，统一使用深绿色
    segments.forEach((segment, index) => {
        segment.classList.remove('active');
        if (index < activeSegments) {
            segment.classList.add('active');
            segment.style.backgroundColor = '#3872e0';
        } else {
            segment.style.backgroundColor = '#ccc';
        }
    });
    
    // 更新强度标签
    strengthLabel.querySelector('.entropy').textContent = `${window.i18n.getTranslation('entropy')}: ${Math.round(strengthResult.entropy)} bits`;
    strengthLabel.querySelector('.level').textContent = window.i18n.getTranslation(strengthResult.level.label);
};

// 显示安全警告
export const showSecurityWarning = (show) => {
    const securityWarning = document.getElementById('securityWarning');
    // 清除现有的计时器
    if (window.securityWarningTimer) {
        clearTimeout(window.securityWarningTimer);
        window.securityWarningTimer = null;
    }

    if (securityWarning) {
        if (show) {
            securityWarning.classList.add('show');
            // 设置新的3秒计时器
            window.securityWarningTimer = setTimeout(() => {
                securityWarning.classList.remove('show');
                window.securityWarningTimer = null;
            }, 3000);
        } else {
            securityWarning.classList.remove('show');
        }
    }
};