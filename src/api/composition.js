import request from '@/utils/request'

export function calculateComposition(data) {
  return request({
    url: '/api/compositions/calculate/',
    method: 'post',
    data
  })
}

export function getCompositionInfo(data) {
  return request({
    url: '/api/compositions/info/',
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
