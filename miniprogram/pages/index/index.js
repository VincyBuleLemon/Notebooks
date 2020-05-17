// 待补充滑到底继续刷新数据，因为前端操控数据库只能最多同时获得20条数据
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    logged: false,
    openid: '',
    exist: false,
    activities: [],
    actList:[],
    teamName: '',
    havaTeam:app.globalData.havaTeam,
    showView: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    console.log(app.globalData.openid)
    if (app.globalData.openid != undefined) {
      //获取活动
      db.collection('users').where({
        _openid: app.globalData.openid
      }).get().then(res => {
        console.log(res.data[0].joined[0], "1111")
        if (res.data[0].joined[0] === undefined) {
          that.setData({
            haveTeam: true,
          })
        } else {
          that.setData({
            haveTeam: false,
            teamName: res.data[0].joined[0]
          })
          db.collection('activity').where({
            teamName: res.data[0].joined[0]
          }).orderBy('time', 'desc').get().then(res => {
            console.log(res)
            that.setData({
              activities: res.data,
              exist: true,
              haveTeam:true
            })
          })
        }
      })
    }
  },
  getMsg() {
    var that = this
    const db = wx.cloud.database()
    db.collection('activity').get({
      success: function (res) {
        console.log(res)
        that.setData({
          activities: res.data,
           exist: true
        })
      }
    })
  },
  //增加
  join: function () {
    var that = this
    var _ = db.command
    wx.showModal({
      title: '提示',
      content: '你确定要加入该团嘛',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          db.collection('activity').where({
            member: _.in([app.globalData.openid])
          }).get().then(res => {
            if (res.data[0] != undefined) {
              wx.showToast({
                title: '您已经加入了该活动',
                icon: 'none'
              })

            } else {
              wx.showToast({
                title: '成功加入',
              })
              db.collection('activity').get().then(res => {
                if (!res.data[0].member || (res.data[0].member.length < res.data[0].activity.peoples)) {
                  wx.cloud.callFunction({
                    name: 'where_update',
                    data: {
                      collection: 'activity',
                      key: 'time',
                      value: that.data.activity.time,
                      add_key: 'member',
                      add_value: app.globalData.openid,
                      method: 'push',
                    }
                  }).then(res => {
                    //这里需要重新获取下活动才能同步member
                    db.collection('activity').where({
                      time: that.data.activity.time
                    }).get().then(res => {
                      wx.cloud.callFunction({
                        name: 'where_update',
                        data: {
                          collection: 'users',
                          key: '_openid',
                          value: app.globalData.openid,
                          add_key: 'activities',
                          add_value: res.data[0], //这里是直接获取从上个页面传过来的活动，而不是直接从数据库获取的，
                          method: 'push',
                        }
                      }).then(res => {

                      })
                    })
                  })
                  wx.navigateTo({
                    //跳转到创建团队或者加入团队界面
                    url: '../schedule/schedule',
                  })
                } else {
                  wx.showToast({
                    title: '该团人已满',
                    icon: 'none'
                  })
                }

              })
            }
          })

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //删除
  deleteItem(e) {
    // 记录this指向
    const that = this
    var id = e.currentTarget.dataset.id._id
    console.log(id, '232525')
    // 这里之所以使用wx.showModal是防止误操作
    wx.showModal({
      title: '提示',
      content: '你确定要删除这次的活动？',
      success(res) {
        console.log(res, '2352352')
        const db = wx.cloud.database()
        var id = e.currentTarget.dataset.id
        if (res.confirm) {
          if (res.confirm) {
            // 获取数据库的引用
            const db = wx.cloud.database()
            // 获取名为“message”集合的引用
            const message = db.collection('activity')
            // 删除操作（Promise 风格）
            var id = e.currentTarget.dataset.id._id
            // console.log(id, '232525')
            message.doc(id).remove().then(res => {
              // 删除成功后再次请求列表，达到刷新数据的目的
              if (res.errMsg === 'document.remove:ok') {
                that.getMsg()
              }
            })
          }
        }
      }
    })
  },
  //查询
  wxSearchFn: function (e) {
    console.log(e ,'11')
  },
  keyInput: function (e) {
    console.log(e.detail.value,'eeee输入信息')
    // this.setData({
    //   keyword: e.detail.value
    // });
    let keyword = e.detail.value
    if(keyword !== ''){
      const db = wx.cloud.database();
      const _ = db.command
      db.collection('activity').where({
        'activity.phrase2': keyword   //匹配输入内容
      }).get({
        success: res => {
          console.log(res)
          this.setData({
            activities: res.data
          })
        },
        fail: err => {
          console.log(err)
        }
      })
    }else{
      this.getMsg()
    }
    
  },
  //编辑
  getphrase2(e) {
    console.log(e)
    this.setData({
      phrase2: e.detail.value
    })
  },
  gettime1(e) {
    this.setData({
      time1: e.detail.value
    })
  },
  getfund(e) {
    this.setData({
      fund: e.detail.value
    })
  },
  getpeoples(e) {
    this.setData({
      peoples: e.detail.value
    })
  },
   onSubscribe(e) {
    console.log(e)
    //  let activities = e.target.dataset.id.activity
    this.setData({
      isRuleTrue: true
    })
     let id = e.target.dataset.id._id
    const db = wx.cloud.database()
     console.log(e,'eeee')
     var that = this

     db.collection('activity').doc(id).get({
       success: function (res) {
         console.log(res,"ressssss")
         that.setData({
           inpVal: res.data.activity.phrase2,
           inp3Val: res.data.activity.fund,
           inp4Val: res.data.activity.peoples,
           id: res.data._id
         })
       }
     })
},
  updetMsg(e) {
    var that = this
    console.log(e,"eeee")
    var id = e.target.dataset.id
    const db = wx.cloud.database()
    db.collection('activity').doc(id).update({
      data: {
        'activity.phrase2': that.data.phrase2,
        'activity.fund': that.data.fund,
        'activity.peoples': that.data.peoples
      },
      success: function (res) {
        that.getMsg()
        that.setData({
          inpVal: '',
          inp3Val: '',
          inp4Val: '',
          isRuleTrue: false
        })
        that.getMsg()
        wx.showToast({
          title: '修改记录成功',
        })
        wx.navigateTo({
          url: '../index/index',
        })
      },
      fail: err => {
        wx.showToast({
          title: '修改失败',
        })
      }
    })
  },
  //关闭规则提示
  hideRule: function () {
    this.setData({
      isRuleTrue: false
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      logged: app.globalData.logged
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this
    db.collection('activity').skip(20).where({
      teamName: that.data.teamName
    }).get().then(res => {
      console.log(res)
      that.setData({
        activities: that.data.activities.concat(res.data)
      })
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  publish: function() {

  },
  createOrChooice: function() {
    wx.navigateTo({
      //跳转到创建团队或者加入团队界面
      url: '../createTeam/createTeam',
    })
  },
  /**
   * 暂时未开放游客模式
   * 游客模式就是在首页可以看到别的团体的活动，但是没有参加的权限
   */
  visitor: function() {

  },
  createActivity: function() {
    wx.navigateTo({
      //跳转到创建活动页面上
      url: '../createActivity/createActivity',
    })
  },
  goDetail: function(e) {
    var index = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../actDetail/actDetail?objData=' + JSON.stringify(this.data.activities[index]),
    })
  }
})