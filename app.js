// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null,
    // 全局配置
    defaultSettings: {
      electricityPrice: 0.6, // 默认电价 元/kWh
      batteryCapacity: 60, // 默认电池容量 kWh
      chargingEfficiency: 0.9 // 充电效率
    }
  }
})