//index.js
//获取应用实例
const app = getApp()
const img_url = [
  "https://lhwccw.oss-cn-shenzhen.aliyuncs.com/20200910085532.png",
  "https://lhwccw.oss-cn-shenzhen.aliyuncs.com/20200910091535.png"
][0]

Page({
  data: {
    container_height: 0,
    content_height: 0,
    content_width: 0,
    content_margin: 40,
    bottom_tab_height: 120,
    img_url: img_url,
    img_width: 0,
    img_height: 0

  },
  // get_img_rpx_size: function (img_width, img_height) {
  //   let that = this;
  //   let rpx_width, rpx_height;
  //   if (img_width >= img_height) {
  //     // rpx_width = 
  //   }
  // },
  onLoad: function () {
    let that = this;
    let window_height = app.globalData.window_height;
    let bottom_tab_height = that.data.bottom_tab_height;
    let container_height = window_height - bottom_tab_height;
    that.setData({
      container_height: container_height,
    });

    // let content_margin = that.data.content_margin;
    // let content_height = container_height - 2 * content_margin;
    // let content_width = app.globalData.window_width - 2 * content_margin;
    // wx.getImageInfo({
    //   src: img_url,
    //   success: function(result) {
    //     let img_width = result.width;
    //     let img_height = result.height;
    //     let rpx_width, rpx_height;
    //     if (img_width >= img_height) {
    //       rpx_width = content_width; 
    //       rpx_height = 
    //     } else if () {

    //     }
    //     that.setData({
    //       container_height: container_height,
    //       content_height: content_height,
    //       content_width: content_width,
    //       img_width: result.width,
    //       img_height: result.height
    //     });
    //     // console.log(result);
    //   }
    // })
  },
  onReady: function () {
    let that = this
    wx.createSelectorQuery().select("#img").fields({
      size: true
    }, function (res) {
      console.log(res);
      that.setData({
        img_width: res.width * app.globalData.pixelRatio,
        img_height: res.height * app.globalData.pixelRatio
      });
    }).exec();
  }
})
