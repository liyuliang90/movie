//app.js
const QQMapWX = require('./assets/libs/qqmap-wx-jssdk.min.js');
let qqmapsdk;
qqmapsdk = new QQMapWX({
  key: 'MH2BZ-4WTK3-2D63K-YZRHP-HM537-HHBD3'
});

App({
  globalData:{},
  getSysInfo(){
    let that = this
    wx.getSystemInfo({
      success: res => {
        that.globalData.screenHeight = res.screenHeight;
        that.globalData.screenWidth = res.screenWidth;
        that.globalData.statusBarHeight = res.statusBarHeight
      }
    })
  },
  onLaunch: function () {
    this.initPage()
    this.getSysInfo()
  },
  initPage(){
    // 获取用户授权信息信息,防止重复出现授权弹框
    wx.getSetting({
      success: res => {
        //已有权限直接获得信息，否则出现授权弹框
        if (res.authSetting['scope.userLocation']) {
          this.getUserLocation()
        } else {
          this.getUserLocation()
        }
      },
      fail:(res)=>{ 
        console.log('getSetting fail')
        console.log(res)
      }
      
    })
  },
  //获取用户的位置信息
  getUserLocation() {
    wx.getLocation({
      //成功授权
      success: (res) => {
        const latitude = res.latitude;
        const longitude = res.longitude;
        // 使用腾讯地图接口将位置坐标转出成名称（为什么弹框出出现两次？）
        qqmapsdk.reverseGeocoder({
          location: {   //文档说location默认为当前位置可以省略，但是还是要手动加上，否则弹框会出现两次，手机端则出现问题
            latitude,
            longitude
          },
          success: (res) => {
            const cityFullname = res.result.address_component.city;
            var cityInfo = {
              id:null,
              latitude,
              longitude,
              cityName: cityFullname.substring(0, cityFullname.length - 1),
              status:1
            }
            const _this = this;
            const baseUrl = this.globalData.baseUrl
            wx.request({
              url: `${baseUrl}/ajax/cityLocation`,
              data:{'city_name':cityInfo.cityName},
              success(res) {
                if(res.data.success){
                    _this.globalData.selectCity.id = res.data.city_id
                    _this.globalData.userLocation.id = res.data.city_id
                }else{
                  comsole.log('没有这个城市')
                }
              }
            })
            this.globalData.userLocation = { ...cityInfo}   //浅拷贝对象
            this.globalData.selectCity = { ...cityInfo } //浅拷贝对象
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回，所以此处加入 callback 以防止这种情况
            if (this.userLocationReadyCallback) {
              this.userLocationReadyCallback()
            }
          }
        })
      },
      fail:()=>{
        this.globalData.userLocation = {status:0}
        //防止当弹框出现后，用户长时间不选择，
        if (this.userLocationReadyCallback) {
          this.userLocationReadyCallback()
        }
      }
    })
  },
  globalData: {
    userLocation: null, //用户的位置信息
    selectCity: null, //用户切换的城市
    //cityId: null,
    baseUrl:'http://192.168.75.128:8000',
  }
})