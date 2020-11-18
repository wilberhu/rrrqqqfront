import request from '@/utils/request'

export function getHistData(params) {
  return request({
    url: '/api/item_hist_data/',
    method: 'get',
    params
  })
}

export function fetchCompanyClose(ts_code) {
  return request({
    url: '/api/close_data/',
    method: 'post',
    data: {
      ts_code
    }
  })
}
