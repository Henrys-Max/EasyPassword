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
    
    // 设置超时标志，确保不会无限等待
    let configLoaded = false;
    const timeoutId = setTimeout(() => {
        if (!configLoaded) {
            console.warn('配置加载超时，使用默认配置');
            passwordOutput.value = '配置加载超时，使用默认配置...';
            // 使用默认配置生成密码
            generatePassword();
        }
    }, 3000); // 3秒超时
    
    try {
        // 检查必需的依赖，但不再递归等待
        // 即使依赖未完全加载，也尝试继续执行
        const dependenciesLoaded = window.passwordGenerator && window.PasswordStrength;
        if (!dependenciesLoaded) {
            console.warn('部分依赖模块未加载完成，使用有限功能继续');
        }

        // 默认配置
        const defaultConfig = {
            passwordType: 'random',
            passwordLength: 12,
            includeNumbers: true,
            includeSymbols: false,
            wordCount: 3,
            separator: '-',
            capitalizeFirst: true
        };

        // 尝试从存储中获取配置
        try {
            chrome.storage.sync.get(defaultConfig, (config) => {
                configLoaded = true;
                clearTimeout(timeoutId);
                
                try {
                    // 更新UI元素的值
                    const typeRadio = document.querySelector(`input[name="passwordType"][value="${config.passwordType}"]`);
                    if (typeRadio) typeRadio.checked = true;
                    
                    if (passwordLength) passwordLength.value = config.passwordLength;
                    if (lengthValue) lengthValue.textContent = config.passwordLength;
                    if (includeNumbers) includeNumbers.checked = config.includeNumbers;
                    if (includeSymbols) includeSymbols.checked = config.includeSymbols;
                    
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
                    passwordOutput.value = '配置应用失败，使用默认配置...';
                    // 出错时使用默认配置
                    generatePassword();
                }
            });
        } catch (storageError) {
            // 存储访问失败时使用默认配置
            console.error('存储访问失败:', storageError);
            configLoaded = true;
            clearTimeout(timeoutId);
            passwordOutput.value = '配置存储访问失败，使用默认配置...';
            generatePassword();
        }
    } catch (error) {
        // 确保清除超时计时器
        configLoaded = true;
        clearTimeout(timeoutId);
        
        console.error('加载配置失败:', error);
        passwordOutput.value = '加载配置失败，使用默认配置...';
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