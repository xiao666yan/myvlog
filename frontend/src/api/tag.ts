import request from '../utils/request';

export const getTags = () => {
  return request({
    url: '/tags',
    method: 'get'
  });
};

export const createTag = (data: any) => {
  return request({
    url: '/tags',
    method: 'post',
    data
  });
};

export const updateTag = (id: number, data: any) => {
  return request({
    url: `/tags/${id}`,
    method: 'put',
    data
  });
};

export const deleteTag = (id: number) => {
  return request({
    url: `/tags/${id}`,
    method: 'delete'
  });
};
