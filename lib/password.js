/**
 * 密码生成器类 V1.1.0
 * 提供安全且易用的密码生成功能，支持随机密码和易记忆密码的生成
 * 
 * 主要功能：
 * 1. 生成随机乱序密码：使用密码学安全的随机数生成器，确保密码强度
 * 2. 生成易记忆密码：基于常用单词组合，提高密码可记忆性
 * 3. 支持自定义密码规则：灵活配置长度、字符类型等参数
 * 
 * 安全特性：
 * - 使用Web Worker实现异步密码生成，避免阻塞主线程
 * - 采用Web Crypto API生成高质量随机数，保证密码随机性
 * - 实现多重密码复杂度校验，包括熵值计算和模式检测
 * - 防止键盘序列和连续重复字符，增强密码安全性
 * - 排除易混淆字符，提高密码可用性和准确性
 * - 智能分布特殊字符，确保密码结构均衡
 * 
 * 技术实现：
 * - 采用事件驱动架构，实现异步操作和状态管理
 * - 使用模块化设计，分离核心逻辑和界面交互
 * - 实现完整的错误处理机制，包括参数验证和异常恢复
 * - 支持配置持久化，提供一致的用户体验
 * - 优化的性能表现，快速响应用户操作
 */

// 使用传统方式加载依赖
const scriptCharset = document.createElement('script');
scriptCharset.src = '/lib/shared/charset.js';
document.head.appendChild(scriptCharset);

const scriptUtils = document.createElement('script');
scriptUtils.src = '/lib/shared/utils.js';
document.head.appendChild(scriptUtils);

