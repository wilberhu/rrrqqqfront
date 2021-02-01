import request from '@/utils/request'

export function getCompanyHistData(ts_code, params) {
  return request({
    url: '/api/companies/hist_data/' + ts_code,
    method: 'get',
    params
  })
}

export function getIndexHistData(ts_code, params) {
  return request({
    url: '/api/indexes/hist_data/' + ts_code,
    method: 'get',
    params
  })
}

export function getFundHistData(ts_code, params) {
  return request({
    url: '/api/funds_basic/hist_data/' + ts_code,
    method: 'get',
    params
  })
}

export function fetchCompanyClose(data, column='close', params) {
  return request({
    url: '/api/data/' + column + '/',
    method: 'post',
    params,
    data
  })
}

export function fetchFundNav(data, column='unit_nav', params) {
  return request({
    url: '/api/funds/' + column + '/',
    method: 'post',
    params,
    data
  })
}
