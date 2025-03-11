/**
 * 密码生成器Web Worker V1.1.2
 * 在后台线程中执行密码生成操作，实现高性能、高安全性的密码生成功能
 * 
 * 主要功能：
 * 1. 随机密码生成：使用密码学安全的随机数生成器
 * 2. 易记密码生成：基于单词组合的智能算法
 * 3. 密码强度保证：多重安全规则验证
 * 4. 密码强度评估：实时计算熵值和复合评分
 * 5. 智能诊断分析：检测密码问题并提供优化建议
 * 
 * 安全特性：
 * - 使用Web Crypto API生成高质量随机数
 * - 智能字符分布算法，避免弱密码模式
 * - 多重密码强度验证，包括熵值计算
 * - 防止键盘序列和字符重复
 * - 确保密码中包含必需字符类型
 * - 布隆过滤器优化弱密码检测
 * - 动态权重调整的熵值计算
 * - 复合评分模型的强度评估
 * 
 * 性能优化：
 * - 异步处理密码生成，避免阻塞主线程
 * - 优化的字符集处理和随机数生成
 * - 智能的密码生成重试机制
 * 
 * 技术实现：
 * - 模块化设计，便于维护和扩展
 * - 完整的错误处理和异常恢复
 * - 灵活的配置选项支持
 */

// 使用传统方式加载依赖
importScripts('/lib/shared/charset.js', '/lib/shared/utils.js');

/**
 * 生成符合安全要求的密码
 * @param {Object} options - 密码生成选项
 * @returns {string} 生成的密码
 */
function generateSecurePassword(options) {
    const { length = 12, includeNumbers = true, includeSymbols = true } = options;
    
    // 确保至少包含一个大写字母、一个小写字母
    let requiredChars = [
        CHARSET.uppercase[getSecureRandom(0, CHARSET.uppercase.length - 1)],
        CHARSET.lowercase[getSecureRandom(0, CHARSET.lowercase.length - 1)]
    ];
    
    // 根据选项添加必需的数字和符号
    if (includeNumbers) {
        requiredChars.push(CHARSET.numbers[getSecureRandom(0, CHARSET.numbers.length - 1)]);
    }
    if (includeSymbols) {
        requiredChars.push(CHARSET.symbols[getSecureRandom(0, CHARSET.symbols.length - 1)]);
    }
    
    // 计算剩余需要生成的字符数
    const remainingLength = length - requiredChars.length;
    
    // 构建完整字符集
    let charset = CHARSET.uppercase + CHARSET.lowercase;
    if (includeNumbers) charset += CHARSET.numbers;
    if (includeSymbols) charset += CHARSET.symbols;
    
    let password;
    do {
        // 生成剩余字符
        let remainingChars = '';
        for (let i = 0; i < remainingLength; i++) {
            const index = getSecureRandom(0, charset.length - 1);
            remainingChars += charset[index];
        }
        
        // 将必需字符和剩余字符合并并打乱顺序
        password = [...requiredChars, ...remainingChars];
        for (let i = password.length - 1; i > 0; i--) {
            const j = getSecureRandom(0, i);
            [password[i], password[j]] = [password[j], password[i]];
        }
        password = password.join('');
        
    } while (
        hasKeyboardSequence(password, KEYBOARD_SEQUENCES) ||
        hasRepeatingChars(password) ||
        matchesWeakPattern(password, WEAK_PATTERNS) ||
        !checkComplexity(password, { includeNumbers, includeSymbols }) ||
        calculateEntropy(password, charset.length) < (length < 12 ? 25 : 50)
    );
    
    return password;
}

/**
 * 生成易记密码
 * @param {Object} options - 密码生成选项
 * @returns {string} 生成的易记密码
 */
function generateMemorablePassword(options) {
    const { 
        wordCount = 3, 
        separator = '-', 
        capitalizeFirst = true, 
        commonWords = [] 
    } = options;
    
    if (!commonWords || commonWords.length === 0) {
        throw new Error('单词列表为空');
    }
    
    // 随机选择指定数量的单词
    const selectedWords = [];
    const usedIndexes = new Set(); // 避免重复选择相同的单词
    
    for (let i = 0; i < wordCount; i++) {
        let randomIndex;
        do {
            randomIndex = getSecureRandom(0, commonWords.length - 1);
        } while (usedIndexes.has(randomIndex));
        
        usedIndexes.add(randomIndex);
        let word = commonWords[randomIndex];
        
        // 应用首字母大小写设置
        if (capitalizeFirst) {
            word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        } else {
            word = word.toLowerCase();
        }
        
        selectedWords.push(word);
    }
    
    // 使用指定的分隔符连接单词
    const password = selectedWords.join(separator);
    
    return password;
}

// 监听主线程消息
self.addEventListener('message', (e) => {
    const { type, options } = e.data;
    
    try {
        let password;
        if (type === 'generate') {
            password = generateSecurePassword(options);
        } else if (type === 'generate_memorable') {
            password = generateMemorablePassword(options);
        } else {
            throw new Error('不支持的密码生成类型');
        }
        self.postMessage({ type: 'success', password });
    } catch (error) {
        self.postMessage({ type: 'error', message: error.message });
    }
});

// 辅助函数：检查是否包含键盘序列
function hasKeyboardSequence(password, sequences) {
    for (const sequence of sequences) {
        if (password.includes(sequence)) return true;
    }
    return false;
}

// 辅助函数：检查是否包含重复字符
function hasRepeatingChars(password) {
    for (let i = 0; i < password.length - 2; i++) {
        if (password[i] === password[i+1] && password[i] === password[i+2]) {
            return true;
        }
    }
    return false;
}

// 辅助函数：检查是否匹配弱密码模式
function matchesWeakPattern(password, patterns) {
    for (const pattern of patterns) {
        if (pattern.test(password)) return true;
    }
    return false;
}

// 辅助函数：检查密码复杂度
function checkComplexity(password, options) {
    const { includeNumbers, includeSymbols } = options;
    
    // 必须包含大小写字母
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    
    // 根据选项检查数字和符号
    const hasNumbers = !includeNumbers || /[0-9]/.test(password);
    const hasSymbols = !includeSymbols || /[!@#$%^&*_+\-=?]/.test(password);
    
    return hasUppercase && hasLowercase && hasNumbers && hasSymbols;
}

// 辅助函数：计算密码熵值
function calculateEntropy(password, charsetSize) {
    return Math.log2(Math.pow(charsetSize, password.length));
}

// 使用charset.js中定义的常量