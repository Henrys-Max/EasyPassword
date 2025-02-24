/**
 * 密码强度评估工具类 V1.1.0
 * 提供密码强度评估、诊断和优化建议功能
 */

// 使用传统方式加载依赖
const scriptCharset = document.createElement('script');
scriptCharset.src = '/lib/shared/charset.js';
document.head.appendChild(scriptCharset);

const scriptUtils = document.createElement('script');
scriptUtils.src = '/lib/shared/utils.js';
document.head.appendChild(scriptUtils);

class PasswordStrength {
    // 密码强度等级定义
    static STRENGTH_LEVELS = [
        { threshold: 40, label: "极弱", color: "#ff4444" },
        { threshold: 60, label: "中等", color: "#ffd700" },
        { threshold: 80, label: "强", color: "#7CFC00" },
        { threshold: 95, label: "极强", color: "#006400" }
    ];

    // 评分维度权重
    static SCORE_WEIGHTS = {
        characterDiversity: 0.30,  // 字符多样性
        effectiveLength: 0.35,    // 有效长度
        patternSecurity: 0.25,    // 模式安全性
        weaknessMatch: 0.10       // 弱密码匹配度
    };

    /**
     * 评估密码强度
     * @param {string} password - 待评估的密码
     * @param {Object} options - 评估选项
     * @returns {Object} 评估结果
     */
    static evaluateStrength(password, options = {}) {
        // 计算各维度得分
        const scores = {
            characterDiversity: this.evaluateCharacterDiversity(password, options),
            effectiveLength: this.evaluateEffectiveLength(password),
            patternSecurity: this.evaluatePatternSecurity(password, options.userData).score,
            weaknessMatch: this.evaluateWeaknessMatch(password)
        };

        // 使用预定义的权重计算综合得分
        const score = Object.entries(scores).reduce((total, [key, score]) => {
            return total + score * this.SCORE_WEIGHTS[key];
        }, 0);

        // 获取优势项和建议
        const patternSecurityResult = this.evaluatePatternSecurity(password, options.userData);
        const diagnosis = this.diagnoseProblem(password, options);
        const suggestions = this.generateTargetedSuggestions({
            risks: patternSecurityResult.risks,
            effectiveLengthScore: scores.effectiveLength
        });

        return {
            score: Math.min(100, score),
            level: this.getStrengthLevel(score),
            advantages: diagnosis.advantages,
            risks: diagnosis.risks,
            suggestions,
            entropy: this.calculateEntropy(password),
            diagnosis: {
                advantages: diagnosis.advantages,
                risks: diagnosis.risks
            }
        };
    }

    /**
     * 计算综合得分
     * @private
     */
    static calculateScore(password, options) {
        const scores = {
            characterDiversity: this.evaluateCharacterDiversity(password, options),
            effectiveLength: this.evaluateEffectiveLength(password),
            patternSecurity: this.evaluatePatternSecurity(password),
            weaknessMatch: this.evaluateWeaknessMatch(password)
        };

        return Object.entries(scores).reduce((total, [key, score]) => {
            return total + score * this.SCORE_WEIGHTS[key];
        }, 0);
    }

