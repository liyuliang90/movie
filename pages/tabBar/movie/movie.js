const request = require('../../../utils/request')
const app = getApp()
const api = require('../../../utils/api')
Page({
  data: {
    city: '正在定位...',
    switchItem: 0, //默认选择‘正在热映’
    //‘正在热映’数据
    movieList0: [],
    //movieIds0: [],
    loadComplete0: false, //‘正在上映’数据是否加载到最后一条
    //‘即将上映’数据
    mostExpectedList: [],
    movieList1: [],
    //movieIds1: [],
    loadComplete1: false,
    loadComplete2: false //水平滚动加载的数据是否加载完毕
  },
  onLoad() {
    this.initPage()
  },
  initPage() {
    //https://www.jianshu.com/p/aaf65625fc9d   解释的很好
    if (app.globalData.userLocation) {
      this.setData({
        city: app.globalData.selectCity ? app.globalData.selectCity.cityName : '定位失败'
      })
    } else {
      app.userLocationReadyCallback = () => {
        this.setData({
          city: app.globalData.selectCity ? app.globalData.selectCity.cityName : '定位失败'
        })
      }
    }
    this.firstLoad()
  },
  onShow() {
    if (app.globalData.selectCity) {
      this.setData({
        city: app.globalData.selectCity.cityName
      })
    }
  },
  //上拉触底刷新
  onReachBottom() {
    const {
      switchItem,
      movieList0,
      movieIds0,
      loadComplete0,
      movieList1,
      movieIds1,
      loadComplete1
    } = this.data
    console.log('test')
    if (this.data.switchItem === 0) {
      this.ReachBottom(movieList0, loadComplete0, 0)
    } else {
      this.ReachBottom(movieList1, loadComplete1, 1)
    }
  },
  //第一次加载页面时请求‘正在热映的数据’
  async firstLoad() {
    wx.showLoading({
      title: '正在加载...'
    })
    const params = {
      limit:12,
      offset:0,
      showst:3
    }
    const [res, err] = await api.getMovieList(params)
    if (!err) {
      const movieList0 = this.formatImgUrl(res.movieList)
      this.setData({
        movieList0: this.data.movieList0.concat(movieList0),
        loadComplete0: !res.paging.hasMore
      })
    }
    wx.hideLoading()
  },
  //切换swtch
  async selectItem(e) {
    const item = e.currentTarget.dataset.item
    this.setData({
      switchItem: item
    })
    if (item === 1 && !this.data.mostExpectedList.length) {
      wx.showLoading({
        title: '正在加载...'
      })
      api.getMostExpected().then(([res]) => {
        this.setData({
          mostExpectedList: this.formatImgUrl(res.coming || [], true)
        })
      }).finally(() => {
        wx.hideLoading()
      })
      /*const params = {
        limit:12,
        offset:0,
        showst:1
      }
      const [res, err] = await api.getMovieList(params)
      if (!err) {
        const list = this.formatImgUrl(res.movieList)
        this.setData({
          movieList1: this.data.movieList1.concat(list),
          loadComplete1: !res.paging.hasMore
        })
      }*/

      api.getComingList().then(([res]) => {
        this.setData({
          movieList1: this.formatImgUrl(res.coming || [])
        })
      })
    }
  },
  //上拉触底刷新的加载函数
  async ReachBottom(list, complete, item) {
    if (complete) {
      return
    }
    let showst = 3
    if (item==1){
        showst = 1
    }
    const params = {
      limit:12,
      offset:list.length,
      showst:showst
    }
    const [res, err] = await api.getMovieList(params)
    if (!err) {
      const more_list = this.formatImgUrl(res.movieList)
      this.setData({
        [`movieList${item}`]: list.concat(more_list),
        [`loadComplete${item}`]: !res.paging.hasMore
      })
    }
  },
  //滚动到最右边时的事件处理函数
  async lower() {
    const {
      mostExpectedList,
      loadComplete2
    } = this.data
    const length = mostExpectedList.length
    if (loadComplete2) {
      return
    }
    const [res, err] = await request({
      api: "/ajax/mostExpected",
      data: {
        limit: 10,
        offset: length,
        token:''
      }
    })
    if (!err) {
      this.setData({
        mostExpectedList: mostExpectedList.concat(this.formatImgUrl(res.coming || [], true)),
        loadComplete2: !res.paging.hasMore || !res.coming.length //当返回的数组长度为0时也认为数据请求完毕
      })
    }
  },
  //处理图片url
  formatImgUrl(arr, cutTitle = false) {
    //小程序不能在{{}}调用函数，所以我们只能在获取API的数据时处理，而不能在wx:for的每一项中处理
    if (!Array.isArray(arr)) {
      return
    }
    let newArr = []
    arr.forEach(item => {
      let title = item.comingTitle
      if (cutTitle) {
        title = item.comingTitle.split(' ')[0]
      }
      let imgUrl = item.img.replace('w.h', '128.180')
      newArr.push({
        ...item,
        comingTitle: title,
        img: imgUrl
      })
    })
    return newArr
  },
  //转发
  onShareAppMessage(res) {
    return {
      title: '快来看看附近的电影院',
      path: 'pages/tabBar/movie/movie'
    }
  }
})