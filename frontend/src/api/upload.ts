import request from '../utils/request';

interface UploadResponse {
  url: string;
}

export const uploadFile = (file: File): Promise<string | UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return request({
    url: '/upload',
    method: 'post',
    data: formData
  });
};
