//index.js
//获取应用实例
const app = getApp()
const img_url = [
  "https://lhwccw.oss-cn-shenzhen.aliyuncs.com/20200910085532.png",
  "https://lhwccw.oss-cn-shenzhen.aliyuncs.com/20200910091535.png",
  "https://lhwccw.oss-cn-shenzhen.aliyuncs.com/20201107180151.png",
  "https://lhwccw.oss-cn-shenzhen.aliyuncs.com/20201109191756.jpg"
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
      wx.createSelectorQuery().select('#cut_img')
      .fields({ node: true, size: true })
      .exec(res => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const current_image = that.data.images[0];
        canvas.height = Math.ceil(current_image.height);
        canvas.width = Math.ceil(current_image.width);

        const img = canvas.createImage();
        img.onload = () => {
          const sx = Math.ceil((current_style.left - origin_style.left) / origin_style.width * current_image.width);
          const sy = Math.ceil((current_style.top - origin_style.top) / origin_style.height * current_image.height);
          const sWidth = Math.ceil(current_style.width / origin_style.width * current_image.width);
          const sHeight = Math.ceil(current_style.height / origin_style.height  * current_image.height);
          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
          wx.canvasToTempFilePath({
            width: sWidth,
            height: sHeight,
            canvas: canvas,
            success: function (res) {
              const cut_box_style = get_cut_box_style (sWidth, sHeight, that.data.content_size)
              that.setData({
                cut_box_style: cut_box_style,
                images: that.data.images.concat([{
                  url: res.tempFilePath,
                  width: sWidth,
                  height: sHeight,
                  path: res.tempFilePath,
                  type: 'png'
                }]),
                
              });
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          });
        }
        img.src = that.data.images[0].url;
      });
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
        const cut_box_style = get_cut_box_style (result.width, result.height, content_size);
        that.setData({
          container_height: container_height,
          content_size: content_size,
          cut_box_style: cut_box_style,
          images: [{
            url: img_url,
            width: result.width,
            height: result.height,
            path: result.path,
            type: result.type
          }]
        });
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
    cut_box_style.width = Math.ceil(content_size.width / px_ratio); 
    scale = content_size.width / img_width;
    cut_box_style.height = Math.ceil(img_height * scale / px_ratio);
    cut_box_style.left = 0;
    cut_box_style.top = Math.ceil((content_size.height / px_ratio - cut_box_style.height) * 0.5);
  } else {
    cut_box_style.height = Math.ceil(content_size.height / px_ratio);
    scale = content_size.height / img_height;
    cut_box_style.width = Math.ceil(img_width * scale / px_ratio);
    cut_box_style.top = 0;
    cut_box_style.left = Math.ceil((content_size.width / px_ratio - cut_box_style.width) * 0.5);
  }
  return cut_box_style;
}
