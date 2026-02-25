package com.myvlog.blog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.myvlog.blog.entity.LearningNote;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface LearningNoteMapper extends BaseMapper<LearningNote> {

    @Select("SELECT * FROM learning_notes WHERE article_id = #{articleId} ORDER BY created_at DESC")
    List<LearningNote> selectByArticleId(@Param("articleId") Long articleId);

    @Select("SELECT * FROM learning_notes WHERE article_id = #{articleId} AND user_id = #{userId} ORDER BY created_at DESC")
    List<LearningNote> selectByArticleIdAndUserId(@Param("articleId") Long articleId, @Param("userId") Long userId);
}
