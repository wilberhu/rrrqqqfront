import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/api/stock_filters/',
    method: 'get',
    params: query
  })
}

export function fetchAllList(query) {
  return request({
    url: '/api/stock_filters/all/',
    method: 'get',
    params: query
  })
}

export function fetchItem(id) {
  return request({
    url: '/api/stock_filters/' + id + '/',
    method: 'get'
  })
}

export function fetchItemCode(id) {
  return request({
    url: '/api/stock_filters/' + id + '/code/',
    method: 'get'
  })
}

export function fetchItemData(id, params) {
  return request({
    url: '/api/stock_filters/' + id + '/data/',
    method: 'get',
    params
  })
}

export function createItem(data) {
  return request({
    url: '/api/stock_filters/',
    method: 'post',
    data
  })
}

export function updateItem(id, data) {
  return request({
    url: '/api/stock_filters/' + id + '/',
    method: 'put',
    data
  })
}

export function deleteItem(id) {
  return request({
    url: '/api/stock_filters/' + id + '/',
    method: 'delete'
  })
}
