import request from '../utils/request';

export interface Column {
  id: number;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  parentId?: number;
  sortOrder: number;
  status: number;
  articleCount?: number;
  children?: Column[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ColumnCreateRequest {
  name: string;
  slug?: string;
  description?: string;
  coverImage?: string;
  parentId?: number;
  sortOrder?: number;
}

export interface ColumnUpdateRequest {
  name?: string;
  slug?: string;
  description?: string;
  coverImage?: string;
  parentId?: number;
  sortOrder?: number;
  status?: number;
}

// 获取所有专栏
export function getColumns(): Promise<Column[]> {
  return request({
    url: '/columns',
    method: 'get'
  });
}

// 获取专栏树
export function getColumnTree(): Promise<Column[]> {
  return request({
    url: '/columns/tree',
    method: 'get'
  });
}

// 获取单个专栏
export function getColumn(id: number): Promise<Column> {
  return request({
    url: `/columns/${id}`,
    method: 'get'
  });
}

// 创建专栏
export function createColumn(data: ColumnCreateRequest): Promise<Column> {
  return request({
    url: '/columns',
    method: 'post',
    data
  });
}

// 更新专栏
export function updateColumn(id: number, data: ColumnUpdateRequest): Promise<Column> {
  return request({
    url: `/columns/${id}`,
    method: 'put',
    data
  });
}

// 删除专栏
export function deleteColumn(id: number): Promise<void> {
  return request({
    url: `/columns/${id}`,
    method: 'delete'
  });
}

// 获取专栏下的文章ID列表
export function getArticlesByColumnId(columnId: number): Promise<number[]> {
  return request({
    url: `/columns/${columnId}/articles`,
    method: 'get'
  });
}

// 添加文章到专栏
export function addArticleToColumn(columnId: number, articleId: number, sortOrder?: number): Promise<void> {
  return request({
    url: `/columns/${columnId}/articles/${articleId}`,
    method: 'post',
    params: { sortOrder }
  });
}

// 从专栏移除文章
export function removeArticleFromColumn(columnId: number, articleId: number): Promise<void> {
  return request({
    url: `/columns/${columnId}/articles/${articleId}`,
    method: 'delete'
  });
}
