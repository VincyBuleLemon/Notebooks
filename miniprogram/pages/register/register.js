let app = getApp();
//获取云数据库引用
const db = wx.cloud.database();
const admin = db.collection('adminlist');
let name = null;
let password = null;

Page({
  data: {
  },
  //输入用户名
  inputName: function (event) {
    name = event.detail.value
  },
  //输入密码
  inputPassword(event) {
    password = event.detail.value
  },

//注册
  register() {
    let that = this;
    let flag = false  //是否存在 true为存在
    //查询用户是否已经注册
    admin.get({
      success: (res) => {
        let admins = res.data;  //获取到的对象数组数据
        //console.log(admins);
        for (let i = 0; i < admins.length; i++) {  //遍历数据库对象集合
          if (name === admins[i].name) { //用户名存在
            flag = true;
            //   break;
          }
        }
        if (flag === true) {    //已注册
          wx.showToast({
            title: '账号已注册！',
            icon: 'success',
            duration: 2500
          })
        } else {  //未注册
          that.saveuserinfo()
        }
      }
    })
  },


  //注册用户信息
  saveuserinfo() {
    // let that = this;
    admin.add({  //添加数据
      data: {
        name: name,
        password: password
      }
    }).then(res => {
      console.log('注册成功！')
      wx.showToast({
        title: '注册成功！',
        icon: 'success',
        duration: 3000
      })
      wx.navigateBack({
        delta: 1
        //返回上一级
      })
    })
    
  },

  back() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },
})
