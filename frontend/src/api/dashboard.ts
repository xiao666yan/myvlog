import request from '../utils/request';
import { DashboardStats } from '../../types';

export const getDashboardStats = (): Promise<DashboardStats> => {
  return request({
    url: '/dashboard/stats',
    method: 'get'
  });
};
