// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  return await cloud.database().collection('activity').get({
    success: function (res) {
      console.log(res.data)
    },
    fail: console.error
  });
}