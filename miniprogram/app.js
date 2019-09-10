//app.js
App({

  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    //全局变量
    this.globalData = {
      fileID:'',
      fileName:'',
      userInfo:'',
      resList:[]
    }
  },
  //多张图片上传
  uploadimg: function (data){
  var that = this,
    i=data.i ? data.i : 0,//当前上传的哪张图片
    success=data.success ? data.success : 0,//上传成功的个数
    fail=data.fail ? data.fail : 0;//上传失败的个数

    const cloudPath = data.imgName + new Date().getTime() + data.path[i].match(/\.[^.]+?$/)[0];
    const imgName = data.imgName;
    const appUserInfo = data.userInfo;
    this.globalData.fileName=cloudPath;  //修改全局变量
    console.log("app data.path[i]",data.path[i]);

    //调用微信上传方法
    wx.cloud.uploadFile({
      //cloudPath,filePath是两个必选参数
      cloudPath: cloudPath,
      filePath: data.path[i],
      //name: 'file',//这里根据自己的实际情况改
      //  formData: null,//这里是上传图片时一起上传的数据
      success: (resp) => {
        success++;//图片上传成功，图片上传成功的变量+1
        console.log("i:",i);
        //这里可能有BUG，失败也会执行这里,所以这里应该是后台返回过来的状态码为成功时，这里的success才+1     
        that.globalData.fileID=resp.fileID;//修改全局变量
        console.log("全局变量测试", that.globalData.fileID);
        console.log("上传成功回调：",resp);
        console.log("上传成功回调：",resp.fileID);
        that.globalData.resFileID = resp.fileID;
        that.globalData.resList.push(that.globalData.resFileID);
        console.log("resList", that.globalData.resList);  //上传回调的fileID存入一个全局数组

        console.log("uploadFile userInfo:",that.globalData.userInfo);

        //储存信息到数据库====================================================================================
        const db = wx.cloud.database("wonder");
        db.collection("db-wonder-imgList").add({
          // data 字段表示需新增的 JSON 数据
          data: {
            // _id: 'todo-identifiant-aleatoire', 
            // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
            imgId: resp.fileID,
            imgName: that.globalData.fileName,      //可使用自定义imgName，懒得折腾，这里就用fileName了
            openId: that.globalData.openId,
            due: new Date(),
            show: true,
            userInfo: appUserInfo
          },
          success(res) {
            console.log("img info add success+++++++++++++");
            // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
            console.log(res);
          }
        })

     

        
      },
      fail: (res) => {
        fail++;//图片上传失败，图片上传失败的变量+1
        console.error('[上传文件] 失败：', res)
        console.log('success:' + i + "fail:" + fail);
      },
      complete: () => {
        console.log(i);
        i++;//这个图片执行完上传后，开始上传下一张            
        if (i == data.path.length) {   //当图片传完时，停止调用          
          console.log('执行完毕');
          console.log('成功：' + success + " 失败：" + fail);
          //弹窗===============================================================================================
          wx.showModal({
            title: '提示',
            content: '图片上传成功！',
            showCancel: true,   //是否显示取消按钮
            cancelText: '返回列表',   //替换“取消”
            cancelColor: '#D2B48C',
            confirmText: '查看图片',   //替换“成功”
            confirmColor: '#FFA500',

            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                //做页面跳转，或者做弹窗用来展示刚刚上传的图片-----------------
                wx.navigateTo({
                  url: '../uploadedImageList/uploadedImageList',
                  events: {
                    // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据。。
                    acceptDataFromOpenedPage: function (data) {
                      console.log("acceptDataFromOpenedPage",data)
                    },
                  },
                  success: function (res) {
                    // 通过eventChannel向被打开页面传送数据
                    res.eventChannel.emit('acceptDataFromOpenerPage', { data: that.globalData.resFileID })
                    //。。。emmm,小程序太笨了。这就是页面和js不分离，不好的地方。只能传递一个条数据。。多条数据还是只能用全局变量
                  }
                })

              } else if (res.cancel) {
                console.log('用户点击取消')
                wx.navigateTo({
                  url: '../media/media',
                  events: {
                    // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
                    acceptDataFromOpenedPage: function (data) {
                      console.log(data)
                    },
                    someEvent: function (data) {
                      console.log(data)
                    }
                  },
                  success: function (res) {
                    // 通过eventChannel向被打开页面传送数据
                    res.eventChannel.emit('acceptDataFromOpenerPage', { data: 'test' })
                  }
                })
              }
            }
          })

        } else {//若图片还没有传完，则继续调用函数                
          data.i = i;
          data.success = success;
          data.fail = fail;
          that.uploadimg(data);
        }
      }
      
    });

  },
  onGetOpenid: function () {//获取用户openID
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
  previewImage: function (e) {
      var current = e.target.dataset.src;
      const urls = [];
      urls.push(current);
      wx.previewImage({
        current: current, // 当前显示图片的http链接
        urls: urls // 需要预览的图片http链接列表
      })


    // console.log("imgFileID from dataset:", e.target.dataset.index);
    // const imgFileID = e.target.dataset.index;
    // wx.navigateTo({
    //   url: '../showBigImg/showBigImg',
    //   events: {
    //     // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据。。
    //     acceptDataFromOpenedPage: function (data) {
    //       console.log("acceptDataFromOpenedPage", data)
    //     },
    //   },
    //   success: function (res) {
    //     // 通过eventChannel向被打开页面传送数据
    //     res.eventChannel.emit('acceptDataFromOpenerPage', { data: imgFileID })
    //     //。。。emmm,小程序太笨了。这就是页面和js不分离，不好的地方。只能传递一个条数据。。多条数据还是只能用全局变量
    //   }
    // })
  },

  

})
