import request from '../utils/request';

export interface LearningNote {
  id: number;
  articleId: number;
  userId?: number;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningNoteCreateRequest {
  content: string;
}

// 获取文章的所有笔记
export function getNotesByArticleId(articleId: number): Promise<LearningNote[]> {
  return request({
    url: `/notes/article/${articleId}`,
    method: 'get'
  });
}

// 创建笔记
export function createNote(articleId: number, data: LearningNoteCreateRequest): Promise<LearningNote> {
  return request({
    url: `/notes/article/${articleId}`,
    method: 'post',
    data
  });
}

// 删除笔记
export function deleteNote(id: number): Promise<void> {
  return request({
    url: `/notes/${id}`,
    method: 'delete'
  });
}
