// 充电预估助手首页逻辑
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 输入参数
    batteryCapacity: '', // 车辆容量(kWh)
    currentBattery: '', // 当前电量(%)
    electricityPrice: '', // 电价(元/度)
    chargingAmount: '', // 充电金额(元)
    isFullCharge: false, // 是否充满开关
    isFullBattery: false, // 是否满电开关
    
    // 输入验证错误信息
    batteryCapacityError: '',
    currentBatteryError: '',
    electricityPriceError: '',
    chargingAmountError: '',
    
    // 计算结果
    purchasedElectricity: null, // 可充电量(度)
    estimatedBatteryIncrease: null, // 预估充入电池电量(度)
    estimatedFinalBattery: null, // 预估充电后电量(%)
    
    // 充电损耗率
    chargingLossRate: 0, // 默认0，后续通过实际数据计算
    chargingLossRateSource: '(默认值)',
    
    // 实际数据录入
    isActualSectionOpen: false,
    actualChargingFee: '', // 充电费用(元)
    actualExpense: '', // 实际支出(元)
    actualFinalBattery: '', // 实际达到电量(%)
    
    // 实际数据验证错误信息
    actualChargingFeeError: '',
    actualExpenseError: '',
    actualFinalBatteryError: '',
    canSaveActualData: false,
    
    // 历史记录
    hasHistoryData: false,
    historyData: null,
    historyDate: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadDefaultValues();
  },

  /**
   * 加载默认值
   */
  loadDefaultValues: function () {
    try {
      const historyData = wx.getStorageSync('ev_charging_history');
      
      if (historyData) {
        // 设置历史数据
        this.setData({
          hasHistoryData: true,
          historyData: historyData,
          historyDate: this.formatDate(new Date(historyData.timestamp))
        });
        
        // 填充默认值
        this.setData({
          batteryCapacity: historyData.batteryCapacity.toString(),
          currentBattery: '40', // 当前电量默认为40%
          electricityPrice: historyData.electricityPrice.toString()
        });
        
        // 如果有实际损耗率数据，使用实际数据
        if (historyData.actualChargingLossRate !== undefined && historyData.actualChargingLossRate !== null) {
          this.setData({
            chargingLossRate: historyData.actualChargingLossRate,
            chargingLossRateSource: '(实际数据)',
            formattedChargingLossRate: (historyData.actualChargingLossRate * 100).toFixed(1)
          });
        }
      } else {
        // 无历史数据，使用系统默认值
        this.setData({
          currentBattery: '40',
          electricityPrice: '1.0',
          chargingLossRate: 0.12, // 默认损耗率12%
          chargingLossRateSource: '(默认值)',
          formattedChargingLossRate: '12.0'
        });
      }
    } catch (error) {
      console.error('加载默认值错误:', error);
    }
  },

  /**
   * 格式化日期
   */
  formatDate: function (date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * 输入事件处理函数
   */
  onBatteryCapacityInput: function (e) {
    const value = e.detail.value;
    let error = '';
    
    if (value && (isNaN(value) || parseFloat(value) <= 0)) {
      error = '请输入大于0的数值';
    }
    
    this.setData({
      batteryCapacity: value,
      batteryCapacityError: error
    });
    
    // 如果充满开关打开，重新计算充满所需金额
    if (this.data.isFullCharge) {
      this.calculateFullChargeAmount();
    }
    
    this.calculateResults();
  },
  
  onCurrentBatteryInput: function (e) {
    const value = e.detail.value;
    let error = '';
    
    if (value && (isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 100)) {
      error = '请输入0-100之间的数值';
    }
    
    this.setData({
      currentBattery: value,
      currentBatteryError: error
    });
    
    // 如果充满开关打开，重新计算充满所需金额
    if (this.data.isFullCharge) {
      this.calculateFullChargeAmount();
    }
    
    this.calculateResults();
  },
  
  onElectricityPriceInput: function (e) {
    const value = e.detail.value;
    let error = '';
    
    if (value && (isNaN(value) || parseFloat(value) <= 0)) {
      error = '请输入大于0的数值';
    }
    
    this.setData({
      electricityPrice: value,
      electricityPriceError: error
    });
    
    // 如果充满开关打开，重新计算充满所需金额
    if (this.data.isFullCharge) {
      this.calculateFullChargeAmount();
    }
    
    this.calculateResults();
  },
  
  onChargingAmountInput: function (e) {
    // 如果充满开关打开，不允许手动输入
    if (this.data.isFullCharge) {
      return;
    }
    
    const value = e.detail.value;
    let error = '';
    
    if (value && (isNaN(value) || parseFloat(value) <= 0)) {
      error = '请输入有效金额';
    }
    
    this.setData({
      chargingAmount: value,
      chargingAmountError: error
    });
    
    this.calculateResults();
  },
  
  /**
   * 充满开关切换事件
   */
  onFullChargeChange: function (e) {
    const isChecked = e.detail.value;
    
    this.setData({
      isFullCharge: isChecked
    });
    
    if (isChecked) {
      // 如果开关打开，计算充满所需金额
      this.calculateFullChargeAmount();
    } else {
      // 如果开关关闭，清空充电金额
      this.setData({
        chargingAmount: '',
        chargingAmountError: ''
      });
    }
    
    this.calculateResults();
  },
  
  /**
   * 计算充满所需金额
   */
  calculateFullChargeAmount: function () {
    try {
      const { 
        batteryCapacity, batteryCapacityError,
        currentBattery, currentBatteryError,
        electricityPrice, electricityPriceError,
        chargingLossRate
      } = this.data;
      
      // 检查必要参数
      if (
        !batteryCapacity || batteryCapacityError ||
        !currentBattery || currentBatteryError ||
        !electricityPrice || electricityPriceError
      ) {
        wx.showToast({
          title: '请先填写必要参数',
          icon: 'none',
          duration: 2000
        });
        
        // 如果参数不完整，关闭开关
        this.setData({
          isFullCharge: false
        });
        return;
      }
      
      // 转换为数值
      const batteryCapacityNum = parseFloat(batteryCapacity);
      const currentBatteryNum = parseFloat(currentBattery);
      const electricityPriceNum = parseFloat(electricityPrice);
      const lossRateNum = parseFloat(chargingLossRate) || 0;
      
      // 计算充满所需的电量（度）
      const neededBatteryKwh = batteryCapacityNum * (1 - currentBatteryNum / 100);
      
      // 考虑损耗率计算实际需要购买的电量
      // 如果损耗率为0，直接使用需要的电量
      // 否则，需要购买的电量 = 需要的电量 ÷ (1 - 损耗率)
      const neededPurchaseKwh = lossRateNum === 1 ? neededBatteryKwh : neededBatteryKwh / (1 - lossRateNum);
      
      // 计算充满所需金额
      const fullChargeAmount = neededPurchaseKwh * electricityPriceNum;
      
      // 更新充电金额，保甸2位小数
      this.setData({
        chargingAmount: fullChargeAmount.toFixed(2),
        chargingAmountError: ''
      });
    } catch (error) {
      console.error('计算充满金额错误:', error);
      wx.showToast({
        title: '计算出错，请检查输入',
        icon: 'none'
      });
      
      // 如果计算出错，关闭开关
      this.setData({
        isFullCharge: false
      });
    }
  },

  /**
   * 实际数据输入事件处理函数
   */
  onActualChargingFeeInput: function (e) {
    const value = e.detail.value;
    let error = '';
    
    if (value && (isNaN(value) || parseFloat(value) <= 0)) {
      error = '请输入大于0的数值';
    }
    
    this.setData({
      actualChargingFee: value,
      actualChargingFeeError: error
    });
    
    this.checkActualDataValidity();
  },
  
  onActualExpenseInput: function (e) {
    const value = e.detail.value;
    let error = '';
    
    if (value && (isNaN(value) || parseFloat(value) <= 0)) {
      error = '请输入大于0的数值';
    }
    
    this.setData({
      actualExpense: value,
      actualExpenseError: error
    });
    
    this.checkActualDataValidity();
  },
  
  onActualFinalBatteryInput: function (e) {
    // 如果满电开关已打开，不处理手动输入
    if (this.data.isFullBattery) {
      return;
    }
    
    const value = e.detail.value;
    let error = '';
    const currentBattery = parseFloat(this.data.currentBattery);
    
    if (value && (isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 100)) {
      error = '请输入0-100之间的数值';
    } else if (value && !isNaN(currentBattery) && parseFloat(value) < currentBattery) {
      error = '达到电量不能低于当前电量';
    }
    
    this.setData({
      actualFinalBattery: value,
      actualFinalBatteryError: error
    });
    
    this.checkActualDataValidity();
  },
  
  /**
   * 满电开关切换事件
   */
  onFullBatteryChange: function (e) {
    const isChecked = e.detail.value;
    
    this.setData({
      isFullBattery: isChecked
    });
    
    if (isChecked) {
      // 如果开关打开，自动填充100%
      this.setData({
        actualFinalBattery: '100',
        actualFinalBatteryError: ''
      });
    }
    
    this.checkActualDataValidity();
  },

  /**
   * 检查实际数据有效性
   */
  checkActualDataValidity: function () {
    const { 
      actualChargingFee, actualChargingFeeError,
      actualFinalBattery, actualFinalBatteryError,
      batteryCapacity, currentBattery
    } = this.data;
    
    // 检查所有必填字段是否已填写且无错误
    // 注意：已移除实际支出字段，所以不再检查
    const isValid = 
      actualChargingFee && !actualChargingFeeError &&
      actualFinalBattery && !actualFinalBatteryError &&
      batteryCapacity && currentBattery;
    
    this.setData({
      canSaveActualData: isValid
    });
  },

  /**
   * 计算预估结果
   */
  calculateResults: function () {
    try {
      const { 
        batteryCapacity, batteryCapacityError,
        currentBattery, currentBatteryError,
        electricityPrice, electricityPriceError,
        chargingAmount, chargingAmountError,
        chargingLossRate
      } = this.data;
      
      // 检查是否有所有必要参数且无错误
      let missingFields = [];
      let batteryCapacityMissing = false;
      let currentBatteryMissing = false;
      let electricityPriceMissing = false;
      let chargingAmountMissing = false;
      
      if (!batteryCapacity) {
        missingFields.push('车辆容量');
        batteryCapacityMissing = true;
      }
      if (!currentBattery) {
        missingFields.push('当前电量');
        currentBatteryMissing = true;
      }
      if (!electricityPrice) {
        missingFields.push('电价');
        electricityPriceMissing = true;
      }
      if (!chargingAmount) {
        missingFields.push('充电金额');
        chargingAmountMissing = true;
      }
      
      // 设置输入框错误状态
      this.setData({
        batteryCapacityError: batteryCapacityMissing ? '必填项' : batteryCapacityError,
        currentBatteryError: currentBatteryMissing ? '必填项' : currentBatteryError,
        electricityPriceError: electricityPriceMissing ? '必填项' : electricityPriceError,
        chargingAmountError: chargingAmountMissing ? '必填项' : chargingAmountError
      });
      
      // 如果有缺失参数，显示提示
      if (missingFields.length > 0) {
        wx.showToast({
          title: `请填写: ${missingFields.join('、')}`,
          icon: 'none',
          duration: 2000
        });
      }
      
      if (
        !batteryCapacity || batteryCapacityError ||
        !currentBattery || currentBatteryError ||
        !electricityPrice || electricityPriceError ||
        !chargingAmount || chargingAmountError
      ) {
        // 如果有缺失参数或错误，清空结果
        this.setData({
          purchasedElectricity: null,
          estimatedBatteryIncrease: null,
          estimatedFinalBattery: null
        });
        return;
      }
      
      // 转换为数值进行计算
      const batteryCapacityNum = parseFloat(batteryCapacity);
      const currentBatteryNum = parseFloat(currentBattery);
      const electricityPriceNum = parseFloat(electricityPrice);
      const chargingAmountNum = parseFloat(chargingAmount);
      
      // 可充电量 = 充电金额 ÷ 电价
      const purchasedElectricity = chargingAmountNum / electricityPriceNum;
      
      // 预估充入电池电量 = 可充电量 × (1 - 充电损耗率)
      // 充电损耗率表示损失的比例，所以需要用 1 减去损耗率
      const estimatedBatteryIncrease = purchasedElectricity * (1 - chargingLossRate);
      
      // 预估充电后电量 = (当前电量% × 容量 + 预估充入电池电量) ÷ 容量 × 100%
      const currentBatteryKwh = (currentBatteryNum / 100) * batteryCapacityNum;
      const estimatedFinalBattery = ((currentBatteryKwh + estimatedBatteryIncrease) / batteryCapacityNum) * 100;
      
      // 更新结果，保留2位小数，充电损耗率保留1位小数，充电后电量取整数
      this.setData({
        purchasedElectricity: purchasedElectricity.toFixed(2),
        estimatedBatteryIncrease: estimatedBatteryIncrease.toFixed(2),
        estimatedFinalBattery: Math.round(estimatedFinalBattery),
        formattedChargingLossRate: chargingLossRate !== undefined && chargingLossRate !== null ? (chargingLossRate * 100).toFixed(1) : '--'
      });
    } catch (error) {
      console.error('计算错误:', error);
      wx.showToast({
        title: '计算出错，请检查输入',
        icon: 'none'
      });
    }
  },

  // 实际数据录入区域始终显示，无需切换状态

  /**
   * 保存实际数据
   */
  saveActualData: function () {
    try {
      const { 
        batteryCapacity, currentBattery, electricityPrice, chargingAmount,
        purchasedElectricity, estimatedBatteryIncrease, estimatedFinalBattery,
        actualChargingFee, actualFinalBattery, chargingLossRate
      } = this.data;
      
      // 转换为数值
      const batteryCapacityNum = parseFloat(batteryCapacity);
      const currentBatteryNum = parseFloat(currentBattery);
      const electricityPriceNum = parseFloat(electricityPrice);
      const actualChargingFeeNum = parseFloat(actualChargingFee);
      const actualFinalBatteryNum = parseFloat(actualFinalBattery);
      
      // 计算实际结果
      // 实际充入电池电量 = (实际达到电量% - 当前电量%) × 容量
      const actualBatteryIncrease = ((actualFinalBatteryNum - currentBatteryNum) / 100) * batteryCapacityNum;
      
      // 可充电量 = 充电费用 ÷ 预设电价
      const actualPurchasedElectricity = actualChargingFeeNum / electricityPriceNum;
      
      // 真实充电损耗率 = 1 - (实际充入电量 ÷ 可充电量)
      // 损耗率表示损失的比例，所以是 1 减去有效率
      // 确保损耗率不小于0
      let actualChargingLossRate = 1 - (actualBatteryIncrease / actualPurchasedElectricity);
      if (actualChargingLossRate < 0) {
        actualChargingLossRate = 0;
        console.log('计算的损耗率小于0，已调整为0');
      }
      
      // 实际电价 = 充电费用 ÷ 可充电量
      const actualElectricityPrice = actualChargingFeeNum / actualPurchasedElectricity;
      
      // 创建历史记录
      const historyRecord = {
        // 基础输入数据
        batteryCapacity: batteryCapacityNum,
        currentBattery: currentBatteryNum,
        electricityPrice: electricityPriceNum,
        chargingAmount: parseFloat(chargingAmount),
        
        // 预估结果
        estimatedBatteryIncrease: parseFloat(estimatedBatteryIncrease),
        estimatedFinalBattery: parseFloat(estimatedFinalBattery),
        
        // 实际数据
        actualChargingFee: parseFloat(actualChargingFee),
        actualFinalBattery: actualFinalBatteryNum,
        
        // 计算结果
        actualBatteryIncrease: actualBatteryIncrease,
        actualChargingLossRate: actualChargingLossRate,
        actualElectricityPrice: actualElectricityPrice,
        
        // 元数据
        timestamp: Date.now(),
        dataSource: "actual"
      };
      
      // 检查损耗率是否异常（超过20%）
      if (actualChargingLossRate > 0.2) {
        const lossRatePercent = (actualChargingLossRate * 100).toFixed(1);
        // 使用确认对话框提示用户
        wx.showModal({
          title: '损耗率异常',
          content: `计算出的充电损耗率为${lossRatePercent}%，高于正常水平(12-20%)。请确认您输入的实际金额和达到电量是否正确？`,
          confirmText: '数据正确',
          cancelText: '重新输入',
          success: (res) => {
            if (res.confirm) {
              // 用户确认数据正确，继续保存
              this.completeDataSave(historyRecord, actualChargingLossRate);
            } else {
              // 用户选择重新输入，不保存数据
              wx.showToast({
                title: '已取消保存',
                icon: 'none'
              });
            }
          }
        });
      } else {
        // 损耗率正常，直接保存
        this.completeDataSave(historyRecord, actualChargingLossRate);
      }
    } catch (error) {
      console.error('保存数据错误:', error);
      wx.showToast({
        title: '数据保存失败',
        icon: 'none'
      });
    }
  },
  
  /**
   * 完成数据保存过程
   */
  completeDataSave: function(historyRecord, actualChargingLossRate) {
    // 保存到本地存储
    wx.setStorageSync('ev_charging_history', historyRecord);
    
    // 更新UI
    this.setData({
      hasHistoryData: true,
      historyData: historyRecord,
      historyDate: this.formatDate(new Date(historyRecord.timestamp)),
      chargingLossRate: actualChargingLossRate,
      chargingLossRateSource: '(实际数据)',
      
      // 清空实际数据输入并重置满电开关
      actualChargingFee: '',
      actualFinalBattery: '',
      isFullBattery: false
    });
    
    // 显示保存成功提示
    wx.showToast({
      title: '数据保存成功',
      icon: 'success'
    });
    
    // 重新计算预估结果（使用新的损耗率）
    this.calculateResults();
  }
});
