package com.myvlog.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myvlog.blog.dto.ColumnDto;
import com.myvlog.blog.entity.ArticleColumn;
import com.myvlog.blog.entity.Column;
import com.myvlog.blog.mapper.ArticleColumnMapper;
import com.myvlog.blog.mapper.ColumnMapper;
import com.myvlog.blog.service.ColumnService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ColumnServiceImpl extends ServiceImpl<ColumnMapper, Column> implements ColumnService {

    private final ColumnMapper columnMapper;
    private final ArticleColumnMapper articleColumnMapper;

    @Override
    @Transactional
    public ColumnDto createColumn(ColumnDto columnDto) {
        log.info("Creating column with name: {}", columnDto.getName());
        
        if (columnDto.getName() == null || columnDto.getName().trim().isEmpty()) {
            throw new RuntimeException("Column name is required");
        }
        
        Column column = new Column();
        BeanUtils.copyProperties(columnDto, column);

        if (column.getSlug() == null || column.getSlug().isEmpty()) {
            column.setSlug(UUID.randomUUID().toString().substring(0, 8));
        }

        // Check duplicate slug
        if (columnMapper.selectCount(new LambdaQueryWrapper<Column>().eq(Column::getSlug, column.getSlug())) > 0) {
            throw new RuntimeException("Column slug already exists");
        }

        if (column.getStatus() == null) {
            column.setStatus(1);
        }
        if (column.getSortOrder() == null) {
            column.setSortOrder(0);
        }

        columnMapper.insert(column);
        log.info("Column created with id: {}", column.getId());

        ColumnDto result = new ColumnDto();
        BeanUtils.copyProperties(column, result);
        return result;
    }

    @Override
    @Transactional
    public ColumnDto updateColumn(Long id, ColumnDto columnDto) {
        Column column = columnMapper.selectById(id);
        if (column == null) {
            throw new RuntimeException("Column not found");
        }

        BeanUtils.copyProperties(columnDto, column, "id", "createdAt", "updatedAt");
        columnMapper.updateById(column);

        ColumnDto result = new ColumnDto();
        BeanUtils.copyProperties(column, result);
        return result;
    }

    @Override
    @Transactional
    public void deleteColumn(Long id) {
        // Check if has children
        Long childrenCount = columnMapper.selectCount(new LambdaQueryWrapper<Column>().eq(Column::getParentId, id));
        if (childrenCount > 0) {
            throw new RuntimeException("Cannot delete column with children");
        }

        // Delete article relations
        articleColumnMapper.delete(new LambdaQueryWrapper<ArticleColumn>().eq(ArticleColumn::getColumnId, id));

        columnMapper.deleteById(id);
    }

    @Override
    public ColumnDto getColumn(Long id) {
        Column column = columnMapper.selectById(id);
        if (column == null) {
            return null;
        }
        ColumnDto result = new ColumnDto();
        BeanUtils.copyProperties(column, result);

        // Count articles
        Long count = articleColumnMapper.selectCount(new LambdaQueryWrapper<ArticleColumn>().eq(ArticleColumn::getColumnId, id));
        result.setArticleCount(count);

        return result;
    }

    @Override
    public List<ColumnDto> getAllColumns() {
        return columnMapper.selectAllActive()
                .stream()
                .map(column -> {
                    ColumnDto dto = new ColumnDto();
                    BeanUtils.copyProperties(column, dto);

                    // Count articles for each column
                    Long count = articleColumnMapper.selectCount(new LambdaQueryWrapper<ArticleColumn>().eq(ArticleColumn::getColumnId, column.getId()));
                    dto.setArticleCount(count);

                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<ColumnDto> getColumnTree() {
        List<Column> allColumns = columnMapper.selectAllActive();
        return buildTree(allColumns, null);
    }

    private List<ColumnDto> buildTree(List<Column> columns, Long parentId) {
        return columns.stream()
                .filter(c -> (parentId == null && c.getParentId() == null) || (parentId != null && parentId.equals(c.getParentId())))
                .map(column -> {
                    ColumnDto dto = new ColumnDto();
                    BeanUtils.copyProperties(column, dto);

                    // Count articles
                    Long count = articleColumnMapper.selectCount(new LambdaQueryWrapper<ArticleColumn>().eq(ArticleColumn::getColumnId, column.getId()));
                    dto.setArticleCount(count);

                    // Recursively build children
                    dto.setChildren(buildTree(columns, column.getId()));

                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void addArticleToColumn(Long columnId, Long articleId, Integer sortOrder) {
        // Check if relation exists
        Long count = articleColumnMapper.selectCount(
                new LambdaQueryWrapper<ArticleColumn>()
                        .eq(ArticleColumn::getColumnId, columnId)
                        .eq(ArticleColumn::getArticleId, articleId));

        if (count > 0) {
            throw new RuntimeException("Article already in column");
        }

        ArticleColumn relation = new ArticleColumn();
        relation.setColumnId(columnId);
        relation.setArticleId(articleId);
        relation.setSortOrder(sortOrder != null ? sortOrder : 0);

        articleColumnMapper.insert(relation);
    }

    @Override
    @Transactional
    public void removeArticleFromColumn(Long columnId, Long articleId) {
        articleColumnMapper.delete(
                new LambdaQueryWrapper<ArticleColumn>()
                        .eq(ArticleColumn::getColumnId, columnId)
                        .eq(ArticleColumn::getArticleId, articleId));
    }

    @Override
    public List<Long> getArticleIdsByColumnId(Long columnId) {
        return articleColumnMapper.selectArticleIdsByColumnId(columnId);
    }
}
