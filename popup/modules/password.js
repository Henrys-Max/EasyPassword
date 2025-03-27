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
    if (!passwordOutput) {
        console.error('密码输出元素未找到');
        return;
    }

    // 设置超时处理，确保不会无限等待
    let passwordGenerated = false;
    const timeoutId = setTimeout(() => {
        if (!passwordGenerated) {
            console.warn('密码生成超时，使用备用方法');
            passwordOutput.value = '生成超时，请重试...';
            // 移除可能的事件监听器
            window.removeEventListener('passwordGenerated', handlePasswordGenerated);
            window.removeEventListener('passwordError', handlePasswordError);
        }
    }, 3000); // 3秒超时

    // 检查密码生成器是否已初始化
    if (!window.passwordGenerator) {
        console.warn('密码生成器未初始化，使用备用方法');
        passwordOutput.value = '生成器未就绪，请稍后再试...';
        
        // 最多等待2秒钟
        let attempts = 0;
        const maxAttempts = 20;
        const checkGenerator = setInterval(() => {
            if (window.passwordGenerator) {
                clearInterval(checkGenerator);
                generatePassword();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkGenerator);
                passwordOutput.value = '生成器初始化失败，请刷新页面重试';
            }
            attempts++;
        }, 100);
        return;
    }

    try {
        // 获取参数，使用默认值防止错误
        const type = passwordType?.value || 'random';
        const length = parseInt(passwordLength?.value || '12');
        const useNumbers = includeNumbers?.checked !== false; // 默认为true
        const useSymbols = includeSymbols?.checked || false;

        // 验证参数有效性，使用安全的默认值
        const safeLength = (isNaN(length) || length < 8 || length > 26) ? 12 : length;

        // 更新状态提示
        passwordOutput.value = `正在生成${type === 'random' ? '随机' : '易记'}密码...`;

        // 记录生成参数
        console.log('密码生成参数:', {
            type,
            length: safeLength,
            useNumbers,
            useSymbols
        });

        // 添加事件监听器处理密码生成结果
        const handlePasswordGenerated = (event) => {
            passwordGenerated = true;
            clearTimeout(timeoutId);
            
            const { password } = event.detail;
            passwordOutput.value = password;
            
            // 评估密码强度并更新UI
            try {
                if (window.PasswordStrength) {
                    updatePasswordStrength(password);
                }
            } catch (strengthError) {
                console.warn('密码强度评估失败:', strengthError);
            }

            // 移除事件监听器
            window.removeEventListener('passwordGenerated', handlePasswordGenerated);
            window.removeEventListener('passwordError', handlePasswordError);
        };

        const handlePasswordError = (event) => {
            passwordGenerated = true;
            clearTimeout(timeoutId);
            
            const { message } = event.detail;
            console.error('密码生成失败:', message);
            passwordOutput.value = '生成失败，请重试...';
            
            // 移除事件监听器
            window.removeEventListener('passwordGenerated', handlePasswordGenerated);
            window.removeEventListener('passwordError', handlePasswordError);
        };

        // 添加事件监听器
        window.addEventListener('passwordGenerated', handlePasswordGenerated);
        window.addEventListener('passwordError', handlePasswordError);

        // 检查密码生成器方法是否可用
        const canGenerateRandom = typeof window.passwordGenerator.generateRandomPassword === 'function';
        const canGenerateMemorable = typeof window.passwordGenerator.generateMemorablePassword === 'function';
        
        if (!canGenerateRandom && !canGenerateMemorable) {
            throw new Error('密码生成器功能不可用');
        }

        // 调用密码生成方法
        if (type === 'memorable' && canGenerateMemorable) {
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
        } else {
            // 默认生成随机密码
            console.log('开始生成随机密码...');
            if (canGenerateRandom) {
                window.passwordGenerator.generateRandomPassword(safeLength, useNumbers, useSymbols);
            } else if (canGenerateMemorable) {
                // 如果随机密码生成不可用，尝试使用易记密码
                window.passwordGenerator.generateMemorablePassword();
            } else {
                throw new Error('无法生成密码');
            }
        }

    } catch (error) {
        // 确保清除超时计时器
        passwordGenerated = true;
        clearTimeout(timeoutId);
        
        console.error('密码生成过程出错:', error);
        passwordOutput.value = '生成失败，请重试...';
        
        // 移除可能的事件监听器
        window.removeEventListener('passwordGenerated', handlePasswordGenerated);
        window.removeEventListener('passwordError', handlePasswordError);
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