// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { imgID, imgName, openId } = event;

  const db = wx.cloud.database("wonder");
  const that = this;
  db.collection("db-wonder-imgList").add({
    // data 字段表示需新增的 JSON 数据
    data: {
      // _id: 'todo-identifiant-aleatoire', 
      // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
      imgID: imgID,
      imgName: imgName,
      openId: openId,
      due: new Date(),
      show: true
    },
    success(res) {
      console.log("add success!");
      // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
      console.log(res);
    }
  })
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}