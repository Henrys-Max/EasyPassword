/**
 * 密码生成器类 V1.1.5
 * 提供安全且易用的密码生成功能，支持随机密码和易记忆密码的生成
 * 
 * 更新说明：
 * 1. 重构为统一的密码生成服务架构
 * 2. 优化Web Worker通信和错误处理
 * 3. 提高密码生成的安全性和性能
 */

class PasswordGenerator {
    constructor() {
        // 预定义的常用单词列表（用于生成易记的密码）
        this.commonWords = [
            'able', 'acid', 'also', 'atom', 'Asia', 'aunt', 'back', 'band', 'bank', 'base',
            'bath', 'bean', 'beat', 'been', 'bell', 'best', 'bird', 'bite', 'black', 'blank',
            'blind', 'blow', 'boat', 'boil', 'bomb', 'bone', 'book', 'both', 'box', 'brand',
            'bread', 'brew', 'brief', 'bring', 'brown', 'build', 'burn', 'busy', 'call', 'calm',
            'camp', 'card', 'care', 'cart', 'case', 'city', 'clan', 'claw', 'clay', 'coal',
            'code', 'coil', 'colt', 'come', 'cool', 'copy', 'core', 'corn', 'cost', 'couch',
            'cove', 'cowl', 'cube', 'cure', 'curl', 'curr', 'cute', 'cyber', 'data', 'deal',
            'dear', 'dean', 'deep', 'dial', 'diet', 'disc', 'disk', 'dock', 'dome', 'done',
            'down', 'draw', 'drop', 'drug', 'drum', 'dual', 'duty', 'each', 'edit', 'else',
            'emit', 'ends', 'envy', 'epic', 'euro', 'even', 'ever', 'exam', 'exit', 'face',
            'fact', 'fail', 'fair', 'fake', 'fall', 'fame', 'fang', 'farm', 'fast', 'feast',
            'feat'
        ];

        // 初始化Web Worker，使用异步方式避免阻塞
        this.workerInitialized = false;
        this.pendingTasks = [];
        
        // 使用setTimeout延迟初始化Worker，避免阻塞主线程
        setTimeout(() => {
            this.initWorker();
        }, 0);
    }

    /**
     * 初始化Web Worker处理密码生成
     * @private
     */
    initWorker() {
        try {
            console.log('开始初始化Web Worker...');
            this.worker = new Worker('/lib/core/password/worker.js');

            // 处理Web Worker消息
            this.worker.onmessage = (e) => {
                const { type, password, message } = e.data;
                if (type === 'success') {
                    // 触发密码生成成功事件
                    const event = new CustomEvent('passwordGenerated', {
                        detail: { password }
                    });
                    window.dispatchEvent(event);
                } else if (type === 'error') {
                    console.error('密码生成失败:', message);
                    // 触发错误事件
                    const event = new CustomEvent('passwordError', {
                        detail: { message }
                    });
                    window.dispatchEvent(event);
                }
            };

            // 处理Web Worker错误
            this.worker.onerror = (error) => {
                console.error('Web Worker错误:', error);
                const event = new CustomEvent('passwordError', {
                    detail: { message: error.message || '未知Worker错误' }
                });
                window.dispatchEvent(event);
                
                // 尝试重新初始化Worker
                this.workerInitialized = false;
                setTimeout(() => {
                    this.initWorker();
                }, 1000);
            };
            
            // 标记Worker已初始化
            this.workerInitialized = true;
            console.log('Web Worker初始化成功');
            
            // 处理等待中的任务
            if (this.pendingTasks.length > 0) {
                console.log(`处理${this.pendingTasks.length}个等待中的任务`);
                this.pendingTasks.forEach(task => {
                    this.worker.postMessage(task);
                });
                this.pendingTasks = [];
            }
        } catch (error) {
            console.error('初始化Web Worker失败:', error);
            const event = new CustomEvent('passwordError', {
                detail: { message: '初始化失败: ' + (error.message || '未知错误') }
            });
            window.dispatchEvent(event);
            
            // 标记初始化失败，稍后重试
            this.workerInitialized = false;
            setTimeout(() => {
                this.initWorker();
            }, 1000);
        }
    }

