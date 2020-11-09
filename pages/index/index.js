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
    content_margin: 40,
    content_size: {
      width: 0,
      height: 0
    },
    images: [],
    cut_box_style: {
      height: 0,
      width: 0,
      top: 0,
      left: 0
    },
    canvas_id: 'cut_img',
    uri: undefined,
    hide_canvas: true
  },
  // 根据裁剪框尺寸对图片进行裁剪
  cut_image: function () {
    let that = this;
    const props = ['width', 'height', 'left', 'top'];
    wx.createSelectorQuery().select('#cut_box')
    .fields({ computedStyle: props })
    .exec((res) => {
      // console.log('res', JSON.stringify(res));
      const cut_box_node = res[0];
      const current_style = convert_style_to_int(cut_box_node, props);
      const origin_style = that.data.cut_box_style;
      console.log('current_style', current_style);
      console.log('origin_style', origin_style);
      // const ctx = wx.createCanvasContext(that.data.canvas_id);
      // ctx.drawImage(that.data.images[0].path, 0, 0, 150, 150);
      // ctx.draw(false, function () {
      //   console.log('draw ok');
      //   wx.canvasToTempFilePath({
      //     x: 0,
      //     y: 0,
      //     width: 100,
      //     height: 100,
      //     canvasId: that.data.canvas_id,
      //     success: function (res) {
      //       console.log("canvasToTempFilePath res", res.tempFilePath);
      //       that.setData({
      //         uri: res.tempFilePath,
      //       });
      //     }
      //   });
      // });
      wx.createSelectorQuery().select('#cut_img')
      .fields({ node: true, size: true })
      .exec(res => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const img = canvas.createImage();
        img.src = that.data.images[0].url;
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 50, 50);
          wx.canvasToTempFilePath({
            // x: 0,
            // y: 0,
            // width: 50,
            // height: 50,
            canvas: canvas,
            success: function (res) {
              console.log("canvasToTempFilePath res", res.tempFilePath);
              that.setData({
                images: that.data.images.concat([{
                  url: res.tempFilePath,
                  width: 367,
                  height: 389,
                  path: res.tempFilePath,
                  type: 'png'
                }]),
              });
            }
          });
        }
        
      });
    });
  },
  // 初始化裁剪框
  init_cut_box: function () {
    const that = this;
    const images = that.data.images;
    const img = images[images.length - 1];
    const cut_box_style = get_cut_box_style (img.width, img.height, that.data.content_size);
    that.setData({
      cut_box_style: cut_box_style,
    });
  },
  onLoad: function () {
    const that = this;
    const container_height = get_container_height (that.data.bottom_tab_height);
    const content_size = get_content_size (container_height, that.data.content_margin);
    wx.getImageInfo({
      src: img_url,
      success: function(result) {
        // console.log('get image info', JSON.stringify(result));
        that.setData({
          container_height: container_height,
          content_size: content_size,
          images: [{
            url: img_url,
            width: result.width,
            height: result.height,
            path: result.path,
            type: result.type
          }]
        });
        that.init_cut_box();
      }
    });
  }
});


// 将字符串格式的样式值转成数字格式
function px_to_int (string_value) {
  var index = string_value.indexOf("px");
  return parseInt(string_value.slice(0, index));
}

// 将样式由 px 字符串格式转成数字表示的格式，以方便后续做计算
// props 表示要转换的样式属性名称组成的数据，例如 ['width', 'height'] 等
function convert_style_to_int (style, props) {
  let result = {};
  props.forEach(function (prop) {
    result[prop] = px_to_int(style[prop]);
  });
  return result;
}

// 获取容器高度(扣除底部操作栏)
function get_container_height (bottom_tab_height) {
  const window_height = app.globalData.window_height ;
  return Math.round(window_height - bottom_tab_height);
}

// 获取内容区尺寸
function get_content_size (container_height, content_margin) {
  const content_height = container_height - 2 * content_margin;
  const content_width = app.globalData.window_width - 2 * content_margin;
  return {
    width: content_width,
    height: content_height
  }
}

// 获取裁剪框初始尺寸
function get_cut_box_style (img_width, img_height, content_size) {
  let scale;
  let px_ratio = app.globalData.px_ratio;
  let cut_box_style = {};
  if (img_width / img_height >= content_size.width / content_size.height) {
    cut_box_style.width = Math.round(content_size.width / px_ratio); 
    scale = content_size.width / img_width;
    cut_box_style.height = Math.round(img_height * scale / px_ratio);
    cut_box_style.left = 0;
    cut_box_style.top = Math.round((content_size.height / px_ratio - cut_box_style.height) * 0.5);
  } else {
    cut_box_style.height = Math.round(content_size.height / px_ratio);
    scale = content_size.height / img_height;
    cut_box_style.width = Math.round(img_width * scale / px_ratio);
    cut_box_style.top = 0;
    cut_box_style.left = Math.round((content_size.width / px_ratio - cut_box_style.width) * 0.5);
  }
  return cut_box_style;
}
