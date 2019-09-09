//liuyan.js
//获取应用实例
var app = getApp();
Page({

  data: {
    disabled: false,
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isHide: true,
    sqFlag: false,
    liuyanName: '',
     list:[],
     inputVal:''
  },
  onShowList:function(){
    console.log('onShowList')
    //查询出数据库所有的内容并显示出来
    // const db = wx.cloud.database('wonder');
    // db.collection('db-wonder').get().then(res => {
    //     // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
    //     console.log(res.data)
    //     this.setData({
    //       list: res.data
    //     })
    //   })
    //   .catch()
    wx.cloud.callFunction({
      // 需调用的云函数名
      name: 'queryDB-wonder',
      // 传给云函数的参数
      // data: {
      // },
      // 成功回调
      complete: res=> {
        console.log("云查询函数：",res)
        console.log("云查询函数：",res.result.data)
        this.setData({
          list: res.result.data
         })
      }
    })

  },
  changeInputVal(ev) {
    this.setData({
      inputVal: ev.detail.value
    });
  },
  delMsg(ev) {
    //拿到设置的该留言的id
     console.log("delete id",ev.target.dataset.index);
     const id = ev.target.dataset.index;
    const db=wx.cloud.database('wonder');
    db.collection('db-wonder').doc(id).remove({
      success(res) {
        console.log("delete success~");
        console.log(res)
      }

    })

     this.onShowList();
  },
  addMsg() {    //添加留言方法
     console.log(this.data.inputVal);
     if(this.data.inputVal != '')
     {
        const db = wx.cloud.database('wonder');
        const that=this;
        db.collection('db-wonder').add({
          // data 字段表示需新增的 JSON 数据
          data: {
            // _id: 'todo-identifiant-aleatoire', 
            // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
            inputVal: this.data.inputVal,
            liuyanName: this.data.liuyanName,
            description: 'learn cloud database',
            due: new Date().getMilliseconds,
            show: true
          },
          success(res) {
            console.log("add success!");
            that.onShowList();
            // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
            console.log(res)
           
          }
        })
        //设置留言框的值为空
        this.setData({
          inputVal:'',   //设置初始值为空
          disabled: true
        });
        //定时器 15秒后才恢复留言按钮的使用
       setTimeout((function callback() {
         this.setData({ disabled: false });
       }).bind(this), 15000);

     }else{
       wx.showToast(
         {
         title: '请填写内容~',
         icon: 'none'
       })
     }
     
  },

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
              // 用户已经授权过,不需要显示授权页面,所以不需要改变 isHide 的值
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
                userInfo:res.userInfo,
                liuyanName: nickName,
                isHide: false
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
          console.log("app.globalData.openid:",app.globalData.openid);
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
  bindGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      // 获取到用户的信息了，打印到控制台上看下
      console.log("用户的信息如下：");
      console.log(e.detail.userInfo);
      //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
      that.setData({
        isHide: false,
        liuyanName:e.detail.userInfo.nickName,
        userInfo: e.detail.userInfo,
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
  onGetUserInfo: function (e) {
    console.log("onGetUserInfo")
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
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

})