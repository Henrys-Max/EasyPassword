/**
 * 密码检测器模块 V1.0.0
 * 负责检测页面中的密码输入框并添加事件监听
 */

// 用于存储已经处理过的密码框元素
const processedInputs = new WeakSet();

/**
 * 检测页面中的所有密码输入框
 * @param {Function} callback - 发现密码框时执行的回调函数
 */
function detectPasswordInputs(callback) {
  // 查找所有类型为password的输入框
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  
  passwordInputs.forEach(input => {
    // 避免重复处理同一元素
    if (!processedInputs.has(input)) {
      processedInputs.add(input);
      
      // 给密码框添加焦点事件
      input.addEventListener('focus', (event) => {
        callback(event.target);
      });
      
      // 给密码框添加点击事件
      input.addEventListener('click', (event) => {
        callback(event.target);
      });
    }
  });
}

/**
 * 监控DOM变化，检测新添加的密码框
 * @param {Function} callback - 发现密码框时执行的回调函数
 */
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

/**
 * 获取密码框的位置信息
 * @param {HTMLElement} inputElement - 密码输入框元素
 * @returns {Object} 包含坐标和尺寸的对象
 */
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

// 导出模块功能
window.passwordDetector = {
  detectPasswordInputs,
  observeDOMChanges,
  getPasswordInputPosition
}; 