class PasswordGenerator {
    /**
     * 初始化密码生成器
     * 定义基本字符集，排除易混淆的字符以提高可读性
     * 初始化Web Worker用于后台密码生成
     */
    constructor() {
        // 预定义的常用单词列表（用于生成易记的密码）
        this.commonWords = [
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
            'feat', 'feet', 'feed', 'feel', 'fill', 'film', 'find', 'fine', 'fire', 'firm',
            'fist', 'flag', 'flat', 'fled', 'flow', 'fluid', 'flush', 'foam', 'fold', 'folk',
            'font', 'food', 'foot', 'fore', 'form', 'fort', 'four', 'from', 'fuel', 'full',
            'game', 'gate', 'gene', 'gett', 'give', 'glad', 'glam', 'glare', 'glass', 'glow',
            'glue', 'goad', 'goal', 'goat', 'gold', 'good', 'goof', 'golf', 'gone', 'gore',
            'grid', 'grip', 'grow', 'grub', 'gulf', 'hair', 'half', 'halt', 'hand', 'hang',
            'hard', 'harm', 'hasp', 'hate', 'head', 'heal', 'hear', 'heat', 'heck', 'help',
            'hero', 'high', 'hill', 'hint', 'hire', 'hist', 'hole', 'holy', 'home', 'hook',
            'hope', 'host', 'hour', 'http', 'html', 'icon', 'idea', 'idle', 'iffy', 'info',
            'into', 'iris', 'isle', 'item', 'java', 'jeep', 'join', 'just', 'keep', 'kilo',
            'kind', 'kiss', 'kite', 'kitty', 'know', 'lack', 'lady', 'lake', 'lame', 'land',
            'lane', 'lang', 'last', 'late', 'lava', 'lawl', 'laye', 'lead', 'leaf', 'lean',
            'leap', 'learn', 'least', 'left', 'lend', 'less', 'lest', 'leve', 'liar', 'lick',
            'lidl', 'lieb', 'life', 'lift', 'like', 'limb', 'line', 'link', 'lion', 'list',
            'live', 'load', 'loan', 'lock', 'lone', 'long', 'loop', 'lord', 'lose', 'loss',
            'loud', 'love', 'lowe', 'luck', 'lump', 'lung', 'main', 'make', 'male', 'mall',
            'malt', 'manc', 'mand', 'many', 'mapl', 'mark', 'mask', 'mass', 'math', 'matt',
            'mayo', 'mean', 'meal', 'meat', 'meet', 'melt', 'mesh', 'mess', 'meta', 'mice',
            'mica', 'micr', 'mile', 'milk', 'mill', 'mina', 'mind', 'mini', 'miss', 'mist',
            'mode', 'mold', 'mole', 'molt', 'mono', 'moon', 'more', 'most', 'move', 'much',
            'muck', 'muds', 'mugs', 'must', 'myth', 'name', 'near', 'neat', 'need', 'neon',
            'nest', 'nets', 'news', 'next', 'nice', 'nick', 'nine', 'node', 'noma', 'none',
            'noon', 'norm', 'nose', 'note', 'null', 'numb', 'oaks', 'obey', 'oath', 'oboe',
            'obol', 'obvi', 'octa', 'odor', 'okay', 'olde', 'oned', 'only', 'onto', 'open',
            'opal', 'opus', 'orca', 'orcl', 'oral', 'orth', 'osis', 'other', 'ounce', 'oval',
            'over', 'ownp', 'pack', 'page', 'pain', 'pair', 'pale', 'palm', 'panl', 'pant',
            'papa', 'para', 'park', 'part', 'pass', 'path', 'pawn', 'paye', 'pcic', 'pdas',
            'peek', 'peer', 'peel', 'peep', 'pelt', 'pent', 'peon', 'pept', 'perf', 'perm',
            'pers', 'pest', 'pete', 'phil', 'phone', 'photo', 'pick', 'pict', 'pier', 'pill',
            'pima', 'pipe', 'pity', 'place', 'plan', 'plat', 'play', 'plea', 'plod', 'plot',
            'plow', 'plug', 'plum', 'plus', 'pmiw', 'pmod', 'port', 'pose', 'post', 'pour',
            'power', 'prac', 'pray', 'pree', 'pred', 'press', 'prey', 'price', 'prime', 'print',
            'pris', 'priv', 'prob', 'proc', 'prod', 'prof', 'prog', 'prom', 'prop', 'pros',
            'prot', 'prow', 'prox', 'psst', 'pstn', 'puma', 'push', 'pute', 'quad', 'quag',
            'quai', 'qual', 'quant', 'quart', 'quay', 'quee', 'quest', 'queue', 'quick', 'quiet',
            'quit', 'quiz', 'race', 'rack', 'raid', 'rail', 'rain', 'rake', 'ramp', 'rand',
            'rang', 'rank', 'rare', 'rate', 'rati', 'real', 'reap', 'rear', 'reas', 'rest',
            'rets', 'rice', 'rich', 'rift', 'ring', 'risk', 'rite', 'road', 'rock', 'role',
            'roll', 'roof', 'room', 'root', 'rose', 'rost', 'rotc', 'round', 'route', 'rowl',
            'rube', 'rule', 'rune', 'rush', 'safe', 'sail', 'sale', 'salt', 'same', 'sane',
            'save', 'saws', 'scan', 'scat', 'sche', 'scho', 'scii', 'scis', 'scot', 'seal',
            'seam', 'seat', 'sect', 'send', 'sent', 'sept', 'sera', 'serv', 'sess', 'seta',
            'seven', 'sexs', 'shade', 'shaft', 'shake', 'sham', 'shape', 'share', 'sharp', 'shear',
            'shelf', 'shine', 'ship', 'shirt', 'shoe', 'shop', 'shot', 'show', 'side', 'sigh',
            'sight', 'sign', 'silk', 'silt', 'simi', 'sing', 'site', 'size', 'skate', 'skip',
            'skin', 'skyw', 'slab', 'slack', 'slam', 'slap', 'slave', 'sleep', 'slid', 'slim',
            'slip', 'slot', 'slow', 'slum', 'slup', 'small', 'smart', 'smel', 'smile', 'smog',
            'smol', 'snug', 'snow', 'soar', 'soak', 'soap', 'sock', 'soft', 'soil', 'sold',
            'sole', 'some', 'song', 'soon', 'soot', 'sort', 'soul', 'sound', 'soup', 'sour',
            'south', 'spat', 'spec', 'speed', 'spell', 'spend', 'spin', 'spit', 'spite', 'split',
            'spot', 'spry', 'spyx', 'squa', 'stab', 'staff', 'stage', 'stair', 'stamp', 'stand',
            'starv', 'state', 'staye', 'stead', 'steal', 'steam', 'steel', 'stem', 'step', 'still',
            'stim', 'sting', 'stirr', 'stock', 'stop', 'store', 'story', 'stout', 'stow', 'stra',
            'strain', 'strange', 'strap', 'stray', 'streak', 'street', 'stress', 'stretch', 'strict', 'strike',
            'strong', 'struc', 'stub', 'stun', 'suba', 'subb', 'such', 'suck', 'suit', 'sumo',
            'summ', 'sunn', 'supe', 'sure', 'surf', 'surge', 'suss', 'sute', 'swan', 'swap',
            'swell', 'swim', 'swing', 'switch', 'symbol', 'sync', 'syss', 'talk', 'tall', 'tape',
            'task', 'taxx', 'team', 'tech', 'tele', 'temp', 'tend', 'term', 'test', 'text',
            'than', 'that', 'them', 'then', 'this', 'thor', 'thus', 'tide', 'tied', 'time',
            'tint', 'tiny', 'tipw', 'tire', 'toad', 'tobe', 'tock', 'tool', 'toot', 'topo',
            'torn', 'toss', 'tour', 'town', 'toxic', 'toyx', 'track', 'trade', 'trail', 'tram',
            'tray', 'tree', 'trig', 'trip', 'troop', 'trop', 'true', 'trust', 'truth', 'trye',
            'tube', 'tuck', 'tuff', 'tula', 'turn', 'twin', 'type', 'uage', 'udde', 'ufoe',
            'ughh', 'ulna', 'ultra', 'ummm', 'umps', 'unci', 'unda', 'unit', 'upon', 'used',
            'user', 'util', 'vals', 'vamp', 'vase', 'vast', 'vate', 'vauu', 'verb', 'very',
            'veto', 'viaa', 'vice', 'view', 'vile', 'villa', 'vinyl', 'viny', 'visa', 'visit',
            'void', 'volt', 'vote', 'vowe', 'vult', 'walk', 'walla', 'want', 'warm', 'warn',
            'wash', 'waste', 'water', 'wave', 'wayy', 'webc', 'webm', 'week', 'weep', 'welll',
            'went', 'were', 'west', 'what', 'when', 'whip', 'whirl', 'white', 'whoa', 'wide',
            'wife', 'wild', 'will', 'winy', 'wipe', 'wire', 'wise', 'wish', 'with', 'wolf',
            'woman', 'word', 'work', 'wrap', 'writ', 'wrong', 'yack', 'year', 'yell', 'yelp',
            'yesy', 'yeti', 'yoke', 'zone', 'zoom'
        ];
    
        // 初始化Web Worker，使用绝对路径
        this.worker = new Worker('/lib/worker.js');
        this.worker.onmessage = this.handleWorkerMessage.bind(this);
        this.worker.onerror = this.handleWorkerError.bind(this);
    }

