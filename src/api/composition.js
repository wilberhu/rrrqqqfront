import request from '@/utils/request'

export function dailyTrader(data) {
  return request({
    url: '/api/compositions/',
    method: 'post',
    data
  })
}
