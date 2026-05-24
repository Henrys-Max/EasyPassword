/**
 * EasyPassword 设置页面脚本
 * 
 * 功能：
 * 1. 菜单切换（易记单词 / 产品信息）
 * 2. 易记单词的增删管理，数据持久化到 chrome.storage.sync
 * 3. 产品信息展示（从 manifest.json 动态读取）
 */

// ==============================
// 默认单词列表（与 generator.js 保持一致）
// ==============================
const DEFAULT_COMMON_WORDS = [
    'able', 'acid', 'also', 'atom', 'Asia', 'aunt', 'back', 'band', 'bank', 'base',
    'bath', 'bean', 'beat', 'been', 'bell', 'best', 'bird', 'bite', 'black', 'blank',
    'blind', 'blow', 'boat', 'boil', 'bomb', 'bone', 'book', 'both', 'box', 'brand',
    'bread', 'brew', 'brief', 'bring', 'brown', 'build', 'burn', 'busy', 'call', 'calm',
    'camp', 'card', 'care', 'cart', 'case', 'city', 'clan', 'claw', 'clay', 'coal',
    'code', 'coil', 'colt', 'come', 'cool', 'copy', 'core', 'corn', 'cost', 'couch',
    'cove', 'cowl', 'cube', 'cure', 'curl', 'curr', 'cute', 'cyber', 'data', 'deal',
    'dear', 'dean', 'deep', 'dial', 'diet', 'disc', 'disk', 'dock', 'dome', 'done',
    'down', 'draw', 'drop', 'drug', 'drum', 'dual', 'duty', 'each', 'edit', 'else',
    'emit', 'ends', 'envy', 'epic', 'euro', 'even', 'ever', 'exam', 'exit', 'face',
    'fact', 'fail', 'fair', 'fake', 'fall', 'fame', 'fang', 'farm', 'fast', 'feast',
    'feat'
];

// ==============================
// i18n 快捷方法
// ==============================
const t = (key, ...args) => {
    if (window.i18n) {
        return args.length ? window.i18n.formatTranslation(key, ...args) : window.i18n.getTranslation(key);
    }
    return key;
};

// ==============================
// 全局状态
// ==============================
let currentWords = [...DEFAULT_COMMON_WORDS];
let isEditing = false;
let messageTimer = null;

// ==============================
// DOM 元素引用
// ==============================
const menuItems = document.querySelectorAll('.menu-item');
const panels = document.querySelectorAll('.content-panel');
const wordInputGroup = document.getElementById('wordInputGroup');
const wordInput = document.getElementById('wordInput');
const addWordBtn = document.getElementById('addWordBtn');
const editWordBtn = document.getElementById('editWordBtn');
const editHint = document.getElementById('editHint');
const wordList = document.getElementById('wordList');
const emptyHint = document.getElementById('emptyHint');
const wordMessage = document.getElementById('wordMessage');

// ==============================
// 初始化
// ==============================
function init() {
    document.title = t('settingsTitle');
    loadWords();
    bindMenuEvents();
    bindWordEvents();
    displayProductInfo();
}

/**
 * 从 chrome.storage.sync 加载单词列表
 */
function loadWords() {
    chrome.storage.sync.get('commonWords', (data) => {
        if (data.commonWords && Array.isArray(data.commonWords) && data.commonWords.length > 0) {
            currentWords = data.commonWords;
        }
        renderWordList();
    });
}

/**
 * 渲染单词网格
 */
function renderWordList() {
    wordList.innerHTML = '';
    
    if (currentWords.length === 0) {
        emptyHint.classList.add('visible');
        return;
    }
    
    emptyHint.classList.remove('visible');
    
    currentWords.forEach((word, index) => {
        const tag = document.createElement('span');
        tag.className = 'word-tag' + (isEditing ? ' editing' : '');
        tag.innerHTML = `
            <span class="word-text">${escapeHtml(word)}</span>
            <button class="btn-delete${isEditing ? ' visible' : ''}" 
                    data-index="${index}" 
                    title="${t('settingsWordRemove')}">&times;</button>
        `;
        wordList.appendChild(tag);
    });
    
    // 绑定删除按钮事件
    if (isEditing) {
        wordList.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.index);
                removeWord(idx);
            });
        });
    }
}

/**
 * HTML 转义
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==============================
// 菜单切换
// ==============================
function bindMenuEvents() {
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const panelName = item.dataset.panel;
            
            // 更新菜单激活状态
            menuItems.forEach(m => m.classList.remove('active'));
            item.classList.add('active');
            
            // 切换面板
            panels.forEach(p => p.classList.remove('active'));
            const targetPanel = document.getElementById('panel' + capitalize(panelName));
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ==============================
// 单词操作
// ==============================
function bindWordEvents() {
    // 添加单词
    addWordBtn.addEventListener('click', addWord);
    wordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addWord();
        }
    });
    
    // 编辑/完成切换
    editWordBtn.addEventListener('click', toggleEditMode);
}

/**
 * 验证单词输入：仅允许英文字母（大小写混合），不允许数字、符号
 */
