import request from '@/utils/request';

export function getArticles(params) {
  return request({
    url: '/articles',
    method: 'get',
    params
  });
}

export function getArticle(id) {
  return request({
    url: `/articles/${id}`,
    method: 'get'
  });
}

export function getArticleBySlug(slug) {
  return request({
    url: `/articles/slug/${slug}`,
    method: 'get'
  });
}

export function createArticle(data) {
  return request({
    url: '/articles',
    method: 'post',
    data
  });
}

export function updateArticle(id, data) {
  return request({
    url: `/articles/${id}`,
    method: 'put',
    data
  });
}

export function getMyArticles() {
  return request({
    url: '/articles/me',
    method: 'get'
  });
}

export function deleteArticle(id) {
  return request({
    url: `/articles/${id}`,
    method: 'delete'
  });
}

export function getAdminArticles(params) {
  return request({
    url: '/articles/admin',
    method: 'get',
    params
  });
}
