/**
 * 配置管理模块 V1.2.0
 * 负责处理用户配置的保存、加载和同步
 * 
 * 更新说明：
 * 1. 与新的密码管理模块集成
 * 2. 优化配置加载和保存逻辑
 * 3. 改进错误处理机制
 */

import { getDOMElements } from './init.js';
import { generatePassword } from './password-manager.js';

// 默认配置
const DEFAULT_CONFIG = {
    passwordType: 'random',
    passwordLength: 15,
    includeNumbers: true,
    includeSymbols: false,
    wordCount: 3,
    separator: '-',
    capitalizeFirst: true
};

// 保存当前配置到本地存储
export const saveConfig = () => {
    try {
        const { 
            passwordType, 
            passwordLength, 
            includeNumbers, 
            includeSymbols 
        } = getDOMElements();

        const config = {
            passwordType: passwordType?.value || DEFAULT_CONFIG.passwordType,
            passwordLength: passwordLength?.value || DEFAULT_CONFIG.passwordLength,
            includeNumbers: includeNumbers?.checked ?? DEFAULT_CONFIG.includeNumbers,
            includeSymbols: includeSymbols?.checked ?? DEFAULT_CONFIG.includeSymbols
        };

        // 读取易记密码配置
        const wordCount = document.getElementById('wordCount');
        const separator = document.getElementById('separator');
        const capitalizeFirst = document.getElementById('capitalizeFirst');

        if (wordCount) {
            config.wordCount = parseInt(wordCount.value) || DEFAULT_CONFIG.wordCount;
        }

        if (separator) {
            config.separator = separator.value || DEFAULT_CONFIG.separator;
        }

        if (capitalizeFirst) {
            config.capitalizeFirst = capitalizeFirst.checked ?? DEFAULT_CONFIG.capitalizeFirst;
        }

        // 使用Chrome存储API保存配置
        chrome.storage.sync.set({ passwordConfig: config }, () => {
            console.log('配置已保存', config);
        });
    } catch (error) {
        console.error('保存配置失败:', error);
    }
};

// 从本地存储加载配置
export const loadSavedConfig = () => {
    try {
        chrome.storage.sync.get('passwordConfig', (data) => {
            const savedConfig = data.passwordConfig || DEFAULT_CONFIG;
            console.log('加载已保存的配置', savedConfig);
            
            applyConfig(savedConfig);
        });
    } catch (error) {
        console.error('加载配置失败:', error);
        // 使用默认配置
        applyConfig(DEFAULT_CONFIG);
    }
};

// 应用配置到界面
const applyConfig = (config) => {
    try {
        const { 
            passwordType, 
            passwordLength, 
            lengthValue, 
            includeNumbers, 
            includeSymbols 
        } = getDOMElements();

        // 更新密码类型
        const passwordTypeRadio = document.querySelector(`input[name="passwordType"][value="${config.passwordType}"]`);
        if (passwordTypeRadio) {
            passwordTypeRadio.checked = true;

            // 切换配置面板
            const randomOptions = document.getElementById('randomOptions');
            const memorableOptions = document.getElementById('memorableOptions');
            
            if (config.passwordType === 'memorable') {
                randomOptions.style.display = 'none';
                memorableOptions.style.display = 'block';
            } else {
                randomOptions.style.display = 'block';
                memorableOptions.style.display = 'none';
            }
        }

        // 更新密码长度
        if (passwordLength && lengthValue) {
            passwordLength.value = config.passwordLength;
            lengthValue.textContent = config.passwordLength;
        }

        // 更新数字选项
        if (includeNumbers) {
            includeNumbers.checked = config.includeNumbers;
        }

        // 更新符号选项
        if (includeSymbols) {
            includeSymbols.checked = config.includeSymbols;
        }

        // 更新易记密码选项
        const wordCount = document.getElementById('wordCount');
        const wordCountValue = document.getElementById('wordCountValue');
        const separator = document.getElementById('separator');
        const capitalizeFirst = document.getElementById('capitalizeFirst');

        if (wordCount && wordCountValue && config.wordCount) {
            wordCount.value = config.wordCount;
            wordCountValue.textContent = config.wordCount;
        }

        if (separator && config.separator) {
            separator.value = config.separator;
        }

        if (capitalizeFirst && config.capitalizeFirst !== undefined) {
            capitalizeFirst.checked = config.capitalizeFirst;
        }

        // 生成初始密码
        generatePassword();
    } catch (error) {
        console.error('应用配置失败:', error);
    }
};