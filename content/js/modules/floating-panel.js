/**
 * 浮窗UI模块 V1.0.0
 * 负责创建和管理密码浮窗
 */

// 当前打开的浮窗实例
let currentPanel = null;

// 浮窗HTML模板
const panelTemplate = `
  <div class="easy-password-panel-header">
    <img class="easy-password-panel-logo" src="${window.easyPasswordExtension ? window.easyPasswordExtension.logoUrl : ''}" alt="Easy Password">
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

/**
 * 创建浮窗元素
 * @returns {HTMLElement} 浮窗DOM元素
 */
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

/**
 * 创建并显示浮窗
 * @param {HTMLElement} targetInput - 目标密码框
 * @param {Object} position - 位置信息
 * @param {Object} config - 密码生成配置
 * @param {Function} passwordGenerator - 密码生成函数
 * @param {Function} strengthEvaluator - 强度评估函数
 */
function showPanel(targetInput, position, config, passwordGenerator, strengthEvaluator) {
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
  const password = passwordGenerator(config);
  passwordField.value = password;
  
  // 评估并显示密码强度
  const strengthResult = strengthEvaluator(password);
  updateStrengthIndicator(strengthSegments, strengthResult);
  
  // 绑定刷新按钮事件
  refreshButton.addEventListener('click', () => {
    const newPassword = passwordGenerator(config);
    passwordField.value = newPassword;
    const newStrengthResult = strengthEvaluator(newPassword);
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
      const newPosition = window.passwordDetector.getPasswordInputPosition(targetInput);
      positionPanel(currentPanel, newPosition);
    }
  });
  
  window.addEventListener('resize', () => {
    if (currentPanel && targetInput) {
      const newPosition = window.passwordDetector.getPasswordInputPosition(targetInput);
      positionPanel(currentPanel, newPosition);
    }
  });
}

/**
 * 定位浮窗
 * @param {HTMLElement} panel - 浮窗元素
 * @param {Object} position - 位置信息
 */
function positionPanel(panel, position) {
  // 计算位置，确保在视图范围内
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const panelWidth = panel.offsetWidth || 300; // 默认宽度300px
  
  // 判断水平方向定位
  let left = position.left;
  if (left + panelWidth > viewportWidth) {
    left = Math.max(0, viewportWidth - panelWidth - 10);
  }
  
  // 设置位置
  panel.style.left = `${left}px`;
  panel.style.top = `${position.top + 5}px`; // 增加5px间距
}

/**
 * 更新密码强度指示器
 * @param {NodeList} segments - 强度指示器段
 * @param {Object} strengthResult - 强度评估结果
 */
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

/**
 * 将密码填充到输入框
 * @param {HTMLElement} inputElement - 目标输入框
 * @param {string} password - 要填充的密码
 */
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

/**
 * 尝试寻找并填充确认密码字段
 * @param {HTMLElement} passwordInput - 密码输入框
 * @param {string} password - 要填充的密码
 */
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

/**
 * 处理点击外部区域事件
 * @param {Event} event - 点击事件
 */
function handleOutsideClick(event) {
  if (currentPanel && !currentPanel.contains(event.target) && event.target.type !== 'password') {
    hidePanel();
  }
}

/**
 * 隐藏并移除浮窗
 */
function hidePanel() {
  if (currentPanel) {
    // 移除外部点击监听
    document.removeEventListener('click', handleOutsideClick);
    
    // 移除DOM元素
    document.body.removeChild(currentPanel);
    currentPanel = null;
  }
}

// 导出模块功能
window.floatingPanel = {
  showPanel,
  hidePanel
}; 