/**
 * DOM工具模块 V1.0.0
 * 提供通用的DOM操作方法
 */

/**
 * 安全地将脚本注入页面
 * @param {string} scriptText - 要注入的脚本内容
 */
function injectScript(scriptText) {
  try {
    const script = document.createElement('script');
    script.textContent = scriptText;
    script.async = false;
    document.documentElement.appendChild(script);
    document.documentElement.removeChild(script);
  } catch (error) {
    console.error('脚本注入失败:', error);
  }
}

/**
 * 检测页面主题
 * @returns {string} 'light'或'dark'
 */
function detectPageTheme() {
  // 检查系统首选项
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  // 尝试基于页面背景色推断
  const bodyBg = window.getComputedStyle(document.body).backgroundColor;
  const htmlBg = window.getComputedStyle(document.documentElement).backgroundColor;
  
  // 将颜色转换为RGB数组
  const parseColor = (color) => {
    if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
      return null;
    }
    
    // 处理rgb/rgba格式
    if (color.startsWith('rgb')) {
      const values = color.match(/\d+/g);
      if (values && values.length >= 3) {
        return values.map(Number).slice(0, 3);
      }
    }
    
    return null;
  };
  
  const bgColor = parseColor(bodyBg) || parseColor(htmlBg);
  
  // 计算亮度
  if (bgColor) {
    // 使用亮度公式: 0.299*R + 0.587*G + 0.114*B
    const brightness = (0.299 * bgColor[0] + 0.587 * bgColor[1] + 0.114 * bgColor[2]) / 255;
    
    // 亮度小于0.5被视为暗色主题
    return brightness < 0.5 ? 'dark' : 'light';
  }
  
  // 默认返回亮色主题
  return 'light';
}

/**
 * 判断元素是否在视口内
 * @param {HTMLElement} element - 要检查的元素
 * @returns {boolean} 元素是否在视口内
 */
function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * 获取元素绝对位置
 * @param {HTMLElement} element - DOM元素
 * @returns {Object} 包含top和left的对象
 */
function getAbsolutePosition(element) {
  let left = 0;
  let top = 0;
  let current = element;
  
  while (current) {
    left += current.offsetLeft;
    top += current.offsetTop;
    current = current.offsetParent;
  }
  
  return { top, left };
}

/**
 * 注册全局点击事件，但排除特定元素
 * @param {HTMLElement} excludeElement - 点击时要排除的元素
 * @param {Function} callback - 点击事件回调
 * @returns {Function} 移除事件监听的函数
 */
function addGlobalClickEvent(excludeElement, callback) {
  function handleClick(event) {
    if (!excludeElement.contains(event.target)) {
      callback(event);
    }
  }
  
  document.addEventListener('click', handleClick);
  
  // 返回移除监听的函数
  return function removeListener() {
    document.removeEventListener('click', handleClick);
  };
}

// 导出模块功能
window.domUtils = {
  injectScript,
  detectPageTheme,
  isElementInViewport,
  getAbsolutePosition,
  addGlobalClickEvent
}; 