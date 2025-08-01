# 充电预估助手微信小程序

## 项目简介

充电预估助手是一个单页面微信小程序，帮助电动车用户根据充电金额计算能充多少电量。用户输入电池容量、当前电量、电价和充电金额，系统考虑充电损耗后计算出能充到的预估电量百分比和增加的电量。

## 功能特点

- **实时计算**：输入参数后立即计算预估结果
- **历史记录**：保存最近一次充电记录，并与预估结果对比
- **自适应损耗率**：根据实际充电数据优化预估准确度
- **简洁界面**：单页面设计，操作简单直观

## 使用说明

### 基本使用流程

1. 打开小程序，输入以下参数：
   - 车辆容量(kWh)：电动车电池容量，范围>0
   - 当前电量(%)：当前电池电量百分比，范围0-100%
   - 电价(元/度)：充电电价
   - 充电金额(元)：预计充电花费

2. 系统自动计算并显示：
   - 可充电量(度)：从电网购买的电量
   - 预估充入(度)：考虑损耗后实际进入电池的电量
   - 充电后电量(%)：充电后的预估电量百分比
   - 充电损耗率(%)：电量损耗比例

3. 充电完成后，点击"实际数据录入"，输入：
   - 充电费用(元)：交给充电桩的金额
   - 实际支出(元)：充电费用减去优惠券价格
   - 达到电量(%)：车辆显示的电量百分比

4. 点击"保存实际数据"，系统会：
   - 计算实际充电损耗率
   - 更新历史记录
   - 将实际损耗率用于下次预估计算

### 数据说明

- 首次使用时，充电损耗率默认为12%
- 输入实际数据后，系统会根据实际情况更新损耗率
- 系统只保存最近一次充电记录
- 车辆容量会被保存，下次使用时自动填充

## 技术实现

- 前端框架：微信小程序原生框架
- 数据存储：微信小程序本地存储 (wx.setStorageSync/wx.getStorageSync)
- 计算引擎：纯前端JavaScript计算，无需后端服务
- UI组件：微信小程序原生组件

## 开发者信息

- 开发时间：2025年7月
- 版本：1.0.0

## 使用提示

- 确保输入的车辆容量与实际相符，这会影响计算准确度
- 充电损耗率会随充电设备、温度等因素变化，多次使用后会更准确
- 如需清除历史数据，可在微信小程序设置中清除缓存
