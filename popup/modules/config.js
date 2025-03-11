/**
 * 配置管理模块
 * 负责处理配置的加载和保存
 */

import { getDOMElements } from './init.js';
import { generatePassword } from './password.js';

// 加载保存的配置
export const loadSavedConfig = () => {
    const {
        passwordOutput,
        passwordType,
        passwordLength,
        lengthValue,
        includeNumbers,
        includeSymbols
    } = getDOMElements();

    // 更新状态提示
    passwordOutput.value = '正在加载配置...';
    try {
        // 检查所有必需的依赖是否已加载
        if (!window.passwordGenerator || !window.PasswordStrength) {
            console.warn('等待依赖模块加载完成...');
            setTimeout(loadSavedConfig, 100);
            return;
        }

        chrome.storage.sync.get({
            passwordType: 'random',
            passwordLength: 12,
            includeNumbers: true,
            includeSymbols: false,
            wordCount: 3,
            separator: '-',
            capitalizeFirst: true
        }, (config) => {
            try {
                // 更新UI元素的值
                document.querySelector(`input[name="passwordType"][value="${config.passwordType}"]`).checked = true;
                passwordLength.value = config.passwordLength;
                lengthValue.textContent = config.passwordLength;
                includeNumbers.checked = config.includeNumbers;
                includeSymbols.checked = config.includeSymbols;
                
                // 更新易记密码配置UI
                const wordCount = document.getElementById('wordCount');
                const wordCountValue = document.getElementById('wordCountValue');
                const separator = document.getElementById('separator');
                const capitalizeFirst = document.getElementById('capitalizeFirst');
                
                if (wordCount) wordCount.value = config.wordCount;
                if (wordCountValue) wordCountValue.textContent = config.wordCount;
                if (separator) separator.value = config.separator;
                if (capitalizeFirst) capitalizeFirst.checked = config.capitalizeFirst;
                
                // 根据密码类型切换配置面板
                toggleConfigPanel(config.passwordType);

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
};

// 保存配置
export const saveConfig = () => {
    const { passwordType, passwordLength, includeNumbers, includeSymbols } = getDOMElements();

    // 获取易记密码配置值
    const wordCount = document.getElementById('wordCount');
    const separator = document.getElementById('separator');
    const capitalizeFirst = document.getElementById('capitalizeFirst');
    
    const config = {
        passwordType: passwordType.value,
        passwordLength: parseInt(passwordLength.value),
        includeNumbers: includeNumbers.checked,
        includeSymbols: includeSymbols.checked,
        wordCount: wordCount ? parseInt(wordCount.value) : 3,
        separator: separator ? separator.value : '-',
        capitalizeFirst: capitalizeFirst ? capitalizeFirst.checked : true
    };

    chrome.storage.sync.set(config, () => {
        console.log('配置已保存');
    });
};

// 切换配置面板
export const toggleConfigPanel = (type) => {
    const memorableOptions = document.getElementById('memorableOptions');
    const randomOptions = document.getElementById('randomOptions');
    
    if (type === 'memorable') {
        if (memorableOptions) memorableOptions.style.display = 'block';
        if (randomOptions) randomOptions.style.display = 'none';
    } else {
        if (memorableOptions) memorableOptions.style.display = 'none';
        if (randomOptions) randomOptions.style.display = 'block';
    }
};