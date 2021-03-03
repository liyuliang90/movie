const baseUrl = 'http://192.168.75.128:8000'

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

module.exports = get