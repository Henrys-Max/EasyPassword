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

// 密码诊断面板元素
let diagnosisPanel, advantagesList, risksList, suggestionsList;

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
    // 在依赖加载完成后，直接加载配置
    if (passwordOutput) {
        loadSavedConfig();
    }
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
        strengthBar = document.getElementById('strengthBar');
        strengthLabel = document.getElementById('strengthLabel');
        diagnosisPanel = document.getElementById('diagnosisPanel');
        advantagesList = document.getElementById('advantagesList');
        risksList = document.getElementById('risksList');
        suggestionsList = document.getElementById('suggestionsList');

        // 验证所有必需的DOM元素
        if (!copyButton || !refreshButton || !passwordType || !passwordLength || 
            !lengthValue || !includeNumbers || !includeSymbols || !strengthBar || 
            !strengthLabel || !diagnosisPanel || !advantagesList || !risksList || 
            !suggestionsList) {
            throw new Error('部分必需的DOM元素未找到');
        }

        // 更新状态
        passwordOutput.value = '正在设置事件监听器...';
        
        // 添加密码生成成功事件监听器
        // 密码生成成功事件监听器
        window.addEventListener('passwordGenerated', (event) => {
            console.log('密码生成成功');
            if (event.detail && event.detail.password) {
                const password = event.detail.password;
                passwordOutput.value = password;
                
                // 检查PasswordStrength类是否可用
                if (typeof PasswordStrength === 'undefined') {
                    console.error('密码强度评估模块未就绪');
                    return;
                }
                
                try {
                    // 评估密码强度
                    const options = {
                        includeNumbers: includeNumbers.checked,
                        includeSymbols: includeSymbols.checked
                    };
                    const strengthResult = PasswordStrength.evaluateStrength(password, options);
                    
                    // 更新强度指示器
                    strengthBar.style.width = `${strengthResult.score}%`;
                    strengthBar.style.backgroundColor = strengthResult.level.color;
                    
                    // 更新强度标签，分别显示等级和熵值
                    const levelSpan = strengthLabel.querySelector('.level');
                    const entropySpan = strengthLabel.querySelector('.entropy');
                    levelSpan.textContent = `${strengthResult.level.label}`;
                    entropySpan.textContent = `${strengthResult.score}%`;
                    
                    // 更新诊断面板
                    updateDiagnosisPanel(strengthResult);
                    
                    // 如果参数变化导致强度骤降，添加抖动效果
                    if (strengthResult.score < 40) {
                        strengthBar.style.animation = 'shake 0.2s ease-in-out';
                        setTimeout(() => {
                            strengthBar.style.animation = '';
                        }, 200);
                    }
                } catch (error) {
                    console.error('密码强度评估失败:', error);
                    // 设置默认的强度显示
                    strengthBar.style.width = '0%';
                    strengthBar.style.backgroundColor = '#ccc';
                    strengthLabel.querySelector('.level').textContent = '评估失败';
                    strengthLabel.querySelector('.entropy').textContent = '';
                }
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
        const checkDependencies = () => {
            if (passwordGenerator && window.PasswordStrength) {
                loadSavedConfig();
            } else {
                setTimeout(checkDependencies, 100);
            }
        };
        checkDependencies();

        // 更新诊断面板的辅助函数
        function updateDiagnosisPanel(strengthResult) {
            // 清空现有内容
            advantagesList.innerHTML = '';
            risksList.innerHTML = '';
            suggestionsList.innerHTML = '';

            // 添加优势项
            strengthResult.diagnosis.advantages.forEach(advantage => {
                const li = document.createElement('li');
                li.textContent = advantage;
                advantagesList.appendChild(li);
            });

            // 添加风险项
            strengthResult.diagnosis.risks.forEach(risk => {
                const li = document.createElement('li');
                li.textContent = risk;
                risksList.appendChild(li);
            });

            // 添加优化建议
            strengthResult.suggestions.forEach(suggestion => {
                const li = document.createElement('li');
                li.textContent = suggestion;
                suggestionsList.appendChild(li);
            });

            // 根据是否有内容显示或隐藏相应区域
            advantagesList.parentElement.style.display = 
                strengthResult.diagnosis.advantages.length ? 'block' : 'none';
            risksList.parentElement.style.display = 
                strengthResult.diagnosis.risks.length ? 'block' : 'none';
            suggestionsList.parentElement.style.display = 
                strengthResult.suggestions.length ? 'block' : 'none';

            // 显示诊断面板
            diagnosisPanel.classList.add('show');
        }
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

    // 检查密码生成器是否已初始化
    if (!passwordGenerator || typeof passwordGenerator.generateRandomPassword !== 'function') {
        console.error('密码生成器未就绪');
        passwordOutput.value = '密码生成器未就绪，请稍后再试...';
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

    // 密码强度指示器点击事件
    strengthBar.parentElement.addEventListener('click', () => {
        diagnosisPanel.classList.toggle('show');
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

    // 安全提示信息显示控制函数
    function showSecurityWarning(show) {
        const warningElement = document.getElementById('securityWarning');
        if (warningElement) {
            warningElement.style.display = show ? 'block' : 'none';
        }
    }
}