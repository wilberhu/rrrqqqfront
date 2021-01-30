import request from '@/utils/request'

export function fetchItemList(query) {
  return request({
    url: '/api/users/',
    method: 'get',
    params: query
  })
}

export function getItem(id) {
  return request({
    url: '/api/users/' + id + '/',
    method: 'get'
  })
}

export function createItem(data) {
  return request({
    url: '/api/users/',
    method: 'post',
    data
  })
}

export function updateItem(id, data) {
  return request({
    url: '/api/users/' + id + '/',
    method: 'put',
    data
  })
}

export function deleteItem(id) {
  return request({
    url: '/api/users/' + id + '/',
    method: 'delete'
  })
}

export function updateToken(data) {
  return request({
    url: '/api/token/',
    method: 'put',
    data
  })
}

export function login(data) {
  return request({
    url: '/api/user/login',
    method: 'post',
    data: data
  })
}

export function getInfo() {
  return request({
    url: '/api/user/info',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/api/user/logout',
    method: 'post'
  })
}

