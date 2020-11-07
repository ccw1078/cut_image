//app.js
App({
  onLaunch: function () {
    let that = this;
    wx.getSystemInfo({
      success: (result) => {
        // console.log(result);
        that.globalData.window_height = result.windowHeight * result.pixelRatio;
        that.globalData.window_width = result.windowWidth * result.pixelRatio;
        that.globalData.pixelRatio = result.pixelRatio;
      },
    })
  },
  globalData: {
    userInfo: null
  }
})