function validateWord(word) {
    const trimmed = word.trim();
    if (!trimmed) {
        return { valid: false, message: t('settingsValidateEmpty') };
    }
    if (!/^[a-zA-Z]+$/.test(trimmed)) {
        return { valid: false, message: t('settingsValidateLettersOnly') };
    }
    if (trimmed.length < 2) {
        return { valid: false, message: t('settingsValidateMinLength') };
    }
    if (trimmed.length > 6) {
        return { valid: false, message: t('settingsValidateMaxLength') };
    }
    if (currentWords.includes(trimmed)) {
        return { valid: false, message: t('settingsValidateDuplicate') };
    }
    return { valid: true };
}

/**
 * 添加单词
 */
function addWord() {
    const word = wordInput.value;
    const result = validateWord(word);
    
    if (!result.valid) {
        showInputError(true);
        showMessage(result.message, 'error');
        return;
    }
    
    showInputError(false);
    currentWords.push(word.trim());
    wordInput.value = '';
    wordInput.focus();
    renderWordList();
    showMessage(t('settingsWordAdded', word.trim()), 'success');
}

/**
 * 移除单词
 */
function removeWord(index) {
    if (currentWords.length <= 10) {
        showMessage(t('settingsMinWordWarning'), 'error');
        return;
    }
    const removed = currentWords[index];
    currentWords.splice(index, 1);
    renderWordList();
    showMessage(t('settingsWordRemoved', removed), 'success');
}

/**
 * 切换编辑模式
 */
function toggleEditMode() {
    isEditing = !isEditing;
    
    const label = editWordBtn.querySelector('.btn-label');
    const iconEdit = editWordBtn.querySelector('.icon-edit');
    const iconDone = editWordBtn.querySelector('.icon-done');
    
    if (isEditing) {
        // 进入编辑状态：显示输入组、提示文字，切换为完成图标
        wordInputGroup.style.display = 'flex';
        editHint.style.display = 'inline';
        editWordBtn.classList.add('editing');
        if (iconEdit) iconEdit.style.display = 'none';
        if (iconDone) iconDone.style.display = 'inline';
        if (label) label.textContent = t('settingsDone');
        setTimeout(() => wordInput.focus(), 100);
    } else {
        // 退出编辑状态：隐藏输入组、提示文字，恢复编辑图标
        wordInputGroup.style.display = 'none';
        editHint.style.display = 'none';
        editWordBtn.classList.remove('editing');
        if (iconEdit) iconEdit.style.display = 'inline';
        if (iconDone) iconDone.style.display = 'none';
        if (label) label.textContent = t('settingsEdit');
        wordInput.value = '';
        showInputError(false);
        saveWords();
    }
    
    renderWordList();
}

/**
 * 保存单词到 chrome.storage.sync
 */
function saveWords() {
    chrome.storage.sync.set({ commonWords: currentWords }, () => {
        if (chrome.runtime.lastError) {
            console.error('Failed to save word list:', chrome.runtime.lastError.message);
            showMessage(t('settingsSaveFailed'), 'error');
            return;
        }
        console.log('Word list saved:', currentWords.length, 'words');
        showMessage(t('settingsSaveSuccess'), 'success');
    });
}

// ==============================
// 产品信息
// ==============================
function displayProductInfo() {
    const manifest = chrome.runtime.getManifest();
    
    const nameEl = document.getElementById('aboutProductName');
    const versionEl = document.getElementById('aboutVersion');
    
    if (nameEl) {
        nameEl.textContent = manifest.name || 'Easy Password';
    }
    if (versionEl) {
        versionEl.textContent = 'v' + (manifest.version || '1.0.0');
    }
}

// ==============================
// UI 辅助
// ==============================

/**
 * 输入框错误状态
 */
function showInputError(show) {
    if (show) {
        wordInput.classList.add('input-error');
    } else {
        wordInput.classList.remove('input-error');
    }
}

/**
 * 显示消息提示
 */
function showMessage(message, type) {
    if (messageTimer) {
        clearTimeout(messageTimer);
    }
    
    wordMessage.textContent = message;
    wordMessage.className = 'message-toast show ' + type;
    
    messageTimer = setTimeout(() => {
        wordMessage.classList.remove('show');
        messageTimer = null;
    }, 2500);
}

// 清除输入框错误状态
wordInput.addEventListener('input', () => {
    showInputError(false);
});

// ==============================
// 启动
// ==============================
document.addEventListener('DOMContentLoaded', () => {
    // 等待 i18n 初始化完成后加载
    setTimeout(init, 50);
});
