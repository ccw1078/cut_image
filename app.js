//app.js
App({
  onLaunch: function () {
    let that = this;
    wx.getSystemInfo({
      success: (result) => {
        console.log(result);
        const ratio = result.windowHeight / result.windowWidth;
        const fix_window_width = 750;
        that.globalData.window_height = Math.ceil(fix_window_width * ratio);
        that.globalData.window_width = fix_window_width;
        that.globalData.px_ratio = fix_window_width / result.windowWidth;
      },
    })
  },
  globalData: {
    userInfo: null
  }
})