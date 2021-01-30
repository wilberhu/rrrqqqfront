import request from '@/utils/request'

export function fetchList(params) {
  return request({
    url: '/api/funds_basic/',
    method: 'get',
    params
  })
}

export function fetchAllList(params) {
  return request({
    url: '/api/funds_basic/all/',
    method: 'get',
    params
  })
}
