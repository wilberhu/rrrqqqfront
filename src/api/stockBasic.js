import request from '@/utils/request'

export function fetchCompanyList(params) {
  return request({
    url: '/api/companies/',
    method: 'get',
    params
  })
}

export function fetchAllCompanies() {
  return request({
    url: '/api/companies/all/',
    method: 'get'
  })
}

export function fetchIndexList(params) {
  return request({
    url: '/api/indexes/',
    method: 'get',
    params
  })
}
