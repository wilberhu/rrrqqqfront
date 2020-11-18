import request from '@/utils/request'

export function fetchCompanyList(params) {
  return request({
    url: '/api/companies/',
    method: 'get',
    params
  })
}

export function fetchAllCompaniesMarkets() {
  return request({
    url: '/api/companies_markets/all/',
    method: 'get'
  })
}

export function fetchCompanyDetail(id) {
  return request({
    url: '/api/companies/' + id + '/',
    method: 'get'
  })
}

export function fetchItemDetail(params) {
  return request({
    url: '/api/item_detail/',
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
