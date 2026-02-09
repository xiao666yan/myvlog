import request from '@/utils/request';

export function getAdminComments(params) {
  return request({
    url: '/comments/admin',
    method: 'get',
    params
  });
}

export function auditComment(id, status) {
  return request({
    url: `/comments/${id}/audit`,
    method: 'put',
    params: { status }
  });
}

export function deleteComment(id) {
  return request({
    url: `/comments/${id}`,
    method: 'delete'
  });
}
