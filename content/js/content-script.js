/**
 * Easy Password 内容脚本 V1.1.5
 * 
 * 这是密码快速填充浮窗功能的主入口
 * 负责初始化密码检测和浮窗显示
 */

// 获取扩展资源URL
const logoUrl = chrome.runtime.getURL('assets/icons/logo_16.png');

//==========================================================================
// 密码服务适配器
//==========================================================================

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

// 常用英文单词列表（简化版）
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

// 生成随机密码
function generatePassword(config = currentConfig) {
  if (config.passwordType === 'memorable') {
    return generateMemorablePassword(config);
  } else {
    return generateRandomPassword(config);
  }
}

// 生成随机密码
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

// 生成易记密码
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

// 评估密码强度
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

// 计算密码熵值
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

// 检查重复字符
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

// 检查序列
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

//==========================================================================
// 密码框检测器
//==========================================================================

// 用于存储已经处理过的密码框元素
const processedInputs = new WeakSet();

// 检测页面中的所有密码输入框
function detectPasswordInputs(callback) {
  // 查找所有类型为password的输入框
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  
  passwordInputs.forEach(input => {
    // 避免重复处理同一元素
    if (!processedInputs.has(input)) {
      processedInputs.add(input);
      
      // 只使用点击事件监听器
      input.addEventListener('click', (event) => {
        callback(event.target);
      });
    }
  });
}

// 监控DOM变化，检测新添加的密码框
function observeDOMChanges(callback) {
  // 创建一个监听DOM变化的观察者
  const observer = new MutationObserver((mutations) => {
    let shouldDetect = false;
    
    // 检查DOM变化
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          // 检查新添加的节点及其子节点是否包含密码框
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.nodeName === 'INPUT' && node.type === 'password') {
              shouldDetect = true;
            } else if (node.querySelector && node.querySelector('input[type="password"]')) {
              shouldDetect = true;
            }
          }
        });
      }
    });
    
    // 如果检测到新的密码框，则刷新检测
    if (shouldDetect) {
      detectPasswordInputs(callback);
    }
  });
  
  // 配置观察选项
  const observerOptions = {
    childList: true,    // 监视直接子节点的添加或删除
    subtree: true,      // 监视所有后代节点
    attributes: false,  // 不监视属性变化
    characterData: false // 不监视节点内容或数据变化
  };
  
  // 开始监控整个文档
  observer.observe(document.documentElement, observerOptions);
  
  return observer;
}

// 获取密码框的位置信息
function getPasswordInputPosition(inputElement) {
  const rect = inputElement.getBoundingClientRect();
  
  // 计算页面滚动
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  // 返回绝对定位所需的信息
  return {
    top: rect.bottom + scrollTop, // 放在密码框下方
    left: rect.left + scrollLeft,
    width: rect.width,
    height: rect.height,
    inputWidth: rect.width
  };
}

//==========================================================================
// 浮窗UI
//==========================================================================

// 当前打开的浮窗实例
let currentPanel = null;

// 浮窗HTML模板
const panelTemplate = `
  <div class="easy-password-panel-header">
    <img class="easy-password-panel-logo" src="${logoUrl}" alt="Easy Password">
    <div class="easy-password-panel-title">Easy Password</div>
    <button class="easy-password-panel-close">&times;</button>
  </div>
  <div class="easy-password-password-display">
    <input type="text" class="easy-password-password-field" readonly>
    <div class="easy-password-strength-meter">
      <div class="easy-password-strength-segment"></div>
      <div class="easy-password-strength-segment"></div>
      <div class="easy-password-strength-segment"></div>
      <div class="easy-password-strength-segment"></div>
    </div>
  </div>
  <div class="easy-password-panel-actions">
    <button class="easy-password-panel-button easy-password-refresh-button">刷新</button>
    <button class="easy-password-panel-button easy-password-fill-button">填充</button>
  </div>
`;

// 创建浮窗元素
function createPanelElement() {
  const panel = document.createElement('div');
  panel.className = 'easy-password-floating-panel';
  panel.innerHTML = panelTemplate;
  
  // 检测系统深色模式
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    panel.classList.add('dark-mode');
  }
  
  return panel;
}

