import request from '@/utils/request';

export function searchArticles(params) {
  return request({
    url: '/search',
    method: 'get',
    params
  });
}
