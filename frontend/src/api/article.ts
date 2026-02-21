import request from '../utils/request';
import { Article, ApiResponse } from '../../types';

interface ArticleListResponse {
  records: Article[];
  total: number;
}

export const getArticles = (params?: any): Promise<Article[] | ArticleListResponse> => {
  return request({
    url: '/articles',
    method: 'get',
    params
  });
};

export const getAdminArticles = (params?: any): Promise<Article[]> => {
  return request({
    url: '/articles/admin',
    method: 'get',
    params
  });
};

export const getMyArticles = (): Promise<Article[]> => {
  return request({
    url: '/articles/me',
    method: 'get'
  });
};

export const getArticleById = (id: number): Promise<Article> => {
  return request({
    url: `/articles/${id}`,
    method: 'get'
  });
};

export const createArticle = (data: any) => {
  return request({
    url: '/articles',
    method: 'post',
    data
  });
};

export const updateArticle = (id: number, data: any) => {
  return request({
    url: `/articles/${id}`,
    method: 'put',
    data
  });
};

export const deleteArticle = (id: number) => {
  return request({
    url: `/articles/${id}`,
    method: 'delete'
  });
};

export const auditArticle = (id: number, status: string) => {
  return request({
    url: `/articles/${id}/audit`,
    method: 'put',
    params: { status }
  });
};
