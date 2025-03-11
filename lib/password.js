/**
 * 密码生成器类 V1.1.2
 * 提供安全且易用的密码生成功能，支持随机密码和易记忆密码的生成
 * 
 * 更新说明：
 * 1. 重构易记密码生成算法，支持更灵活的配置选项
 * 2. 新增单词数量、分隔符和首字母大小写控制
 * 3. 优化密码生成效率和安全性
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

        // 初始化Web Worker
        this.initWorker();
    }

    initWorker() {
        this.worker = new Worker('/lib/worker.js');

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
                detail: { message: error.message }
            });
            window.dispatchEvent(event);
        };
    }

    generateRandomPassword(length, includeNumbers, includeSymbols) {
        if (!this.worker) {
            throw new Error('Web Worker未初始化');
        }
        this.worker.postMessage({
            type: 'generate',
            options: { length, includeNumbers, includeSymbols }
        });
    }

    generateMemorablePassword(options = {}) {
        if (!this.worker) {
            throw new Error('Web Worker未初始化');
        }

        // 设置默认值
        const defaults = {
            wordCount: 3,
            separator: '-',
            capitalizeFirst: true
        };
        
        // 合并用户选项和默认值，过滤掉非易记密码相关的选项
        const { wordCount, separator, capitalizeFirst } = { ...defaults, ...options };
        
        this.worker.postMessage({
            type: 'generate_memorable',
            options: {
                wordCount,
                separator,
                capitalizeFirst,
                commonWords: this.commonWords
            }
        });
    }
}

// 创建并导出密码生成器实例
const passwordGenerator = new PasswordGenerator();
window.passwordGenerator = passwordGenerator;

export default passwordGenerator;
