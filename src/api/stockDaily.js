import request from '@/utils/request'

export function fetchCompanyList(params) {
  return request({
    url: '/api/companies_daily/',
    method: 'get',
    params
  })
}

export function fetchIndexList(params) {
  return request({
    url: '/api/indexes_daily/',
    method: 'get',
    params
  })
}

