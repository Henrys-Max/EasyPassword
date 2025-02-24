/**
 * 密码生成器类 V1.1.0
 * 提供安全且易用的密码生成功能，支持随机密码和易记忆密码的生成
 */

// 等待依赖加载完成
const loadDependencies = () => {
    return new Promise((resolve, reject) => {
        // 加载charset.js
        const scriptCharset = document.createElement('script');
        scriptCharset.src = '/lib/shared/charset.js';
        document.head.appendChild(scriptCharset);

        // 加载utils.js
        const scriptUtils = document.createElement('script');
        scriptUtils.src = '/lib/shared/utils.js';
        document.head.appendChild(scriptUtils);

        // 检查依赖是否加载完成
        const checkDependencies = () => {
            if (typeof self.CHARSET !== 'undefined' && typeof getSecureRandom !== 'undefined') {
                resolve();
            } else {
                setTimeout(checkDependencies, 100);
            }
        };
        checkDependencies();
    });
};

class PasswordGenerator {
    constructor() {
        // 预定义的常用单词列表（用于生成易记的密码）
        this.commonWords = [
            'able', 'acid', 'also', 'atom', 'Asia', 'aunt', 'back', 'band', 'bank', 'base', 'bath', 'bean', 'beat', 'been', 'bell', 'best', 'bird', 'bite', 'black', 'blank', 'blind', 'blow', 'boat', 'boil', 'bomb', 'bone', 'book', 'both', 'box', 'brand', 'bread', 'brew', 'brief', 'bring', 'brown', 'build', 'burn', 'busy', 'call', 'calm', 'camp', 'card', 'care', 'cart', 'case', 'city', 'clan', 'claw', 'clay', 'coal', 'code', 'coil', 'colt', 'come', 'cool', 'copy', 'core', 'corn', 'cost', 'couch', 'cove', 'cowl', 'cube', 'cure', 'curl', 'curr', 'cute', 'cyber', 'data', 'deal', 'dear', 'dean', 'deep', 'dial', 'diet', 'disc', 'disk', 'dock', 'dome', 'done', 'down', 'draw', 'drop', 'drug', 'drum', 'dual', 'duty', 'each', 'edit', 'else', 'emit', 'ends', 'envy', 'epic', 'euro', 'even', 'ever', 'exam', 'exit', 'face', 'fact', 'fail', 'fair', 'fake', 'fall', 'fame', 'fang', 'farm', 'fast', 'feast', 'feat', 'feet', 'feed', 'feel', 'fill', 'film', 'find', 'fine', 'fire', 'firm', 'fist', 'flag', 'flat', 'fled', 'flow', 'fluid', 'flush', 'foam', 'fold', 'folk', 'font', 'food', 'foot', 'fore', 'form', 'fort', 'four', 'from', 'fuel', 'full', 'game', 'gate', 'gene', 'gett', 'give', 'glad', 'glam', 'glare', 'glass', 'glow', 'glue', 'goad', 'goal', 'goat', 'gold', 'good', 'good', 'goof', 'golf', 'gone', 'gore', 'gpss', 'grid', 'grip', 'grow', 'grub', 'gulf', 'hair', 'half', 'halt', 'hand', 'hang', 'hard', 'harm', 'hasp', 'hate', 'head', 'heal', 'hear', 'heat', 'heck', 'help', 'hero', 'high', 'hill', 'hint', 'hire', 'hist', 'hole', 'holy', 'home', 'hook', 'hope', 'host', 'hour', 'http', 'html', 'icon', 'idea', 'idle', 'iffy', 'ille', 'imac', 'imap', 'info', 'into', 'iris', 'isle', 'item', 'java', 'jeep', 'join', 'joyj', 'just', 'keep', 'kilo', 'kind', 'kiss', 'kite', 'kitty', 'know', 'lack', 'lady', 'lake', 'lame', 'land', 'lane', 'lang', 'last', 'late', 'lava', 'lawl', 'laye', 'lead', 'leaf', 'lean', 'leap', 'learn', 'least', 'left', 'lend', 'less', 'lest', 'leve', 'liar', 'lick', 'lidl', 'lieb', 'life', 'lift', 'like', 'limb', 'line', 'link', 'lion', 'list', 'live', 'load', 'loan', 'lock', 'lone', 'long', 'loop', 'lord', 'lose', 'loss', 'loud', 'love', 'lowe', 'luck', 'lump', 'lung', 'main', 'make', 'male', 'mall', 'malt', 'manc', 'mand', 'many', 'mapl', 'mark', 'mask', 'mass', 'math', 'matt', 'mayo', 'mean', 'meal', 'meat', 'meet', 'melt', 'mesh', 'mess', 'meta', 'mice', 'mica', 'micr', 'mile', 'milk', 'mill', 'mina', 'mind', 'mini', 'miss', 'mist', 'mode', 'mold', 'mole', 'molt', 'mono', 'moon', 'more', 'most', 'motel', 'move', 'much', 'muck', 'muds', 'mugs', 'must', 'myth', 'name', 'near', 'neat', 'need', 'neon', 'nest', 'nets', 'news', 'next', 'nice', 'nick', 'nine', 'node', 'noma', 'none', 'noon', 'norm', 'nose', 'note', 'null', 'numb', 'oaks', 'obey', 'oath', 'oboe', 'obol', 'obvi', 'octa', 'odor', 'okay', 'olde', 'oned', 'only', 'onto', 'open', 'opal', 'opus', 'orca', 'orcl', 'oral', 'orth', 'osis', 'other', 'ounce', 'oval', 'over', 'ownp', 'pack', 'page', 'pain', 'pair', 'pale', 'palm', 'panl', 'pant', 'papa', 'para', 'park', 'part', 'pass', 'path', 'pawn', 'paye', 'pcic', 'pdas', 'peek', 'peer', 'peel', 'peep', 'peer', 'pelt', 'pent', 'peon', 'pept', 'perf', 'perm', 'pers', 'pest', 'pete', 'phil', 'phone', 'photo', 'pick', 'pict', 'pier', 'pill', 'pima', 'pipe', 'pity', 'place', 'plan', 'plat', 'play', 'plea', 'plod', 'plot', 'plow', 'plug', 'plum', 'plus', 'pmiw', 'pmod', 'port', 'pose', 'post', 'pour', 'power', 'prac', 'pray', 'pree', 'pred', 'press', 'prey', 'price', 'prime', 'print', 'pris', 'priv', 'prob', 'proc', 'prod', 'prof', 'prog', 'prom', 'prop', 'pros', 'prot', 'prow', 'prox', 'psst', 'pstn', 'puma', 'push', 'pute', 'quad', 'quag', 'quai', 'qual', 'quant', 'quart', 'quay', 'quee', 'quest', 'queue', 'quick', 'quiet', 'quit', 'quiz', 'race', 'rack', 'raid', 'rail', 'rain', 'rake', 'ramp', 'rand', 'rang', 'rank', 'rare', 'rate', 'rati', 'real', 'reap', 'rear', 'reas', 'rear', 'reap', 'rest', 'rets', 'rice', 'rich', 'rift', 'ring', 'risk', 'rite', 'road', 'rock', 'role', 'roll', 'roof', 'room', 'root', 'rose', 'rost', 'rotc', 'round', 'route', 'rowl', 'rube', 'rule', 'rune', 'rush', 'safe', 'sail', 'sale', 'salt', 'same', 'sane', 'save', 'saws', 'scan', 'scat', 'sche', 'scho', 'scii', 'scis', 'scot', 'seal', 'seam', 'seat', 'sect', 'send', 'sent', 'sept', 'sera', 'serv', 'sess', 'seta', 'seven', 'sexs', 'shade', 'shaft', 'shake', 'sham', 'shape', 'share', 'sharp', 'shear', 'shelf', 'shine', 'ship', 'shirt', 'shoe', 'shop', 'shot', 'show', 'side', 'sigh', 'sight', 'sign', 'silk', 'silt', 'simi', 'sing', 'site', 'size', 'skate', 'skip', 'skin', 'skyw', 'slab', 'slack', 'slam', 'slap', 'slave', 'sleep', 'slid', 'slim', 'slip', 'slot', 'slow', 'slum', 'slup', 'small', 'smart', 'smel', 'smile', 'smog', 'smol', 'snug', 'snow', 'soar', 'soak', 'soap', 'sock', 'soft', 'soil', 'sold', 'sole', 'some', 'song', 'soon', 'soot', 'sort', 'soul', 'sound', 'soup', 'sour', 'south', 'spat', 'spat', 'spec', 'speed', 'spell', 'spend', 'spin', 'spit', 'spite', 'split', 'spot', 'spry', 'spyx', 'squa', 'stab', 'staff', 'stage', 'stair', 'stamp', 'stand', 'starv', 'state', 'staye', 'stead', 'steal', 'steam', 'steel', 'stem', 'step', 'stereo', 'still', 'stim', 'sting', 'stirr', 'stock', 'stop', 'store', 'story', 'stout', 'stow', 'stra', 'strain', 'strange', 'strap', 'stray', 'streak', 'street', 'stress', 'stretch', 'strict', 'strike', 'strong', 'struc', 'stub', 'stun', 'suba', 'subb', 'such', 'suck', 'suit', 'sumo', 'summ', 'sunn', 'supe', 'sure', 'surf', 'surge', 'suss', 'sute', 'swan', 'swap', 'swell', 'swim', 'swing', 'switch', 'symbol', 'sync', 'syss', 'talk', 'tall', 'tape', 'task', 'taxx', 'team', 'tech', 'tele', 'temp', 'tend', 'term', 'test', 'text', 'than', 'that', 'them', 'then', 'this', 'thor', 'thus', 'tide', 'tied', 'time', 'tint', 'tiny', 'tipw', 'tire', 'toad', 'tobe', 'tock', 'tool', 'toot', 'topo', 'torn', 'toss', 'tour', 'town', 'toxic', 'toyx', 'track', 'trade', 'trail', 'tram', 'tray', 'tree', 'trig', 'trip', 'troop', 'trop', 'true', 'trust', 'truth', 'trye', 'tube', 'tuck', 'tuff', 'tula', 'turn', 'twin', 'type', 'uage', 'udde', 'ufoe', 'ughh', 'ulna', 'ultra', 'ummm', 'umps', 'unci', 'unda', 'unit', 'upon', 'used', 'user', 'util', 'vals', 'vamp', 'vase', 'vast', 'vate', 'vauu', 'verb', 'very', 'veto', 'viaa', 'vice', 'view', 'vile', 'villa', 'vinyl', 'viny', 'visa', 'visit', 'void', 'volt', 'vote', 'vowe', 'vult', 'walk', 'walla', 'want', 'warm', 'warn', 'wash', 'waste', 'water', 'wave', 'wayy', 'webc', 'webm', 'week', 'weep', 'welll', 'went', 'were', 'west', 'what', 'when', 'whip', 'whirl', 'white', 'whoa', 'wide', 'wife', 'wild', 'will', 'winy', 'wipe', 'wire', 'wise', 'wish', 'with', 'wolf', 'woman', 'word', 'work', 'wrap', 'writ', 'wrong', 'yack', 'year', 'yell', 'yelp', 'yesy', 'yeti', 'yoke', 'zone', 'zoom'
        ];

        // 初始化Web Worker
        this.initWorker();
    }

