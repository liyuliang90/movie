const app = getApp()
const baseUrl = app.globalData.baseUrl;
const api = require('../../../utils/api.js');
Page({
  data: {
    showTime:'',//影片上映日期
    isShow: false, //导航下拉框是否展开
    cityCinemaInfo: {}, //影院过滤菜单
    params: { //影院搜索条件
      movieId: 0,
      day: '',
      offset: 0,
      limit: 20,
      districtId: -1,
      lineId: -1,
      hallType: -1,
      brandId: -1,
      serviceId: -1,
      areaId: -1,
      stationId: -1,
      item: '',
      updateShowDay: false,
    },
    cinemas: [], //影院列表 
    loadComplete: false, //数据是否加载完
    nothing: false, //是否有符合过滤的影院
    noSchedule: false //当天是否有场次，原本时间是由后台返回的，但是缺少城市ID就没有返回，导致当天可能没有播放场次

  },
  onLoad(options) {
    this.initPage(options)
  },
  initPage(options){
    const movieId = options.movieId
    const movieName = options.movieName
    const showTime = options.showTime //影片上映日期
    wx.setNavigationBarTitle({
      title: movieName
    })
    this.setData({
      showTime,
      params: {
        ...this.data.params,
        movieId
      }
    })
    //select-time会触发事件来调用changeTime初始化数据
  },
  //获取影院列表
  getCinemas() {
    const _this = this;
    return new Promise((resolve, reject) => {
      const params = {
          cityId: app.globalData.selectCity.id,
          districtId: _this.data.params.districtId,
          movieId: _this.data.params.movieId,
          showTime: _this.data.params.day,
          lng:app.globalData.selectCity.longitude,
          lat:app.globalData.selectCity.latitude,
          limit:_this.data.params.limit,
          offset: _this.data.cinemas.length
      }
      wx.request({
        //url: `https://m.maoyan.com/ajax/movie?forceUpdate=${Date.now()}`,
        url: `${baseUrl}/ajax/movie`,
        method: 'GET',
        data: params,
        success(res) {
          // 缺少了城市ID所以返回值缺少showDays，只能自己模拟时间了
          resolve(res.data.cinemas)
          _this.setData({
            cinemas: _this.data.cinemas.concat(res.data.cinemas),
            loadComplete: !res.data.paging.hasMore
          })
        }
      })
    })
  },
  //获取过滤菜单数据
  getFilter() {
    const _this = this;
    const params = {
      movieId: this.data.params.movieId,
      day: this.data.params.day
    }
    api.getFilterCinemas(params).then(([res])=>{
      _this.setData({
        cityCinemaInfo: res
      })
    })
  },
  //当选择的时间变化时触发
  changeTime(e){
    const day = e.detail.day
    this.setData({
      params: { ...this.data.params,day},
      cinemas: [],
      isShow: false, //隐藏过滤下拉框
      noSchedule: false
    },()=>{
      wx.showLoading({
        title: '正在加载...'
      })
      this.getCinemas().then((list) => {
        wx.hideLoading()
        if (!list.length) {
          this.setData({
            noSchedule: true
          })
        }
      })
      this.getFilter()
    })
  },
  //当过滤条件变化时调用的函数
  changeCondition(e) {
    const obj = e.detail
    wx.showLoading({
      title: '正在加载...'
    })
    this.setData({
      params: {
        ...this.data.params,
        ...obj
      },
      cinemas: [],
      nothing: false
    }, () => {
      this.getCinemas().then((list) => {
        if (!list.length) {
          this.setData({
            nothing: true
          })
        }
        wx.hideLoading()
      })
    })
  },
  //导航下拉框状态变化时的处理，在下拉框展开时禁止滚动穿透
  toggleShow(e) {
    const item = e.detail.item
    this.setData({
      isShow: item !== -1
    })
  },
  //上拉触底加载更多
  onReachBottom() {
    if (this.data.loadComplete) {
      return
    }
    this.getCinemas()
  }
})