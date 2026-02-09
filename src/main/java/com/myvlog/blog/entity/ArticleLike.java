package com.myvlog.blog.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("article_likes")
public class ArticleLike extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long articleId;
    private Long userId;
}
