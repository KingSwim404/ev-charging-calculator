/**
 * 充电预估助手核心计算工具类
 */

/**
 * 计算预估结果
 * @param {Object} params 计算参数
 * @param {number} params.batteryCapacity 车辆容量(kWh)
 * @param {number} params.currentBattery 当前电量(%)
 * @param {number} params.electricityPrice 电价(元/度)
 * @param {number} params.chargingAmount 充电金额(元)
 * @param {number} params.chargingLossRate 充电损耗率
 * @returns {Object} 计算结果
 */
function calculateEstimation(params) {
  const { batteryCapacity, currentBattery, electricityPrice, chargingAmount, chargingLossRate } = params;
  
  // 可充电量 = 充电金额 ÷ 电价
  const purchasedElectricity = chargingAmount / electricityPrice;
  
  // 预估充入电池电量 = 可充电量 × 充电损耗率
  const estimatedBatteryIncrease = purchasedElectricity * chargingLossRate;
  
  // 预估充电后电量 = (当前电量% × 容量 + 预估充入电池电量) ÷ 容量 × 100%
  const currentBatteryKwh = (currentBattery / 100) * batteryCapacity;
  const estimatedFinalBattery = ((currentBatteryKwh + estimatedBatteryIncrease) / batteryCapacity) * 100;
  
  return {
    purchasedElectricity: parseFloat(purchasedElectricity.toFixed(2)),
    estimatedBatteryIncrease: parseFloat(estimatedBatteryIncrease.toFixed(2)),
    estimatedFinalBattery: parseFloat(estimatedFinalBattery.toFixed(2))
  };
}

/**
 * 计算实际结果
 * @param {Object} params 计算参数
 * @param {number} params.batteryCapacity 车辆容量(kWh)
 * @param {number} params.currentBattery 当前电量(%)
 * @param {number} params.electricityPrice 电价(元/度)
 * @param {number} params.actualExpense 实际支出(元)
 * @param {number} params.actualFinalBattery 实际达到电量(%)
 * @returns {Object} 计算结果
 */
function calculateActualResults(params) {
  const { batteryCapacity, currentBattery, electricityPrice, actualExpense, actualFinalBattery } = params;
  
  // 可充电量 = 实际支出 ÷ 预设电价
  const purchasedElectricity = actualExpense / electricityPrice;
  
  // 实际充入电池电量 = (实际达到电量% - 当前电量%) × 容量
  const actualBatteryIncrease = ((actualFinalBattery - currentBattery) / 100) * batteryCapacity;
  
  // 真实充电损耗率 = 实际充入电量 ÷ 可充电量
  const actualChargingLossRate = actualBatteryIncrease / purchasedElectricity;
  
  // 实际电价 = 实际支出 ÷ 可充电量
  const actualElectricityPrice = actualExpense / purchasedElectricity;
  
  return {
    actualBatteryIncrease: parseFloat(actualBatteryIncrease.toFixed(2)),
    actualChargingLossRate: parseFloat(actualChargingLossRate.toFixed(2)),
    actualElectricityPrice: parseFloat(actualElectricityPrice.toFixed(2))
  };
}

/**
 * 创建历史记录对象
 * @param {Object} inputData 输入数据
 * @param {Object} estimationResults 预估结果
 * @param {Object} actualData 实际数据
 * @param {Object} actualResults 实际结果计算
 * @returns {Object} 历史记录对象
 */
function createHistoryRecord(inputData, estimationResults, actualData, actualResults) {
  return {
    // 基础输入数据
    batteryCapacity: inputData.batteryCapacity,
    currentBattery: inputData.currentBattery,
    electricityPrice: inputData.electricityPrice,
    chargingAmount: inputData.chargingAmount,
    chargingLossRate: inputData.chargingLossRate,
    
    // 预估结果
    purchasedElectricity: estimationResults.purchasedElectricity,
    estimatedBatteryIncrease: estimationResults.estimatedBatteryIncrease,
    estimatedFinalBattery: estimationResults.estimatedFinalBattery,
    
    // 实际数据
    actualChargingFee: actualData.actualChargingFee,
    actualExpense: actualData.actualExpense,
    actualFinalBattery: actualData.actualFinalBattery,
    
    // 计算结果
    actualBatteryIncrease: actualResults.actualBatteryIncrease,
    actualChargingLossRate: actualResults.actualChargingLossRate,
    actualElectricityPrice: actualResults.actualElectricityPrice,
    
    // 元数据
    timestamp: Date.now(),
    dataSource: "actual"
  };
}

module.exports = {
  calculateEstimation,
  calculateActualResults,
  createHistoryRecord
};
