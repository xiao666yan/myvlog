import request from '../utils/request';
import { User, ApiResponse } from '../../types';

export const getUsers = (): Promise<User[]> => {
  return request({
    url: '/users',
    method: 'get'
  });
};

export const getUserProfile = (): Promise<User> => {
  return request({
    url: '/users/profile',
    method: 'get'
  });
};

export const updateNickname = (id: number, nickname: string) => {
  return request({
    url: `/users/${id}/nickname`,
    method: 'put',
    params: { nickname }
  });
};

export const updateUserProfile = (id: number, data: any) => {
  return request({
    url: `/users/${id}/profile`,
    method: 'put',
    data
  });
};

export const updateAvatar = (id: number, avatar: string) => {
  return request({
    url: `/users/${id}/avatar`,
    method: 'put',
    data: { avatar }
  });
};

export const updateEmail = (id: number, email: string) => {
  return request({
    url: `/users/${id}/email`,
    method: 'put',
    data: { email }
  });
};

export const updatePassword = (id: number, data: any) => {
  return request({
    url: `/users/${id}/password`,
    method: 'put',
    data
  });
};

export const grantVip = (id: number) => {
  return request({
    url: `/users/${id}/vip`,
    method: 'post'
  });
};

export const deleteUser = (id: number) => {
  return request({
    url: `/users/${id}`,
    method: 'delete'
  });
};
