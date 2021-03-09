//const baseUrl = 'http://192.168.75.128:8000'
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

module.exports = get
module.exports = {
  getMovieList: getMovieList,
  getMostExpected: getMostExpected,
  getComingList: getComingList
}
//module.exports = getMostExpected