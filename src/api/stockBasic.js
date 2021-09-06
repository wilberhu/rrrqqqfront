import request from '@/utils/request'

export function fetchCompanyList(params) {
  return request({
    url: '/api/companies/',
    method: 'get',
    params
  })
}

export function queryCompanies(params) {
  return request({
    url: '/api/companies/query/',
    method: 'get',
    params
  })
}

export function fetchIndexList(params) {
  return request({
    url: '/api/indexes/',
    method: 'get',
    params
  })
}

export function queryIndexes(params) {
  return request({
    url: '/api/indexes/query/',
    method: 'get',
    params
  })
}
