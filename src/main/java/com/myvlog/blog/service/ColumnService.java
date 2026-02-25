package com.myvlog.blog.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.myvlog.blog.dto.ColumnDto;
import com.myvlog.blog.entity.Column;
import java.util.List;

public interface ColumnService extends IService<Column> {
    ColumnDto createColumn(ColumnDto columnDto);
    ColumnDto updateColumn(Long id, ColumnDto columnDto);
    void deleteColumn(Long id);
    ColumnDto getColumn(Long id);
    List<ColumnDto> getAllColumns();
    List<ColumnDto> getColumnTree();
    void addArticleToColumn(Long columnId, Long articleId, Integer sortOrder);
    void removeArticleFromColumn(Long columnId, Long articleId);
    List<Long> getArticleIdsByColumnId(Long columnId);
}
