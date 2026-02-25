package com.myvlog.blog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.myvlog.blog.entity.ArticleColumn;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ArticleColumnMapper extends BaseMapper<ArticleColumn> {

    @Select("SELECT article_id FROM article_columns WHERE column_id = #{columnId} ORDER BY sort_order ASC")
    List<Long> selectArticleIdsByColumnId(@Param("columnId") Long columnId);

    @Select("SELECT column_id FROM article_columns WHERE article_id = #{articleId}")
    List<Long> selectColumnIdsByArticleId(@Param("articleId") Long articleId);
}
