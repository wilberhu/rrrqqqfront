import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/api/stock_pickings/',
    method: 'get',
    params: query
  })
}

export function fetchItem(id) {
  return request({
    url: '/api/stock_pickings/' + id + '/',
    method: 'get'
  })
}

export function createItem(data) {
  return request({
    url: '/api/stock_pickings/',
    method: 'post',
    data
  })
}

export function updateItem(id, data) {
  return request({
    url: '/api/stock_pickings/' + id + '/',
    method: 'put',
    data
  })
}

export function deleteItem(id) {
  return request({
    url: '/api/stock_pickings/' + id + '/',
    method: 'delete'
  })
}
