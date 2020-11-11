// pages/index.js
Page({

  data: {
    img: {
      path: undefined
    }
  },
  add_img: function () {
    const that = this;
    wx.chooseImage({
      count: 1,
      success: function (res) {
        // console.log("add img res", JSON.stringify(res));
        that.setData({
          'img.path': res.tempFilePaths[0]
        })
      }
    })
  },
  start_cut: function () {
    const that = this;
    wx.navigateTo({
      url: '../cut_img/cut_img',
      success: function (res) {
        res.eventChannel.emit("cut_img", {
          path: that.data.img.path
        });
      }
    })
  }
})