const app = getApp()
const baseUrl = app.globalData.baseUrl;
function get(url, data) {
  url = `${baseUrl}${url}`
  return new Promise((resolve, reject) => {
    wx.request({
      data:data,
      url:url,
      success: (res) => {
        if(typeof res === 'string'){
          reject([{}, err])
        } else {
          resolve([res.data || {}, null])
        }
      },
      fail: (err) => {
        reject([{}, err])
      }
    })
  }).catch(err => [{}, err])
}

function getMovieList(){
    const url = '/ajax/movieOnInfoList'
    return get(url,{})
}

function getMostExpected(){
    const url = '/ajax/mostExpected?limit=10&offset=0&token='
    return get(url,{})
}

function getComingList(){
  const url = '/ajax/comingList'
  return get(url,{})
}

function getActor(params){
  const url = '/ajax/actor'
  return get(url,params)
}

function getFilterCinemas(params){
  const url = '/ajax/filterCinemas'
  const param = {
    'city_id':app.globalData.selectCity.id,
    ...params
  }
  return get(url,param)
}

function getCitys(){
  const url = '/ajax/citys'
  return get(url,{})
}

module.exports = {
  getMovieList: getMovieList,
  getMostExpected: getMostExpected,
  getComingList: getComingList,
  getFilterCinemas: getFilterCinemas,
  getCitys: getCitys,
  getActor: getActor,
}