// 创建并显示浮窗
function showPanel(targetInput, position) {
  // 如果已有浮窗，先移除
  if (currentPanel) {
    document.body.removeChild(currentPanel);
    currentPanel = null;
  }
  
  // 创建新浮窗
  const panel = createPanelElement();
  document.body.appendChild(panel);
  currentPanel = panel;
  
  // 设置浮窗位置
  positionPanel(panel, position);
  
  // 获取浮窗内部元素
  const passwordField = panel.querySelector('.easy-password-password-field');
  const refreshButton = panel.querySelector('.easy-password-refresh-button');
  const fillButton = panel.querySelector('.easy-password-fill-button');
  const closeButton = panel.querySelector('.easy-password-panel-close');
  const strengthSegments = panel.querySelectorAll('.easy-password-strength-segment');
  
  // 生成并显示密码
  const password = generatePassword(currentConfig);
  passwordField.value = password;
  
  // 评估并显示密码强度
  const strengthResult = evaluatePasswordStrength(password);
  updateStrengthIndicator(strengthSegments, strengthResult);
  
  // 绑定刷新按钮事件
  refreshButton.addEventListener('click', () => {
    const newPassword = generatePassword(currentConfig);
    passwordField.value = newPassword;
    const newStrengthResult = evaluatePasswordStrength(newPassword);
    updateStrengthIndicator(strengthSegments, newStrengthResult);
  });
  
  // 绑定填充按钮事件
  fillButton.addEventListener('click', () => {
    fillPasswordToInput(targetInput, passwordField.value);
    hidePanel();
  });
  
  // 绑定关闭按钮事件
  closeButton.addEventListener('click', hidePanel);
  
  // 点击外部区域关闭浮窗
  document.addEventListener('click', handleOutsideClick);
  
  // 在切换页面或滚动时重新定位浮窗
  window.addEventListener('scroll', () => {
    if (currentPanel && targetInput) {
      const newPosition = getPasswordInputPosition(targetInput);
      positionPanel(currentPanel, newPosition);
    }
  });
  
  window.addEventListener('resize', () => {
    if (currentPanel && targetInput) {
      const newPosition = getPasswordInputPosition(targetInput);
      positionPanel(currentPanel, newPosition);
    }
  });
}

// 定位浮窗
function positionPanel(panel, position) {
  // 设置面板宽度，与密码框宽度相同，但不小于260px
  const panelWidth = Math.max(260, position.inputWidth);
  panel.style.width = `${panelWidth}px`;

  // 计算位置，确保在视图范围内
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // 判断水平方向定位
  let left = position.left;
  if (left + panelWidth > viewportWidth) {
    left = Math.max(0, viewportWidth - panelWidth - 10);
  }
  
  // 设置位置
  panel.style.left = `${left}px`;
  panel.style.top = `${position.top + 5}px`; // 增加5px间距
}

// 更新密码强度指示器
function updateStrengthIndicator(segments, strengthResult) {
  // 重置所有段的状态
  segments.forEach(segment => {
    segment.classList.remove('active');
    segment.style.backgroundColor = '#ccc';
  });
  
  // 根据密码强度评分确定激活的段数
  const score = strengthResult.score;
  let activeSegments = 0;
  
  if (score <= 40) {
    activeSegments = 1;
  } else if (score <= 60) {
    activeSegments = 2;
  } else if (score <= 80) {
    activeSegments = 3;
  } else {
    activeSegments = 4;
  }
  
  // 激活对应段数
  for (let i = 0; i < activeSegments; i++) {
    segments[i].classList.add('active');
    segments[i].style.backgroundColor = '#3872e0';
  }
}

// 将密码填充到输入框
function fillPasswordToInput(inputElement, password) {
  // 设置输入框的值
  inputElement.value = password;
  
  // 触发输入事件，让网站的JS能够识别到输入变化
  const inputEvent = new Event('input', { bubbles: true });
  const changeEvent = new Event('change', { bubbles: true });
  
  inputElement.dispatchEvent(inputEvent);
  inputElement.dispatchEvent(changeEvent);
  
  // 尝试寻找确认密码字段并自动填充
  tryFillConfirmPassword(inputElement, password);
}

