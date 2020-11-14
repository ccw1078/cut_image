//index.js
//获取应用实例
const app = getApp()

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
    props: ['width', 'height', 'left', 'top']
  },
  rotate_image: function () {
    const that = this;
    const images = that.data.images;
    const count = images.length;
    if (count < 1) return;
    const current_image = images[count - 1];
    const rotated_image = get_rotated_image (current_image);
    const new_cut_box_style = get_cut_box_style (rotated_image, that.data.content_size);
    that.setData({
      cut_box_style: new_cut_box_style,
      images: that.data.images.concat([rotated_image]),
    });
  },
  // 根据当前裁剪框尺寸，计算裁剪后的图片尺寸和新的裁剪框尺寸
  cut_image: function () {
    const that = this;
    const props = that.data.props;
    wx.createSelectorQuery().select('#cut_box')
    .fields({ computedStyle: props })
    .exec(res => {
      const cut_box_node = res[0];
      const current_style = convert_style_to_int(cut_box_node, props);
      const origin_style = that.data.cut_box_style;
      const images = that.data.images;
      const current_image = images[images.length - 1];
      const cutted_image = get_cutted_image (current_style, origin_style, current_image);
      const new_cut_box_style = get_cut_box_style (cutted_image, that.data.content_size);
      that.setData({
        cut_box_style: new_cut_box_style,
        images: that.data.images.concat([cutted_image]),
      });
    });
  },
  draw_img: function () {
    const that = this;
    const images = that.data.images;
    if (images.length === 0) return;
    wx.createSelectorQuery().select('#cut_img')
    .fields({ node: true, size: true })
    .exec(res => {
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const current_image = images[images.length - 1];
      // 当旋转角度为90度或270度时，图片的宽高刚好对调
      const not_rotated = current_image.rotate % 180 === 0;
      canvas.height = not_rotated ? current_image.height : current_image.width;
      canvas.width = not_rotated ? current_image.width : current_image.height;
      const img = canvas.createImage();
      img.onload = () => {
        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(current_image.rotate * Math.PI / 180);
        ctx.drawImage(img, current_image.left, current_image.top, current_image.width, current_image.height, -current_image.width/2, -current_image.height/2, current_image.width, current_image.height);
        ctx.restore();
      }
      img.src = that.data.img_url;
    });
  },
  undo: function () {
    const that = this;
    const images = that.data.images;
    const images_count = images.length;
    if (images_count <= 1) return;
    const previous_image = images[images_count - 2];
    const previous_cut_box_style = get_cut_box_style (previous_image, that.data.content_size);
    that.setData({
      cut_box_style: previous_cut_box_style,
      images: that.data.images.slice(0, images_count - 1),
    });
  },
  save: function () {
    const that = this;
    wx.createSelectorQuery().select('#cut_img')
    .fields({ node: true, size: true })
    .exec(res => {
      const canvas = res[0].node;
      wx.showLoading({ title: '正在保存中', mask: true });
      wx.canvasToTempFilePath({
        canvas: canvas,
        success: function (result) {
          wx.hideLoading({
            success: res => {
              wx.showToast({
                title: '保存成功',
                mask: true,
                success: function (res) {
                  setTimeout(() => {
                    that.navigate_to(result);
                  }, 500);
                }
              })
            }
          });
        }
      });
    });
  },
  navigate_to: function (res) {
    const that = this;
    const images = that.data.images;
    const count = images.length;
    const cutted_img = images[count - 1];
    cutted_img.url = res.tempFilePath;
    const origin_img = images[0];
    origin_img.url = that.data.img_url;
    wx.navigateTo({
      url: '../input_size/input_size',
      success: function (res) {
        res.eventChannel.emit('input_size', {
          cutted: cutted_img,
          origin: origin_img,
          canvas: that.data.origin_canvas_style
        });
      }
    })
  },
  onLoad: function () {
    const that = this;
    const eventChannel = that.getOpenerEventChannel();
    eventChannel.on('cut_img', function (data) {
      // console.log("data", data);
      const img_url = data.path;
      const container_height = get_container_height (that.data.bottom_tab_height);
      const content_size = get_content_size (container_height, that.data.content_margin);
      wx.getImageInfo({
        src: img_url,
        success: function(img) {
          const image = {
            width: img.width,
            height: img.height,
            left: 0,
            top: 0,
            rotate: 0
          }
          const cut_box_style = get_cut_box_style (image, content_size);
          that.setData({
            container_height: container_height,
            content_size: content_size,
            cut_box_style: cut_box_style,
            origin_canvas_style: cut_box_style,
            img_url: img_url,
            images: [image]
          });
        }
      });
    });

    
  }
});


