//app.js
App({
  onLaunch: function () {
    let that = this;
    wx.getSystemInfo({
      success: (result) => {
        console.log(result);
        const ratio = result.windowHeight / result.windowWidth; // 屏幕的宽高比
        const fix_window_width = 750; // 屏幕宽度默认为 750rpx
        that.globalData.window_height = Math.ceil(fix_window_width * ratio); // 计算屏幕高度，单位 rpx
        that.globalData.window_width = fix_window_width; // 屏幕宽度
        that.globalData.px_ratio = fix_window_width / result.windowWidth; // rpx 和逻辑像素 px 的换算比例
        that.globalData.pixelRatio = result.pixelRatio; // 物理像素和逻辑像素的换算比例
      },
    })
  },
  globalData: {
  }
})