/**
 * 密码服务适配器模块 V1.0.0
 * 为内容脚本提供密码生成和评估功能
 */

// 默认密码配置
const DEFAULT_CONFIG = {
  passwordType: 'random',
  passwordLength: 15,
  includeNumbers: true,
  includeSymbols: false,
  wordCount: 3,
  separator: '-',
  capitalizeFirst: true
};

// 当前配置
let currentConfig = {...DEFAULT_CONFIG};

// 密码字符集
const CHAR_SETS = {
  lowercase: 'abcdefghjkmnpqrstuvwxyz', // 排除了易混淆的字符 l, o
  uppercase: 'ABCDEFGHJKLMNPQRSTUVWXYZ', // 排除了易混淆的字符 I, O
  numbers: '23456789', // 排除了易混淆的数字 0, 1
  symbols: '!@#$%^&*_+-=?'
};

// 常用英文单词列表（简化版，实际应用中会使用更大的词库）
const WORDS = [
  'apple', 'banana', 'orange', 'grape', 'lemon', 'peach', 'melon',
  'water', 'river', 'ocean', 'lake', 'stream', 'rain', 'cloud',
  'tiger', 'lion', 'eagle', 'bear', 'wolf', 'fox', 'rabbit',
  'green', 'blue', 'red', 'yellow', 'black', 'white', 'purple',
  'happy', 'smile', 'laugh', 'dream', 'hope', 'love', 'peace',
  'world', 'earth', 'moon', 'star', 'sun', 'sky', 'space',
  'music', 'dance', 'song', 'sound', 'rhythm', 'beat', 'melody',
  'light', 'dark', 'day', 'night', 'dawn', 'dusk', 'noon',
  'book', 'story', 'tale', 'novel', 'poem', 'word', 'letter',
  'house', 'home', 'room', 'door', 'window', 'wall', 'floor'
];

/**
 * 生成随机密码
 * @param {Object} config - 密码生成配置
 * @returns {string} 生成的密码
 */
function generatePassword(config = currentConfig) {
  if (config.passwordType === 'memorable') {
    return generateMemorablePassword(config);
  } else {
    return generateRandomPassword(config);
  }
}

/**
 * 生成随机密码
 * @param {Object} config - 密码生成配置
 * @returns {string} 生成的随机密码
 */
function generateRandomPassword(config) {
  // 构建字符集
  let charset = CHAR_SETS.lowercase + CHAR_SETS.uppercase;
  if (config.includeNumbers) {
    charset += CHAR_SETS.numbers;
  }
  if (config.includeSymbols) {
    charset += CHAR_SETS.symbols;
  }
  
  // 确定密码长度
  const length = config.passwordLength || 15;
  
  // 生成密码
  let password = '';
  const charsetLength = charset.length;
  
  // 使用加密安全的随机数生成
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    const randomIndex = array[i] % charsetLength;
    password += charset.charAt(randomIndex);
  }
  
  // 确保包含所有必要的字符类型
  let hasLowercase = /[a-z]/.test(password);
  let hasUppercase = /[A-Z]/.test(password);
  let hasNumbers = config.includeNumbers ? /[0-9]/.test(password) : true;
  let hasSymbols = config.includeSymbols ? /[!@#$%^&*_+=?-]/.test(password) : true;
  
  // 如果缺少任何类型，替换随机字符
  if (!hasLowercase || !hasUppercase || !hasNumbers || !hasSymbols) {
    const newArray = new Uint32Array(4);
    window.crypto.getRandomValues(newArray);
    
    if (!hasLowercase) {
      const randomIndex = newArray[0] % length;
      const randomChar = CHAR_SETS.lowercase.charAt(newArray[0] % CHAR_SETS.lowercase.length);
      password = password.substring(0, randomIndex) + randomChar + password.substring(randomIndex + 1);
    }
    
    if (!hasUppercase) {
      const randomIndex = newArray[1] % length;
      const randomChar = CHAR_SETS.uppercase.charAt(newArray[1] % CHAR_SETS.uppercase.length);
      password = password.substring(0, randomIndex) + randomChar + password.substring(randomIndex + 1);
    }
    
    if (config.includeNumbers && !hasNumbers) {
      const randomIndex = newArray[2] % length;
      const randomChar = CHAR_SETS.numbers.charAt(newArray[2] % CHAR_SETS.numbers.length);
      password = password.substring(0, randomIndex) + randomChar + password.substring(randomIndex + 1);
    }
    
    if (config.includeSymbols && !hasSymbols) {
      const randomIndex = newArray[3] % length;
      const randomChar = CHAR_SETS.symbols.charAt(newArray[3] % CHAR_SETS.symbols.length);
      password = password.substring(0, randomIndex) + randomChar + password.substring(randomIndex + 1);
    }
  }
  
  return password;
}

/**
 * 生成易记密码
 * @param {Object} config - 密码生成配置
 * @returns {string} 生成的易记密码
 */
