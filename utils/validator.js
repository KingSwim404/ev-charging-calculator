/**
 * 充电预估助手输入验证工具类
 */

/**
 * 验证车辆容量输入
 * @param {string} value 输入值
 * @returns {Object} 验证结果，包含isValid和errorMsg
 */
function validateBatteryCapacity(value) {
  if (!value) {
    return { isValid: false, errorMsg: '请输入车辆容量' };
  }
  
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { isValid: false, errorMsg: '请输入有效数字' };
  }
  
  if (num <= 0) {
    return { isValid: false, errorMsg: '容量必须大于0' };
  }
  
  if (num < 10 || num > 200) {
    return { isValid: false, errorMsg: '请输入10-200之间的值' };
  }
  
  return { isValid: true, errorMsg: '' };
}

/**
 * 验证电量百分比输入
 * @param {string} value 输入值
 * @returns {Object} 验证结果，包含isValid和errorMsg
 */
function validateBatteryPercentage(value) {
  if (!value) {
    return { isValid: false, errorMsg: '请输入电量百分比' };
  }
  
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { isValid: false, errorMsg: '请输入有效数字' };
  }
  
  if (num < 0 || num > 100) {
    return { isValid: false, errorMsg: '电量必须在0-100%之间' };
  }
  
  return { isValid: true, errorMsg: '' };
}

/**
 * 验证电价输入
 * @param {string} value 输入值
 * @returns {Object} 验证结果，包含isValid和errorMsg
 */
function validateElectricityPrice(value) {
  if (!value) {
    return { isValid: false, errorMsg: '请输入电价' };
  }
  
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { isValid: false, errorMsg: '请输入有效数字' };
  }
  
  if (num <= 0) {
    return { isValid: false, errorMsg: '电价必须大于0' };
  }
  
  return { isValid: true, errorMsg: '' };
}

/**
 * 验证金额输入
 * @param {string} value 输入值
 * @returns {Object} 验证结果，包含isValid和errorMsg
 */
function validateAmount(value) {
  if (!value) {
    return { isValid: false, errorMsg: '请输入金额' };
  }
  
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { isValid: false, errorMsg: '请输入有效数字' };
  }
  
  if (num <= 0) {
    return { isValid: false, errorMsg: '金额必须大于0' };
  }
  
  return { isValid: true, errorMsg: '' };
}

/**
 * 验证实际达到电量
 * @param {string} value 输入值
 * @param {number} currentBattery 当前电量
 * @returns {Object} 验证结果，包含isValid和errorMsg
 */
function validateFinalBattery(value, currentBattery) {
  if (!value) {
    return { isValid: false, errorMsg: '请输入达到电量' };
  }
  
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { isValid: false, errorMsg: '请输入有效数字' };
  }
  
  if (num < 0 || num > 100) {
    return { isValid: false, errorMsg: '电量必须在0-100%之间' };
  }
  
  if (num < currentBattery) {
    return { isValid: false, errorMsg: '达到电量不能低于当前电量' };
  }
  
  return { isValid: true, errorMsg: '' };
}

/**
 * 安全计算函数，捕获计算过程中的异常
 * @param {Function} calculationFunction 计算函数
 * @param {Object} params 计算参数
 * @returns {Object|null} 计算结果或null（如果出错）
 */
function safeCalculate(calculationFunction, params) {
  try {
    return calculationFunction(params);
  } catch (error) {
    console.error('计算错误:', error);
    wx.showToast({
      title: '计算出错，请检查输入',
      icon: 'none'
    });
    return null;
  }
}

/**
 * 安全存储函数，捕获存储过程中的异常
 * @param {Function} operation 存储操作函数
 * @param {any} data 要存储的数据
 * @returns {any|null} 操作结果或null（如果出错）
 */
function safeStorage(operation, data) {
  try {
    return operation(data);
  } catch (error) {
    console.error('存储错误:', error);
    wx.showToast({
      title: '数据保存失败',
      icon: 'none'
    });
    return null;
  }
}

module.exports = {
  validateBatteryCapacity,
  validateBatteryPercentage,
  validateElectricityPrice,
  validateAmount,
  validateFinalBattery,
  safeCalculate,
  safeStorage
};
