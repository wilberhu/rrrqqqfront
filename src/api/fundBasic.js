import request from '@/utils/request'

export function fetchList(params) {
  return request({
    url: '/api/funds_basic/',
    method: 'get',
    params
  })
}
