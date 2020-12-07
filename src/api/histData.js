import request from '@/utils/request'

export function getHistData(ts_code, params) {
  return request({
    url: '/api/item_hist_data/' + ts_code,
    method: 'get',
    params
  })
}

export function fetchCompanyClose(ts_code, params) {
  return request({
    url: '/api/close_data/',
    method: 'post',
    params,
    data: {
      ts_code
    }
  })
}
