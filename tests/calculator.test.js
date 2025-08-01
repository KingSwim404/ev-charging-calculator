/**
 * 充电预估助手核心计算功能测试
 */

// 导入计算工具类
const calculator = require('../utils/calculator');

/**
 * 测试预估结果计算
 */
function testCalculateEstimation() {
  console.log('===== 测试预估结果计算 =====');
  
  // 测试用例1：基本计算
  const testCase1 = {
    batteryCapacity: 60,
    currentBattery: 30,
    electricityPrice: 1.0,
    chargingAmount: 50,
    chargingLossRate: 0.9
  };
  
  const expected1 = {
    purchasedElectricity: 50,
    estimatedBatteryIncrease: 45,
    estimatedFinalBattery: 100 // 会被限制为100
  };
  
  const result1 = calculator.calculateEstimation(testCase1);
  console.log('测试用例1 - 基本计算:');
  console.log('预期结果:', expected1);
  console.log('实际结果:', result1);
  console.log('测试通过:', 
    Math.abs(result1.purchasedElectricity - expected1.purchasedElectricity) < 0.01 &&
    Math.abs(result1.estimatedBatteryIncrease - expected1.estimatedBatteryIncrease) < 0.01 &&
    Math.abs(result1.estimatedFinalBattery - expected1.estimatedFinalBattery) < 0.01
  );
  
  // 测试用例2：不超过100%
  const testCase2 = {
    batteryCapacity: 60,
    currentBattery: 20,
    electricityPrice: 1.0,
    chargingAmount: 30,
    chargingLossRate: 0.9
  };
  
  const expected2 = {
    purchasedElectricity: 30,
    estimatedBatteryIncrease: 27,
    estimatedFinalBattery: 65 // (20% * 60 + 27) / 60 * 100 = 65%
  };
  
  const result2 = calculator.calculateEstimation(testCase2);
  console.log('\n测试用例2 - 不超过100%:');
  console.log('预期结果:', expected2);
  console.log('实际结果:', result2);
  console.log('测试通过:', 
    Math.abs(result2.purchasedElectricity - expected2.purchasedElectricity) < 0.01 &&
    Math.abs(result2.estimatedBatteryIncrease - expected2.estimatedBatteryIncrease) < 0.01 &&
    Math.abs(result2.estimatedFinalBattery - expected2.estimatedFinalBattery) < 0.01
  );
  
  // 测试用例3：不同损耗率
  const testCase3 = {
    batteryCapacity: 60,
    currentBattery: 30,
    electricityPrice: 1.0,
    chargingAmount: 50,
    chargingLossRate: 0.8
  };
  
  const expected3 = {
    purchasedElectricity: 50,
    estimatedBatteryIncrease: 40, // 50 * 0.8 = 40
    estimatedFinalBattery: 96.67 // (30% * 60 + 40) / 60 * 100 = 96.67%
  };
  
  const result3 = calculator.calculateEstimation(testCase3);
  console.log('\n测试用例3 - 不同损耗率:');
  console.log('预期结果:', expected3);
  console.log('实际结果:', result3);
  console.log('测试通过:', 
    Math.abs(result3.purchasedElectricity - expected3.purchasedElectricity) < 0.01 &&
    Math.abs(result3.estimatedBatteryIncrease - expected3.estimatedBatteryIncrease) < 0.01 &&
    Math.abs(result3.estimatedFinalBattery - expected3.estimatedFinalBattery) < 0.01
  );
}

/**
 * 测试实际结果计算
 */