    /**
     * 评估字符多样性得分
     * @private
     */
    static evaluateCharacterDiversity(password, options) {
        const typeStats = {
            upper: (password.match(/[A-Z]/g) || []).length,
            lower: (password.match(/[a-z]/g) || []).length,
            number: (password.match(/[0-9]/g) || []).length,
            symbol: (password.match(/[!@#$%^&*_+=?]/g) || []).length
        };

        // 类型存在性得分（0-40分）
        const existenceScore = Object.values(typeStats).filter(v => v > 0).length * 10;

        // 分布均衡性得分（0-60分）
        const totalChars = password.length;
        const distributionScore = Object.values(typeStats).reduce((score, count) => 
            score + (count / totalChars >= 0.15 ? 15 : 0), 0);

        return Math.min(100, existenceScore + distributionScore);
    }

    /**
     * 评估有效长度得分
     * @private
     */
    static evaluateEffectiveLength(password) {
        const length = password.length;
        if (length >= 15) return 100;
        if (length <= 8) return 0;
        return ((length - 8) / 7) * 100;
    }

    /**
     * 评估模式安全性得分
     * @private
     */
    static PATTERN_DEFINITIONS = {
        KEYBOARD_SEQUENCE: [/qwerty|asdfgh|zxcvbn/i, "键盘序列"],
        DATE_FORMAT: [/(19|20)\d{2}[-\/](0[1-9]|1[0-2])[-\/](0[1-9]|[12][0-9]|3[01])/, "日期格式"],
        L33T_SPEAK: [/[4@4]|[3€3]|[0○0]/, "Leet语变形"],
        SEASON_WORDS: [/spring|summer|autumn|winter|春|夏|秋|冬/i, "季节词汇"]
    };

    static checkContextAssociation(password, userData = {}) {
        const risks = [];
        if (userData.username && password.toLowerCase().includes(userData.username.toLowerCase())) {
            risks.push("包含用户名");
        }
        if (userData.birthYear && password.includes(userData.birthYear)) {
            risks.push("包含出生年份");
        }
        return risks;
    }

    static evaluatePatternSecurity(password, userData = {}) {
        let score = 100;
        const risks = [];

        // 检查各种模式
        for (const [key, [pattern, label]] of Object.entries(this.PATTERN_DEFINITIONS)) {
            if (pattern.test(password)) {
                score -= 25;
                risks.push(label);
            }
        }

        // 检查上下文关联
        const contextRisks = this.checkContextAssociation(password, userData);
        if (contextRisks.length > 0) {
            score -= 20 * contextRisks.length;
            risks.push(...contextRisks);
        }

        return {
            score: Math.max(0, score),
            risks
        };
    }

    /**
     * 评估弱密码匹配度得分
     * @private
     */
    static evaluateWeaknessMatch(password) {
        let score = 100;

        // 检查常见单词
        if (/password|admin|user|login/i.test(password)) {
            score -= 40;
        }

        // 检查日期格式
        if (/\d{4,}/.test(password)) {
            score -= 20;
        }

        return Math.max(0, score);
    }

    /**
     * 获取密码强度等级
     * @private
     */
    static getStrengthLevel(score) {
        for (const level of this.STRENGTH_LEVELS) {
            if (score <= level.threshold) {
                return level;
            }
        }
        return this.STRENGTH_LEVELS[this.STRENGTH_LEVELS.length - 1];
    }

    /**
     * 诊断密码问题
     * @private
     */
    static diagnoseProblem(password, options) {
        const advantages = [];
        const risks = [];

        // 分析优势
        if (password.length >= 12) {
            advantages.push('密码长度充足');
        }
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
            advantages.push('同时包含大小写字母');
        }
        if (/[0-9]/.test(password)) {
            advantages.push('包含数字');
        }
        if (/[!@#$%^&*_+=?]/.test(password)) {
            advantages.push('包含特殊符号');
        }

        // 分析风险
        if (password.length < 8) {
            risks.push('密码长度过短');
        }
        if (hasKeyboardSequence(password, KEYBOARD_SEQUENCES)) {
            risks.push('包含键盘序列');
        }
        if (hasRepeatingChars(password)) {
            risks.push('包含重复字符');
        }
        if (matchesWeakPattern(password, WEAK_PATTERNS)) {
            risks.push('使用了常见的弱密码模式');
        }

        return { advantages, risks };
    }

    /**
     * 生成优化建议
     * @private
     */
    static generateSuggestions(password, score, diagnosis) {
        const suggestions = [];

        if (score < 60) {
            if (password.length < 12) {
                suggestions.push('建议增加密码长度到12位以上');
            }
            if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
                suggestions.push('建议同时使用大小写字母');
            }
            if (!/[0-9]/.test(password)) {
                suggestions.push('建议添加数字');
            }
            if (!/[!@#$%^&*_+=?]/.test(password)) {
                suggestions.push('建议添加特殊符号');
            }
        }

        if (diagnosis.risks.length > 0) {
            suggestions.push('避免使用键盘序列、重复字符和常见密码模式');
        }

        return suggestions;
    }

    /**
     * 计算密码熵值得分
     * @private
     */
    static calculateEntropyScore(password, options) {
        const charsetSize = this.getEffectiveCharsetSize(options);
        const entropy = Math.log2(Math.pow(charsetSize, password.length));
        return Math.min(100, (entropy / 128) * 100);
    }

    /**
     * 获取有效字符集大小
     * @private
     */
    static getEffectiveCharsetSize(options) {
        let size = 26; // 基础小写字母
        size += 26;    // 大写字母
        if (options.includeNumbers) size += 10;
        if (options.includeSymbols) size += 12;
        return size;
    }

    static evaluateBruteForceResistance(password) {
        const entropy = this.calculateEntropy(password);
        const timeToCrack = Math.pow(2, entropy) / 1e12; // 假设每秒尝试1万亿次
        return timeToCrack > 31536000 ? 100 : (timeToCrack / 31536000) * 100; // 1年为阈值
    }

    static calculateEntropy(password) {
        const charsetSize = this.getEffectiveCharsetSize(password);
        return Math.log2(Math.pow(charsetSize, password.length));
    }

    static getEffectiveCharsetSize(password) {
        let size = 0;
        if (/[a-z]/.test(password)) size += 26;
        if (/[A-Z]/.test(password)) size += 26;
        if (/[0-9]/.test(password)) size += 10;
        if (/[!@#$%^&*_+=?]/.test(password)) size += 12;
        return Math.max(26, size); // 至少使用小写字母集
    }

    static getScenarioWeights(scenario) {
        const WEIGHTS = {
            DEFAULT:      { length:0.3, diversity:0.4, entropy:0.3 },
            FINANCIAL:    { length:0.4, diversity:0.3, entropy:0.3 },
            SOCIAL_MEDIA: { length:0.2, diversity:0.5, entropy:0.3 }
        };
        return WEIGHTS[scenario] || WEIGHTS.DEFAULT;
    }

    static analyzeAdvantages(password) {
        const advantages = [];
        if (password.length >= 16) advantages.push("超长密码（≥16位）");
        if (/[\u4e00-\u9fa5]/.test(password)) advantages.push("包含非拉丁字符");
        if (this.calculateEntropy(password) > 120) advantages.push("熵值＞120bit");
        return advantages;
    }

    static generateTargetedSuggestions(diagnosis) {
        const suggestions = [];
        if (diagnosis.risks.includes("键盘序列")) {
            suggestions.push("替换序列字符：将'qwe'改为'k7m'");
        }
        if (diagnosis.effectiveLengthScore < 70) {
            suggestions.push("增加密码长度至12位以上");
        }
        return suggestions;
    }
}

// 在全局作用域中暴露类
window.PasswordStrength = PasswordStrength;