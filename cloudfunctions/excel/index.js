// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'meno-9lbub'
})

// // 云函数入口函数
// exports.main = async(event, context) => {
//     return await cloud.database().collection('messages').get()
// }


//操作excel用的类库
const xlsx = require('node-xlsx');

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    console.log(event)
    console.log(context)
    let { actList } = event
    
    //1,定义excel表格名
    let dataCVS = 'test.xlsx'
    //2，定义存储数据的
    let alldata = [];
    let row = ['活动时间', '创建人', '活动标题','计划资金','活动人数']; //表属性
    alldata.push(row);

    for (let key in actList) {
      let arr = [];
      arr.push(actList[key].activity.date);
      arr.push(actList[key].creator);
      arr.push(actList[key].activity.phrase2);
      arr.push(actList[key].activity.fund);
      arr.push(actList[key].activity.peoples);
      alldata.push(arr)
    }
    //3，把数据保存到excel里
    var buffer = await xlsx.build([{
      name: "mySheetName",
      data: alldata
    }]);
    //4，把excel文件保存到云存储里
    return await cloud.uploadFile({
      cloudPath: dataCVS,
      fileContent: buffer, //excel二进制文件
    })

  } catch (e) {
    console.error(e)
    return e
  }
}