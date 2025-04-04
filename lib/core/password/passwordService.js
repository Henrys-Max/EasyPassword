/**
 * 密码服务模块 V1.0.0
 * 
 * 这是一个中央通信模块，提供统一的密码生成、强度评估和事件处理接口
 * 所有与密码相关的操作都通过此服务进行，实现了组件间的解耦
 */

// 导入密码相关模块
import PasswordGenerator from './generator.js';
import PasswordStrength from './strength.js';

class PasswordService {
    constructor() {
        // 创建密码生成器实例
        this.generator = new PasswordGenerator();
        
        // 注册事件回调
        this.callbacks = {
            onPasswordGenerated: [],
            onPasswordError: [],
            onStrengthEvaluated: []
        };
        
        // 绑定事件监听
        this._initEventListeners();
    }
    
    /**
     * 初始化事件监听器
     * @private
     */
    _initEventListeners() {
        window.addEventListener('passwordGenerated', (event) => {
            const { password } = event.detail;
            // 自动评估强度
            const strengthResult = this.evaluateStrength(password);
            
            // 调用所有注册的回调
            this.callbacks.onPasswordGenerated.forEach(callback => {
                try {
                    callback(password, strengthResult);
                } catch (error) {
                    console.error('密码生成回调执行失败:', error);
                }
            });
        });
        
        window.addEventListener('passwordError', (event) => {
            const { message } = event.detail;
            this.callbacks.onPasswordError.forEach(callback => {
                try {
                    callback(message);
                } catch (error) {
                    console.error('密码错误回调执行失败:', error);
                }
            });
        });
    }
    
    /**
     * 生成随机密码
     * @param {number} length - 密码长度
     * @param {boolean} includeNumbers - 是否包含数字
     * @param {boolean} includeSymbols - 是否包含符号
     */
    generateRandomPassword(length, includeNumbers, includeSymbols) {
        this.generator.generateRandomPassword(length, includeNumbers, includeSymbols);
    }
    
    /**
     * 生成易记密码
     * @param {Object} options - 密码选项
     */
    generateMemorablePassword(options) {
        this.generator.generateMemorablePassword(options);
    }
    
    /**
     * 评估密码强度
     * @param {string} password - 待评估的密码
     * @returns {Object} 评估结果
     */
    evaluateStrength(password) {
        const result = PasswordStrength.evaluateStrength(password);
        
        // 调用强度评估回调
        this.callbacks.onStrengthEvaluated.forEach(callback => {
            try {
                callback(result);
            } catch (error) {
                console.error('强度评估回调执行失败:', error);
            }
        });
        
        return result;
    }
    
    /**
     * 注册密码生成成功回调
     * @param {Function} callback - 回调函数，接收生成的密码和强度评估结果
     */
    onPasswordGenerated(callback) {
        if (typeof callback === 'function') {
            this.callbacks.onPasswordGenerated.push(callback);
        }
    }
    
    /**
     * 注册密码生成错误回调
     * @param {Function} callback - 回调函数，接收错误信息
     */
    onPasswordError(callback) {
        if (typeof callback === 'function') {
            this.callbacks.onPasswordError.push(callback);
        }
    }
    
    /**
     * 注册强度评估回调
     * @param {Function} callback - 回调函数，接收强度评估结果
     */
    onStrengthEvaluated(callback) {
        if (typeof callback === 'function') {
            this.callbacks.onStrengthEvaluated.push(callback);
        }
    }
    
    /**
     * 移除密码生成成功回调
     * @param {Function} callback - 要移除的回调函数
     */
    offPasswordGenerated(callback) {
        this.callbacks.onPasswordGenerated = this.callbacks.onPasswordGenerated.filter(cb => cb !== callback);
    }
    
    /**
     * 移除密码生成错误回调
     * @param {Function} callback - 要移除的回调函数
     */
    offPasswordError(callback) {
        this.callbacks.onPasswordError = this.callbacks.onPasswordError.filter(cb => cb !== callback);
    }
    
    /**
     * 移除强度评估回调
     * @param {Function} callback - 要移除的回调函数
     */
    offStrengthEvaluated(callback) {
        this.callbacks.onStrengthEvaluated = this.callbacks.onStrengthEvaluated.filter(cb => cb !== callback);
    }
}

// 创建单例实例
const passwordService = new PasswordService();

// 导出服务实例
export default passwordService; 