    initWorker() {
        this.worker = new Worker('/lib/worker.js');
        this.worker.onmessage = (e) => {
            const { type, password, message } = e.data;
            if (type === 'success') {
                // 触发密码生成成功事件
                const event = new CustomEvent('passwordGenerated', {
                    detail: { password }
                });
                window.dispatchEvent(event);
            } else if (type === 'error') {
                console.error('密码生成失败:', message);
                // 触发错误事件
                const event = new CustomEvent('passwordError', {
                    detail: { message }
                });
                window.dispatchEvent(event);
            }
        };

        this.worker.onerror = (error) => {
            console.error('Web Worker错误:', error);
            const event = new CustomEvent('passwordError', {
                detail: { message: error.message }
            });
            window.dispatchEvent(event);
        };
    }

    generateRandomPassword(length, includeNumbers, includeSymbols) {
        this.worker.postMessage({
            type: 'generate',
            options: { length, includeNumbers, includeSymbols }
        });
    }

    generateMemorablePassword(length, includeNumbers, includeSymbols) {
        this.worker.postMessage({
            type: 'generate_memorable',
            options: { length, includeNumbers, includeSymbols, commonWords: this.commonWords }
        });
    }
}

// 初始化密码生成器并导出
loadDependencies().then(() => {
    window.passwordGenerator = new PasswordGenerator();
    console.log('密码生成器初始化完成');
}).catch(error => {
    console.error('密码生成器初始化失败:', error);
});