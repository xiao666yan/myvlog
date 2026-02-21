import request from '../utils/request';
import { User } from '../../types';

interface AuthResponse {
  token: string;
  user: User;
}

export const login = (username: string, password: string): Promise<AuthResponse> => {
  return request({
    url: '/auth/login',
    method: 'post',
    data: {
      username,
      password
    }
  });
};

export const register = (username: string, password: string, email: string, nickname: string): Promise<AuthResponse> => {
  return request({
    url: '/auth/register',
    method: 'post',
    data: {
      username,
      password,
      email,
      nickname
    }
  });
};

export const getUserInfo = (): Promise<User> => {
  return request({
    url: '/users/me',
    method: 'get'
  });
};

export const logout = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};
