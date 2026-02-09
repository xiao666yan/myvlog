import request from '../utils/request';

export function getDashboardStats() {
  return request({
    url: '/dashboard/stats',
    method: 'get'
  });
}

export function getHeatData() {
  return request({
    url: '/dashboard/heat',
    method: 'get'
  });
}
