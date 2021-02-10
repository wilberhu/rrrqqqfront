import request from '@/utils/request'
import { getToken } from '@/utils/auth'
import axios from "axios";

export function fetchList(params) {
  return request({
    url: '/api/funds_basic/',
    method: 'get',
    params
  })
}

export function fetchItemPortfolio(ts_code, params) {
  return request({
    url: '/api/funds_basic/portfolio/' + ts_code +'/',
    method: 'get',
    params
  })
}

export function fetchItemPortfolioDownload(ts_code) {
  return axios({
    url: '/api/funds_basic/portfolio/' + ts_code +'/download/',
    method: 'get',
    headers:{
      Authorization: 'Bearer ' + getToken(),
    }
  })
}

export function fetchAllList(params) {
  return request({
    url: '/api/funds_basic/all/',
    method: 'get',
    params
  })
}