// 尝试寻找并填充确认密码字段
function tryFillConfirmPassword(passwordInput, password) {
  // 常见的确认密码字段id或name模式
  const confirmPatterns = [
    'confirmPassword', 'confirm_password', 'confirm-password',
    'passwordConfirm', 'password_confirm', 'password-confirm',
    'retypePassword', 'retype_password', 'retype-password',
    'passwordAgain', 'password_again', 'password-again',
    'password2', 'pwd2', 'pass2'
  ];
  
  // 用于查找确认密码框的选择器
  const selectors = [];
  
  // 添加常见ID和name匹配
  confirmPatterns.forEach(pattern => {
    selectors.push(`input[type="password"][id*="${pattern}" i]`);
    selectors.push(`input[type="password"][name*="${pattern}" i]`);
  });
  
  // 尝试查找与当前密码框相邻的密码框
  const allPasswordInputs = Array.from(document.querySelectorAll('input[type="password"]'));
  const currentIndex = allPasswordInputs.indexOf(passwordInput);
  
  // 如果找到当前输入框，并且下一个也是密码框
  if (currentIndex !== -1 && currentIndex < allPasswordInputs.length - 1) {
    const nextInput = allPasswordInputs[currentIndex + 1];
    nextInput.value = password;
    
    // 触发事件
    const inputEvent = new Event('input', { bubbles: true });
    const changeEvent = new Event('change', { bubbles: true });
    nextInput.dispatchEvent(inputEvent);
    nextInput.dispatchEvent(changeEvent);
  } else {
    // 尝试通过选择器查找确认密码框
    for (const selector of selectors) {
      const confirmInput = document.querySelector(selector);
      if (confirmInput && confirmInput !== passwordInput) {
        confirmInput.value = password;
        
        // 触发事件
        const inputEvent = new Event('input', { bubbles: true });
        const changeEvent = new Event('change', { bubbles: true });
        confirmInput.dispatchEvent(inputEvent);
        confirmInput.dispatchEvent(changeEvent);
        break;
      }
    }
  }
}

// 处理点击外部区域事件
function handleOutsideClick(event) {
  if (currentPanel && !currentPanel.contains(event.target) && event.target.type !== 'password') {
    hidePanel();
  }
}

// 隐藏并移除浮窗
function hidePanel() {
  if (currentPanel) {
    // 移除外部点击监听
    document.removeEventListener('click', handleOutsideClick);
    
    // 移除DOM元素
    document.body.removeChild(currentPanel);
    currentPanel = null;
  }
}

//==========================================================================
// 初始化
//==========================================================================

// 初始化插件功能
function initialize() {
  // 日志
  console.log('Easy Password 浮窗功能初始化中...');
  
  // 加载用户配置
  chrome.storage.sync.get('passwordConfig', (data) => {
    currentConfig = data.passwordConfig || DEFAULT_CONFIG;
    console.log('密码配置加载完成，开始检测密码框');
    
    // 回调函数：当找到密码框时
    const onPasswordInputFound = (inputElement) => {
      // 获取密码框位置
      const position = getPasswordInputPosition(inputElement);
      
      // 显示浮窗
      showPanel(inputElement, position);
    };
    
    // 初次检测页面上的密码框
    detectPasswordInputs(onPasswordInputFound);
    
    // 开始监控DOM变化，检测后续添加的密码框
    observeDOMChanges(onPasswordInputFound);
    
    // 监听配置变更
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes.passwordConfig) {
        currentConfig = changes.passwordConfig.newValue;
        console.log('密码配置已更新:', currentConfig);
      }
    });
  });
}

// 等待页面加载完成
function waitForPageLoad() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initialize, 500); // 延迟500ms确保页面完全加载
    });
  } else {
    setTimeout(initialize, 500); // 延迟500ms确保页面完全加载
  }
}

// 启动
waitForPageLoad();