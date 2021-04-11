import request from '@/utils/request'
import { getToken } from '@/utils/auth'
import axios from "axios";

export function fetchList(query) {
  return request({
    url: '/api/strategies/',
    method: 'get',
    params: query
  })
}

export function fetchAllList(query) {
  return request({
    url: '/api/strategies/all/',
    method: 'get',
    params: query
  })
}

export function fetchItem(id) {
  return request({
    url: '/api/strategies/' + id + '/',
    method: 'get'
  })
}

export function fetchItemCode(id) {
  return request({
    url: '/api/strategies/' + id + '/code/',
    method: 'get'
  })
}

export function createItem(data) {
  return request({
    url: '/api/strategies/',
    method: 'post',
    data
  })
}

export function updateItem(id, data) {
  return request({
    url: '/api/strategies/' + id + '/',
    method: 'put',
    data
  })
}

export function deleteItem(id) {
  return request({
    url: '/api/strategies/' + id + '/',
    method: 'delete'
  })
}

export function fetchStrategyPortfolioDownload(path) {
  return axios({
    url: '/api/strategies/portfolio/' + path.split('strategies/portfolio/')[1],
    method: 'get',
    headers:{
      Authorization: 'Bearer ' + getToken(),
    }
  })
}
