import request from '../utils/request';

export const getAnnouncements = () => {
  return request({
    url: '/announcements',
    method: 'get'
  });
};

export const getActiveAnnouncements = () => {
  return request({
    url: '/announcements/active',
    method: 'get'
  });
};

export const createAnnouncement = (data: any) => {
  return request({
    url: '/announcements',
    method: 'post',
    data
  });
};

export const updateAnnouncement = (id: number, data: any) => {
  return request({
    url: `/announcements/${id}`,
    method: 'put',
    data
  });
};

export const deleteAnnouncement = (id: number) => {
  return request({
    url: `/announcements/${id}`,
    method: 'delete'
  });
};

export const markAnnouncementAsRead = (id: number) => {
  return request({
    url: `/announcements/${id}/read`,
    method: 'post'
  });
};
