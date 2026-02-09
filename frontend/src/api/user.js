import request from '../utils/request';

export function updateNickname(userId, nickname) {
  return request({
    url: `/users/${userId}/nickname`,
    method: 'put',
    data: { nickname }
  });
}

export function updateEmail(userId, email) {
  return request({
    url: `/users/${userId}/email`,
    method: 'put',
    data: { email }
  });
}

export function updateAvatar(userId, avatar) {
  return request({
    url: `/users/${userId}/avatar`,
    method: 'put',
    data: { avatar }
  });
}

export function updatePassword(userId, oldPassword, newPassword) {
  return request({
    url: `/users/${userId}/password`,
    method: 'put',
    data: { oldPassword, newPassword }
  });
}

export function getProfile() {
  return request({
    url: '/users/profile',
    method: 'get'
  });
}
