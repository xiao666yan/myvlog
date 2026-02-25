package com.myvlog.blog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.myvlog.blog.entity.LearningProgress;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface LearningProgressMapper extends BaseMapper<LearningProgress> {

    @Select("SELECT * FROM learning_progress WHERE user_id = #{userId} AND article_id = #{articleId}")
    LearningProgress selectByUserIdAndArticleId(@Param("userId") Long userId, @Param("articleId") Long articleId);
}