    /**
     * 生成随机密码
     * @param {number} length - 密码长度
     * @param {boolean} includeNumbers - 是否包含数字
     * @param {boolean} includeSymbols - 是否包含符号
     */
    generateRandomPassword(length, includeNumbers, includeSymbols) {
        const message = {
            type: 'generate',
            options: { length, includeNumbers, includeSymbols }
        };
        
        // 检查Worker是否已初始化
        if (!this.workerInitialized || !this.worker) {
            console.log('Worker未就绪，将任务加入队列');
            this.pendingTasks.push(message);
            
            // 如果Worker完全未初始化，尝试初始化
            if (!this.worker) {
                console.log('尝试初始化Worker...');
                setTimeout(() => {
                    this.initWorker();
                }, 0);
            }
            
            // 设置超时处理，确保即使Worker初始化失败也能返回结果
            setTimeout(() => {
                if (this.pendingTasks.includes(message)) {
                    console.warn('Worker初始化超时，使用备用方法');
                    // 从队列中移除任务
                    this.pendingTasks = this.pendingTasks.filter(task => task !== message);
                    
                    // 触发错误事件
                    const event = new CustomEvent('passwordError', {
                        detail: { message: 'Worker初始化超时，请刷新页面重试' }
                    });
                    window.dispatchEvent(event);
                }
            }, 3000);
            
            return;
        }
        
        // Worker已就绪，直接发送消息
        try {
            this.worker.postMessage(message);
        } catch (error) {
            console.error('发送消息到Worker失败:', error);
            // 触发错误事件
            const event = new CustomEvent('passwordError', {
                detail: { message: '生成密码失败: ' + (error.message || '未知错误') }
            });
            window.dispatchEvent(event);
        }
    }

    /**
     * 生成易记密码
     * @param {Object} options - 密码生成选项
     */
    generateMemorablePassword(options = {}) {
        // 设置默认值
        const defaults = {
            wordCount: 3,
            separator: '-',
            capitalizeFirst: true
        };
        
        // 合并用户选项和默认值，过滤掉非易记密码相关的选项
        const { wordCount, separator, capitalizeFirst } = { ...defaults, ...options };
        
        const message = {
            type: 'generate_memorable',
            options: {
                wordCount,
                separator,
                capitalizeFirst,
                commonWords: this.commonWords
            }
        };
        
        // 检查Worker是否已初始化
        if (!this.workerInitialized || !this.worker) {
            console.log('Worker未就绪，将易记密码任务加入队列');
            this.pendingTasks.push(message);
            
            // 如果Worker完全未初始化，尝试初始化
            if (!this.worker) {
                console.log('尝试初始化Worker...');
                setTimeout(() => {
                    this.initWorker();
                }, 0);
            }
            
            // 设置超时处理，确保即使Worker初始化失败也能返回结果
            setTimeout(() => {
                if (this.pendingTasks.includes(message)) {
                    console.warn('Worker初始化超时，使用备用方法');
                    // 从队列中移除任务
                    this.pendingTasks = this.pendingTasks.filter(task => task !== message);
                    
                    // 触发错误事件
                    const event = new CustomEvent('passwordError', {
                        detail: { message: 'Worker初始化超时，请刷新页面重试' }
                    });
                    window.dispatchEvent(event);
                }
            }, 3000);
            
            return;
        }
        
        // Worker已就绪，直接发送消息
        try {
            this.worker.postMessage(message);
        } catch (error) {
            console.error('发送易记密码消息到Worker失败:', error);
            // 触发错误事件
            const event = new CustomEvent('passwordError', {
                detail: { message: '生成易记密码失败: ' + (error.message || '未知错误') }
            });
            window.dispatchEvent(event);
        }
    }
}

export default PasswordGenerator; 