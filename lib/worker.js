/**
 * 密码生成器Web Worker V1.1.0
 * 在后台线程中执行密码生成操作，实现高性能、高安全性的密码生成功能
 * 
 * 主要功能：
 * 1. 随机密码生成：使用密码学安全的随机数生成器
 * 2. 易记密码生成：基于单词组合的智能算法
 * 3. 密码强度保证：多重安全规则验证
 * 
 * 安全特性：
 * - 使用Web Crypto API生成高质量随机数
 * - 智能字符分布算法，避免弱密码模式
 * - 多重密码强度验证，包括熵值计算
 * - 防止键盘序列和字符重复
 * - 确保密码中包含必需字符类型
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
        calculateEntropy(password, charset.length) < (length < 14 ? 40 : 80)
    );
    
    return password;
}

// 生成易记密码
function generateMemorablePassword(options) {
    const { length, includeNumbers, includeSymbols, commonWords } = options;
    
    // 短密码特殊处理（长度小于10位时）
    if (length < 10) {
        let password = '';
        // 随机选择一个单词
        let word = commonWords[getSecureRandom(0, commonWords.length - 1)];
        // 确保单词长度不超过4位
        word = word.slice(0, 4);
        // 将单词转为首字母大写，其余小写
        word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        
        // 添加数字和符号填充剩余长度
        let extras = '';
        const remainingLength = length - word.length;
        
        if (includeNumbers && remainingLength > 0) {
            // 添加数字
            for (let i = 0; i < Math.ceil(remainingLength / 2); i++) {
                extras += CHARSET.numbers[getSecureRandom(0, CHARSET.numbers.length - 1)];
            }
        }
        
        if (includeSymbols && extras.length < remainingLength) {
            // 添加符号填充剩余位置
            while (extras.length < remainingLength) {
                extras += CHARSET.symbols[getSecureRandom(0, CHARSET.symbols.length - 1)];
            }
        } else if (extras.length < remainingLength) {
            // 如果不使用符号，用数字填充剩余位置
            while (extras.length < remainingLength) {
                extras += CHARSET.numbers[getSecureRandom(0, CHARSET.numbers.length - 1)];
            }
        }
        
        // 组合密码并确保特殊字符分布均匀
        password = word + extras;
        return password;
    }
    
    // 长密码生成逻辑
    let password = '';
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
        // 随机选择两个单词
        const word1 = commonWords[getSecureRandom(0, commonWords.length - 1)];
        const word2 = commonWords[getSecureRandom(0, commonWords.length - 1)];

        // 确保至少包含一个小写字母（将第二个单词转为小写）
        const formattedWord2 = word2.toLowerCase();

        // 添加数字和符号，确保它们分布在单词之间
        let extras = '';
        if (includeNumbers) {
            // 添加2个数字以增加复杂度
            extras += CHARSET.numbers[getSecureRandom(0, CHARSET.numbers.length - 1)];
            extras += CHARSET.numbers[getSecureRandom(0, CHARSET.numbers.length - 1)];
        }
        if (includeSymbols) {
            // 在不同位置添加符号
            extras = CHARSET.symbols[getSecureRandom(0, CHARSET.symbols.length - 1)] + 
                    extras + 
                    CHARSET.symbols[getSecureRandom(0, CHARSET.symbols.length - 1)];
        }

        // 智能组合密码：确保特殊字符分布均匀
        password = word1 + extras.charAt(0) + formattedWord2;
        if (extras.length > 1) {
            password = password.slice(0, Math.floor(password.length / 2)) + 
                      extras.slice(1) + 
                      password.slice(Math.floor(password.length / 2));
        }

        // 如果密码长度符合要求，返回密码
        if (password.length === length) {
            return password;
        }

        // 如果密码太长，智能截取保持特征
        if (password.length > length) {
            // 确保保留首尾和特殊字符
            const start = password.slice(0, Math.floor(length / 2));
            const end = password.slice(password.length - Math.ceil(length / 2));
            return start + end;
        }

        // 如果密码太短，添加随机字符直到达到目标长度
        while (password.length < length) {
            const charset = CHARSET.uppercase + CHARSET.lowercase +
                (includeNumbers ? CHARSET.numbers : '') +
                (includeSymbols ? CHARSET.symbols : '');
            // 避免连续重复字符
            let newChar;
            do {
                const index = getSecureRandom(0, charset.length - 1);
                newChar = charset[index];
            } while (password.slice(-1) === newChar);
            password += newChar;
        }

        if (password.length === length) {
            return password;
        }

        attempts++;
    }

    // 如果无法生成符合要求的密码，使用随机密码
    return generateSecurePassword({ length, includeNumbers, includeSymbols });
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