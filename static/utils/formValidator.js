/**
 * 表单验证工具类
 */
class FormValidator {
  /**
   * 验证表单字段
   * @param {Object} form 表单数据
   * @param {Object} rules 验证规则
   * @returns {Object} 验证结果 {valid: boolean, message: string}
   */
  static validate(form, rules) {
    for (const field in rules) {
      if (rules.hasOwnProperty(field)) {
        const fieldRules = rules[field];
        
        for (const rule of fieldRules) {
          // 必填验证
          if (rule.required && (form[field] === undefined || form[field] === null || form[field] === '')) {
            return {
              valid: false,
              field,
              message: rule.message || `${field}不能为空`
            };
          }
          
          // 最小长度验证
          if (rule.min && form[field] && form[field].length < rule.min) {
            return {
              valid: false,
              field,
              message: rule.message || `${field}不能少于${rule.min}个字符`
            };
          }
          
          // 最大长度验证
          if (rule.max && form[field] && form[field].length > rule.max) {
            return {
              valid: false,
              field,
              message: rule.message || `${field}不能超过${rule.max}个字符`
            };
          }
          
          // 数字验证
          if (rule.type === 'number' && form[field] && isNaN(Number(form[field]))) {
            return {
              valid: false,
              field,
              message: rule.message || `${field}必须是数字`
            };
          }
          
          // 手机号验证
          if (rule.type === 'phone' && form[field] && !/^1\d{10}$/.test(form[field])) {
            return {
              valid: false,
              field,
              message: rule.message || `请输入有效的手机号码`
            };
          }
          
          // 邮箱验证
          if (rule.type === 'email' && form[field] && !/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(form[field])) {
            return {
              valid: false,
              field,
              message: rule.message || `请输入有效的邮箱地址`
            };
          }
          
          // 自定义验证函数
          if (rule.validator && typeof rule.validator === 'function') {
            const result = rule.validator(form[field], form);
            if (result !== true) {
              return {
                valid: false,
                field,
                message: result || rule.message || `${field}验证失败`
              };
            }
          }
        }
      }
    }
    
    return { valid: true };
  }
  
  /**
   * 显示验证错误消息
   * @param {string} message 错误消息
   */
  static showError(message) {
    uni.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  }
  
  /**
   * 验证表单并显示错误消息
   * @param {Object} form 表单数据
   * @param {Object} rules 验证规则
   * @returns {boolean} 验证是否通过
   */
  static validateAndShowError(form, rules) {
    const result = this.validate(form, rules);
    if (!result.valid) {
      this.showError(result.message);
      return false;
    }
    return true;
  }
}

export default FormValidator;