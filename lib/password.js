/**
 * 密码生成器类 V1.1.0
 * 提供安全且易用的密码生成功能，支持随机密码和易记忆密码的生成
 * 
 * 主要功能：
 * 1. 生成随机乱序密码：使用密码学安全的随机数生成器，确保密码强度
 * 2. 生成易记忆密码：基于常用单词组合，提高密码可记忆性
 * 3. 支持自定义密码规则：灵活配置长度、字符类型等参数
 * 
 * 安全特性：
 * - 使用Web Worker实现异步密码生成，避免阻塞主线程
 * - 采用Web Crypto API生成高质量随机数，保证密码随机性
 * - 实现多重密码复杂度校验，包括熵值计算和模式检测
 * - 防止键盘序列和连续重复字符，增强密码安全性
 * - 排除易混淆字符，提高密码可用性和准确性
 * - 智能分布特殊字符，确保密码结构均衡
 * 
 * 技术实现：
 * - 采用事件驱动架构，实现异步操作和状态管理
 * - 使用模块化设计，分离核心逻辑和界面交互
 * - 实现完整的错误处理机制，包括参数验证和异常恢复
 * - 支持配置持久化，提供一致的用户体验
 * - 优化的性能表现，快速响应用户操作
 */

// 使用传统方式加载依赖
const scriptCharset = document.createElement('script');
scriptCharset.src = '/lib/shared/charset.js';
document.head.appendChild(scriptCharset);

const scriptUtils = document.createElement('script');
scriptUtils.src = '/lib/shared/utils.js';
document.head.appendChild(scriptUtils);

class PasswordGenerator {
    /**
     * 初始化密码生成器
     * 定义基本字符集，排除易混淆的字符以提高可读性
     * 初始化Web Worker用于后台密码生成
     */
    constructor() {
        // 预定义的常用单词列表（用于生成易记的密码）
        this.commonWords = [
            'Blue', 'Red', 'Green', 'Yellow', 'Purple',
            'Tiger', 'Lion', 'Eagle', 'Bear', 'Wolf',
            'Moon', 'Star', 'Sun', 'Cloud', 'Rain',
            'River', 'Mountain', 'Ocean', 'Forest', 'Desert'
        ];
    
        // 初始化Web Worker，使用绝对路径
        this.worker = new Worker('/lib/worker.js');
        this.worker.onmessage = this.handleWorkerMessage.bind(this);
        this.worker.onerror = this.handleWorkerError.bind(this);
    }

    // Web Worker消息处理方法
    handleWorkerMessage(event) {
        const { type, password, message } = event.data;
        if (type === 'success') {
            // 触发密码生成成功事件
            window.dispatchEvent(new CustomEvent('passwordGenerated', {
                detail: { 
                    password,
                    message: '密码生成成功：已生成符合要求的安全密码'
                },
                bubbles: true,
                composed: true
            }));
        } else if (type === 'error') {
            // 触发密码生成失败事件
            window.dispatchEvent(new CustomEvent('passwordError', {
                detail: { 
                    message: '密码生成失败：' + message,
                    error: message
                },
                bubbles: true,
                composed: true
            }));
        }
    }

    handleWorkerError(error) {
        // 触发Worker错误事件
        window.dispatchEvent(new CustomEvent('passwordError', {
            detail: { 
                message: '密码生成器内部错误：' + error.message,
                error: error.message
            },
            bubbles: true,
            composed: true
        }));
    }

    /**
     * 生成随机乱序密码
     * @param {number} length - 密码长度（8-20位）
     * @param {boolean} includeNumbers - 是否包含数字
     * @param {boolean} includeSymbols - 是否包含特殊符号
     * @returns {void} 通过事件返回生成的密码
     */
    generateRandomPassword(length, includeNumbers, includeSymbols) {
        // 验证参数
        if (length < 8 || length > 20) {
            throw new Error('密码长度必须在8-20位之间');
        }

        // 使用Web Worker生成密码
        this.worker.postMessage({
            type: 'generate',
            options: { length, includeNumbers, includeSymbols }
        });
    }

    /**
     * 生成易记的密码（基于单词组合）
     * @param {number} length - 目标密码长度
     * @param {boolean} includeNumbers - 是否包含数字
     * @param {boolean} includeSymbols - 是否包含特殊符号
     * @returns {string} 生成的易记密码
     */
    generateMemorablePassword(length, includeNumbers, includeSymbols) {
        // 验证参数
        if (length < 8 || length > 20) {
            throw new Error('密码长度必须在8-20位之间');
        }

        // 使用Web Worker生成密码
        this.worker.postMessage({
            type: 'generate_memorable',
            options: { 
                length, 
                includeNumbers, 
                includeSymbols,
                commonWords: this.commonWords
            }
        });
    }
    }
    
// 创建密码生成器实例并设为全局变量
window.passwordGenerator = new PasswordGenerator();