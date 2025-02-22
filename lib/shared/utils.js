/**
 * 共享工具函数 V1.1.0
 * 提供密码生成器所需的通用工具函数和安全性检查方法
 * 
 * 主要功能：
 * 1. 安全随机数生成：使用Web Crypto API生成高质量随机数
 * 2. 字符串操作：随机字符选择、字符串打乱等
 * 3. 密码安全性检查：包含多重验证机制
 * 
 * 安全特性：
 * - 使用密码学安全的随机数生成器
 * - 实现Fisher-Yates洗牌算法
 * - 多重密码强度验证
 * - 熵值计算与评估
 * 
 * 使用说明：
 * - 支持在主线程和Web Worker中使用
 * - 提供完整的密码复杂度检查
 * - 包含详细的错误处理机制
 */

/**
 * 使用Web Crypto API生成密码学安全的随机数
 * @param {number} min - 最小值（包含）
 * @param {number} max - 最大值（包含）
 * @returns {number} 生成的随机整数
 */
function getSecureRandom(min, max) {
    const range = max - min + 1;
    const bytes = new Uint32Array(1);
    const maxNum = Math.floor(0xFFFFFFFF / range) * range;
    
    do {
        // 在Web Worker中使用self.crypto，在主线程中使用window.crypto
        const cryptoObj = typeof self !== 'undefined' ? self.crypto : window.crypto;
        cryptoObj.getRandomValues(bytes);
    } while (bytes[0] >= maxNum);
    
    return min + (bytes[0] % range);
}

/**
 * 从指定字符集中随机选择一个字符
 * @param {string} charset - 字符集
 * @returns {string} 随机选择的字符
 */
function getRandomChar(charset) {
    return charset[getSecureRandom(0, charset.length - 1)];
}

/**
 * 使用Fisher-Yates算法打乱字符串
 * @param {string} str - 需要打乱的字符串
 * @returns {string} 打乱后的字符串
 */
function shuffleString(str) {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
        const j = getSecureRandom(0, i);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
}

/**
 * 检查密码是否包含键盘序列
 * @param {string} password - 待检查的密码
 * @param {Array<string>} sequences - 键盘序列列表
 * @returns {boolean} 是否包含键盘序列
 */
function hasKeyboardSequence(password, sequences) {
    const lowerPass = password.toLowerCase();
    return sequences.some(seq => lowerPass.includes(seq));
}

/**
 * 检查密码是否包含连续重复字符
 * @param {string} password - 待检查的密码
 * @returns {boolean} 是否包含连续重复字符
 */
function hasRepeatingChars(password) {
    return /([a-zA-Z0-9!@#$%^&*_+=?])\1{2,}/.test(password);
}

/**
 * 检查密码是否匹配弱密码模式
 * @param {string} password - 待检查的密码
 * @param {Array<RegExp>} patterns - 弱密码模式列表
 * @returns {boolean} 是否匹配弱密码模式
 */
function matchesWeakPattern(password, patterns) {
    return patterns.some(pattern => pattern.test(password));
}

/**
 * 检查密码复杂度
 * @param {string} password - 待检查的密码
 * @returns {boolean} 密码是否满足复杂度要求
 */
function checkComplexity(password) {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*_+=?]/.test(password);
    return (hasUpper && hasLower) && (hasNumber || hasSymbol);
}

/**
 * 计算密码熵值
 * @param {string} password - 待计算的密码
 * @param {number} charsetSize - 字符集大小
 * @returns {number} 密码熵值
 */
function calculateEntropy(password, charsetSize) {
    return Math.floor(password.length * Math.log2(charsetSize));
}

// 在全局作用域中暴露函数
self.getSecureRandom = getSecureRandom;
self.getRandomChar = getRandomChar;
self.shuffleString = shuffleString;
self.hasKeyboardSequence = hasKeyboardSequence;
self.hasRepeatingChars = hasRepeatingChars;
self.matchesWeakPattern = matchesWeakPattern;
self.checkComplexity = checkComplexity;
self.calculateEntropy = calculateEntropy;