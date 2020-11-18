import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/api/datasets/',
    method: 'get',
    params: query
  })
}

export function uploadDataset(data) {
  return request({
    url: '/api/datasets/',
    method: 'post',
    data
  })
}

export function editDataset(id, data) {
  return request({
    url: '/api/datasets/' + id + '/',
    method: 'put',
    data
  })
}

export function getDatasetHighlight(id) {
  return request({
    url: '/api/datasets/' + id + '/highlight/',
    method: 'get'
  })
}

export function deleteDataset(id) {
  return request({
    url: '/api/datasets/' + id + '/',
    method: 'delete'
  })
}

export function deleteMutipleDataset(data) {
  return request({
    url: '/api/datasets_delete/',
    method: 'delete',
    data
  })
}
