import request from '@/utils/request'

export function calculateComposition(data) {
  return request({
    url: '/api/compositions/calculate/',
    method: 'post',
    data
  })
}


export function calculateActivity(data) {
  return request({
    url: '/api/compositions/activity/',
    method: 'post',
    data
  })
}

export function fetchDataframe(data) {
  return request({
    url: '/api/compositions/dataframe/',
    method: 'post',
    data
  })
}

export function fetchList(query) {
  return request({
    url: '/api/compositions/',
    method: 'get',
    params: query
  })
}

export function fetchItem(id) {
  return request({
    url: '/api/compositions/' + id + '/',
    method: 'get'
  })
}

export function createItem(data) {
  return request({
    url: '/api/compositions/',
    method: 'post',
    data
  })
}

export function updateItem(id, data) {
  return request({
    url: '/api/compositions/' + id + '/',
    method: 'put',
    data
  })
}

export function deleteItem(id) {
  return request({
    url: '/api/compositions/' + id + '/',
    method: 'delete'
  })
}

export function fetchTradeCalender() {
  return request({
    url: '/api/trade_calender/',
    method: 'get'
  })
}
