import request from '@/utils/request'

export function fetchList(params) {
  return request({
    url: '/api/funds_daily/',
    method: 'get',
    params
  })
}
