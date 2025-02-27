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

// 密码强度指示器元素
let strengthBar, strengthLabel;


// 加载依赖模块
const loadScripts = () => {
    return new Promise((resolve, reject) => {
        const loadScript = (src) => {
            return new Promise((resolveScript, rejectScript) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolveScript;
                script.onerror = (error) => {
                    console.error(`加载模块失败: ${src}`, error);
                    rejectScript(new Error(`加载模块失败: ${src}`));
                };
                document.head.appendChild(script);
            });
        };

        // 按顺序加载所有依赖，确保charset.js和utils.js先加载
        Promise.resolve()
            .then(() => loadScript('/lib/shared/charset.js'))
            .then(() => {
                if (typeof self.CHARSET === 'undefined') {
                    throw new Error('字符集模块加载失败');
                }
                return loadScript('/lib/shared/utils.js');
            })
            .then(() => {
                if (typeof getSecureRandom === 'undefined') {
                    throw new Error('工具函数模块加载失败');
                }
                return loadScript('/lib/shared/strength.js');
            })
            .then(() => loadScript('/lib/password.js'))
            .then(() => {
                // 验证所有必需的模块是否已加载
                if (typeof window.passwordGenerator === 'undefined') {
                    throw new Error('密码生成器核心模块加载失败');
                }
                if (typeof PasswordStrength === 'undefined') {
                    throw new Error('密码强度评估模块加载失败');
                }

                // 初始化全局变量
                passwordGenerator = window.passwordGenerator;
                console.log('所有依赖模块加载成功');
                resolve();
            })
            .catch(reject);
    });
};

// 确保所有依赖加载完成后再初始化
loadScripts().then(() => {
    console.log('所有依赖模块加载完成');
    // 移除这里的配置加载，统一在DOMContentLoaded中处理
    // if (passwordOutput) {
    //     loadSavedConfig();
    // }
}).catch(error => {
    console.error('依赖模块加载失败:', error);
    if (passwordOutput) {
        passwordOutput.value = '依赖模块加载失败：' + error.message;
    }
});

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

        // 初始化密码强度相关元素
        strengthBar = document.querySelector('.strength-segments');
        strengthLabel = document.getElementById('strengthLabel');

        // 验证所有必需的DOM元素
        if (!copyButton || !refreshButton || !passwordType || !passwordLength || 
            !lengthValue || !includeNumbers || !includeSymbols || !strengthBar || 
            !strengthLabel) {
            throw new Error('部分必需的DOM元素未找到');
        }

        // 更新状态
        passwordOutput.value = '正在设置事件监听器...';
        
        // 初始化事件监听器
        initializeEventListeners();

        // 更新状态
        passwordOutput.value = '正在等待密码生成器初始化...';
        
        // 等待密码生成器初始化完成后再加载配置
        const checkDependencies = () => {
            if (passwordGenerator && window.PasswordStrength) {
                loadSavedConfig();
            } else {
                setTimeout(checkDependencies, 100);
            }
        };
        checkDependencies();

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
        const error = new Error('必需的DOM元素未找到');
        console.error(error);
        if (passwordOutput) {
            passwordOutput.value = '初始化失败：' + error.message;
        }
        return;
    }

    // 检查密码生成器是否已初始化
    if (!passwordGenerator) {
        const error = new Error('密码生成器未初始化');
        console.error(error);
        passwordOutput.value = '等待初始化：' + error.message;
        // 定期检查密码生成器是否已初始化
        const checkGenerator = setInterval(() => {
            if (passwordGenerator) {
                clearInterval(checkGenerator);
                generatePassword();
            }
        }, 100);
        return;
    }

    // 检查密码生成器方法是否可用
    if (typeof passwordGenerator.generateRandomPassword !== 'function' || 
        typeof passwordGenerator.generateMemorablePassword !== 'function') {
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
        if (isNaN(length) || length < 8 || length > 20) {
            throw new Error('密码长度必须在8-20位之间');
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

        // 根据类型生成密码
        console.log('开始生成密码...');
        
        // 添加事件监听器处理密码生成结果
        const handlePasswordGenerated = (event) => {
            const { password } = event.detail;
            passwordOutput.value = password;
            
            // 评估密码强度并更新UI
            const strengthResult = PasswordStrength.evaluateStrength(password);
            
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
                    segment.style.backgroundColor = '#006400';
                } else {
                    segment.style.backgroundColor = '#ccc';
                }
            });
            
            // 更新强度标签
            strengthLabel.querySelector('.entropy').textContent = `${window.i18n.getTranslation('entropy')}: ${Math.round(strengthResult.entropy)} bits`;
            strengthLabel.querySelector('.level').textContent = window.i18n.getTranslation(strengthResult.level.label);
            

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
            passwordGenerator.generateRandomPassword(length, useNumbers, useSymbols);
        } else {
            console.log('开始生成易记密码...');
            passwordGenerator.generateMemorablePassword(length, useNumbers, useSymbols);
        }

    } catch (error) {
        console.error('密码生成过程出错:', error);
        passwordOutput.value = '生成失败：' + error.message;
    }
}

// 定时器变量
let copyButtonTimer;

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
        const originalText = window.i18n.getTranslation('copy');
        
        // 清除之前的定时器并重置按钮状态
        if (copyButtonTimer) {
            clearTimeout(copyButtonTimer);
            copyButton.textContent = originalText;
            copyButton.classList.remove('success', 'error');
        }
        
        // 使用i18n获取当前语言的提示文本
        copyButton.textContent = window.i18n.getTranslation('copied');
        copyButton.classList.add('success');
        
        // 保存新的定时器引用
        copyButtonTimer = setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.classList.remove('success');
        }, 1000);
    } catch (err) {
        console.error('复制失败:', err);
        const originalText = window.i18n.getTranslation('copy');
        
        // 清除之前的定时器并重置按钮状态
        if (copyButtonTimer) {
            clearTimeout(copyButtonTimer);
            copyButton.textContent = originalText;
            copyButton.classList.remove('success', 'error');
        }
        
        // 使用i18n获取当前语言的失败提示文本
        copyButton.textContent = window.i18n.getTranslation('copyFailed');
        copyButton.classList.add('error');
        
        // 保存新的定时器引用
        copyButtonTimer = setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.classList.remove('error');
        }, 1000);
    }
}

// 初始化事件监听器
function initializeEventListeners() {
    // 复制按钮点击事件
    copyButton.addEventListener('click', copyPassword);

    // 刷新按钮点击事件
    refreshButton.addEventListener('click', () => {
        const refreshIcon = refreshButton.querySelector('.refresh-icon');
        refreshIcon.classList.add('rotate');
        setTimeout(() => {
            refreshIcon.classList.remove('rotate');
        }, 500);
        generatePassword();
    });



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


}
// 显示或隐藏安全提示信息
function showSecurityWarning(show) {
    const warningElement = document.getElementById('securityWarning');
    if (!warningElement) return;

    if (show) {
        warningElement.style.display = 'block';
        // 使用setTimeout确保display属性生效后再添加show类
        setTimeout(() => {
            warningElement.classList.add('show');
        }, 10);
        // 2.5秒后自动隐藏
        setTimeout(() => {
            warningElement.classList.remove('show');
            // 等待过渡动画完成后再隐藏元素
            setTimeout(() => {
                warningElement.style.display = 'none';
            }, 300);
        }, 2500);
    } else {
        warningElement.classList.remove('show');
        // 等待过渡动画完成后再隐藏元素
        setTimeout(() => {
            warningElement.style.display = 'none';
        }, 300);
    }
}