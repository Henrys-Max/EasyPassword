/**
 * 密码强度评估工具类 V1.1.0
 * 提供密码强度评估、诊断和优化建议功能
 */

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
        effectiveLength: 0.25,    // 有效长度
        patternSecurity: 0.25,    // 模式安全性
        weaknessMatch: 0.20       // 弱密码匹配度
    };

    /**
     * 评估密码强度
     * @param {string} password - 待评估的密码
     * @param {Object} options - 评估选项
     * @returns {Object} 评估结果
     */
    static evaluateStrength(password, options = {}) {
        if (!password) {
            return {
                score: 0,
                level: this.STRENGTH_LEVELS[0],
                suggestions: ["请输入密码"],
                entropy: 0
            };
        }

        // 计算各维度得分
        const characterDiversityScore = this.evaluateCharacterDiversity(password, options);
        const effectiveLengthScore = this.evaluateEffectiveLength(password);
        const patternSecurityResult = this.evaluatePatternSecurity(password);
        const weaknessMatchScore = this.evaluateWeaknessMatch(password);

        // 使用预定义的权重计算综合得分
        const score = (
            characterDiversityScore * this.SCORE_WEIGHTS.characterDiversity +
            effectiveLengthScore * this.SCORE_WEIGHTS.effectiveLength +
            patternSecurityResult.score * this.SCORE_WEIGHTS.patternSecurity +
            weaknessMatchScore * this.SCORE_WEIGHTS.weaknessMatch
        );

        // 获取强度等级
        const level = this.getStrengthLevel(score);

        // 生成建议
        const suggestions = this.generateTargetedSuggestions({
            effectiveLengthScore,
            characterDiversityScore,
            risks: patternSecurityResult.risks
        });

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
     * 计算密码熵值
     * @private
     */
    static calculateEntropy(password) {
        const charsetSize = this.getEffectiveCharsetSize(password);
        return Math.log2(Math.pow(charsetSize, password.length));
    }

    /**
     * 获取有效字符集大小
     * @private
     */
    static getEffectiveCharsetSize(password) {
        let size = 0;
        if (/[a-z]/.test(password)) size += 26;
        if (/[A-Z]/.test(password)) size += 26;
        if (/[0-9]/.test(password)) size += 10;
        if (/[!@#$%^&*_+=?]/.test(password)) size += 12;
        return Math.max(26, size); // 至少使用小写字母集
    }

    /**
     * 生成针对性建议
     * @private
     */
    static generateTargetedSuggestions(diagnosis) {
        const suggestions = [];
        
        if (diagnosis.effectiveLengthScore < 70) {
            suggestions.push("建议增加密码长度至12位以上");
        }
        
        if (diagnosis.characterDiversityScore < 60) {
            suggestions.push("建议使用大小写字母、数字和特殊符号的组合");
        }
        
        if (diagnosis.risks && diagnosis.risks.length > 0) {
            suggestions.push("避免使用键盘序列、日期等常见模式");
        }
        
        return suggestions;
    }
}

// 在全局作用域中暴露类
window.PasswordStrength = PasswordStrength;