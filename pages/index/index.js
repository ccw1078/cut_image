//index.js
//获取应用实例
const app = getApp()
const img_url = [
  "https://lhwccw.oss-cn-shenzhen.aliyuncs.com/20200910085532.png",
  "https://lhwccw.oss-cn-shenzhen.aliyuncs.com/20200910091535.png",
  "https://lhwccw.oss-cn-shenzhen.aliyuncs.com/20201107180151.png"
][0]

Page({
  data: {
    container_height: 0,
    bottom_tab_height: 120,

    content_height: 0,
    content_width: 0,
    content_margin: 40,
    
    img_url: img_url,

    cut_box_style: {
      height: 0,
      width: 0,
      top: 0,
      left: 0
    },

    px_ratio: app.globalData.px_ratio,
    corner_block_size: 80,


  },
  onLoad: function () {
    const that = this;
    const window_height = app.globalData.window_height;
    const bottom_tab_height = that.data.bottom_tab_height;
    const container_height = window_height - bottom_tab_height;

    const content_margin = that.data.content_margin;
    const content_height = container_height - 2 * content_margin;
    const content_width = app.globalData.window_width - 2 * content_margin;
    wx.getImageInfo({
      src: img_url,
      success: function(result) {
        const img_width = result.width;
        const img_height = result.height;
        let scale;
        let px_ratio = app.globalData.px_ratio;
        let cut_box_style = {};
        if (img_width / img_height >= content_width / content_height) {
          cut_box_style.width = Math.round(content_width / px_ratio); 
          scale = content_width / img_width;
          cut_box_style.height = Math.round(img_height * scale / px_ratio);
          cut_box_style.left = 0;
          cut_box_style.top = Math.round((content_height / px_ratio - cut_box_style.height) * 0.5);
        } else {
          cut_box_style.height = Math.round(content_height / px_ratio);
          scale = content_height / img_height;
          cut_box_style.width = Math.round(img_width * scale / px_ratio);
          cut_box_style.top = 0;
          cut_box_style.left = Math.round((content_width / px_ratio - cut_box_style.width) * 0.5);
        }

        that.setData({
          container_height: container_height,
          content_height: content_height,
          content_width: content_width,
          cut_box_style: cut_box_style,
        });
        // console.log(result);
      }
    })
  }
})