function generateMemorablePassword(config) {
  // 获取配置
  const wordCount = config.wordCount || 3;
  const separator = config.separator || '-';
  const capitalizeFirst = config.capitalizeFirst !== false;
  
  // 获取随机单词
  const words = [];
  const usedIndices = new Set();
  const array = new Uint32Array(wordCount);
  window.crypto.getRandomValues(array);
  
  for (let i = 0; i < wordCount; i++) {
    let index;
    do {
      index = array[i] % WORDS.length;
    } while (usedIndices.has(index));
    
    usedIndices.add(index);
    let word = WORDS[index];
    
    // 首字母大写
    if (capitalizeFirst) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    
    words.push(word);
  }
  
  // 添加数字
  let password = words.join(separator);
  
  if (config.includeNumbers) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const randomNumber = CHAR_SETS.numbers.charAt(array[0] % CHAR_SETS.numbers.length);
    password += randomNumber;
  }
  
  // 添加符号
  if (config.includeSymbols) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const randomSymbol = CHAR_SETS.symbols.charAt(array[0] % CHAR_SETS.symbols.length);
    password += randomSymbol;
  }
  
  return password;
}

/**
 * 评估密码强度
 * @param {string} password - 要评估的密码
 * @returns {Object} 强度评估结果
 */
function evaluatePasswordStrength(password) {
  if (!password) {
    return { score: 0, entropy: 0, level: { value: 0, label: 'veryWeak' } };
  }
  
  // 计算熵
  let entropy = calculateEntropy(password);
  
  // 重复字符检查
  const repeatPenalty = checkRepeatedChars(password);
  entropy = Math.max(0, entropy - repeatPenalty);
  
  // 序列检查（如 abcd 或 1234）
  const sequencePenalty = checkSequences(password);
  entropy = Math.max(0, entropy - sequencePenalty);
  
  // 计算最终得分（0-100）
  let score = Math.min(100, Math.max(0, entropy));
  
  // 确定安全级别
  let level = { value: 0, label: 'veryWeak' };
  
  if (score < 40) {
    level = { value: 1, label: 'weak' };
  } else if (score < 60) {
    level = { value: 2, label: 'medium' };
  } else if (score < 80) {
    level = { value: 3, label: 'strong' };
  } else {
    level = { value: 4, label: 'veryStrong' };
  }
  
  return {
    score,
    entropy,
    level
  };
}

/**
 * 计算密码熵值
 * @param {string} password - 密码
 * @returns {number} 熵值
 */
function calculateEntropy(password) {
  // 检查使用的字符类型
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[!@#$%^&*_+=?-]/.test(password);
  
  // 计算可能的字符集大小
  let charsetSize = 0;
  if (hasLowercase) charsetSize += 26;
  if (hasUppercase) charsetSize += 26;
  if (hasNumbers) charsetSize += 10;
  if (hasSymbols) charsetSize += 15; // 估计值，取决于实际使用的符号集
  
  // 基本熵值: log2(字符集大小) * 密码长度
  const baseEntropy = Math.log2(Math.max(1, charsetSize)) * password.length;
  
  // 根据密码长度增加奖励
  const lengthBonus = Math.sqrt(password.length) * 2;
  
  // 根据字符类型多样性增加奖励
  const diversityBonus = (hasLowercase ? 5 : 0) +
                         (hasUppercase ? 5 : 0) +
                         (hasNumbers ? 5 : 0) +
                         (hasSymbols ? 10 : 0);
  
  return baseEntropy + lengthBonus + diversityBonus;
}

/**
 * 检查重复字符
 * @param {string} password - 密码
 * @returns {number} 惩罚值
 */
function checkRepeatedChars(password) {
  let penalty = 0;
  
  // 检查连续相同字符
  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i+1] && password[i] === password[i+2]) {
      penalty += 10;
    }
  }
  
  // 检查高重复率
  const charCount = {};
  for (const char of password) {
    charCount[char] = (charCount[char] || 0) + 1;
  }
  
  // 计算字符频率
  for (const char in charCount) {
    const frequency = charCount[char] / password.length;
    if (frequency > 0.3) { // 如果某个字符出现频率超过30%
      penalty += 5;
    }
  }
  
  return Math.min(30, penalty); // 最大惩罚30
}

/**
 * 检查序列
 * @param {string} password - 密码
 * @returns {number} 惩罚值
 */
function checkSequences(password) {
  let penalty = 0;
  const sequences = ['abcdefghijklmnopqrstuvwxyz', '0123456789', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
  
  for (const seq of sequences) {
    for (let i = 0; i < password.length - 2; i++) {
      const triplet = password.substring(i, i + 3).toLowerCase();
      for (let j = 0; j < seq.length - 2; j++) {
        if (triplet === seq.substring(j, j + 3) || 
            triplet === seq.substring(j + 2, j - 1)) {
          penalty += 5;
        }
      }
    }
  }
  
  return Math.min(20, penalty); // 最大惩罚20
}

// 导出模块功能
window.passwordService = {
  DEFAULT_CONFIG,
  currentConfig,
  generatePassword,
  evaluatePasswordStrength
}; 