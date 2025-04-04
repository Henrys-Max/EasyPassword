/**
 * 密码强度评估工具类 V1.1.5
 * 提供密码强度评估、诊断和优化建议功能
 */

class PasswordStrength {
    // 密码强度等级定义
    static STRENGTH_LEVELS = [
        { threshold: 40, label: "weak" },
        { threshold: 60, label: "medium" },
        { threshold: 80, label: "strong" },
        { threshold: 95, label: "very-strong" }
    ];

    // 评分维度权重
    static SCORE_WEIGHTS = {
        characterDiversity: 0.35,  // 字符多样性
        effectiveLength: 0.35,    // 有效长度
        patternSecurity: 0.30,    // 模式安全性
    };

    /**
     * 评估密码强度
     * @param {string} password - 待评估的密码
     * @returns {Object} 评估结果
     */
    static evaluateStrength(password) {
        if (!password) {
            return {
                score: 0,
                level: this.STRENGTH_LEVELS[0],
                suggestions: ["请输入密码"],
                entropy: 0
            };
        }

        // 计算各维度得分
        const characterDiversityScore = this.evaluateCharacterDiversity(password);
        const effectiveLengthScore = this.evaluateEffectiveLength(password);
        const patternSecurityResult = this.evaluatePatternSecurity(password);

        // 使用预定义的权重计算综合得分
        const score = (
            characterDiversityScore * this.SCORE_WEIGHTS.characterDiversity +
            effectiveLengthScore * this.SCORE_WEIGHTS.effectiveLength +
            patternSecurityResult.score * this.SCORE_WEIGHTS.patternSecurity
        );

        // 获取强度等级
        const level = this.getStrengthLevel(score);

        // 使用固定的通用建议
        const suggestions = ["建议使用12位以上的密码，包含大小写字母、数字和特殊符号"];

        return {
            score: Math.round(Math.min(100, score)),
            level,
            suggestions,
            entropy: this.calculateEntropy(password)
        };
    }

    /**
     * 评估字符多样性得分
     * @private
     */
    static evaluateCharacterDiversity(password) {
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
        KEYBOARD_SEQUENCE: [/[qwerty|asdf|zxcv]{4,}/i, "键盘序列"],
        DATE_FORMAT: [/(19|20)\d{2}[-\/](0[1-9]|1[0-2])[-\/](0[1-9]|[12][0-9]|3[01])/, "日期格式"]
    };

    static evaluatePatternSecurity(password) {
        let score = 100;
        const risks = [];

        // 检查各种模式
        for (const [key, [pattern, label]] of Object.entries(this.PATTERN_DEFINITIONS)) {
            if (pattern.test(password)) {
                score -= 25;
                risks.push(label);
            }
        }

        return {
            score: Math.max(0, score),
            risks
        };
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
     * 计算密码熵值
     * @private
     */
    static calculateEntropy(password) {
        let size = 0;
        if (/[a-z]/.test(password)) size += 26;
        if (/[A-Z]/.test(password)) size += 26;
        if (/[0-9]/.test(password)) size += 10;
        if (/[!@#$%^&*_+=?]/.test(password)) size += 12;
        return Math.log2(Math.pow(Math.max(26, size), password.length));
    }
}

export default PasswordStrength; 