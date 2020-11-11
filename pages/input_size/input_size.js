// pages/input_cut_size/input_cut_size.js
const img_urls = [
  "https://lhwccw.oss-cn-shenzhen.aliyuncs.com/20201110101924.png",
  "https://lhwccw.oss-cn-shenzhen.aliyuncs.com/20200910085532.png",
  "https://lhwccw.oss-cn-shenzhen.aliyuncs.com/20200910091535.png",
  "https://lhwccw.oss-cn-shenzhen.aliyuncs.com/20201107180151.png",
  "https://lhwccw.oss-cn-shenzhen.aliyuncs.com/20201109191756.jpg",
  "https://lhwccw.oss-cn-shenzhen.aliyuncs.com/20201110110506.jpg"
];

Page({
  data: {
    img_info: {}
  },
  draw_img: function () {
    const that = this;
    const img_info = that.data.img_info;
    if (!img_info) return;
    wx.createSelectorQuery().select('#canvas')
    .fields({ node: true, size: true })
    .exec(res => {
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const img_info = that.data.img_info;
      canvas.width = img_info.origin.width;
      canvas.height = img_info.origin.height;
      const img = canvas.createImage();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 4;
        ctx.strokeRect(img_info.cutted.left, img_info.cutted.top, img_info.cutted.width, img_info.cutted.height);
      }
      img.src = img_info.origin.url;
    });
  },
  onLoad: function (options) {
    const that = this;
    const eventChannel = that.getOpenerEventChannel();
    eventChannel.on('input_size', function (data) {
      that.setData({
        img_info: data,
        success: function (res) {
          console.log('set data done');
        }
      });
      that.draw_img();
    });
  },

})