import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/api/filter_options/',
    method: 'get',
    params: query
  })
}

export function fetchItem(id) {
  return request({
    url: '/api/filter_options/' + id + '/',
    method: 'get'
  })
}

export function createItem(data) {
  return request({
    url: '/api/filter_options/',
    method: 'post',
    data
  })
}

export function updateItem(id, data) {
  return request({
    url: '/api/filter_options/' + id + '/',
    method: 'put',
    data
  })
}

export function deleteItem(id) {
  return request({
    url: '/api/filter_options/' + id + '/',
    method: 'delete'
  })
}
