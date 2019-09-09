// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  const cloud = require('wx-server-sdk')
  cloud.init()

  const db = cloud.database()
  const MAX_LIMIT = 100

    // 先取出集合记录总数
    const countResult = await db.collection('db-wonder').count()
    const total = countResult.total
    // 计算需分几次取
    const batchTimes = Math.ceil(total / 100)
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      //orderBy根据due存的时间逆序查值
      const promise = db.collection('db-wonder').orderBy('due','desc').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
      tasks.push(promise)
    }
    // 等待所有
    return (
      await Promise.all(tasks)).reduce((acc, cur) => ({
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }))

}