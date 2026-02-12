import request from '../utils/request';

export function getActiveAnnouncements() {
  return request({
    url: '/announcements/active',
    method: 'get'
  });
}

export function createAnnouncement(data) {
  return request({
    url: '/announcements',
    method: 'post',
    data
  });
}

export function deleteAnnouncement(id) {
  return request({
    url: `/announcements/${id}`,
    method: 'delete'
  });
}