    // Web Worker消息处理方法
    handleWorkerMessage(event) {
        const { type, password, message } = event.data;
        if (type === 'success') {
            // 触发密码生成成功事件
            window.dispatchEvent(new CustomEvent('passwordGenerated', {
                detail: { 
                    password,
                    message: '密码生成成功：已生成符合要求的安全密码'
                },
                bubbles: true,
                composed: true
            }));
        } else if (type === 'error') {
            // 触发密码生成失败事件
            window.dispatchEvent(new CustomEvent('passwordError', {
                detail: { 
                    message: '密码生成失败：' + message,
                    error: message
                },
                bubbles: true,
                composed: true
            }));
        }
    }

    handleWorkerError(error) {
        // 触发Worker错误事件
        window.dispatchEvent(new CustomEvent('passwordError', {
            detail: { 
                message: '密码生成器内部错误：' + error.message,
                error: error.message
            },
            bubbles: true,
            composed: true
        }));
    }

    /**
     * 生成随机乱序密码
     * @param {number} length - 密码长度（8-20位）
     * @param {boolean} includeNumbers - 是否包含数字
     * @param {boolean} includeSymbols - 是否包含特殊符号
     * @returns {void} 通过事件返回生成的密码
     */
    generateRandomPassword(length, includeNumbers, includeSymbols) {
        // 验证参数
        if (length < 8 || length > 20) {
            throw new Error('密码长度必须在8-20位之间');
        }

        // 使用Web Worker生成密码
        this.worker.postMessage({
            type: 'generate',
            options: { length, includeNumbers, includeSymbols }
        });
    }

    /**
     * 生成易记的密码（基于单词组合）
     * @param {number} length - 目标密码长度
     * @param {boolean} includeNumbers - 是否包含数字
     * @param {boolean} includeSymbols - 是否包含特殊符号
     * @returns {string} 生成的易记密码
     */
    generateMemorablePassword(length, includeNumbers, includeSymbols) {
        // 验证参数
        if (length < 8 || length > 20) {
            throw new Error('密码长度必须在8-20位之间');
        }

        // 使用Web Worker生成密码
        this.worker.postMessage({
            type: 'generate_memorable',
            options: { 
                length, 
                includeNumbers, 
                includeSymbols,
                commonWords: this.commonWords
            }
        });
    }
    }
    
// 创建密码生成器实例并设为全局变量
window.passwordGenerator = new PasswordGenerator();