// 计算裁剪框的尺寸
function get_cut_box_style (image, content_size) {
  let scale;
  const px_ratio = app.globalData.px_ratio;
  let cut_box_style = {};
  // 当旋转角度为90度或270度时，图片的宽高刚好对调
  const not_rotated = image.rotate % 180 === 0;
  const img_width = not_rotated ? image.width : image.height;
  const img_height = not_rotated ? image.height : image.width;
  if (img_width / img_height >= content_size.width / content_size.height) {
    cut_box_style.width = Math.round(content_size.width / px_ratio); 
    scale = content_size.width / img_width;
    cut_box_style.height = Math.round(img_height * scale / px_ratio);
    cut_box_style.left = -1;// 减 1 的目的是让裁剪框产生包着图片的效果
    cut_box_style.top = Math.round((content_size.height / px_ratio - cut_box_style.height) * 0.5) - 1;
  } else {
    cut_box_style.height = Math.round(content_size.height / px_ratio);
    scale = content_size.height / img_height;
    cut_box_style.width = Math.round(img_width * scale / px_ratio);
    cut_box_style.top = -1;
    cut_box_style.left = Math.round((content_size.width / px_ratio - cut_box_style.width) * 0.5) - 1;
  }
  return cut_box_style;
}


// 计算裁剪后图片的左上角坐标和宽高
function get_cutted_image (current_style, origin_style, current_image) {
  const horiz_ratio = current_style.width / origin_style.width; // 水平宽度变化占比
  const vert_ratio = current_style.height / origin_style.height; // 垂直高度变化占比
  const left_ratio = (current_style.left - origin_style.left) / origin_style.width; // x轴坐标变化占比
  const top_ratio = (current_style.top - origin_style.top) / origin_style.height; // y轴坐标变化占比
  let result = {
    rotate: current_image.rotate
  };
  if (current_image.rotate === 0) {
    result.width = Math.round(current_image.width * horiz_ratio);
    result.height = Math.round(current_image.height * vert_ratio);
    result.left = Math.round(current_image.left + current_image.width * left_ratio);
    result.top = Math.round(current_image.top + current_image.height * top_ratio );
  } else if (current_image.rotate === 90) {
    result.width = Math.round(current_image.width * vert_ratio);
    result.height = Math.round(current_image.height * horiz_ratio);
    result.left = Math.round(current_image.left + top_ratio * current_image.width);
    result.top = Math.round(current_image.top + current_image.height * (1 - horiz_ratio - left_ratio));
  } else if (current_image.rotate === 180) {
    result.left = Math.round(current_image.left + current_image.width * (1 - horiz_ratio - left_ratio));
    result.top = Math.round(current_image.top + current_image.height * (1 - vert_ratio - top_ratio));
    result.width = Math.round(current_image.width * horiz_ratio);
    result.height = Math.round(current_image.height * vert_ratio);
  } else if (current_image.rotate === 270) {
    result.left = Math.round(current_image.left + current_image.width * (1 - vert_ratio - top_ratio));
    result.top = Math.round(current_image.top + current_image.height * left_ratio);
    result.width = Math.round(current_image.width * vert_ratio);
    result.height = Math.round(current_image.height * horiz_ratio);
  } else {
    throw("Invalid image rotate value, it should be 0, 90, 180 or 270.")
  }
  return result;
}

// 计算旋转后图片的左上角坐标和宽高
function get_rotated_image (current_image) {
  return {
    width: current_image.width,
    height: current_image.height,
    top: current_image.top,
    left: current_image.left,
    rotate: (current_image.rotate + 90) % 360 // 每次固定旋转90度，旋到360度时归零
  }
}

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

