/**
 * 共享字符集配置 V1.1.5
 * 定义了密码生成器使用的字符集和安全规则，经过优化以提高可读性和安全性
 * 
 * 字符集设计原则：
 * 1. 可读性优化：排除易混淆字符（如I/l/1, O/0）
 * 2. 安全性考虑：提供足够的字符种类以增加密码熵值
 * 3. 使用频率：选择常用且易于输入的特殊符号
 */

const CHARSET = {
    uppercase: 'ABCDEFGHJKLMNPQRSTUVWXYZ',  // 排除易混淆的I和O
    lowercase: 'abcdefghijkmnpqrstuvwxyz',   // 排除易混淆的l和o
    numbers: '23456789',                     // 排除易混淆的0和1
    symbols: '!@#$%^&*_+-=?'                 // 精选的特殊符号
};

// 键盘序列模式（用于检测和防止）
const KEYBOARD_SEQUENCES = [
    'qwe', 'wer', 'ert', 'rty', 'tyu', 'yui', 'uio', 'iop',
    'asd', 'sdf', 'dfg', 'fgh', 'ghj', 'hjk', 'jkl',
    'zxc', 'xcv', 'cvb', 'vbn', 'bnm'
];

// 弱密码模式（简化版，实际应用中应该使用更完整的弱密码库）
const WEAK_PATTERNS = [
    /^123/, /^abc/, /password/i, /admin/i, /user/i, /login/i
];

// 在全局作用域中暴露变量
self.CHARSET = CHARSET;
self.KEYBOARD_SEQUENCES = KEYBOARD_SEQUENCES;
self.WEAK_PATTERNS = WEAK_PATTERNS; 