function testCalculateActualResults() {
  console.log('\n===== 测试实际结果计算 =====');
  
  // 测试用例1：基本计算
  const testCase1 = {
    batteryCapacity: 60,
    currentBattery: 30,
    electricityPrice: 1.0,
    actualExpense: 50,
    actualFinalBattery: 80
  };
  
  const expected1 = {
    actualBatteryIncrease: 30, // (80% - 30%) * 60 = 30
    actualChargingLossRate: 0.6, // 30 / 50 = 0.6
    actualElectricityPrice: 1.0 // 50 / 50 = 1.0
  };
  
  const result1 = calculator.calculateActualResults(testCase1);
  console.log('测试用例1 - 基本计算:');
  console.log('预期结果:', expected1);
  console.log('实际结果:', result1);
  console.log('测试通过:', 
    Math.abs(result1.actualBatteryIncrease - expected1.actualBatteryIncrease) < 0.01 &&
    Math.abs(result1.actualChargingLossRate - expected1.actualChargingLossRate) < 0.01 &&
    Math.abs(result1.actualElectricityPrice - expected1.actualElectricityPrice) < 0.01
  );
  
  // 测试用例2：不同电价
  const testCase2 = {
    batteryCapacity: 60,
    currentBattery: 30,
    electricityPrice: 1.2,
    actualExpense: 60,
    actualFinalBattery: 80
  };
  
  const expected2 = {
    actualBatteryIncrease: 30, // (80% - 30%) * 60 = 30
    actualChargingLossRate: 0.6, // 30 / 50 = 0.6
    actualElectricityPrice: 1.2 // 60 / 50 = 1.2
  };
  
  const result2 = calculator.calculateActualResults(testCase2);
  console.log('\n测试用例2 - 不同电价:');
  console.log('预期结果:', expected2);
  console.log('实际结果:', result2);
  console.log('测试通过:', 
    Math.abs(result2.actualBatteryIncrease - expected2.actualBatteryIncrease) < 0.01 &&
    Math.abs(result2.actualChargingLossRate - expected2.actualChargingLossRate) < 0.01 &&
    Math.abs(result2.actualElectricityPrice - expected2.actualElectricityPrice) < 0.01
  );
}

/**
 * 测试历史记录创建
 */
function testCreateHistoryRecord() {
  console.log('\n===== 测试历史记录创建 =====');
  
  const inputData = {
    batteryCapacity: 60,
    currentBattery: 30,
    electricityPrice: 1.0,
    chargingAmount: 50,
    chargingLossRate: 0.9
  };
  
  const estimationResults = {
    purchasedElectricity: 50,
    estimatedBatteryIncrease: 45,
    estimatedFinalBattery: 100
  };
  
  const actualData = {
    actualChargingFee: 50,
    actualExpense: 48,
    actualFinalBattery: 80
  };
  
  const actualResults = {
    actualBatteryIncrease: 30,
    actualChargingLossRate: 0.6,
    actualElectricityPrice: 0.96
  };
  
  const historyRecord = calculator.createHistoryRecord(inputData, estimationResults, actualData, actualResults);
  
  console.log('历史记录创建结果:');
  console.log(historyRecord);
  console.log('测试通过:', 
    historyRecord.batteryCapacity === inputData.batteryCapacity &&
    historyRecord.currentBattery === inputData.currentBattery &&
    historyRecord.electricityPrice === inputData.electricityPrice &&
    historyRecord.chargingAmount === inputData.chargingAmount &&
    historyRecord.chargingLossRate === inputData.chargingLossRate &&
    historyRecord.purchasedElectricity === estimationResults.purchasedElectricity &&
    historyRecord.estimatedBatteryIncrease === estimationResults.estimatedBatteryIncrease &&
    historyRecord.estimatedFinalBattery === estimationResults.estimatedFinalBattery &&
    historyRecord.actualChargingFee === actualData.actualChargingFee &&
    historyRecord.actualExpense === actualData.actualExpense &&
    historyRecord.actualFinalBattery === actualData.actualFinalBattery &&
    historyRecord.actualBatteryIncrease === actualResults.actualBatteryIncrease &&
    historyRecord.actualChargingLossRate === actualResults.actualChargingLossRate &&
    historyRecord.actualElectricityPrice === actualResults.actualElectricityPrice &&
    historyRecord.dataSource === "actual" &&
    typeof historyRecord.timestamp === 'number'
  );
}

// 运行所有测试
function runAllTests() {
  testCalculateEstimation();
  testCalculateActualResults();
  testCreateHistoryRecord();
  console.log('\n===== 所有测试完成 =====');
}

// 导出测试函数
module.exports = {
  runAllTests,
  testCalculateEstimation,
  testCalculateActualResults,
  testCreateHistoryRecord
};
