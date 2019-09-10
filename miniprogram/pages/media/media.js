var app = getApp();
Page({

  /**
   * 页面的初始数据
   */

  data: {

    pics: [],//
    fileList:'',
    Placeholder:'授权登录后可上传图片,微信实名制请文明体验。',
    mode: "scaleToFill", //不保持纵横比缩放图片，使图片完全适应
    userInfo:{},
    name:'',
    time:'',
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    fileIdList:'',
    f5:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  // onLoad: function (options) {
  //   const that=this;
  //   wx.cloud.getTempFileURL({
  //     fileList: ['cloud://wonder-jzkjz.776f-wonder-jzkjz/my-image.gif'],
  //     success: res => {
  //       // get temp file URL
  //       console.log(res.fileList)
  //       that.setData({
  //         fileList:res.fileList
  //       })
  //     },
  //     fail: err => {
  //       // handle error
  //     }
  //   })


  // },
  //事件处理函数
  onLoad: function (options) {
    console.log('onLoad')
    const that = this;
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function (res) {
              // 用户已经授权过
              // 根据自己的需求有其他操作再补充
              const userInfo = res.userInfo
              const nickName = userInfo.nickName
              const avatarUrl = userInfo.avatarUrl
              const gender = userInfo.gender // 性别 0：未知、1：男、2：女
              const province = userInfo.province
              const city = userInfo.city
              const country = userInfo.country
              console.log("输出个人信息：")
              // console.log(res.userInfo)
              console.log(userInfo)
              console.log(nickName)
              console.log(avatarUrl)
              console.log(gender)
              console.log(province)
              console.log(city)
              console.log(country)
              //传递nickName的值
              that.setData({
                userInfo: res.userInfo,
                name: nickName,
                isHide: false,
                hasUserInfo:true
              })

              // 我这里实现的是在用户授权成功后，调用微信的 wx.login 接口，从而获取code
              wx.login({
                success: res => {
                  // 获取到用户的 code 之后：res.code
                  console.log("用户的code:" + res.code);

                  // 可以传给后台，再经过解析获取用户的 openid
                  // 或者可以直接使用微信的提供的接口直接获取 openid ，方法如下：
                  // wx.request({
                  //     // 自行补上自己的 APPID 和 SECRET
                  //   url: 'https://api.weixin.qq.com/sns/jscode2session?appid=wx2c74a2f6ed845a54&secret=自己的secret&js_code=' + res.code + '&grant_type=authorization_code',
                  //     success: res => {
                  //         // 获取到用户的 openid
                  //         console.log("用户的openid:" + res.data.openid);
                  //         that.setData({
                  //           userOpenId:res.data.openid
                  //         });
                  //     }
                  // });
                }
              });
            }
          });

          that.onGetOpenid();
          console.log("app.globalData.openid:", app.globalData.openid);
        } else {
          // 用户没有授权
          // 改变 isHide 的值，显示授权页面
          that.setData({
            isHide: true
          });
        }
      }
    });

    //调用查询函数
    this.onShowList();

  },
  onShowList: function () {
    console.log('onShowList')
    wx.cloud.callFunction({
      // 需调用的云函数名
      name: 'queryDB-wonder-imgList',
      // 传给云函数的参数
      // data: {
      // },
      // 成功回调
      complete: res => {
        console.log("云查询函数queryDB-wonder-imgList：", res)
        console.log("云查询函数queryDB-wonder-imgList：", res.result.data)
        this.setData({
          fileIdList: res.result.data
        })
      }
    })

  },
   onChoose: function () {//这里是选取图片的方法
    var that = this,
    pics = this.data.pics;
     const hasUserInfo = this.data.hasUserInfo;

     if (hasUserInfo){  //如果已获得用户信息
      wx.chooseImage({
        count: 9 - pics.length, // 最多可以选择的图片张数，默认9
        sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
        sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
        success: function (res) {
          var imgsrc = res.tempFilePaths;
          console.log(res.tempFilePaths);
          pics = pics.concat(imgsrc);//拆开数组参数，一个元素一个元素地加进去。  
          that.setData({
            pics: pics
          });

          console.log("pics",pics)
          console.log("uploadimg!");
          console.log("userInfo:", that.data.userInfo);
          
          //调用app中的上传图片方法
          app.uploadimg({
            imgName: 'wonder',//定义图片名称
            path: pics,//这里是选取的图片的地址数组
            userInfo: that.data.userInfo        
          });
          

        },
        fail: function () {
          // fail      
        },
        complete: function () {
          // complete      
          that.setPlaceholder();
          //调用查询函数
          that.onShowList();
        }
      })
    }
    else{
      //未获得用户信息
      wx.showModal({
        title: '提示',
        content: '请先点击登录按钮！' + this.data.hasUserInfo,
      })

    }

  },
  // onGetUserInfo: function (e) {
  //   console.log("onGetUserInfo")
  //   if (!this.logged && e.detail.userInfo) {
  //     this.setData({
  //       logged: true,
  //       avatarUrl: e.detail.userInfo.avatarUrl,
  //       userInfo: e.detail.userInfo
  //     })
  //   }
  // },
  bindGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      this.onGetOpenid();//调用onGetOpenid方法
      var that = this;
      // 获取到用户的信息了，打印到控制台上看下
      console.log("用户的信息如下：");
      console.log(e.detail.userInfo);
      //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
      that.setData({
        isHide: false,
        liuyanName: e.detail.userInfo.nickName,
        userInfo: e.detail.userInfo,
        hasUserInfo: true,    
        logged: true
      });
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  },
  canILogin() {
    if (!wx.canIUse('button.open-type.getUserInfo')) { // 对应的功能就是通过按钮获取用户资料
      wx.showModal({}) // 向用户提示需要升级微信
    }
  },
   onGetOpenid: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        this.setData({
          sqFlag: true,
          isHide: false,
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },
  setPlaceholder:function(){
      this.setData({
        Placeholder:''
      })
  },
  previewImage: app.previewImage,
 
  onShow:function(){
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})