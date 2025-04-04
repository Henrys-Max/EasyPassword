/**
 * 密码生成器Web Worker V1.1.5
 * 在后台线程中执行密码生成操作，实现高性能、高安全性的密码生成功能
 * 
 * 主要功能：
 * 1. 随机密码生成：使用密码学安全的随机数生成器
 * 2. 易记密码生成：基于单词组合的智能算法
 * 3. 密码强度保证：多重安全规则验证
 */

// 使用传统方式加载依赖
importScripts('/lib/core/password/charset.js', '/lib/core/password/utils.js');

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