/**
 * 设置页面功能控制 
 * - 加载用户设置
 * - 处理设置更改
 * - 保存设置到存储
 */

// 默认设置
const DEFAULT_SETTINGS = {
    passwordDetection: true
};

// DOM 元素
const elements = {
    passwordDetection: document.getElementById('passwordDetection'),
    toggleStatus: document.getElementById('toggleStatus'),
    saveButton: document.getElementById('saveButton'),
    saveStatus: document.getElementById('saveStatus'),
    privacyLink: document.getElementById('privacyLink')
};

/**
 * 初始化页面
 */
async function initOptions() {
    // 加载设置
    const settings = await loadSettings();
    
    // 更新界面
    updateUI(settings);
    
    // 设置事件监听器
    setupEventListeners();
}

/**
 * 加载设置
 */
async function loadSettings() {
    try {
        // 从chrome存储中获取设置
        const result = await new Promise(resolve => {
            chrome.storage.sync.get('settings', resolve);
        });
        
        // 合并默认设置
        return { ...DEFAULT_SETTINGS, ...result.settings };
    } catch (error) {
        console.error('加载设置失败:', error);
        return DEFAULT_SETTINGS;
    }
}

/**
 * 更新界面
 */
function updateUI(settings) {
    // 更新开关状态
    elements.passwordDetection.checked = settings.passwordDetection;
    elements.toggleStatus.textContent = settings.passwordDetection ? '已开启' : '已关闭';
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
    // 开关状态改变
    elements.passwordDetection.addEventListener('change', function() {
        elements.toggleStatus.textContent = this.checked ? '已开启' : '已关闭';
    });
    
    // 保存按钮点击
    elements.saveButton.addEventListener('click', saveSettings);
    
    // 隐私政策链接
    elements.privacyLink.addEventListener('click', function(event) {
        event.preventDefault();
        chrome.tabs.create({ url: 'https://example.com/privacy-policy' });
    });
}

/**
 * 保存设置
 */
async function saveSettings() {
    try {
        // 获取当前设置
        const settings = {
            passwordDetection: elements.passwordDetection.checked
        };
        
        // 保存到chrome存储
        await new Promise(resolve => {
            chrome.storage.sync.set({ settings }, resolve);
        });
        
        // 显示成功消息
        showSaveStatus('设置已保存');
        
        // 通知其他部分设置已更改
        chrome.runtime.sendMessage({ action: 'settingsUpdated', settings });
    } catch (error) {
        console.error('保存设置失败:', error);
        showSaveStatus('保存失败，请重试', false);
    }
}

/**
 * 显示保存状态
 */
function showSaveStatus(message, isSuccess = true) {
    elements.saveStatus.textContent = message;
    elements.saveStatus.className = 'save-status visible';
    elements.saveStatus.style.color = isSuccess ? 'var(--success-color)' : 'red';
    
    // 3秒后隐藏
    setTimeout(() => {
        elements.saveStatus.className = 'save-status';
    }, 3000);
}

// 初始化页面
document.addEventListener('DOMContentLoaded', initOptions); 