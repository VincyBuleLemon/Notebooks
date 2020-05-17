// pages/report/report.js
var wxCharts = require('../../utils/wxcharts-min.js');
var app = getApp();
const db = wx.cloud.database()
var lineChart = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listData: []
  },

  touchHandler: function (e) {
    // console.log(lineChart.getCurrentDataIndex(e));
    lineChart.showToolTip(e, {
      // background: '#7cb5ec',
      format: function (item, category) {
        return category + ' ' + item.name + ':' + item.data
      }
    });
  },
  createSimulationData() {
    var categories = [];
    var data = [];
    // for (var i = 0; i < 10; i++) {
    //   // categories.push('2016-' + (i + 1));
    //   data.push(Math.random() * (20 - 10) + 10);
    // }
    const db = wx.cloud.database()
    db.collection('activity').get({
      success: function(res) {
        console.log(res.data, 'res 111')
        for (var i = 0; i < res.data.length; i++) {
          console.log(res.data[i].activity, 'resdata 222')
          categories.push(res.data[i].activity.date);
          data.push(res.data[i].activity.fund); 
          // listData.push(res.data[i].activity)
        }  
        // that.setData({
        //   listData: res.data[i].activity
        // }); 
      
      }
    })
    // data[4] = null;
    return {
      categories: categories,
      data: data
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    var that=this
    that.getMsg()
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    var simulationData = this.createSimulationData();
    that.createSimulationData()
    lineChart = new wxCharts({
      canvasId: 'lineCanvas',
      type: 'line',
      categories: simulationData.categories,
      animation: true,
      // background: '#f5f5f5',
      series: [{
        name: '计划资金',
        data: [1, 1, 22, 33, 44,55],
        format: function (val, name) {
          return val.toFixed(2);
        }
      }],
      xAxis: {
        disableGrid: true,
      },
      yAxis: {
        title: '计划金额 (元)',
        format: function (val) {
          return val.toFixed(2);
        },
        min: 0
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
    wx.cloud.callFunction({
      name: "getActivities",
      success(res) {
        console.log("读取成功", res.result.data)
        that.savaExcel(res.result.data)
      },
      fail(res) {
        console.log("读取失败", res)
      }
    })
  },
  getMsg() {
    var that = this
    const db = wx.cloud.database()
    db.collection('activity').get({
      success: function (res) {
        console.log(res)
        that.setData({
          listData: res.data
        })
      }
    })
  },
  //把数据保存到excel里，并把excel保存到云存储
  savaExcel(actList) {
    let that = this
    wx.cloud.callFunction({
      name: "excel",
      data: {
        actList: actList
      },
      success(res) {
        console.log("保存成功", res)
        that.getFileUrl(res.result.fileID)
      },
      fail(res) {
        console.log("保存失败", res)
      }
    })
  },
  //获取云存储文件下载地址，这个地址有效期一天
  getFileUrl(fileID) {
    let that = this;
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: res => {
        // get temp file URL
        console.log("文件下载链接", res.fileList[0].tempFileURL)
        that.setData({
          fileUrl: res.fileList[0].tempFileURL
        })
      },
      fail: err => {
        // handle error
      }
    })
  },
  //复制excel文件下载链接
  copyFileUrl() {
    let that = this
    wx.setClipboardData({
      data: that.data.fileUrl,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log("复制成功", res.data) // data
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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