// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
exports.main = async (event, context) => {
  const dbName = 'activity'
  return db.collection(dbName).doc(id).remove()
}