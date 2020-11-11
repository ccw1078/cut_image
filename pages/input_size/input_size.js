// pages/input_cut_size/input_cut_size.js
Page({
  data: {
    img_info: {},
    width: undefined,
    height: undefined
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
  input_width: function (e) {
    // console.log('e.detail', JSON.stringify(e.detail));
    const that = this;
    if (that.data.height) {
      const width = parseInt(e.detail.value);
      const cutted_width = that.data.img_info.cutted.width;
      const cutted_height = that.data.img_info.cutted.height;
      that.setData({
        height: Math.round(cutted_height / cutted_width * width)
      });
    }
  },
  input_height: function (e) {
    // console.log('e.detail', JSON.stringify(e.detail));
    const that = this;
    if (!that.data.width) {
      const height = parseInt(e.detail.value);
      const cutted_width = that.data.img_info.cutted.width;
      const cutted_height = that.data.img_info.cutted.height;
      that.setData({
        width: Math.round(cutted_width / cutted_height * height)
      });
    }
  },
  onLoad: function (options) {
    const that = this;
    const eventChannel = that.getOpenerEventChannel();
    eventChannel.on('input_size', function (data) {
      that.setData({
        img_info: data
      });
      that.draw_img();
    });
  }
})